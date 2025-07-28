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
// --- Pagination State ---
let currentPage = 1;
const PRODUCTS_PER_PAGE = 14;
let allProducts = [];

async function loadFeaturedProducts(page = 1) {
  const featuredProductsRow = document.querySelector('.featured-products-section .row:not(:first-child)');
  const paginationControls = document.getElementById('pagination-controls');
  if (!featuredProductsRow) return;

  // Only fetch from DB if not already loaded
  if (!allProducts.length) {
    allProducts = await window.dbOperations.products.getHomeProducts();
  }

  // Pagination logic
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPage = page;

  // Clear existing products and controls
  featuredProductsRow.innerHTML = '';
  if (paginationControls) paginationControls.innerHTML = '';

  if (allProducts.length === 0) {
    featuredProductsRow.innerHTML = '<div class="col-12 text-center"><p>No featured products found</p></div>';
    return;
  }

  // Slice products for current page
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIdx = startIdx + PRODUCTS_PER_PAGE;
  const productsToShow = allProducts.slice(startIdx, endIdx);

  productsToShow.forEach((product, index) => {
    const productCol = document.createElement('div');
    productCol.className = 'col-lg-4 col-md-6 mb-4';
    productCol.setAttribute('data-aos', 'fade-up');
    productCol.setAttribute('data-aos-delay', (200 + (index * 100)).toString());
    
    productCol.innerHTML = `
      <div class="product-item majestic-card">
        <div class="image-holder">
          <a href="#" class="product-link" 
             data-product-image="${product.image}" 
             data-product-title="${product.name}" 
             data-product-description="${product.description}" 
             data-product-price="${(parseFloat(product.price) * 1300).toLocaleString('en-US')} د.ع">
            <img src="${product.image}" alt="${product.name}" class="img-fluid product-image">
          </a>
          <div class="product-badge">
            <span>Featured</span>
          </div>
        </div>
        <div class="product-content text-center">
          <h5 class="product-title mt-3">${product.name}</h5>
          <p class="product-description mb-2">${product.description}</p>
          <span class="item-price d-block mb-3">$${parseFloat(product.price).toFixed(2)}</span>
        </div>
      </div>
    `;
    featuredProductsRow.appendChild(productCol);
  });

  // Render pagination controls if needed
  if (paginationControls && totalPages > 1) {
    let controlsHTML = '';
    controlsHTML += `<button class="btn btn-outline-gold mx-1" ${currentPage === 1 ? 'disabled' : ''} id="pagination-prev">Prev</button>`;
    controlsHTML += `<span class="mx-2">Page ${currentPage} of ${totalPages}</span>`;
    controlsHTML += `<button class="btn btn-outline-gold mx-1" ${currentPage === totalPages ? 'disabled' : ''} id="pagination-next">Next</button>`;
    paginationControls.innerHTML = controlsHTML;
    document.getElementById('pagination-prev').onclick = () => loadFeaturedProducts(currentPage - 1);
    document.getElementById('pagination-next').onclick = () => loadFeaturedProducts(currentPage + 1);
  }

  // Re-initialize order buttons after loading products
  if (typeof replaceCartButtons === 'function') {
    replaceCartButtons();
  }
}

// Ensure initial load uses pagination
// Patch: clear allProducts on reload
window.reloadFeaturedProducts = function() {
  allProducts = [];
  loadFeaturedProducts(1);
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
    // Check if the click is on a product link or image
    const trigger = event.target.closest('.product-link');
    if (!trigger) return;

    event.preventDefault();

    // Get data from the product link
    const image = trigger.dataset.productImage;
    const title = trigger.dataset.productTitle;
    const description = trigger.dataset.productDescription;
    const price = trigger.dataset.productPrice;

    // Populate the modal with the product data
    modalProductImage.src = image;
    modalProductTitle.textContent = title;
    modalProductDescription.textContent = description;
    modalProductPrice.textContent = price;

    // Show the modal
    productModal.show();
  });
}