/**
 * Homepage functionality for Kaira Jewelry Shop
 * Loads featured products from database for the homepage
 */

document.addEventListener('DOMContentLoaded', async function() {
  console.log('[home.js] DOMContentLoaded fired');
  
  // Initialize database
  await window.dbOperations.init();
  
  // Load featured products from database
  loadFeaturedProducts();
  
  // Initialize product modal
  initProductModal();
});

/**
 * Load featured products from database and display them in the featured products section
 */
async function loadFeaturedProducts() {
  const featuredProductsRow = document.querySelector('.featured-products-section .row:not(:first-child)');
  if (!featuredProductsRow) return;
  
  // Clear existing products
  featuredProductsRow.innerHTML = '';
  
  // Get featured products from database
  const products = await window.dbOperations.products.getHomeProducts();
  
  if (products.length === 0) {
    featuredProductsRow.innerHTML = '<div class="col-12 text-center"><p>No featured products found</p></div>';
    return;
  }
  
  // Add products to featured section
  products.forEach((product, index) => {
    const productCol = document.createElement('div');
    productCol.className = 'col-lg-4 col-md-6 mb-4';
    productCol.setAttribute('data-aos', 'fade-up');
    productCol.setAttribute('data-aos-delay', (200 + (index * 100)).toString());
    
    productCol.innerHTML = `
      <div class="product-item majestic-card">
        <div class="image-holder">
          <a href="#" class="product-link">
            <img src="${product.image}" alt="${product.name}" class="img-fluid product-image">
          </a>
          <div class="product-badge">
            <span>Featured</span>
          </div>
        </div>
        <div class="product-content text-center">
          <h5 class="product-title mt-3"><a href="#">${product.name}</a></h5>
          <p class="product-description">${product.description}</p>
          <span class="item-price">$${parseFloat(product.price).toFixed(2)}</span>
          <div class="cart-concern mt-3">
            <div class="cart-button d-flex justify-content-center align-items-center">
              <button type="button" class="btn-wrap cart-link d-flex align-items-center add-to-cart" 
                data-product-image="${product.image}"
                data-product-title="${product.name}" 
                data-product-description="${product.description}"
                data-product-price="$${parseFloat(product.price).toFixed(2)}">
                <span class="cart-icon"><i class="bi bi-bag"></i></span>
                <span class="text-uppercase">add to cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    featuredProductsRow.appendChild(productCol);
  });
  
  // Re-initialize order buttons after loading products
  if (typeof replaceCartButtons === 'function') {
    replaceCartButtons();
  }
}

/**
 * Initialize product modal functionality
 */
function initProductModal() {
  const modalElem = document.getElementById('productModal');
  if (!modalElem) return;
  
  const productModal = new bootstrap.Modal(modalElem);
  const modalProductImage = document.getElementById('modalProductImage');
  const modalProductTitle = document.getElementById('modalProductTitle');
  const modalProductDescription = document.getElementById('modalProductDescription');
  const modalProductPrice = document.getElementById('modalProductPrice');
  
  // Add event listeners to product items after they're loaded
  document.addEventListener('click', function(event) {
    // Determine trigger: 'Add to Cart' or product image click
    let trigger = event.target.closest('.cart-link');
    let isImage = false;
    if (!trigger) {
      trigger = event.target.closest('.product-link');
      isImage = !!trigger;
    }
    if (!trigger) return;

    event.preventDefault();

    // Use data from cart-link regardless of trigger
    let dataElem;
    if (!isImage) {
      dataElem = trigger;
    } else {
      const productItem = trigger.closest('.product-item');
      if (!productItem) return;
      dataElem = productItem.querySelector('.cart-link');
      if (!dataElem) return;
    }

    const image = dataElem.dataset.productImage;
    const title = dataElem.dataset.productTitle;
    const description = dataElem.dataset.productDescription;
    const price = dataElem.dataset.productPrice;

    // Populate the modal with the product data
    modalProductImage.src = image;
    modalProductTitle.textContent = title;
    modalProductDescription.textContent = description;
    modalProductPrice.textContent = price;

    // Show the modal
    productModal.show();
  });
}