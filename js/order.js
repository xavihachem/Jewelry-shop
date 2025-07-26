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
  const cartButtons = document.querySelectorAll('.add-to-cart');
  
  cartButtons.forEach(button => {
    // Change button text to "Order Now"
    button.innerHTML = '<i class="bi bi-bag-check"></i> Order Now';
    button.classList.add('order-now-btn');
    
    // Remove existing event listeners and add new one
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'order.html';
        return;
      e.preventDefault();
      
      // Get product information from data attributes or parent elements
      const productItem = this.closest('.product-item');
      if (!productItem) return;
      
      // Get product image - first try product-image class, then any img
      const productImageEl = productItem.querySelector('.product-image') || productItem.querySelector('img');
      const productImage = productImageEl ? productImageEl.src : '';
      
      // Get product title - try multiple possible selectors
      let productTitle = '';
      if (productItem.querySelector('.product-title a')) {
        productTitle = productItem.querySelector('.product-title a').textContent;
      } else if (productItem.querySelector('.product-title')) {
        productTitle = productItem.querySelector('.product-title').textContent;
      } else if (productItem.querySelector('h3')) {
        productTitle = productItem.querySelector('h3').textContent;
      } else if (productItem.dataset.productTitle) {
        productTitle = productItem.dataset.productTitle;
      }
      
      // Get product price - try multiple possible selectors
      let productPrice = '';
      if (productItem.querySelector('.item-price')) {
        productPrice = productItem.querySelector('.item-price').textContent;
      } else if (productItem.querySelector('.product-price')) {
        productPrice = productItem.querySelector('.product-price').textContent;
      } else if (productItem.querySelector('.price')) {
        productPrice = productItem.querySelector('.price').textContent;
      } else if (productItem.dataset.productPrice) {
        productPrice = productItem.dataset.productPrice;
      }
      
      // Open order modal with product information
      openOrderModal(productImage, productTitle, productPrice);
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
function submitOrder() {
  // Get form values
  const name = document.getElementById('customerName').value;
  const city = document.getElementById('customerCity').value;
  const phone = document.getElementById('customerPhone').value;
  
  // Get product information
  const product = window.currentOrderProduct;
  
  if (!product) {
    console.error('No product information available');
    return;
  }
  
  // Create order object
  const order = {
    name: name,
    city: city,
    phone: phone,
    product: product.title,
    price: product.price,
    image: product.image,
    date: new Date().toLocaleDateString(),
    status: 'Pending'
  };
  
  // Save order to localStorage
  saveOrder(order);
  
  // Close the modal
  const orderModal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
  orderModal.hide();
  
  // Show success message
  showOrderConfirmation();
}

/**
 * Save order to localStorage
 */
function saveOrder(order) {
  // Get existing orders from localStorage
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  
  // Add new order
  orders.push(order);
  
  // Save to localStorage
  localStorage.setItem('orders', JSON.stringify(orders));
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
  document.getElementById('orderForm').reset();
}