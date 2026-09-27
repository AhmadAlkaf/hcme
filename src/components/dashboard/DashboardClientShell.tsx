'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { ProductModal } from './Modals';
import { createProductServerAction, addProductImageServerAction } from '@/actions/products.actions';

import { AuthUser } from '@/types';

interface DashboardClientShellProps {
  children: React.ReactNode;
  user?: AuthUser | null;
}

export const DashboardClientShell: React.FC<DashboardClientShellProps> = ({ children, user }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <>
      {/* Header Component */}
      <DashboardHeader
        isMobileOpen={isMobileOpen}
        onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenAddProduct={() => setIsProductModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        user={user}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Component */}
        <DashboardSidebar
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Dynamic Page Children */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/20">
          {children}
        </main>
      </div>

      {/* Quick Add Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={async (formData, newSubImages) => {
          const res = await createProductServerAction(formData);
          if (res.success && res.data) {
            if (newSubImages && newSubImages.length > 0) {
              for (const file of newSubImages) {
                await addProductImageServerAction(res.data.id, file);
              }
            }
            setIsProductModalOpen(false);
            window.location.reload();
          } else {
            alert(res.error || 'حدث خطأ أثناء إضافة المنتج');
          }
        }}
      />
    </>
  );
};
