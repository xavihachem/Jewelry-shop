// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Initialize the network canvas if it exists
    const initNetworkCanvas = () => {
        const canvas = document.getElementById('network-canvas');
        if (!canvas) return;
        
        // Set canvas dimensions
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Rest of the canvas initialization code is in custom.js
    };
    
    // Initialize canvas
    initNetworkCanvas();

    async function loadProducts() {
        if (!productGrid) {
            // Product grid element not found
            return;
        }

        // Show loading state
        if (loadingIndicator) loadingIndicator.classList.remove('d-none');
        
        try {
            // Loading products...
            
            // Check if API is available
            if (!window.api || !window.api.products) {
                throw new Error('API not initialized. Make sure api.js is loaded before home_new.js');
            }
            
            // Get featured products
            const products = await window.api.products.getHomeProducts();
            
            if (Array.isArray(products) && products.length > 0) {
                // Rendering products
                renderProducts(products);
            } else {
                // No featured products available
                productGrid.innerHTML = `
                    <div class="col-12 text-center">
                        <p class="text-muted">No featured products available at the moment.</p>
                        <a href="shop.html" class="btn btn-outline-light mt-2">
                            <i class="bi bi-arrow-right me-2"></i>View All Products
                        </a>
                    </div>`;
            }
        } catch (error) {
            // Failed to load products
            const errorMessage = error.message || 'Failed to load products. Please try again later.';
            productGrid.innerHTML = `
                <div class="col-12 text-center text-danger">
                    <p>${errorMessage}</p>
                    <button onclick="window.location.reload()" class="btn btn-outline-light mt-2">
                        <i class="bi bi-arrow-clockwise me-2"></i>Try Again
                    </button>
                </div>`;
        } finally {
            loadingIndicator?.classList.add('d-none');
        }
    }

    function renderProducts(products) {
        if (!products || products.length === 0) {
            productGrid.innerHTML = '<p class="text-center w-100">No products found.</p>';
            return;
        }

        // Function to format price (already in DZD)
        const formatPriceDZD = (price) => {
            // Format with commas as thousand separators
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        productGrid.innerHTML = products.map(product => `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <a href="shop.html" class="text-decoration-none">
                    <div class="product-card-new h-100">
                        <div class="product-image-container">
                            <div class="product-image-link">
                                <img src="${product.image || 'img/placeholder.jpg'}" 
                                     alt="${product.name}" 
                                     class="product-image-new img-fluid"
                                     loading="lazy">
                            </div>
                        </div>
                        <div class="product-info p-3">
                            <h3 class="product-title-new mb-1">${product.name}</h3>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="item-price text-gold fw-bold">${formatPriceDZD(product.price)} <span class="price-currency" style="color: #D4AF37 !important; display: inline-block; margin-left: 4px;">DZD</span></span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');
        
        // Initialize tooltips for the new elements
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    function addToCart(productId) {
        // Product added to cart
        // Here you would typically add the product to a cart object and update the UI
        const cartCount = document.getElementById('cart-count');
        let currentCount = parseInt(cartCount.textContent);
        cartCount.textContent = currentCount + 1;
    }

    // Make addToCart globally accessible
    window.addToCart = addToCart;

    loadProducts();
});
