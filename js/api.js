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
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(response);
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
    console.log('Product data:', product);
    
    // Ensure the ID is a string and properly formatted
    const productId = id.toString().trim();
    
    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(product)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
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
