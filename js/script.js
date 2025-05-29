// js/script.js
document.addEventListener('DOMContentLoaded', function() {

    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuToggle.querySelector('i').classList.toggle('fa-bars');
            mobileMenuToggle.querySelector('i').classList.toggle('fa-times');
        });
    }

    // Simple Hero Slider
    const slides = document.querySelectorAll('#hero-slider .slide');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds

    function nextSlide() {
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('active');
        slides[currentSlide].querySelector('.slide-content').classList.remove('fade-in');

        currentSlide = (currentSlide + 1) % slides.length;

        slides[currentSlide].classList.add('active');
        // Re-trigger animation for the new slide content
        const newSlideContent = slides[currentSlide].querySelector('.slide-content');
        newSlideContent.classList.remove('fade-in'); // Remove class if already there
        void newSlideContent.offsetWidth; // Trigger reflow
        newSlideContent.classList.add('fade-in');
    }

    if (slides.length > 1) {
        slides[0].classList.add('active'); // Show first slide initially
        slides[0].querySelector('.slide-content').classList.add('fade-in');
        setInterval(nextSlide, slideInterval);
    } else if (slides.length === 1) {
        slides[0].classList.add('active');
        slides[0].querySelector('.slide-content').classList.add('fade-in');
    }


    // Smooth Scroll for internal links (optional, modern browsers handle some of this)
    // document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    //     anchor.addEventListener('click', function (e) {
    //         const hrefAttribute = this.getAttribute('href');
    //         if (hrefAttribute.length > 1) { // Ensure it's not just "#"
    //             const targetElement = document.querySelector(hrefAttribute);
    //             if (targetElement) {
    //                 e.preventDefault();
    //                 targetElement.scrollIntoView({
    //                     behavior: 'smooth'
    //                 });
    //             }
    //         }
    //     });
    // });

    // Scroll Animations (Intersection Observer API)
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    const observerOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the item is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = entry.target.style.animationDelay || '0s'; // Ensure delay is applied if set
                entry.target.classList.add('animate'); // You might need a class like 'animate' to trigger CSS defined animations
                                                      // Or directly add animation classes as done in HTML
                // For the current setup, HTML directly uses animation classes, so this logic can be simpler
                // If you want to re-trigger on scroll, remove 'observer.unobserve(entry.target);'
                // observer.unobserve(entry.target); // Animate only once
            }
            // else { // Optional: remove animation if it scrolls out of view
            //     entry.target.classList.remove('animate');
            // }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });


    // Update Copyright Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Active Nav Link highlighting based on section in view (more advanced)
    // This is a simplified version for active page link
    const navLinks = document.querySelectorAll('header nav ul li a');
    const currentPath = window.location.pathname.split("/").pop();

    navLinks.forEach(link => {
        link.classList.remove('active'); // Remove active from all
        const linkPath = link.getAttribute('href').split("/").pop();
        if (currentPath === linkPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });

});

// ... (الكود السابق) ...

// Quote Basket Functionality
let quoteBasket = JSON.parse(localStorage.getItem('quoteBasket')) || [];
const quoteBasketIcon = document.getElementById('quote-basket-icon');
const basketCount = document.getElementById('basket-count');
const quoteBasketModal = document.getElementById('quote-basket-modal');
const quoteBasketItemsContainer = document.getElementById('quote-basket-items');
const emptyBasketMsg = document.querySelector('.empty-basket-msg');
const requestQuoteBtnModal = document.querySelector('.quote-basket-modal .btn-request-quote');

function updateBasketCount() {
    if (basketCount) {
        basketCount.textContent = quoteBasket.length;
        basketCount.style.display = quoteBasket.length > 0 ? 'flex' : 'none';
    }
}

