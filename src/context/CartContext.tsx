'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem } from '@/types';
import { useRouter, usePathname } from '@/i18n/routing';
import { getImageUrl } from '@/lib/utils';
import { getProductByIdServerAction } from '@/actions/products.actions';
import {
  getBasketItemsServerAction,
  addToBasketServerAction,
  updateBasketItemServerAction,
  deleteBasketItemServerAction,
  checkoutBasketServerAction
} from '@/actions/basket.actions';

interface ToastState {
  id: number;
  message: string;
  image?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isOpen: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number; unitId?: number }, openDrawer?: boolean) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  totalPrice: number;
  isItemInCart: (id: string) => boolean;
  toast: ToastState | null;
  dismissToast: () => void;
  basketId: number | null;
  checkoutCart: () => Promise<{ success: boolean; error?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [basketId, setBasketId] = useState<number | null>(null);
  const [wasLoggedIn, setWasLoggedIn] = useState<boolean | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Sync basket items from server
  const syncBasketWithServer = async () => {
    const isLoggedIn = document.cookie.split(';').some((item) => item.trim().startsWith('user_info='));
    if (!isLoggedIn) {
      return;
    }

    try {
      const res = await getBasketItemsServerAction();
      if (res.success && res.data) {
        const { items, totalPrice: serverTotalPrice, basketId: serverBasketId } = res.data;

        // Group items by `${product}_${unitName}` to merge duplicate rows
        const groupedMap = new Map<string, {
          item: typeof items[0];
          duplicatesToDelete: number[];
        }>();

        for (const item of items) {
          const key = `${item.product}_${item.name_unit_ar}`;
          const existing = groupedMap.get(key);
          if (existing) {
            existing.item.quantity += item.quantity;
            existing.duplicatesToDelete.push(item.id);
          } else {
            groupedMap.set(key, { item: { ...item }, duplicatesToDelete: [] });
          }
        }

        // Clean up duplicates in the background on the server
        for (const [_, group] of groupedMap.entries()) {
          if (group.duplicatesToDelete.length > 0) {
            // Delete duplicate rows in background
            group.duplicatesToDelete.forEach(async (dupId) => {
              try {
                await deleteBasketItemServerAction(dupId);
              } catch (err) {
                console.error('Failed to clean up duplicate basket item:', err);
              }
            });
            // Update the quantity of the main item on the server
            try {
              await updateBasketItemServerAction(group.item.id, group.item.quantity);
            } catch (err) {
              console.error('Failed to update merged quantity on server:', err);
            }
          }
        }

        const mergedItems = Array.from(groupedMap.values()).map((g) => g.item);

        // Fetch details of all unique products in the basket to get their image, code, and agent info
        const uniqueProductIds = Array.from(new Set(mergedItems.map((i) => i.product)));
        const productDetailsMap = new Map();

        await Promise.all(
          uniqueProductIds.map(async (pid) => {
            try {
              const pDetail = await getProductByIdServerAction(pid);
              if (pDetail) {
                productDetailsMap.set(pid, pDetail);
              }
            } catch (err) {
              console.error(`Failed to fetch details for product ${pid}:`, err);
            }
          })
        );

        const mappedItems = mergedItems.map((item): CartItem => {
          const pDetail = productDetailsMap.get(item.product);
          return {
            id: `${item.product}_${item.name_unit_ar}`,
            productId: item.product,
            nameAr: item.name_product_ar,
            nameEn: item.name_product_en || item.name_product_ar,
            image: pDetail ? getImageUrl(pDetail.image) : undefined,
            unitNameAr: item.name_unit_ar,
            unitNameEn: item.name_unit_en || item.name_unit_ar,
            unitPrice: item.price,
            quantity: item.quantity,
            brandNameAr: pDetail ? pDetail.agent_name_ar : undefined,
            brandNameEn: pDetail ? pDetail.agent_name_en || pDetail.agent_name_ar : undefined,
            numberProduct: pDetail ? pDetail.number_product : undefined,
            dbId: item.id,
            unitId: item.unit,
            subtotal: item.subtotal,
          };
        });

        setCartItems(mappedItems);
        setTotalPrice(serverTotalPrice);
        setBasketId(serverBasketId);
      }
    } catch (e) {
      console.error('Failed to sync basket with server:', e);
    }
  };

  // Load basket on mount
  useEffect(() => {
    const loadCart = async () => {
      const isLoggedIn = document.cookie.split(';').some((item) => item.trim().startsWith('user_info='));
      setWasLoggedIn(isLoggedIn);
      if (isLoggedIn) {
        await syncBasketWithServer();
      } else {
        setCartItems([]);
        setTotalPrice(0);
      }
    };

    loadCart();
  }, []);

  // Monitor login/logout transitions on route changes
  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = document.cookie.split(';').some((item) => item.trim().startsWith('user_info='));
      
      if (wasLoggedIn === null) {
        return; // Wait until initial mount load completes
      }

      if (isLoggedIn && !wasLoggedIn) {
        // User logged in
        setWasLoggedIn(true);
        await syncBasketWithServer();
      } else if (!isLoggedIn && wasLoggedIn) {
        // User logged out
        setWasLoggedIn(false);
        setCartItems([]);
        setTotalPrice(0);
      }
    };

    checkLoginStatus();
  }, [pathname, wasLoggedIn]);



  const showToast = (message: string, image?: string) => {
    const toastId = Date.now();
    setToast({ id: toastId, message, image });
    setTimeout(() => {
      setToast((current) => (current?.id === toastId ? null : current));
    }, 3500);
  };

  const dismissToast = () => setToast(null);

  const addToCart = async (
    itemData: Omit<CartItem, 'quantity'> & { quantity?: number; unitId?: number },
    openDrawer: boolean = false
  ) => {
    const addQty = itemData.quantity && itemData.quantity > 0 ? itemData.quantity : 1;

    // Check if user is logged in
    const isLoggedIn = document.cookie.split(';').some((item) => item.trim().startsWith('user_info='));
    if (!isLoggedIn) {
      showToast('يجب عليك تسجيل الدخول أولاً للإضافة إلى السلة 🔐', itemData.image);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }

    const unitId = itemData.unitId;
    if (!unitId) {
      console.error('Cannot add to basket: Unit ID is missing');
      showToast('خطأ: وحدة المنتج غير محددة ⚠️', itemData.image);
      return;
    }

    // Check if item already exists in local cartItems state
    const existingItem = cartItems.find((i) => i.id === itemData.id);

    if (existingItem && existingItem.dbId) {
      const newQty = existingItem.quantity + addQty;
      // Call server action to update quantity in database
      const res = await updateBasketItemServerAction(existingItem.dbId, newQty);
      if (!res.success || !res.data) {
        showToast(res.error || 'فشل تحديث كمية المنتج في السلة ❌', itemData.image);
        return;
      }
    } else {
      // Call server action to persist new item in database
      const res = await addToBasketServerAction(Number(itemData.productId), addQty, unitId);
      if (!res.success || !res.data) {
        showToast(res.error || 'فشل إضافة المنتج إلى السلة ❌', itemData.image);
        return;
      }
    }

    // Refresh the cart from the server
    await syncBasketWithServer();

    const itemName = itemData.nameAr || itemData.nameEn || 'المنتج';
    showToast(`تمت إضافة "${itemName}" إلى السلة 🛒`, itemData.image);

    if (openDrawer) {
      setIsOpen(true);
    }
  };

  const removeFromCart = async (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    if (item.dbId) {
      const res = await deleteBasketItemServerAction(item.dbId);
      if (!res.success) {
        showToast(res.error || 'فشل حذف المنتج من السلة ❌', item.image);
      } else {
        showToast('تمت إزالة المنتج من السلة 🗑️', item.image);
        // Refresh the cart from the server
        await syncBasketWithServer();
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    if (item.dbId) {
      const res = await updateBasketItemServerAction(item.dbId, quantity);
      if (!res.success) {
        showToast(res.error || 'فشل تحديث كمية المنتج ❌', item.image);
      } else {
        // Refresh the cart from the server
        await syncBasketWithServer();
      }
    }
  };

  const clearCart = async () => {
    const prevItems = [...cartItems];

    try {
      await Promise.all(
        prevItems.map(async (item) => {
          if (item.dbId) {
            await deleteBasketItemServerAction(item.dbId);
          }
        })
      );
      showToast('تم إفراغ السلة بنجاح 🗑️');
    } catch (e) {
      showToast('حدث خطأ أثناء إفراغ السلة ❌');
    } finally {
      // Refresh the cart from the server
      await syncBasketWithServer();
    }
  };

  const openCart = () => {
    setIsOpen(true);
    // Sync with server when opening drawer to ensure data freshness
    syncBasketWithServer();
  };
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => {
    setIsOpen((prev) => {
      const nextVal = !prev;
      if (nextVal) {
        syncBasketWithServer();
      }
      return nextVal;
    });
  };

  const totalItems = cartItems.length;

  const isItemInCart = (id: string) => cartItems.some((item) => item.id === id);

  const checkoutCart = async (): Promise<{ success: boolean; error?: string }> => {
    if (!basketId) {
      return { success: false, error: 'لا يوجد سلة نشطة لإتمام الشراء' };
    }

    const res = await checkoutBasketServerAction(basketId);
    if (res.success) {
      showToast('تمت عملية الشراء بنجاح! 🎉');
      setCartItems([]);
      setTotalPrice(0);
      setBasketId(null);
    } else {
      showToast(res.error || 'فشل إتمام عملية الشراء ❌');
    }
    return res;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        totalItems,
        totalPrice,
        isItemInCart,
        toast,
        dismissToast,
        basketId,
        checkoutCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
