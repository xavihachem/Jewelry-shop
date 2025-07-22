/**
 * Shop page functionality for Kaira Jewelry Shop
 * Loads products from database and handles product display
 */

document.addEventListener('DOMContentLoaded', async function() {
  console.log('[shop.js] DOMContentLoaded fired');
  console.log('shop.js: DOMContentLoaded - Initializing database and loading products.');
  
  // Initialize database
  await window.dbOperations.init();
  
  // Load products from database
  loadProducts();
  
  // Initialize product modal
  initProductModal();
});

/**
 * Load products from database and display them in the product grid
 */
async function loadProducts() {
  console.log('shop.js: loadProducts - Attempting to get all products from database.');
  const productGrid = document.querySelector('#shop-products .row.product-grid');
  if (!productGrid) {
    console.error('shop.js: loadProducts - Product grid not found in DOM. Products cannot be displayed.');
    return;
  }
  console.log('shop.js: loadProducts - Found product grid:', productGrid);
  return loadProductsIntoGrid(productGrid);
}

/**
 * Helper function to load products into a grid element
 */
async function loadProductsIntoGrid(productGrid) {
  
  // Clear existing products
  productGrid.innerHTML = '';
  
  try {
    // Get products from database
    const products = await window.dbOperations.products.getAllProducts();
    console.log(`shop.js: loadProducts - Retrieved ${products.length} products.`);
    console.log('Products data:', JSON.stringify(products));
    
    if (!products || products.length === 0) {
      console.log('shop.js: loadProducts - No products found in database, displaying message.');
      productGrid.innerHTML = '<div class="col-12 text-center"><p>No products found</p></div>';
      return;
    }
  
    // Add products to grid
    products.forEach(product => {
      console.log(`shop.js: loadProducts - Processing product: ${product.name}`);
      const productCol = document.createElement('div');
      productCol.className = 'product-col';
      
      productCol.innerHTML = `
        <div class="product-item">
          <div class="product-badge">
            <span>Exclusive</span>
          </div>
          <div class="image-holder">
            <a href="#" class="product-link" data-product-image="${product.image}" data-product-title="${product.name}" data-product-description="${product.description}" data-product-price="${parseFloat(product.price) * 1300}">
              <img src="${product.image}" alt="${product.name}" class="img-fluid product-image">
            </a>
          </div>
          <div class="product-content">
            <div class="product-header">
              <h5 class="product-title">${product.name}</h5>
              <p class="product-description">${product.description}</p>
            </div>
            
            <div class="product-footer">
              <div class="price-container">
                <span class="price-currency">د.ع</span>
                <span class="item-price">${(parseFloat(product.price) * 1300).toLocaleString('en-US')}</span>
              </div>
              
              <button type="button" class="order-now-btn add-to-cart" 
                data-product-image="${product.image}"
                data-product-title="${product.name}" 
                data-product-description="${product.description}"
                data-product-price="${parseFloat(product.price) * 1300}">
                <span class="btn-text">Order Now</span>
                <span class="btn-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      `;
      
      productGrid.appendChild(productCol);
    });
    
    // Re-initialize order buttons after loading products
    if (typeof replaceCartButtons === 'function') {
      replaceCartButtons();
    }
    
    console.log('shop.js: loadProducts - Successfully loaded products into grid');
    return true;
  } catch (error) {
    console.error('shop.js: loadProducts - Error loading products:', error);
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
    console.error('shop.js: initProductModal - Product modal element not found');
    return;
  }
  
  const productModal = new bootstrap.Modal(modalElem);
  const modalProductImage = document.getElementById('modalProductImage');
  const modalProductTitle = document.getElementById('modalProductTitle');
  const modalProductDescription = document.getElementById('modalProductDescription');
  const modalProductPrice = document.getElementById('modalProductPrice');
  const orderNowBtn = modalElem.querySelector('.order-now-btn');
  
  if (!modalProductImage || !modalProductTitle || !modalProductDescription || !modalProductPrice) {
    console.error('shop.js: initProductModal - One or more modal elements not found');
    return;
  }
  
  // Add event listeners to product links (and reuse data attributes from order buttons)
  document.addEventListener('click', function(event) {
    // Check if clicked on product link or product image
    const productLink = event.target.closest('.product-link');
    if (productLink) {
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
          productModal.hide();
          
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
      productModal.show();
    }
  });
}