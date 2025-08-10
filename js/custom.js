document.addEventListener('DOMContentLoaded', function () {


  // Add page transition effect
  document.body.classList.add('page-loaded');
  
  // Handle internal links for smooth page transitions
  // Only apply to main desktop navigation links, not the offcanvas menu links
  document.querySelectorAll('.navbar-collapse .nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.href.includes(window.location.hostname) || this.href.startsWith('/') || this.href.startsWith('./') || this.href.startsWith('../')) {
        e.preventDefault();
        document.body.classList.add('page-transitioning');
        
        setTimeout(() => {
          window.location.href = this.href;
        }, 500);
      }
    });
  });
  
  const modalElem = document.getElementById('productModal');
  if (modalElem) {

    const modalProductImage = document.getElementById('modalProductImage');
    const modalProductTitle = document.getElementById('modalProductTitle');
    const modalProductDescription = document.getElementById('modalProductDescription');
    const modalProductPrice = document.getElementById('modalProductPrice');

    // Handle product image clicks for detail modal
    document.addEventListener('click', function(event) {
      const productLink = event.target.closest('.product-link');
      if (!productLink) return;
      event.preventDefault();
      // Prefer data attributes on the .product-link itself
      let image = productLink.dataset.productImage;
      let title = productLink.dataset.productTitle;
      let description = productLink.dataset.productDescription;
      let price = productLink.dataset.productPrice;
      // If not present, fallback to .cart-link or .add-to-cart
      if (!image || !title || !description || !price) {
        const productItem = productLink.closest('.product-item');
        const dataElem = productItem ? (productItem.querySelector('.cart-link') || productItem.querySelector('.add-to-cart')) : null;
        if (dataElem) {
          image = dataElem.dataset.productImage;
          title = dataElem.dataset.productTitle;
          description = dataElem.dataset.productDescription;
          price = dataElem.dataset.productPrice;
        }
      }
      if (!(image && title && description && price)) return;
      modalProductImage.src = image;
      modalProductTitle.textContent = title;
      modalProductDescription.textContent = description;
      modalProductPrice.textContent = price;
      modalElem.classList.add('active');
    });

    // Add event listeners to all product items
    const productItems = document.querySelectorAll('.product-item');
    console.log('[custom.js] Product items found:', productItems.length);

    productItems.forEach(item => {
      const cartButton = item.querySelector('.cart-link');
      if (cartButton) {
        cartButton.addEventListener('click', function (event) {
          event.preventDefault();

          const image = this.dataset.productImage;
          const title = this.dataset.productTitle;
          const description = this.dataset.productDescription;
          const price = this.dataset.productPrice;

          // Populate the modal with the product data
          modalProductImage.src = image;
          modalProductTitle.textContent = title;
          modalProductDescription.textContent = description;
          modalProductPrice.textContent = price;

          // Show the modal
          modalElem.classList.add('active');
        });
      }
    });
  }

  // Network Animation
  const canvas = document.getElementById('network-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1.5; // Larger particles
        this.speedX = (Math.random() - 0.5) * 0.8; // Slightly faster movement
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.color = getComputedStyle(document.documentElement).getPropertyValue('--primary-gold').trim() || '#c5a47e';
        this.opacity = Math.random() * 0.7 + 0.3; // More visible
        this.baseSize = this.size;
        this.targetSize = this.size * 1.5;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseDir = 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Pulsing effect
        if (this.size > this.targetSize) this.pulseDir = -1;
        if (this.size < this.baseSize) this.pulseDir = 1;
        this.size += this.pulseSpeed * this.pulseDir;
      }

      draw() {
        // Glow effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(197, 164, 126, 0)');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = this.opacity * 0.8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Core particle
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = [];
    const particleCount = Math.min(Math.floor(canvas.width * canvas.height / 15000), 100);
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Enhanced connection lines
      const connectionDistance = 200; // Increased connection range
      const maxLineWidth = 1.5;
      const minLineOpacity = 0.3;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            // Calculate line properties based on distance
            const distanceRatio = 1 - (distance / connectionDistance);
            const lineWidth = maxLineWidth * distanceRatio * distanceRatio; // Quadratic falloff
            const lineOpacity = minLineOpacity + (1 - minLineOpacity) * distanceRatio;
            
            // Create gradient for the line
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            gradient.addColorStop(0, particles[i].color);
            gradient.addColorStop(1, particles[j].color);
            
            // Draw the connection line
            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.globalAlpha = lineOpacity * 0.9; // Slightly transparent
            
            // Draw a subtle glow
            ctx.shadowBlur = 5 * distanceRatio;
            ctx.shadowColor = particles[i].color;
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            
            // Reset shadow for next frame
            ctx.shadowBlur = 0;
          }
        }
      }
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    console.log('[custom.js] Starting network animation...');
    animate();

    // Cleanup on unload (optional for this context, but good practice)
    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(animationFrameId);
    });
  }

  // Navbar Scroll & Mobile Menu Logic
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    });
  }

  const mobileMenu = document.getElementById('mobile-menu');
  const openMenuBtn = document.getElementById('mobile-menu-open-btn');
  const closeMenuBtn = document.getElementById('mobile-menu-close-btn');

  if (mobileMenu && openMenuBtn && closeMenuBtn) {
    openMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('active');
    });

    closeMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
    });
  }

  // Hide or remove preloader overlay after page load
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    preloader.classList.add('loaded');
    setTimeout(() => {
      preloader.parentNode && preloader.parentNode.removeChild(preloader);
    }, 700);
  }

    // Initialize language toggle from localStorage
  (function() {
    const savedLang = localStorage.getItem('language') || 'ar';
    if (savedLang) {
      const ddToggle = document.getElementById('languageDropdown');
      if (ddToggle) {
        const span = ddToggle.querySelector('span');
        if (span) {
          span.textContent = savedLang === 'en' ? 'English' : 'العربية';
        }
      }
      document.querySelectorAll('[data-lang]').forEach(el => {
        if (el.getAttribute('data-lang') === savedLang) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });
    }
  })();

  // Function to update language and refresh the page
  function updateLanguage(lang) {
    localStorage.setItem('language', lang);
    // Update dropdown toggle text
    const ddToggle = document.getElementById('languageDropdown');
    if (ddToggle) {
      const span = ddToggle.querySelector('span');
      if (span) {
        span.textContent = lang === 'en' ? 'English' : 'العربية';
      }
    }
    // Close dropdown if Bootstrap Dropdown instance exists
    if (typeof bootstrap !== 'undefined' && ddToggle) {
      const ddInstance = bootstrap.Dropdown.getInstance(ddToggle);
      if (ddInstance) ddInstance.hide();
    }
    // Force a page refresh to apply translations
    window.location.reload();
  }

  // Language selection handling
  document.querySelectorAll('[data-lang]').forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      updateLanguage(lang);
    });
  });

});
