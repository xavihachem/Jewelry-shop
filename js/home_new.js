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
                // Rendering products incrementally with lazy images
                await renderProductsIncremental(products);
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

    async function renderProductsIncremental(products) {
        if (!products || products.length === 0) {
            productGrid.innerHTML = '<p class="text-center w-100">No products found.</p>';
            return;
        }

        // Format price (already DZD)
        const formatPriceDZD = (price) => String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // Clear and prepare grid
        productGrid.innerHTML = '';

        // Lazy-loading: single IntersectionObserver reused
        const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
        // Resolve image to absolute like in shop page (prefix API_BASE_URL when relative)
        const resolveImageUrl = (u) => {
            if (!u) return 'img/logo.png';
            if (/^https?:\/\//i.test(u)) return u;
            const base = (window.API_BASE_URL || '').replace(/\/+$/,'');
            if (!base) return u; // fallback as-is
            return u.startsWith('/') ? `${base}${u}` : `${base}/${u}`;
        };
        const getImgSrc = (p) => resolveImageUrl(p.imageUrl || p.image || 'img/logo.png');
        if (!window.homeLazyObserver) {
            window.homeLazyObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const img = entry.target;
                    const real = img.getAttribute('data-src');
                    if (real) {
                        img.src = real;
                        img.removeAttribute('data-src');
                        img.classList.remove('lazy');
                    }
                    obs.unobserve(img);
                });
            }, { rootMargin: '200px 0px', threshold: 0.01 });
        }
        const lazyObserver = window.homeLazyObserver;

        const createCard = (product) => {
            const id = product.id || product._id;
            const imgSrc = getImgSrc(product);
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
            col.innerHTML = `
                <a href="product.html?id=${id}" class="text-decoration-none">
                    <div class="product-card-new h-100">
                        <div class="product-image-container">
                            <div class="product-image-link" style="aspect-ratio: 1/1; overflow: hidden;">
                                <img data-src="${imgSrc}" src="${placeholder}" alt="${product.name}" class="product-image-new img-fluid lazy" loading="lazy" decoding="async" style="width:100%; height:100%; object-fit: cover;" />
                            </div>
                        </div>
                        <div class="product-info p-3">
                            <h3 class="product-title-new mb-1">${product.name}</h3>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="item-price text-gold fw-bold">${formatPriceDZD(product.price)} <span class="price-currency" style="color: #D4AF37 !important; display: inline-block; margin-left: 4px;">DZD</span></span>
                            </div>
                        </div>
                    </div>
                </a>`;
            return col;
        };

        // Incremental append one-by-one with a small yield for smoothness
        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            const el = createCard(p);
            productGrid.appendChild(el);
            const img = el.querySelector('img.lazy');
            if (img) lazyObserver.observe(img);
            // Yield to browser to paint between items
            await new Promise(requestAnimationFrame);
        }

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
