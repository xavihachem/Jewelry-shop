/**
 * Database operations for Kaira Jewelry Shop
 * Using SQL.js (SQLite implementation in JavaScript)
 */

// Initialize the database
let db = null;
let sqlLoaded = false;

// Load SQL.js library
function loadSqlJs() {
  return new Promise((resolve, reject) => {
    // Check if SQL.js is already loaded
    if (window.SQL) {
      sqlLoaded = true;
      resolve(window.SQL);
      return;
    }

    // Create script element to load SQL.js
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
    script.onload = () => {
      sqlLoaded = true;
      resolve(window.SQL);
    };
    script.onerror = () => {
      reject(new Error('Failed to load SQL.js'));
    };
    document.head.appendChild(script);
  });
}

// Compress image to reduce storage size
function compressImage(base64Image) {
  // If it's not a base64 image, return as is
  if (!base64Image || !base64Image.startsWith('data:image')) {
    return base64Image;
  }
  
  try {
    // For simplicity in this implementation, we'll reduce the quality without resizing
    // This avoids the asynchronous loading issues with Image objects
    
    // Extract the MIME type and base64 data
    const parts = base64Image.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    
    // If it's already a JPEG with low quality, return as is
    if (mime === 'image/jpeg' && base64Image.length < 500000) {
      return base64Image;
    }
    
    // For very large images, we'll use a more aggressive compression
    // This is a simple approach - in a production app, you might want to use a proper image processing library
    if (base64Image.length > 1000000) { // Over 1MB
      // Create a temporary image element
      const tempImg = document.createElement('img');
      tempImg.src = base64Image;
      
      // Create a canvas with reduced dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set to a reasonable size that maintains aspect ratio but reduces dimensions
      const maxDimension = 600; // Smaller max dimension for very large images
      
      // We need to wait for the image to load, but since this is synchronous,
      // we'll use a simplified approach that works for most cases
      canvas.width = maxDimension;
      canvas.height = maxDimension;
      
      // Draw with reduced quality
      ctx.drawImage(tempImg, 0, 0, maxDimension, maxDimension);
      
      // Return a more compressed JPEG
      return canvas.toDataURL('image/jpeg', 0.6); // Lower quality for very large images
    }
    
    // For moderately large images, use better quality
    return base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, 'data:image/jpeg;base64,');
  } catch (error) {
    console.error('Error compressing image:', error);
    return base64Image; // Return original if compression fails
  }
}

// Initialize the database
async function initDatabase() {
  if (db) return db; // Return existing database if already initialized
  
  try {
    // Load SQL.js if not already loaded
    if (!sqlLoaded) {
      await loadSqlJs();
    }
    
    // Initialize SQL.js
    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    
    // Check if we have a database in localStorage
    const dbData = localStorage.getItem('kairaDb');
    
    if (dbData) {
      console.log('Loading existing database from localStorage.');
      // Load existing database
      const uInt8Array = new Uint8Array(JSON.parse(dbData));
      db = new SQL.Database(uInt8Array);
    } else {
      console.log('Creating a new database.');
      // Create a new database
      db = new SQL.Database();
      
      // Create products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          image TEXT,
          display_home BOOLEAN DEFAULT 0,
          home_position INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT NOT NULL,
          customer_city TEXT,
          customer_phone TEXT,
          product_id INTEGER,
          product_name TEXT NOT NULL,
          product_price REAL NOT NULL,
          product_image TEXT,
          status TEXT DEFAULT 'Pending',
          order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);
      
      // Save the database to localStorage
      saveDatabase();
    }
    
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    return null;
  }
}

// Save the database to localStorage
function saveDatabase() {
  if (!db) return;
  
  try {
    const data = db.export();
    const array = Array.from(new Uint8Array(data));
    const jsonData = JSON.stringify(array);
    
    // Check if the data size is too large for localStorage
    if (jsonData.length > 4.5 * 1024 * 1024) { // ~4.5MB safety limit (below 5MB browser limit)
      console.warn('Database size exceeds safe localStorage limit. Some data may not be saved.');
      // Attempt to clean up old data or implement alternative storage strategy
      cleanupOldData();
    }
    
    localStorage.setItem('kairaDb', jsonData);
    return true;
  } catch (error) {
    console.error('Error saving database to localStorage:', error);
    alert('Storage limit reached. Please delete some products or orders to continue.');
    return false;
  }
}

// Clean up old data to make space
function cleanupOldData() {
  try {
    // Attempt to remove old orders if they exist
    if (db) {
      // Keep only the 10 most recent orders
      db.run('DELETE FROM orders WHERE id NOT IN (SELECT id FROM orders ORDER BY order_date DESC LIMIT 10)');
      
      // If there are too many products with images, consider removing image data from older products
      // This is a last resort to save space
      const productCount = db.exec('SELECT COUNT(*) FROM products')[0].values[0][0];
      if (productCount > 20) {
        console.warn('Too many products with image data. Removing image data from oldest products.');
        db.run('UPDATE products SET image = NULL WHERE id NOT IN (SELECT id FROM products ORDER BY id DESC LIMIT 20)');
      }
    }
  } catch (error) {
    console.error('Error cleaning up old data:', error);
  }
}

