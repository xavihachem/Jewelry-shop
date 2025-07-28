/**
 * API Service for Kaira Jewelry Shop
 * Handles all communication with the backend server
 */

const API_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  // First, clone the response to be able to read it multiple times
  const responseClone = response.clone();
  
  try {
    const data = await responseClone.json();
    
    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        error: data
      });
      
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
      console.error('Failed to parse JSON response. Response text:', text);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    } catch (textError) {
      console.error('Failed to read response as text:', textError);
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
      console.log(`[API] Fetching product with ID: ${id}`);
      const response = await fetch(`${API_URL}/products/${id}`);
      console.log(`[API] Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] Error response:`, errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[API] Response data:', data);
      return data;
    } catch (error) {
      console.error('[API] Error in getProductById:', error);
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
    console.log('Updating product with ID:', id);
    console.log('Product data:', JSON.parse(JSON.stringify(product))); // Deep clone to avoid reference issues
    
    // Ensure the ID is a string and properly formatted
    const productId = id.toString().trim();
    
    try {
      console.log('Sending request to:', `${API_URL}/products/${productId}`);
      
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(product, (key, value) => {
          // Log each property being stringified
          console.log(`Stringifying ${key}:`, value);
          return value;
        })
      });
      
      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error response data:', errorData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
          const text = await response.text();
          console.error('Raw error response:', text);
          errorData = { message: `HTTP error! status: ${response.status} - ${text}` };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Update successful, response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in updateProduct:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        productId,
        productData: product
      });
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
      console.log('Fetching featured products from /products/home');
      const response = await fetch(`${API_URL}/products/home`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`API returned ${response.status} for /products/home:`, errorData);
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }
      
      const data = await handleResponse(response);
      console.log('Successfully fetched featured products:', data);
      return data;
    } catch (error) {
      console.warn('Using fallback method to load featured products. Error:', error.message);
      
      // Add a small delay before fallback to prevent thundering herd
      await delay(300);
      
      // Fallback to filtering all products if the /home endpoint fails
      try {
        console.log('Fetching all products as fallback');
        const response = await fetch(`${API_URL}/products`);
        const allProducts = await handleResponse(response);
        
        const featuredProducts = allProducts
          .filter(p => p.display_home)
          .sort((a, b) => (a.home_position || 0) - (b.home_position || 0));
          
        console.log(`Filtered ${featuredProducts.length} featured products from ${allProducts.length} total products`);
        return featuredProducts;
      } catch (fallbackError) {
        console.error('Fallback in getHomeProducts failed:', fallbackError);
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

// Export API methods
window.api = {
  products: productApi,
  orders: orderApi,
  
  // Initialize API (for backward compatibility)
  init: async () => {
    console.log('API initialized');
    return true;
  }
};

// Alias for backward compatibility with admin.html
window.dbOperations = window.api;
