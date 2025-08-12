/**
 * API Service for Kaira Jewelry Shop
 * Handles all communication with the backend server
 */

// Resolve API base URL in a flexible way so we don't hardcode it across files
// Priority:
// 1) window.API_BASE_URL (can be set inline before scripts)
// 2) <meta name="api-base-url" content="https://api.onyxia.store">
// 3) Local dev fallback: http://localhost:5001
// 4) Same origin (useful when API is served from the same domain)
const __metaApiBase = (typeof document !== 'undefined')
  ? document.querySelector('meta[name="api-base-url"]')?.content
  : undefined;

const API_BASE = (
  (typeof window !== 'undefined' && window.API_BASE_URL && window.API_BASE_URL.trim()) ||
  (__metaApiBase && __metaApiBase.trim()) ||
  ((typeof window !== 'undefined') && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001'
    : (typeof window !== 'undefined' ? window.location.origin : ''))
).replace(/\/$/, '');

const API_URL = `${API_BASE}/api`;

// Helper function to handle API responses
const handleResponse = async (response) => {
  // First, clone the response to be able to read it multiple times
  const responseClone = response.clone();
  
  try {
    const data = await responseClone.json();
    
    if (!response.ok) {
      // API error occurred
      
      const error = new Error(data.message || 'API request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  } catch (jsonError) {
    // If JSON parsing fails, try to get the response as text
    try {
      const text = await response.text();
      // Failed to parse JSON response
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    } catch (textError) {
      // Failed to read response as text
      throw new Error('Failed to process API response');
    }
  }
};

// Product operations
const productApi = {
  // Get all products
  getAllProducts: async () => {
    const response = await fetch(`${API_URL}/products`);
    return handleResponse(response);
  },

  // Get a single product by ID
  getProductById: async (id) => {
    try {
      // Fetching product by ID
      const response = await fetch(`${API_URL}/products/${id}`);
      // Received response status
      
      if (!response.ok) {
        const errorText = await response.text();
        // Error response received
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      // Received response data
      return data;
    } catch (error) {
      // Error in getProductById
      throw error;
    }
  },

  // Add a new product
  addProduct: async (product) => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return handleResponse(response);
  },

  // Update an existing product
  updateProduct: async (id, product) => {
    // Updating product with ID
    
    // Ensure the ID is a string and properly formatted
    const productId = id.toString().trim();
    
    try {
      // Sending update request
      
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(product, (key, value) => {
          // Log each property being stringified
          // Stringifying product data
          return value;
        })
      });
      
      // Received response status
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          // Error response data
        } catch (e) {
          const text = await response.text();
          // Failed to parse error response
          errorData = { message: `HTTP error! status: ${response.status} - ${text}` };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      // Update successful
      return responseData;
    } catch (error) {
      // Error in updateProduct
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },

  // Delete a product
  deleteProduct: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  },

  // Get products for home page (display_home = true)
  getHomeProducts: async () => {
    // Add a small delay to prevent rapid consecutive requests
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      // Fetching featured products
      const response = await fetch(`${API_URL}/products/home`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // API returned error status
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }
      
      const data = await handleResponse(response);
      // Successfully fetched featured products
      return data;
    } catch (error) {
      // Using fallback method to load featured products
      
      // Add a small delay before fallback to prevent thundering herd
      await delay(300);
      
      // Fallback to filtering all products if the /home endpoint fails
      try {
        // Fetching all products as fallback
        const response = await fetch(`${API_URL}/products`);
        const allProducts = await handleResponse(response);
        
        const featuredProducts = allProducts
          .filter(p => p.display_home)
          .sort((a, b) => (a.home_position || 0) - (b.home_position || 0));
          
        // Filtered featured products
        return featuredProducts;
      } catch (fallbackError) {
        // Fallback in getHomeProducts failed
        // Return empty array instead of throwing to prevent breaking the UI
        return [];
      }
    }
  }
};

// Order operations
const orderApi = {
  // Get all orders
  getAllOrders: async () => {
    const response = await fetch(`${API_URL}/orders`);
    return handleResponse(response);
  },

  // Add a new order
  addOrder: async (order) => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return handleResponse(response);
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  // Delete an order
  deleteOrder: async (id) => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Language operations
const languageApi = {
  // Get all language entries (translations)
  getAllLanguages: async () => {
    const response = await fetch(`${API_URL}/languages`);
    return handleResponse(response);
  }
};

// Export API methods
window.api = {
  products: productApi,
  orders: orderApi,
  languages: languageApi,
  
  // Initialize API (for backward compatibility)
  init: async () => {
    // API initialized
    return true;
  }
};

// Alias for backward compatibility with admin.html
window.dbOperations = window.api;
