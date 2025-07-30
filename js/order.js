/**
 * Order processing functionality for Kaira Jewelry Shop
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize order modal functionality
  
  
  // Replace "Add to Cart" buttons with "Order Now" buttons
  replaceCartButtons();
});

/**
 * Initialize the order modal functionality
 */
function initOrderModal() {
  // Create order modal if it doesn't exist
  if (!document.getElementById('orderModal')) {
    createOrderModal();
  }
  
  // Initialize form validation
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitOrder();
    });
  }
}

/**
 * Create the order modal HTML structure
 */
function createOrderModal() {
  const modalHTML = `
    <div class="modal fade" id="orderModal" tabindex="-1" aria-labelledby="orderModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="orderModalLabel">Place Your Order</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="product-info mb-4">
              <div class="d-flex align-items-center">
                <img id="orderProductImage" src="" alt="Product" class="me-3" style="width: 80px; height: 80px; object-fit: cover;">
                <div>
                  <h6 id="orderProductTitle" class="mb-1"></h6>
                  <p id="orderProductPrice" class="text-gold mb-0"></p>
                </div>
              </div>
            </div>
            <form id="orderForm">
              <div class="mb-3">
                <label for="customerName" class="form-label">Full Name</label>
                <input type="text" class="form-control" id="customerName" required>
              </div>
              <div class="mb-3">
                <label for="customerCity" class="form-label">City</label>
                <input type="text" class="form-control" id="customerCity" required>
              </div>
              <div class="mb-3">
                <label for="customerPhone" class="form-label">Phone Number</label>
                <input type="tel" class="form-control" id="customerPhone" required>
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-gold">Confirm Order</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Append modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Replace "Add to Cart" buttons with "Order Now" buttons
 */
function replaceCartButtons() {
  // Select only add-to-cart buttons that aren't order-now-links
  const cartButtons = document.querySelectorAll('.add-to-cart:not(.order-now-link)');
  
  cartButtons.forEach(button => {
    // Change button text to "Order Now"
    button.innerHTML = '<i class="bi bi-bag-check"></i> Order Now';
    button.classList.add('order-now-btn');
    
    // Remove existing event listeners and add new one
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        // Find product element
        const productItem = this.closest('.product-item');
        if (!productItem) return;
        
        // Extract product image
        const productImageEl = productItem.querySelector('.product-image') || productItem.querySelector('img');
        const productImage = productImageEl ? productImageEl.src : '';
        
        // Extract product title
        let productTitle = '';
        if (productItem.querySelector('.product-title a')) {
            productTitle = productItem.querySelector('.product-title a').textContent.trim();
        } else if (productItem.querySelector('.product-title')) {
            productTitle = productItem.querySelector('.product-title').textContent.trim();
        } else if (productItem.querySelector('h3')) {
            productTitle = productItem.querySelector('h3').textContent.trim();
        } else if (productItem.dataset.productTitle) {
            productTitle = productItem.dataset.productTitle.trim();
        }
        
        // Extract product price text and parse number
        let priceText = '';
        if (productItem.querySelector('.item-price')) {
            priceText = productItem.querySelector('.item-price').textContent;
        } else if (productItem.querySelector('.product-price')) {
            priceText = productItem.querySelector('.product-price').textContent;
        } else if (productItem.querySelector('.price')) {
            priceText = productItem.querySelector('.price').textContent;
        } else if (productItem.dataset.productPrice) {
            priceText = productItem.dataset.productPrice;
        }
        const productPrice = parseFloat(priceText.replace(/[^0-9.-]+/g, '')) || 0;
        
        // Build cart item
        const cartItem = {
            id: productItem.dataset.productId || '',
            name: productTitle,
            price: productPrice,
            quantity: 1,
            image: productImage,
            description: ''
        };
        
        // Save single-item cart to localStorage
        localStorage.setItem('cart', JSON.stringify([cartItem]));
        
        // Redirect to order page
        window.location.href = 'order.html';
    });
  });
}

/**
 * Open the order modal with product information
 */
function openOrderModal(image, title, price) {
  // First, close any open product modal to prevent conflicts
  const productModal = document.getElementById('productModal');
  if (productModal) {
    const bsProductModal = bootstrap.Modal.getInstance(productModal);
    if (bsProductModal) {
      bsProductModal.hide();
      // Wait for product modal to close before opening order modal
      setTimeout(() => {
        showOrderModalWithData(image, title, price);
      }, 300);
    } else {
      showOrderModalWithData(image, title, price);
    }
  } else {
    showOrderModalWithData(image, title, price);
  }
}

/**
 * Helper function to show the order modal with product data
 */
function showOrderModalWithData(image, title, price) {
  // Set product information in the modal
  document.getElementById('orderProductImage').src = image;
  document.getElementById('orderProductTitle').textContent = title;
  document.getElementById('orderProductPrice').textContent = price;
  
  // Store product information for order submission
  window.currentOrderProduct = {
    image: image,
    title: title,
    price: price
  };
  
  // Open the modal
  const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
  orderModal.show();
}

/**
 * Submit the order
 */
async function submitOrder() {
  // Get form values
  const name = document.getElementById('customerName').value;
  const city = document.getElementById('customerCity').value;
  const phone = document.getElementById('customerPhone').value;
  const deliveryAddress = document.getElementById('deliveryAddress')?.value || '';
  const deliveryType = document.querySelector('input[name="deliveryType"]:checked')?.value || 'home';
  
  // Get product information from localStorage cart
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  if (!cart.length) {
    showError('No products in cart');
    return;
  }
  
  // Create order object
  const order = {
    customerName: name,
    city: city,
    phoneNumber: phone,
    deliveryAddress: deliveryAddress,
    deliveryType: deliveryType,
    items: cart.map(item => ({
      id: item.id || 'N/A',
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      image: item.image,
      description: item.description || ''
    })),
    status: 'pending',
    subtotal: cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
    deliveryFee: deliveryType === 'home' ? 10 : 0, // Example delivery fee
    total: 0 // Will be calculated on the server
  };
  
  // Calculate total
  order.total = order.subtotal + order.deliveryFee;
  
  try {
    // Submit order to server
    const response = await window.api.orders.addOrder(order);
    console.log('Order submitted successfully:', response);
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Close the modal
    const orderModal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
    if (orderModal) orderModal.hide();
    
    // Show success message
    showOrderConfirmation();
    
    // Redirect to home page after a delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 3000);
    
  } catch (error) {
    console.error('Error submitting order:', error);
    showError(error.message || 'Failed to submit order. Please try again.');
  }
}

/**
 * Show error message
 */
function showError(message) {
  // Create error toast
  const toastHTML = `
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div class="toast align-items-center text-white bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing toast if present
  const existingToast = document.querySelector('.position-fixed.bottom-0.end-0.p-3');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Append toast to body
  document.body.insertAdjacentHTML('beforeend', toastHTML);
  
  // Show the toast
  const toastElement = document.querySelector('.toast');
  const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
  toast.show();
}

/**
 * Show order confirmation message
 */
function showOrderConfirmation() {
  // Create toast notification
  const toastHTML = `
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div id="orderToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-success text-white">
          <strong class="me-auto">Order Confirmed</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          Your order has been successfully placed! Thank you for shopping with us.
          <div class="mt-2">You will be redirected to the home page shortly...</div>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing toast if present
  const existingToast = document.querySelector('.position-fixed.bottom-0.end-0.p-3');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Append toast to body
  document.body.insertAdjacentHTML('beforeend', toastHTML);
  
  // Show the toast
  const toastElement = document.getElementById('orderToast');
  const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
  toast.show();
  
  // Reset form
  const orderForm = document.getElementById('orderForm');
  if (orderForm) orderForm.reset();
}