// Product operations
const productOperations = {
  // Get a single product by ID
  getProductById: async function(id) {
    await initDatabase();
    if (!db) return null;
    
    try {
      const result = db.exec('SELECT * FROM products WHERE id = ?', [id]);
      if (result.length === 0 || result[0].values.length === 0) {
        console.log(`database.js: getProductById - No product found with ID ${id}`);
        return null;
      }
      
      const columns = result[0].columns;
      const product = {};
      columns.forEach((col, i) => {
        product[col] = result[0].values[0][i];
      });
      
      console.log(`database.js: getProductById - Found product:`, product);
      return product;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  },
  
  // Get all products
  getAllProducts: async function() {
    await initDatabase();
    if (!db) return [];
    
    try {
      const result = db.exec('SELECT * FROM products ORDER BY id DESC');
      console.log('database.js: getAllProducts - Raw result from database:', result);
      if (result.length === 0) {
        console.log('database.js: getAllProducts - No products found.');
        return [];
      }

      console.log('database.js: getAllProducts - Columns:', result[0].columns);
      console.log('database.js: getAllProducts - Values:', result[0].values);

      const columns = result[0].columns;
      const products = result[0].values.map(row => {
        const product = {};
        columns.forEach((col, i) => {
          product[col] = row[i];
        });
        return product;
      });
      console.log('database.js: getAllProducts - Processed products:', products);
      console.log(`database.js: getAllProducts - Number of products retrieved: ${products.length}`);
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  },
  
  // Get products for home page display
  getHomeProducts: async function() {
    await initDatabase();
    if (!db) return [];
    
    try {
      const result = db.exec(
        'SELECT * FROM products WHERE display_home = 1 ORDER BY home_position ASC LIMIT 8'
      );
      if (result.length === 0) return [];
      
      const columns = result[0].columns;
      return result[0].values.map(row => {
        const product = {};
        columns.forEach((col, i) => {
          product[col] = row[i];
        });
        return product;
      });
    } catch (error) {
      console.error('Error getting home products:', error);
      return [];
    }
  },
  
  // Add a new product
  addProduct: async function(product) {
    await initDatabase();
    if (!db) return false;
    
    try {
      // Check if the image data is too large (base64 strings can be very large)
      if (product.image && product.image.length > 500000) { // ~500KB limit for images
        console.warn('Image size is too large. Attempting to compress...');
        product.image = compressImage(product.image);
      }
      
      db.run(
        'INSERT INTO products (name, description, price, image, display_home, home_position) VALUES (?, ?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.image, product.display_home || 0, product.home_position || 0]
      );
      
      // Save database and check if it was successful
      const saved = saveDatabase();
      if (!saved) {
        throw new Error('Failed to save database due to storage limits');
      }
      return true;
    } catch (error) {
      console.error('Error adding product:', error);
      return false;
    }
  },
  
  // Update an existing product
  updateProduct: async function(id, product) {
    await initDatabase();
    if (!db) return false;
    
    try {
      // Check if the image data is too large
      if (product.image && product.image.length > 500000) { // ~500KB limit for images
        console.warn('Image size is too large. Attempting to compress...');
        product.image = compressImage(product.image);
      }
      
      db.run(
        'UPDATE products SET name = ?, description = ?, price = ?, image = ?, display_home = ?, home_position = ? WHERE id = ?',
        [product.name, product.description, product.price, product.image, product.display_home, product.home_position, id]
      );
      
      // Save database and check if it was successful
      const saved = saveDatabase();
      if (!saved) {
        throw new Error('Failed to save database due to storage limits');
      }
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  },
  
  // Delete a product
  deleteProduct: async function(id) {
    await initDatabase();
    if (!db) return false;
    
    try {
      db.run('DELETE FROM products WHERE id = ?', [id]);
      saveDatabase();
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  },
  
  // Get a product by ID
  getProductById: async function(id) {
    await initDatabase();
    if (!db) return null;
    
    try {
      const result = db.exec('SELECT * FROM products WHERE id = ?', [id]);
      if (result.length === 0) return null;
      
      const columns = result[0].columns;
      const row = result[0].values[0];
      
      const product = {};
      columns.forEach((col, i) => {
        product[col] = row[i];
      });
      
      return product;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  }
};

// Order operations
const orderOperations = {
  // Get all orders
  getAllOrders: async function() {
    await initDatabase();
    if (!db) return [];
    
    try {
      const result = db.exec('SELECT * FROM orders ORDER BY order_date DESC');
      if (result.length === 0) return [];
      
      const columns = result[0].columns;
      return result[0].values.map(row => {
        const order = {};
        columns.forEach((col, i) => {
          order[col] = row[i];
        });
        return order;
      });
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  },
  
  // Add a new order
  addOrder: async function(order) {
    await initDatabase();
    if (!db) return false;
    
    try {
      // Compress product image if it's too large
      if (order.product_image && order.product_image.length > 500000) {
        console.warn('Order product image is too large. Attempting to compress...');
        order.product_image = compressImage(order.product_image);
      }
      
      db.run(
        'INSERT INTO orders (customer_name, customer_city, customer_phone, product_id, product_name, product_price, product_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [order.customer_name, order.customer_city, order.customer_phone, order.product_id, order.product_name, order.product_price, order.product_image, order.status || 'Pending']
      );
      
      // Save database and check if it was successful
      const saved = saveDatabase();
      if (!saved) {
        // If saving failed due to storage limits, try to clean up and retry
        cleanupOldData();
        const retryResult = saveDatabase();
        if (!retryResult) {
          throw new Error('Failed to save order due to storage limits');
        }
      }
      return true;
    } catch (error) {
      console.error('Error adding order:', error);
      return false;
    }
  },
  
  // Update order status
  updateOrderStatus: async function(id, status) {
    await initDatabase();
    if (!db) return false;
    
    try {
      db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
      saveDatabase();
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  },
  
  // Delete an order
  deleteOrder: async function(id) {
    await initDatabase();
    if (!db) return false;
    
    try {
      db.run('DELETE FROM orders WHERE id = ?', [id]);
      saveDatabase();
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }
};

// Add sample products if database is empty
async function addSampleProductsIfEmpty() {
  await initDatabase();
  if (!db) return;
  
  try {
    // Check if products table is empty
    const result = db.exec('SELECT COUNT(*) FROM products');
    const count = result[0].values[0][0];
    
    if (count === 0) {
      console.log('Products table is empty. Adding sample products to database...');
      
      // Sample products data
      const sampleProducts = [
        {
          name: 'The Solitaire',
          description: 'A timeless classic, this solitaire diamond ring features a brilliant-cut diamond set in a 14k white gold band. Perfect for engagements and special anniversaries.',
          price: 2450,
          image: 'images/product-item-1.jpg',
          display_home: 1,
          home_position: 1
        },
        {
          name: 'Pearl Drops',
          description: 'Elegant and sophisticated, these freshwater pearl drop earrings are accented with small diamonds and set in sterling silver.',
          price: 890,
          image: 'images/product-item-2.jpg',
          display_home: 1,
          home_position: 2
        },
        {
          name: 'The Aurelia',
          description: 'This stunning 18k gold necklace features a delicate chain and a unique pendant, making it a versatile piece for any occasion.',
          price: 1200,
          image: 'images/product-item-3.jpg',
          display_home: 1,
          home_position: 3
        },
        {
          name: 'Emerald Elegance',
          description: 'A beautiful emerald ring surrounded by small diamonds, set in 18k white gold. The perfect statement piece for any collection.',
          price: 1850,
          image: 'images/product-item-4.jpg',
          display_home: 0,
          home_position: 0
        },
        {
          name: 'Sapphire Dreams',
          description: 'A stunning sapphire pendant necklace with diamond accents, set in 14k white gold. Elegant and timeless.',
          price: 1350,
          image: 'images/product-item-5.jpg',
          display_home: 0,
          home_position: 0
        },
        {
          name: 'Ruby Passion',
          description: 'Exquisite ruby earrings with diamond halos, set in 18k rose gold. A perfect gift for that special someone.',
          price: 1650,
          image: 'images/product-item-6.jpg',
          display_home: 0,
          home_position: 0
        },
        {
          name: 'Diamond Infinity',
          description: 'A beautiful infinity bracelet featuring small diamonds set in 14k white gold. Symbolizes eternal love and commitment.',
          price: 980,
          image: 'images/product-item-7.jpg',
          display_home: 0,
          home_position: 0
        },
        {
          name: 'Pearl Elegance',
          description: 'A classic pearl necklace featuring AAA-grade freshwater pearls with a 14k gold clasp. Timeless and sophisticated.',
          price: 750,
          image: 'images/product-item-8.jpg',
          display_home: 0,
          home_position: 0
        }
      ];
      
      // Add sample products to database
      for (const product of sampleProducts) {
        await productOperations.addProduct(product);
      }
      
      console.log('Sample products added successfully!');
      saveDatabase(); // Ensure database is saved after adding samples
    }
  } catch (error) {
    console.error('Error adding sample products:', error);
  }
}

// Export database operations
window.dbOperations = {
  init: async function() {
    await initDatabase();
    await addSampleProductsIfEmpty();
    return db;
  },
  products: productOperations,
  orders: orderOperations
};