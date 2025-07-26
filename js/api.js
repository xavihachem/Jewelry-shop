/**
 * API Service for Kaira Jewelry Shop
 * Handles all communication with the backend server
 */

const API_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
}

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
    const products = await this.getAllProducts();
    return products.filter(p => p.display_home)
                  .sort((a, b) => a.home_position - b.home_position);
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
