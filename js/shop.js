/**
 * Shop page functionality for Kaira Jewelry Shop
 * Loads products from API and handles product display
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Initialize API
  await window.api.init();
  
  // Load products from API and wait for completion
  try {
    const loaded = await loadProducts();
    console.log('[shop.js] loadProducts completed:', loaded);
  } catch (e) {
    console.error('[shop.js] Error loading products:', e);
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
    console.error('shop.js: loadProducts - Product grid not found in DOM. Products cannot be displayed.');
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
        <div class="product-item">
          <div class="product-badge">
            <span>Exclusive</span>
          </div>
          <div class="image-holder">
            <a href="product.html?id=${product.id || product._id}" class="product-link" data-product-id="${product.id || product._id}">
              <img src="${product.image}" alt="${product.name}" class="img-fluid product-image">
            </a>
          </div>
          <div class="product-content">
            <div class="product-header">
              <h5 class="product-title">${product.name}</h5>
              ${product.smallDescription ? `<p class="product-description">${product.smallDescription}</p>` : '<p class="product-description text-muted">No description available</p>'}
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
    
    // Add pagination controls if there are multiple pages
    if (totalPages > 1) {
      const pagination = document.createElement('div');
      pagination.className = 'pagination d-flex justify-content-center align-items-center gap-3 mt-4';
      
      // Previous button
      const prevBtn = document.createElement('button');
      prevBtn.className = 'btn btn-outline-primary';
      prevBtn.innerHTML = '&larr; Previous';
      prevBtn.disabled = shopCurrentPage === 1;
      prevBtn.addEventListener('click', () => loadProductsIntoGrid(productGrid, shopCurrentPage - 1));
      
      // Page numbers
      const pageNumbers = document.createElement('div');
      pageNumbers.className = 'd-flex gap-2';
      
      // Always show first page
      if (shopCurrentPage > 3) {
        const firstPage = document.createElement('button');
        firstPage.className = `btn ${shopCurrentPage === 1 ? 'btn-primary' : 'btn-outline-primary'}`;
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
        pageBtn.className = `btn ${i === shopCurrentPage ? 'btn-primary' : 'btn-outline-primary'}`;
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
        lastPage.className = `btn ${shopCurrentPage === totalPages ? 'btn-primary' : 'btn-outline-primary'}`;
        lastPage.textContent = totalPages;
        lastPage.addEventListener('click', () => loadProductsIntoGrid(productGrid, totalPages));
        pageNumbers.appendChild(lastPage);
      }
      
      // Next button
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-outline-primary';
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
    console.error('shop.js: initProductModal - One or more modal elements not found');
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
      console.log('[shop.js] Click event on document, found productLink:', productLink);
    if (productLink && !event.target.closest('button')) {
        event.preventDefault();
        console.log('[shop.js] Triggering product modal open via link:', productLink);
      
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