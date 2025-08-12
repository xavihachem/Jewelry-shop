// Facebook Pixel Loader
(function() {
    // Check if the script is already loaded
    if (window.fbq) {
        console.log('Facebook Pixel already loaded');
        return;
    }

    // Create the script element
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    
    // When the script loads, initialize the pixel
    script.onload = function() {
        console.log('Facebook Pixel script loaded');
        
        // Initialize the pixel
        window.fbq = function() {
            window.fbq.callMethod ?
            window.fbq.callMethod.apply(window.fbq, arguments) :
            window.fbq.queue.push(arguments);
        };
        
        if (!window._fbq) window._fbq = window.fbq;
        window.fbq.push = window.fbq;
        window.fbq.loaded = true;
        window.fbq.version = '2.0';
        window.fbq.queue = [];
        
        // Initialize with your Pixel ID
        window.fbq('init', '810352084654161');
        
        // Track page view
        window.fbq('track', 'PageView');
        
        console.log('Facebook Pixel initialized and PageView tracked');
    };
    
    // If there's an error loading the script
    script.onerror = function() {
        console.error('Failed to load Facebook Pixel');
    };
    
    // Add the script to the document
    document.head.appendChild(script);
    
    // Also try to track on window load
    window.addEventListener('load', function() {
        if (window.fbq) {
            window.fbq('track', 'PageView');
            console.log('Tracked PageView on window load');
        }
    });
})();
