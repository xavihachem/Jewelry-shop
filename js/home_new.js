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
            console.error('Product grid element not found');
            return;
        }

        // Show loading state
        if (loadingIndicator) loadingIndicator.classList.remove('d-none');
        
        try {
            console.log('Loading products...');
            
            // Check if API is available
            if (!window.api || !window.api.products) {
                throw new Error('API not initialized. Make sure api.js is loaded before home_new.js');
            }
            
            // Get featured products
            console.log('Fetching featured products...');
            const products = await window.api.products.getHomeProducts();
            console.log('Products received:', products);
            
            if (Array.isArray(products) && products.length > 0) {
                console.log(`Rendering ${products.length} products`);
                renderProducts(products);
            } else {
                console.log('No featured products available');
                productGrid.innerHTML = `
                    <div class="col-12 text-center">
                        <p class="text-muted">No featured products available at the moment.</p>
                        <a href="shop.html" class="btn btn-outline-light mt-2">
                            <i class="bi bi-arrow-right me-2"></i>View All Products
                        </a>
                    </div>`;
            }
        } catch (error) {
            console.error('Failed to load products:', error);
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

        productGrid.innerHTML = products.map(product => `
            <div class="product-col">
                <div class="card h-100 product-card">
                    <div class="card-img-container">
                        <img src="${product.image || 'img/placeholder.jpg'}" class="card-img-top" alt="${product.name}">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text mt-auto">$${product.price.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function addToCart(productId) {
        console.log(`Product ${productId} added to cart`);
        // Here you would typically add the product to a cart object and update the UI
        const cartCount = document.getElementById('cart-count');
        let currentCount = parseInt(cartCount.textContent);
        cartCount.textContent = currentCount + 1;
    }

    // Make addToCart globally accessible
    window.addToCart = addToCart;

    loadProducts();
});
