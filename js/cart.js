/**
 * Cart Page Functionality
 * Displays cart items from localStorage and handles basic cart operations
 */

// Function to update cart count in navbar
function updateCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update all cart count elements in the page
    document.querySelectorAll('.cart-count-badge, .cart-badge').forEach(el => {
      el.textContent = cartCount;
      el.style.display = cartCount > 0 ? 'inline-flex' : 'none';
      el.parentElement.classList.toggle('has-items', cartCount > 0);
    });
    
    return cartCount;
  } catch (error) {
    console.error('Error updating cart count:', error);
    return 0;
  }
}



document.addEventListener('DOMContentLoaded', function() {
  console.log('Cart page loaded');
  
  // Update cart count in navbar
  updateCartCount();
  
  // Check for cart expiry after 48 hours
  (function() {
    const timestampKey = 'cartTimestamp';
    const expiryMs = 48 * 60 * 60 * 1000; // 48 hours
    const now = Date.now();
    const last = parseInt(localStorage.getItem(timestampKey), 10);
    if (last && now - last >= expiryMs) {
      console.log('🕒 Cart expired after 48 hours, clearing cart...');
      localStorage.removeItem('cart');
      if (window.showToast) showToast('🕒 Cart Expired', 'Your cart was cleared after 48 hours', 'warning');
    }
    // Update timestamp
    localStorage.setItem(timestampKey, now.toString());
  })();
  
  // DOM Elements
  const cartItemsContainer = document.querySelector('.cart-items-container');
  const cartActions = document.querySelector('.cart-actions');
  const emptyCartMessage = `
    <div class="empty-cart text-center py-5">
      <div class="empty-cart-icon">
        <i class="bi bi-cart-x fs-1"></i>
      </div>
      <h3 class="mb-3">Your cart is empty</h3>
      <p class="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
      <a href="shop.html" class="btn btn-gold">Continue Shopping</a>
    </div>
  `;
  
  // Load and display cart items
  async function loadCartItems() {
    try {
      // Get cart from localStorage
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      console.log('Loaded cart from localStorage:', cart);
      
      // Clear current items
      cartItemsContainer.innerHTML = '';
      
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = emptyCartMessage;
        cartActions.classList.add('d-none');
        updateOrderSummary([]);
        return;
      }
      
      // Show cart actions if cart is not empty
      cartActions.classList.remove('d-none');
      
      // Show loading state
      cartItemsContainer.innerHTML = `
        <div class="text-center py-5">
          <div class="spinner-border text-gold" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading your cart items...</p>
        </div>`;
      
      try {
        // Fetch product details including images from the API
        console.log('Fetching product images from API...');
        await Promise.all(cart.map(async item => {
          try {
            const response = await fetch(`http://localhost:5001/api/products/${item.id}`);
            if (response.ok) {
              const product = await response.json();
              item.image = product.image || product.imageUrl || 'img/logo.png';
            } else {
              console.warn(`Failed to fetch product ${item.id}:`, response.status);
              item.image = 'img/logo.png';
            }
          } catch (error) {
            console.error(`Error fetching product ${item.id}:`, error);
            item.image = 'img/logo.png';
          }
        }));
        console.log('Product images fetched successfully');
      } catch (error) {
        console.error('Error fetching product images:', error);
        // Continue with existing images or placeholders if API fails
      }
      
      // Clear loading state
      cartItemsContainer.innerHTML = '';
      
      // Add each cart item to the DOM with the fetched images
      cart.forEach(item => {
        // Handle image source with better validation
        let imageSrc = 'img/logo.png';
        
        // Check if we have a valid image source
        if (item.image) {
          // If it's a reference to a local image
          if (item.image === 'thumbnail') {
            // Try to get the image from the product data or use default
            const productImage = document.querySelector(`[data-product-id="${item.id}"] .product-image, [data-product-id="${item.id}"] .product-image-new`);
            if (productImage && productImage.src) {
              imageSrc = productImage.src;
            } else {
              // Fallback to product images directory
              imageSrc = `images/product-item-${Math.min(10, Math.max(1, parseInt(item.id) % 10))}.jpg`;
            }
          } 
          // If it's a direct URL or data URL
          else if (item.image.startsWith('http') || item.image.startsWith('data:') || item.image.startsWith('/')) {
            imageSrc = item.image;
          }
          // If it's a relative path
          else if (item.image.startsWith('images/') || item.image.startsWith('./images/')) {
            imageSrc = item.image;
          }
        }
        
        const cartItemHTML = `
          <div class="cart-item" data-product-id="${item.id}">
            <div class="row align-items-center">
              <div class="col-md-2 col-3">
                <img src="${imageSrc}" 
                     alt="${item.name}" 
                     class="img-fluid rounded cart-item-image"
                     loading="lazy"
                     onerror="this.onerror=null; this.classList.add('img-error'); this.src='img/logo.png';">
              </div>
              <div class="col-md-5 col-9">
                <h3 class="product-title mb-1">${item.name}</h3>
                <p class="product-price mb-0">
                  <span class="price-amount">${parseInt(item.price).toLocaleString('en-US')}</span> 
                  <span class="price-currency">DZD</span>
                </p>
              </div>
              <div class="col-md-2 col-4 mt-3 mt-md-0">
                <div class="quantity-selector">
                  <button class="quantity-btn minus">-</button>
                  <input type="number" value="${item.quantity}" min="1" class="quantity-input">
                  <button class="quantity-btn plus">+</button>
                </div>
              </div>
              <div class="col-md-2 col-4 text-md-center mt-3 mt-md-0">
                <div class="product-price">
                  <span class="price-amount">${(parseInt(item.price) * item.quantity).toLocaleString('en-US')}</span> 
                  <span class="price-currency">DZD</span>
                </div>
              </div>
              <div class="col-md-1 col-4 text-end mt-3 mt-md-0">
                <button class="remove-item-btn" title="Remove item" data-product-id="${item.id}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <hr class="my-4">
        `;
        
        cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
      });
      
      // Update order summary
      updateOrderSummary(cart);
      
      // Initialize event listeners for the new elements
      initializeEventListeners();
      
    } catch (error) {
      console.error('Error loading cart items:', error);
      cartItemsContainer.innerHTML = `
        <div class="alert alert-danger">
          Error loading cart. Please try refreshing the page.
        </div>
      `;
    }
  }
  
  // Update order summary with cart data
  function updateOrderSummary(cart) {
    console.log('Updating order summary with cart:', cart);
    
    const subtotal = cart.reduce((sum, item) => {
      return sum + (parseInt(item.price) * item.quantity);
    }, 0);
    
    // Update subtotal
    const subtotalElement = document.querySelector('.summary-item:first-child span:last-child');
    if (subtotalElement) {
      subtotalElement.textContent = `${subtotal.toLocaleString('en-US')} DZD`;
    }
    
    // Update total
    const totalElement = document.querySelector('.total-amount .amount');
    if (totalElement) {
      totalElement.textContent = subtotal.toLocaleString('en-US');
    }
    
    // Update item count
    const itemCountElement = document.querySelector('.item-count');
    if (itemCountElement) {
      const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
      itemCountElement.textContent = `(${itemCount} ${itemCount === 1 ? 'item' : 'items'})`;
    }
  }
  
  // Initialize event listeners for cart interactions
  function initializeEventListeners() {
    // Quantity minus buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
      btn.addEventListener('click', function() {
        const input = this.nextElementSibling;
        if (parseInt(input.value) > 1) {
          input.value = parseInt(input.value) - 1;
          updateCartItem(this.closest('.cart-item'));
        }
      });
    });
    
    // Quantity plus buttons
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
      btn.addEventListener('click', function() {
        const input = this.previousElementSibling;
        input.value = parseInt(input.value) + 1;
        updateCartItem(this.closest('.cart-item'));
      });
    });
    
    // Quantity input changes
    document.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', function() {
        if (parseInt(this.value) < 1) {
          this.value = 1;
        }
        updateCartItem(this.closest('.cart-item'));
      });
    });
    
    // Remove item buttons
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.dataset.productId;
        removeCartItem(productId, this.closest('.cart-item'));
      });
    });
  }
  
  // Update cart item quantity in localStorage
  function updateCartItem(cartItemElement) {
    const productId = cartItemElement.dataset.productId;
    const newQuantity = parseInt(cartItemElement.querySelector('.quantity-input').value);
    
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const itemIndex = cart.findIndex(item => item.id === productId);
      
      if (itemIndex > -1) {
        cart[itemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log(`Updated quantity for product ${productId} to ${newQuantity}`);
        
        // Update the displayed total for this item
        const price = parseInt(cart[itemIndex].price);
        const totalElement = cartItemElement.querySelector('.product-price .price-amount');
        if (totalElement) {
          totalElement.textContent = (price * newQuantity).toLocaleString('en-US');
        }
        
        // Update order summary
        updateOrderSummary(cart);
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  }
  
  // Remove item from cart
  function removeCartItem(productId, cartItemElement) {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const updatedCart = cart.filter(item => item.id !== productId);
      
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      console.log(`Removed product ${productId} from cart`);
      
      // Animate removal
      cartItemElement.style.opacity = '0';
      setTimeout(() => {
        cartItemElement.remove();
        
        // Check if cart is now empty
        if (updatedCart.length === 0) {
          cartItemsContainer.innerHTML = emptyCartMessage;
        }
        
        // Update order summary
        updateOrderSummary(updatedCart);
      }, 300);
      
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  }
  
  // Continue shopping button
  const continueShoppingBtn = document.querySelector('.btn-outline-gold');
  if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'shop.html';
    });
  }
  
  // Proceed to checkout button
  document.addEventListener('click', function(e) {
    // Check if the clicked element or any of its parents is the checkout button
    const checkoutBtn = e.target.closest('.btn-gold');
    // Detect proceed-to-checkout button by its i18n key, not text content
    if (checkoutBtn && checkoutBtn.querySelector('[data-i18n-key="cart.proceed_checkout"]')) {
      e.preventDefault();
      
      // Get cart data from localStorage
      let cart = [];
      try {
        const cartData = localStorage.getItem('cart');
        cart = cartData ? JSON.parse(cartData) : [];
      } catch (e) {
        console.error('❌ Error parsing cart data:', e);
        cart = [];
      }
      
      // Calculate order summary - exclude base64 image data to save space
      const orderSummary = {
        totalItems: cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0),
        subtotal: cart.reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 0)), 0),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity) || 1,
          // Only store a flag indicating if there was an image, not the actual data
          hasImage: Boolean(item.image),
          itemTotal: (parseFloat(item.price) * (parseInt(item.quantity) || 1)).toFixed(2)
        }))
      };
      
      // Store a minimal version of the order in localStorage
      const minimalOrderSummary = {
        totalItems: orderSummary.totalItems,
        subtotal: orderSummary.subtotal,
        items: orderSummary.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          hasImage: item.hasImage,
          itemTotal: item.itemTotal
        }))
      };
      
      // Detailed logging
      console.log('🚀 [CHECKOUT] Proceeding to checkout with the following order details:');
      console.log('📋 Order Summary:', {
        'Total Items': orderSummary.totalItems,
        'Order Subtotal': `${orderSummary.subtotal.toFixed(2)} DZD`,
        'Number of Unique Products': orderSummary.items.length
      });
      
      console.log('🛒 Products in Cart:');
      orderSummary.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name}`, {
          'Quantity': item.quantity,
          'Price per Item': `${item.price} DZD`,
          'Total': `${item.itemTotal} DZD`,
          'Image': item.image
        });
      });
      
      console.log('💳 Total Order Value:', `${orderSummary.subtotal.toFixed(2)} DZD`);
      console.log('🔗 Redirecting to checkout page...');
      
      // Store the minimal order summary in localStorage
      try {
        localStorage.setItem('orderSummary', JSON.stringify(minimalOrderSummary));
      } catch (e) {
        console.error('Error saving order summary:', e);
        // If we still get an error, try storing just the essential data
        const essentialData = {
          totalItems: minimalOrderSummary.totalItems,
          subtotal: minimalOrderSummary.subtotal,
          items: minimalOrderSummary.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            itemTotal: item.itemTotal
          }))
        };
        localStorage.setItem('orderSummary', JSON.stringify(essentialData));
      }
      
      // Proceed to checkout page
      window.location.href = 'order-index.html';
    }
  });
  
  // Initialize the page
  loadCartItems();
});
