document.addEventListener('DOMContentLoaded', function () {
  console.log('[custom.js] DOMContentLoaded fired');
  const modalElem = document.getElementById('productModal');
  console.log('[custom.js] Modal element:', modalElem);
  if (modalElem) {
    const productModal = new bootstrap.Modal(modalElem);
    const modalProductImage = document.getElementById('modalProductImage');
    const modalProductTitle = document.getElementById('modalProductTitle');
    const modalProductDescription = document.getElementById('modalProductDescription');
    const modalProductPrice = document.getElementById('modalProductPrice');

    // Add event listeners to all product items
    const productItems = document.querySelectorAll('.product-item');
    console.log('[custom.js] Product items found:', productItems.length);

    productItems.forEach(item => {
      item.addEventListener('click', function (event) {
        event.preventDefault();

        const image = item.querySelector('.product-image').src;
        const title = item.querySelector('.product-title a').textContent;
        const description = item.querySelector('.product-description') ? item.querySelector('.product-description').textContent : 'No description available.';
        const price = item.querySelector('.item-price').textContent;

        // Populate the modal with the product data
        modalProductImage.src = image;
        modalProductTitle.textContent = title;
        modalProductDescription.textContent = description;
        modalProductPrice.textContent = price;

        // Show the modal
        productModal.show();
      });
    });
  }

  // Network Animation
  const canvas = document.getElementById('network-canvas');
  console.log('[custom.js] Network canvas:', canvas);
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
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = '#c5a47e'; // Gold color for the theme
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
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

      ctx.strokeStyle = '#c5a47e';
      ctx.lineWidth = 0.2;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.globalAlpha = 1 - (distance / 150);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
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
});