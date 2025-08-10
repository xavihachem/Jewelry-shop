/**
 * Shop page functionality for Kaira Jewelry Shop
 * Loads products from API and handles product display
 */

// Function to update currency display based on language
function updateCurrencyDisplay() {
  const isArabic = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  const currencyElements = document.querySelectorAll('.price-currency');
  
  currencyElements.forEach(el => {
    if (isArabic) {
      el.textContent = el.getAttribute('data-ar');
    } else {
      el.textContent = el.getAttribute('data-en');
    }
  });
  
  // Update all View Product buttons when language changes
  updateViewProductButtons();
}

// Function to update View Product buttons text based on current language
function updateViewProductButtons() {
  const currentLang = localStorage.getItem('language') || 'en';
  const buttons = document.querySelectorAll('.btn-text[data-i18n-key="view_product"]');
  
  buttons.forEach(btn => {
    if (window.translations?.[currentLang]?.['view_product']) {
      btn.textContent = window.translations[currentLang]['view_product'];
    }
  });
}

// Main initialization function
async function initializeShop() {
  try {
    // Initialize API if it exists
    if (window.api && typeof window.api.init === 'function') {
      await window.api.init();
    }
    
    // Set up language change observer
    const observer = new MutationObserver(updateCurrencyDisplay);
    observer.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['lang', 'dir']
    });
    
    // Load products
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
      try {
            // Check if we have mock data for testing
        if (typeof window.api === 'undefined' || typeof window.api.products === 'undefined') {
          await loadMockProducts(productGrid);
        } else {
          await loadProductsIntoGrid(productGrid);
        }
      } catch (error) {
        // Error loading products
        productGrid.innerHTML = `
          <div class="col-12 text-center py-5">
            <div class="alert alert-warning">
              Unable to load products. Please try again later.
            </div>
          </div>
        `;
      }
    }
    
    // Update cart count
    updateCartCountFromStorage();
  } catch (error) {
    // Error initializing shop
    // Show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger m-3';
    errorDiv.textContent = 'Error loading products. Please refresh the page or try again later.';
    document.querySelector('main').prepend(errorDiv);
  }
}

// Function to update cart count from localStorage
function updateCartCount(count) {
  // Update all cart count elements in the page
  document.querySelectorAll('.cart-count-badge, .cart-badge').forEach(el => {
    el.textContent = count > 0 ? count : '';
    el.style.display = count > 0 ? 'inline-flex' : 'none';
    el.parentElement.classList.toggle('has-items', count > 0);
  });
  // Cart count updated
}

// Function to update cart count from localStorage
function updateCartCountFromStorage() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    updateCartCount(totalItems);
    return totalItems;
  } catch (error) {
    console.error('Error updating cart count:', error);
    return 0;
  }
}

// Update cart count when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Update cart count on page load
  updateCartCountFromStorage();
  
  // Listen for language changes
  window.addEventListener('storage', function(e) {
    if (e.key === 'language') {
      console.log('Language changed to:', e.newValue);
      updateViewProductButtons();
    }
  });
  
  // Also update when the cart changes (useful if multiple tabs are open)
  window.addEventListener('storage', function(event) {
    if (event.key === 'cart') {
      updateCartCountFromStorage();
    }
  });
});

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeShop);

// Initial currency display
updateCurrencyDisplay();