function renderQuoteBasket() {
    if (!quoteBasketItemsContainer) return;
    quoteBasketItemsContainer.innerHTML = ''; // Clear previous items

    if (quoteBasket.length === 0) {
        if(emptyBasketMsg) emptyBasketMsg.style.display = 'block';
        if(requestQuoteBtnModal) requestQuoteBtnModal.style.display = 'none';
        return;
    }

    if(emptyBasketMsg) emptyBasketMsg.style.display = 'none';
    if(requestQuoteBtnModal) requestQuoteBtnModal.style.display = 'block';

    quoteBasket.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="item-name">${item.name} (ID: ${item.id})</span>
            <button class="remove-item-btn" data-index="${index}" title="إزالة"><i class="fas fa-times"></i></button>
        `;
        quoteBasketItemsContainer.appendChild(li);
    });

    // Add event listeners to new remove buttons
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemIndex = parseInt(this.dataset.index);
            removeItemFromBasket(itemIndex);
        });
    });
}

function addItemToBasket(productId, productName) {
    // Check if item already exists
    const existingItem = quoteBasket.find(item => item.id === productId);
    if (existingItem) {
        alert(`${productName} موجود بالفعل في سلة عرض الأسعار.`);
        return;
    }
    quoteBasket.push({ id: productId, name: productName });
    localStorage.setItem('quoteBasket', JSON.stringify(quoteBasket));
    updateBasketCount();
    renderQuoteBasket();
    // Optional: Show a small notification
    showNotification(`${productName} أضيف إلى طلب السعر!`);
}

function removeItemFromBasket(index) {
    quoteBasket.splice(index, 1);
    localStorage.setItem('quoteBasket', JSON.stringify(quoteBasket));
    updateBasketCount();
    renderQuoteBasket();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'simple-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
// CSS for simple notification (add to style.css or inline for testing)
/*
.simple-notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background-color: var(--secondary-color);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 2000;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
}
.simple-notification.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}
*/


if (quoteBasketIcon) {
    quoteBasketIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing when clicking inside modal if it propagates
        if (quoteBasketModal) quoteBasketModal.classList.toggle('active');
        renderQuoteBasket(); // Render fresh content when opening
    });
}

// Close modal if clicked outside
document.addEventListener('click', function(event) {
    if (quoteBasketModal && quoteBasketModal.classList.contains('active')) {
        const isClickInsideModal = quoteBasketModal.contains(event.target);
        const isClickOnIcon = quoteBasketIcon ? quoteBasketIcon.contains(event.target) : false;
        if (!isClickInsideModal && !isClickOnIcon) {
            quoteBasketModal.classList.remove('active');
        }
    }
});


// Initialize basket on page load
updateBasketCount();
// renderQuoteBasket(); // Call if modal is visible on load or needed elsewhere


// Tabs functionality
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const targetTab = button.dataset.tab;
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === targetTab) {
                content.classList.add('active');
            }
        });
        // After switching tab, re-filter products based on current search term
        filterProductsInActiveTab();
    });
});

function filterProductsInActiveTab() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const activeTabContent = document.querySelector('.tab-content.active');

    if (activeTabContent) {
        const cardsInActiveTab = activeTabContent.querySelectorAll('.product-card');
        cardsInActiveTab.forEach(card => {
            const productNameSearch = card.dataset.productNameSearch ? card.dataset.productNameSearch.toLowerCase() : "";
            const productTitle = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : "";
            const productDescription = card.querySelector('p') ? card.querySelector('p').textContent.toLowerCase() : "";

            if (searchTerm === "" || productNameSearch.includes(searchTerm) || productTitle.includes(searchTerm) || productDescription.includes(searchTerm)) {
                card.style.display = ''; // Show card
            } else {
                card.style.display = 'none'; // Hide card
            }
        });
    }
}
// Initial filter on page load (in case of pre-filled search or direct link)
if (document.getElementById('products-page')) { // Only run on products page
    filterProductsInActiveTab();
}

// Make sure the main DOMContentLoaded listener calls all necessary initializations
document.addEventListener('DOMContentLoaded', function() {
    // ... (existing initializations like mobile menu, hero slider, etc.) ...
    updateBasketCount();
    // renderQuoteBasket(); // Called when modal is opened
    initializeQuantityControls(); // Initialize quantity controls on product cards
    initializeAddToQuoteButtons(); // Re-initialize or ensure it's called
    // FAQ, Scroll Animations, Copyright Year are already being initialized

    // Prefill form if on customer service page
    if (document.getElementById('quote-products')) {
        prefillQuoteForm();
    }
    // Initial filter for products page
    if (document.getElementById('products-page')) {
       filterProductsInActiveTab();
    }
});
// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        // Close other open items (optional)
        // faqItems.forEach(otherItem => {
        //     if (otherItem !== item) otherItem.classList.remove('active');
        // });
        item.classList.toggle('active');
    });
});

// Pre-fill quote form with basket items (on customer-service.html)
function prefillQuoteForm() {
    const quoteFormProductsTextarea = document.getElementById('quote-products');
    if (quoteFormProductsTextarea && quoteBasket.length > 0) {
        let productList = "أرغب في عرض سعر للمنتجات التالية:\n";
        quoteBasket.forEach(item => {
            productList += `- ${item.name} (ID: ${item.id})\n`;
        });
        quoteFormProductsTextarea.value = productList;
    }
}

// Call prefill if on the correct page and element exists
if (document.getElementById('quote-products')) {
    prefillQuoteForm();
}

// Add event listeners for "Add to Quote" buttons (dynamically, if products are loaded via JS or on multiple pages)
// For now, we'll assume they are hardcoded in HTML and add listeners directly.
// If products are dynamically loaded, this listener attachment needs to happen after load.
function initializeAddToQuoteButtons() {
    document.querySelectorAll('.btn-add-to-quote').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            addItemToBasket(productId, productName);
        });
    });
}
initializeAddToQuoteButtons(); // Call on page load

// Add this CSS for the notification to your style.css
/*
.simple-notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background-color: var(--secondary-color);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 2000;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
}
.simple-notification.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}
*/

// ... (الكود السابق في script.js) ...

// ----- NEW OR MODIFIED CODE -----

// Product Search Functionality
const searchInput = document.getElementById('search-input');
const productCards = document.querySelectorAll('.product-card'); // Ensure this selects all relevant cards

if (searchInput && productCards.length > 0) {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();

        productCards.forEach(card => {
            const productNameSearch = card.dataset.productNameSearch ? card.dataset.productNameSearch.toLowerCase() : "";
            const productTitle = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : "";
            const productDescription = card.querySelector('p') ? card.querySelector('p').textContent.toLowerCase() : "";

            // Check if the card is inside a tab-content that is not active
            // If so, don't hide it permanently, just let the tab logic handle visibility
            const parentTabContent = card.closest('.tab-content');
            const isCardInActiveTab = parentTabContent ? parentTabContent.classList.contains('active') : true;


            if (productNameSearch.includes(searchTerm) || productTitle.includes(searchTerm) || productDescription.includes(searchTerm)) {
                if (isCardInActiveTab) {
                    card.style.display = ''; // Show card
                } else {
                    // If it's in an inactive tab, keep its display as per tab logic (likely 'none')
                    // but we mark it as 'search-match' to handle tab switching.
                    card.dataset.searchMatch = 'true';
                }
            } else {
                if (isCardInActiveTab) {
                   card.style.display = 'none'; // Hide card
                }
                card.dataset.searchMatch = 'false';
            }
        });

        // Adjust visibility based on active tab and search
        // This ensures that when switching tabs, only matching items are shown if a search term exists.
        filterProductsInActiveTab();
    });
}

// Function to handle quantity buttons (+/-)
function initializeQuantityControls() {
    document.querySelectorAll('.product-card').forEach(card => {
        const quantityInput = card.querySelector('.product-quantity');
        const minusBtn = card.querySelector('.minus-qty');
        const plusBtn = card.querySelector('.plus-qty');

        if (quantityInput && minusBtn && plusBtn) {
            minusBtn.addEventListener('click', () => {
                let currentValue = parseInt(quantityInput.value);
                if (currentValue > parseInt(quantityInput.min)) {
                    quantityInput.value = currentValue - 1;
                }
            });

            plusBtn.addEventListener('click', () => {
                let currentValue = parseInt(quantityInput.value);
                if (currentValue < parseInt(quantityInput.max)) {
                    quantityInput.value = currentValue + 1;
                }
            });
        }
    });
}
initializeQuantityControls(); // Call on page load

// Modify addItemToBasket function
function addItemToBasket(productId, productName, quantity) { // Added quantity parameter
    const existingItemIndex = quoteBasket.findIndex(item => item.id === productId);
    if (existingItemIndex > -1) {
        // If item exists, update its quantity
        quoteBasket[existingItemIndex].quantity += quantity;
        // Ensure quantity doesn't exceed a max if needed, or just sum them up
        alert(`${productName} موجود بالفعل، تم زيادة الكمية.`);
    } else {
        quoteBasket.push({ id: productId, name: productName, quantity: quantity });
        showNotification(`${productName} (كمية: ${quantity}) أضيف إلى طلب السعر!`);
    }
    localStorage.setItem('quoteBasket', JSON.stringify(quoteBasket));
    updateBasketCount();
    renderQuoteBasket();
}

// Modify initializeAddToQuoteButtons to get quantity
function initializeAddToQuoteButtons() {
    document.querySelectorAll('.btn-add-to-quote').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            const productCard = this.closest('.product-card');
            const quantityInput = productCard ? productCard.querySelector('.product-quantity') : null;
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1; // Default to 1 if not found

            if (quantity > 0) {
                addItemToBasket(productId, productName, quantity);
                if(quantityInput) quantityInput.value = 1; // Reset quantity input after adding
            } else {
                alert("يرجى تحديد كمية صالحة.");
            }
        });
    });
}
// Call it again after DOM content loaded for products.html if it's not already done.
// document.addEventListener('DOMContentLoaded', initializeAddToQuoteButtons); // Already called at end of script.js


// Modify renderQuoteBasket to display quantity
function renderQuoteBasket() {
    if (!quoteBasketItemsContainer) return;
    quoteBasketItemsContainer.innerHTML = '';

    if (quoteBasket.length === 0) {
        if(emptyBasketMsg) emptyBasketMsg.style.display = 'block';
        if(requestQuoteBtnModal) requestQuoteBtnModal.style.display = 'none';
        return;
    }

    if(emptyBasketMsg) emptyBasketMsg.style.display = 'none';
    if(requestQuoteBtnModal) requestQuoteBtnModal.style.display = 'block';

    quoteBasket.forEach((item, index) => {
        const li = document.createElement('li');
        // Display quantity in the basket
        li.innerHTML = `
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">الكمية: ${item.quantity}</span>
            </div>
            <button class="remove-item-btn" data-index="${index}" title="إزالة"><i class="fas fa-times"></i></button>
        `;
        quoteBasketItemsContainer.appendChild(li);
    });

    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemIndex = parseInt(this.dataset.index);
            removeItemFromBasket(itemIndex);
        });
    });
}

// Modify prefillQuoteForm to include quantity
function prefillQuoteForm() {
    const quoteFormProductsTextarea = document.getElementById('quote-products');
    if (quoteFormProductsTextarea && quoteBasket.length > 0) {
        let productList = "أرغب في عرض سعر للمنتجات التالية:\n";
        quoteBasket.forEach(item => {
            productList += `- ${item.name} (ID: ${item.id}) - الكمية: ${item.quantity}\n`;
        });
        quoteFormProductsTextarea.value = productList;
    }
}
// Call prefill if on the correct page and element exists (already in script.js)


// --- Tab functionality enhancement for search ---
// (Modify existing tab switching logic or add this part)
