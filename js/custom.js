document.addEventListener('DOMContentLoaded', function () {
  const productModal = new bootstrap.Modal(document.getElementById('productModal'));
  const modalProductImage = document.getElementById('modalProductImage');
  const modalProductTitle = document.getElementById('modalProductTitle');
  const modalProductDescription = document.getElementById('modalProductDescription');
  const modalProductPrice = document.getElementById('modalProductPrice');

  // Add event listeners to all product items
  const productItems = document.querySelectorAll('.product-item');

  productItems.forEach(item => {
    item.addEventListener('click', function (event) {
      event.preventDefault();

      // Get product data from the clicked item
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

  // Starfield Animation
  const starsContainer = document.getElementById('stars-container');
  if (starsContainer) {
    const createStars = () => {
      for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        const size = Math.random() * 3 + 1; // Star size between 1px and 4px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        star.style.top = `${Math.random() * -100}vh`; // Start off-screen from the top
        star.style.left = `${Math.random() * 100}%`;
        
        const duration = Math.random() * 5 + 5; // Animation duration between 5s and 10s
        const delay = Math.random() * 5; // Animation delay up to 5s
        
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${delay}s`;
        
        starsContainer.appendChild(star);
      }
    };
    createStars();
  }
});