// Function to handle adding items to cart
function addToCart(button) {
  // Store original button state for restoration
  const originalHTML = button.innerHTML;
  const originalClasses = button.className;
  
  try {
    // 1. Initial validation
    if (!button) {
      throw new Error('Add to Cart button is null or undefined');
    }
    
    // 2. Update button to loading state
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Adding...';
    button.classList.remove('btn-outline-gold');
    button.classList.add('btn-secondary');
    
    // 3. Get product details
    const card = button.closest('.product-card-new') || button.closest('.product-card');;
    
    // 4. Extract product data with fallbacks
    const productId = button.getAttribute('data-product-id') || 
                     (card ? card.getAttribute('data-product-id') : null) || 
                     `temp_${Date.now()}`;
    
    const productName = (card ? card.querySelector('.product-title-new, .product-title')?.textContent.trim() : null) || 
                       button.getAttribute('data-product-name') ||
                       'Unnamed Product';
    
    const priceText = (card ? card.querySelector('.item-price')?.textContent.trim() : null) ||
                     button.getAttribute('data-product-price') ||
                     '0';
    const productPrice = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
    
    // Get the full image path
    let productImage = '';
    
    // Try to get from card first
    const imageElement = card ? card.querySelector('.product-image-new, .product-image') : null;
    if (imageElement && imageElement.src) {
      productImage = imageElement.src;
    } 
    // Then try data attribute
    else if (button.getAttribute('data-product-image')) {
      productImage = button.getAttribute('data-product-image');
    }
    // Fallback to logo
    else {
      productImage = 'img/logo.png';
    }
    
    // Store the full image path
    const productImageRef = productImage;
    
    // 5. Validate product data
    if (!productId || !productName || isNaN(productPrice) || productPrice <= 0) {
      throw new Error(`Invalid product data - ID: ${productId}, Name: ${productName}, Price: ${productPrice}`);
    }
    
    // 6. Get or initialize cart
    let cart = [];
    try {
      const cartData = localStorage.getItem('cart');
      cart = cartData ? JSON.parse(cartData) : [];
    } catch (e) {
      cart = []; // Reset cart if corrupted
    }
    
    // 7. Check if product exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    // 8. Update cart
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
      cart[existingItemIndex].lastUpdated = new Date().toISOString();

    } else {
      const newItem = {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImageRef, // Store only reference, not base64
        quantity: 1,
        addedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      cart.push(newItem);

    }
    
    // 9. Save to localStorage with quota management
    try {
      // Check if we're approaching the quota
      const cartString = JSON.stringify(cart);
      const quotaBytes = 5 * 1024 * 1024; // 5MB (most browsers allow 5-10MB)
      
      if (cartString.length > quotaBytes * 0.9) { // 90% of quota
        // If we're close to quota, remove oldest items until we're at 50%
        cart.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        while (cart.length > 0 && JSON.stringify(cart).length > quotaBytes * 0.5) {
          cart.pop();
        }
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // 10. Update UI
      const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      updateCartCount(totalItems);
      
      // 11. Show success feedback
      button.innerHTML = '<i class="bi bi-check-circle me-2"></i>Added!';
      button.classList.remove('btn-secondary');
      button.classList.add('btn-success');
      
      // 12. Show toast notification if available
      if (window.showToast) {
        showToast('Added to Cart', `${productName} was added to your cart`, 'success');
      }
      
      // 13. Reset button after delay
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.className = originalClasses;
        button.disabled = false;
      }, 2000);
      
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // If we hit the quota, clear the cart and try again with just this item
        localStorage.removeItem('cart');
        
        // Try again with just this one item
        const newItem = {
          id: productId,
          name: productName,
          price: productPrice,
          image: productImageRef,
          quantity: 1,
          addedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        
        try {
          localStorage.setItem('cart', JSON.stringify([newItem]));
          updateCartCount(1);
          showToast('⚠️ Cart Reset', 'Your cart was full and has been reset with the new item', 'warning');
        } catch (e) {
          throw new Error('Unable to save even a single item to cart. Please clear your browser storage.');
        }
      } else {
        throw new Error('Failed to save cart to storage: ' + error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ [ERROR] in addToCart:', error);
    
    // Show error state
    button.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>Error';
    button.classList.remove('btn-secondary', 'btn-outline-gold');
    button.classList.add('btn-danger');
    
    // Show error toast if available
    if (window.showToast) {
      showToast('❌ Error', error.message || 'Failed to add to cart', 'danger');
    } else {
      alert('Error: ' + (error.message || 'Failed to add to cart'));
    }
    
    // Reset button after delay
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.className = originalClasses;
      button.disabled = false;
    }, 3000);
    
  } finally {
    // Cleanup complete
  }
}

// Event delegation for add to cart buttons
document.addEventListener('click', function(e) {
  try {
    const addToCartBtn = e.target.closest('.add-to-cart-btn');
    if (addToCartBtn) {
      e.preventDefault();
      e.stopPropagation();
      addToCart(addToCartBtn);
    }
  } catch (error) {
    // Error in add to cart click handler
  }
});

// Load products from API and wait for completion
(async function() {
  try {
    const loaded = await loadProducts();
    // Products loaded successfully
  } catch (e) {
    // Error loading products
    // Show error message to user
    const productGrid = document.querySelector('#shop-products .row.product-grid');
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="alert alert-danger">
            Failed to load products. Please check your connection and try again.
          </div>
        </div>
      `;
    }
  }
});

/**
 * Load products from database and display them in the product grid
 */
async function loadProducts() {
  
  const productGrid = document.querySelector('#shop-products .row.product-grid');
  if (!productGrid) {
    // Product grid not found in DOM
    return;
  }
  
  return loadProductsIntoGrid(productGrid, 1);
}

/**
 * Helper function to load products into a grid element
 */
// --- Pagination State ---
let shopCurrentPage = 1;
const SHOP_PRODUCTS_PER_PAGE = 9; // Changed from 14 to 9 products per page
let shopAllProducts = [];

async function loadProductsIntoGrid(productGrid, page = 1) {
  // Clear existing products
  productGrid.innerHTML = '';
  // Add or find pagination controls
  let paginationControls = document.getElementById('shop-pagination-controls');
  if (!paginationControls) {
    paginationControls = document.createElement('div');
    paginationControls.id = 'shop-pagination-controls';
    paginationControls.className = 'd-flex justify-content-center align-items-center mt-4';
    productGrid.parentNode.appendChild(paginationControls);
  } else {
    paginationControls.innerHTML = '';
  }

  try {
    // Get products from API (cache for pagination)
    if (!shopAllProducts.length) {
      shopAllProducts = await window.api.products.getAllProducts();
    }
    const products = shopAllProducts;
    if (!products || products.length === 0) {
      productGrid.innerHTML = `
        <div class="col-12 text-center py-5">
          <p>No products found.</p>
        </div>
      `;
      paginationControls.innerHTML = '';
      return;
    }

    // Pagination logic
    const totalPages = Math.ceil(products.length / SHOP_PRODUCTS_PER_PAGE);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    shopCurrentPage = page;
    // Slice products for current page
    const startIdx = (shopCurrentPage - 1) * SHOP_PRODUCTS_PER_PAGE;
    const endIdx = startIdx + SHOP_PRODUCTS_PER_PAGE;
    const productsToShow = products.slice(startIdx, endIdx);

    // Add products to grid
    productsToShow.forEach(product => {
      const productCol = document.createElement('div');
      productCol.className = 'product-col';
      
      productCol.innerHTML = `
        <div class="product-card-new">
          <a href="product.html?id=${product.id || product._id}" class="product-link-new" data-product-id="${product.id || product._id}">
            <div class="product-image-new-wrapper">
              <img src="${product.image}" alt="${product.name}" class="product-image-new img-fluid">
            </div>
            <div class="product-info-new">
              <h5 class="product-title-new">${product.name}</h5>
              <p class="product-description-new">${product.smallDescription || 'Classic elegance for every occasion.'}</p>
              <div class="product-price-new">
                <span class="item-price">${parseFloat(product.price).toLocaleString('en-US')}</span>
                <span class="price-currency" data-en="DZD" data-ar="د.ج">DZD</span>
              </div>
              <a href="product.html?id=${product.id || product._id}" class="btn btn-outline-gold w-100 d-flex align-items-center justify-content-center" style="padding: 0.6rem 1.5rem; border-radius: 50px; transition: all 0.3s ease; gap: 8px; color: #E6C56E !important; background: rgba(184, 154, 79, 0.1) !important; border: 2px solid #b89a4f !important; box-shadow: 0 4px 15px rgba(184, 154, 79, 0.15) !important; font-family: 'Jost', sans-serif; font-weight: 400; letter-spacing: 0.5px;">
                <span class="btn-text" data-i18n-key="view_product" style="margin-right: 8px;">${window.translations?.[window.currentLanguage || 'en']?.['view_product'] || 'View Product'}</span>
                <i class="bi bi-arrow-right" style="font-size: 1rem; transition: transform 0.3s ease;"></i>
              </a>
              <style>
                .btn-outline-gold:hover {
                  color: #fff !important;
                  background: rgba(184, 154, 79, 0.3) !important;
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(184, 154, 79, 0.25) !important;
                }
                .btn-outline-gold i {
                  transition: transform 0.3s ease;
                }
                .btn-outline-gold:hover i {
                  transform: translateX(3px);
                }
              </style>
            </div>
          </a>
        </div>
      `;
      
      productGrid.appendChild(productCol);
      // Translate button text based on current language
      updateViewProductButtons();
    });
    
    // Removed order now button initialization as it's no longer needed
    
    // Add pagination controls if there are multiple pages
    if (totalPages > 1) {
      const pagination = document.createElement('div');
      pagination.className = 'pagination d-flex justify-content-center align-items-center gap-1 gap-sm-2 mt-3 mt-sm-4';
      pagination.style.fontSize = '0.9rem';
      
      // Previous button
      const prevBtn = document.createElement('button');
      prevBtn.className = 'btn btn-sm btn-outline-gold px-1 px-sm-2 py-0 py-sm-1';
      prevBtn.style.minWidth = '60px';
      prevBtn.style.fontSize = '0.8rem';
      prevBtn.innerHTML = '&larr; Previous';
      prevBtn.disabled = shopCurrentPage === 1;
      prevBtn.addEventListener('click', () => loadProductsIntoGrid(productGrid, shopCurrentPage - 1));
      
      // Page numbers
      const pageNumbers = document.createElement('div');
      pageNumbers.className = 'd-flex gap-2';
      
      // Always show first page
      if (shopCurrentPage > 3) {
        const firstPage = document.createElement('button');
        firstPage.className = `btn btn-sm ${shopCurrentPage === 1 ? 'btn-gold text-dark' : 'btn-outline-gold'} px-1 px-sm-2 py-0 py-sm-1`;
        firstPage.style.minWidth = '30px';
        firstPage.style.fontSize = '0.8rem';
        firstPage.textContent = '1';
        firstPage.addEventListener('click', () => loadProductsIntoGrid(productGrid, 1));
        pageNumbers.appendChild(firstPage);
        
        if (shopCurrentPage > 4) {
          const ellipsis1 = document.createElement('span');
          ellipsis1.className = 'd-flex align-items-center';
          ellipsis1.textContent = '...';
          pageNumbers.appendChild(ellipsis1);
        }
      }
      
      // Show pages around current page
      const startPage = Math.max(1, shopCurrentPage - 2);
      const endPage = Math.min(totalPages, shopCurrentPage + 2);
      
      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `btn btn-sm ${i === shopCurrentPage ? 'btn-gold text-dark' : 'btn-outline-gold'} px-1 px-sm-2 py-0 py-sm-1`;
        pageBtn.style.minWidth = '30px';
        pageBtn.style.fontSize = '0.8rem';
        pageBtn.textContent = i;
        if (i !== shopCurrentPage) {
          pageBtn.addEventListener('click', () => loadProductsIntoGrid(productGrid, i));
        }
        pageNumbers.appendChild(pageBtn);
      }
      
      // Always show last page
      if (shopCurrentPage < totalPages - 2) {
        if (shopCurrentPage < totalPages - 3) {
          const ellipsis2 = document.createElement('span');
          ellipsis2.className = 'd-flex align-items-center';
          ellipsis2.textContent = '...';
          pageNumbers.appendChild(ellipsis2);
        }
        
        const lastPage = document.createElement('button');
        lastPage.className = `btn btn-sm ${shopCurrentPage === totalPages ? 'btn-gold text-dark' : 'btn-outline-gold'} px-1 px-sm-2 py-0 py-sm-1`;
        lastPage.style.minWidth = '30px';
        lastPage.style.fontSize = '0.8rem';
        lastPage.textContent = totalPages;
        lastPage.addEventListener('click', () => loadProductsIntoGrid(productGrid, totalPages));
        pageNumbers.appendChild(lastPage);
      }
      
      // Next button
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-sm btn-outline-gold px-1 px-sm-2 py-0 py-sm-1';
      nextBtn.style.minWidth = '60px';
      nextBtn.style.fontSize = '0.8rem';
      nextBtn.innerHTML = 'Next &rarr;';
      nextBtn.disabled = shopCurrentPage === totalPages;
      nextBtn.addEventListener('click', () => loadProductsIntoGrid(productGrid, shopCurrentPage + 1));
      
      // Append elements
      pagination.appendChild(prevBtn);
      pagination.appendChild(pageNumbers);
      pagination.appendChild(nextBtn);
      paginationControls.appendChild(pagination);
    }
    
    // Make product items clickable
    document.querySelectorAll('.product-item').forEach(item => {
      const link = item.querySelector('a.product-link');
      if (link) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
          if (!e.target.closest('.add-to-cart') && !e.target.closest('button')) {
            window.location.href = link.href;
          }
        });
      }
    });
    
    
    
      
    return true;
  } catch (error) {
    productGrid.innerHTML = '<div class="col-12 text-center"><p>Error loading products. Please try again later.</p></div>';
    return false;
  }
}

/**
 * Initialize product modal functionality
 */
function initProductModal() {
  
  const modalElem = document.getElementById('productModal');
  if (!modalElem) {
    return;
  }
  
  // Using custom modal, no Bootstrap modal instance
  const modalProductImage = document.getElementById('modalProductImage');
  const modalProductTitle = document.getElementById('modalProductTitle');
  const modalProductDescription = document.getElementById('modalProductDescription');
  const modalProductPrice = document.getElementById('modalProductPrice');
  const orderNowBtn = modalElem.querySelector('.order-now-btn');
  // Close button for custom modal
  const closeBtn = modalElem.querySelector('.close-button');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modalElem.classList.remove('active'));
  }
  
  if (!modalProductImage || !modalProductTitle || !modalProductDescription || !modalProductPrice) {
    return;
  }
  
  // Add event listeners to product links (and reuse data attributes from order buttons)
  document.addEventListener('click', function(event) {
      
    // Check if clicked on product link or product image
    let productLink = event.target.closest('.product-link');
      // Fallback: if click is inside product-item (but not on add-to-cart), use its .product-link
      if (!productLink && !event.target.closest('.add-to-cart')) {
        const productItem = event.target.closest('.product-item');
        if (productItem) {
          productLink = productItem.querySelector('.product-link');
          
        }
      }
      if (productLink && !event.target.closest('button')) {
        event.preventDefault();
      
      // Find the parent product item
      const productItem = productLink.closest('.product-item');
      if (!productItem) return;
      
      // Find the data button to get product data
      let dataBtn = productItem.querySelector('.cart-link');
      if (!dataBtn) dataBtn = productItem.querySelector('.add-to-cart');
      if (!dataBtn) return;
      
      const image = dataBtn.dataset.productImage;
      const title = dataBtn.dataset.productTitle;
      const description = dataBtn.dataset.productDescription;
      const price = dataBtn.dataset.productPrice;
      
      // Populate the modal with the product data
      modalProductImage.src = image;
      modalProductTitle.textContent = title;
      modalProductDescription.textContent = description;
      modalProductPrice.textContent = price;
      
      // Store product data for order button
      if (orderNowBtn) {
        orderNowBtn.dataset.productImage = image;
        orderNowBtn.dataset.productTitle = title;
        orderNowBtn.dataset.productDescription = description;
        orderNowBtn.dataset.productPrice = price;
        
        // Add click handler for Order Now button in the modal
        orderNowBtn.onclick = function(e) {
          e.preventDefault();
          
          // Close product modal
          modalElem.classList.remove('active');
          
          // Wait for modal to close before opening order modal
          setTimeout(() => {
            // Open order modal if the function exists
            if (typeof openOrderModal === 'function') {
              openOrderModal(image, title, price);
            }
          }, 300);
        };
      }
      
      // Show the modal
      modalElem.classList.add('active');
    }
  });
}

// Initialize the product modal when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  if (typeof initProductModal === 'function') {
    try {
      initProductModal();
    } catch (error) {
      console.error('Error initializing product modal:', error);
    }
  }
});

// Load mock products if API is not available
async function loadMockProducts(productGrid) {
  // Mock products data
  const mockProducts = [
    {
      id: '1',
      name: 'Diamond Ring',
      price: '25000',
      image: 'https://via.placeholder.com/300x300?text=Diamond+Ring',
      smallDescription: 'Elegant diamond ring for special occasions.'
    },
    {
      id: '2',
      name: 'Gold Necklace',
      price: '18000',
      image: 'https://via.placeholder.com/300x300?text=Gold+Necklace',
      smallDescription: 'Beautiful gold necklace for any outfit.'
    },
    {
      id: '3',
      name: 'Silver Bracelet',
      price: '12000',
      image: 'https://via.placeholder.com/300x300?text=Silver+Bracelet',
      smallDescription: 'Stylish silver bracelet for daily wear.'
    },
    {
      id: '4',
      name: 'Pearl Earrings',
      price: '15000',
      image: 'https://via.placeholder.com/300x300?text=Pearl+Earrings',
      smallDescription: 'Classic pearl earrings for a timeless look.'
    },
    {
      id: '5',
      name: 'Sapphire Pendant',
      price: '22000',
      image: 'https://via.placeholder.com/300x300?text=Sapphire+Pendant',
      smallDescription: 'Stunning sapphire pendant for special occasions.'
    },
    {
      id: '6',
      name: 'Ruby Ring',
      price: '28000',
      image: 'https://via.placeholder.com/300x300?text=Ruby+Ring',
      smallDescription: 'Exquisite ruby ring for a bold statement.'
    }
  ];

  // Clear existing content
  productGrid.innerHTML = '';

  // Add products to grid
  mockProducts.forEach(product => {
    const productCol = document.createElement('div');
    productCol.className = 'col-md-4 col-sm-6 mb-4';
    
    productCol.innerHTML = `
      <div class="product-card-new">
        <a href="product.html?id=${product.id}" class="product-link-new" data-product-id="${product.id}">
          <div class="product-image-new-wrapper">
            <img src="${product.image}" alt="${product.name}" class="product-image-new img-fluid">
          </div>
          <div class="product-info-new">
            <h5 class="product-title-new">${product.name}</h5>
            <p class="product-description-new">${product.smallDescription}</p>
            <div class="product-price-new">
              <span class="item-price">${parseInt(product.price).toLocaleString('en-US')}</span>
              <span class="price-currency" data-en="DZD" data-ar="د.ج">DZD</span>
            </div>
            <button class="add-to-cart-btn" data-product-id="${product.id}" data-i18n-key="add_to_cart">
              <span class="btn-icon">
                <i class="bi bi-cart-plus"></i>
              </span>
              <span class="btn-text" data-i18n-key="add_to_cart">Add to Cart</span>
            </button>
          </div>
        </a>
      </div>
    `;
    
    productGrid.appendChild(productCol);
  });
  
  // Update currency display
  updateCurrencyDisplay();
}

// Export functions for testing or other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateCurrencyDisplay,
    updateCartCount,
    addToCart,
    loadProducts,
    loadProductsIntoGrid,
    initProductModal
  };
}