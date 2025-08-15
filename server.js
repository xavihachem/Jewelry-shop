require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 80;

// Admin credentials (in production, use environment variables)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'securepassword123';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Middleware
app.use(cors());
app.use(express.json());
// Serve static frontend from project root so we don't need VS Code Live Server
const STATIC_DIR = path.join(__dirname);
app.use(express.static(STATIC_DIR));

// Simple in-memory token blacklist
const tokenBlacklist = new Set();

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
        return res.sendStatus(401);
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Login endpoint
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Token verification endpoint
app.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({ valid: true });
});

// Logout endpoint
app.post('/api/admin/logout', authenticateToken, (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    tokenBlacklist.add(token);
    res.json({ success: true });
});

// Protected admin route
app.get('/admin*', authenticateToken, (req, res, next) => {
  // If the request is for an API endpoint, continue
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Otherwise, serve the admin page
  const filePath = path.join(__dirname, req.path === '/admin' ? 'admin.html' : req.path);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send('Not found');
    } else {
      res.sendFile(filePath);
    }
  });
});

// Public site routes
// Root should serve the main site entry
app.get('/', (req, res) => {
  return res.sendFile(path.join(STATIC_DIR, 'index_new.html'));
});

// Generic static file resolver for other pages (e.g., /shop.html, /product.html)
app.get('*', (req, res) => {
  try {
    const sanitized = req.path.replace(/\\/g, '/');
    const requested = sanitized.startsWith('/') ? sanitized.slice(1) : sanitized;
    const targetPath = path.join(STATIC_DIR, requested);

    fs.access(targetPath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send('Not found');
      }
      return res.sendFile(targetPath);
    });
  } catch (e) {
    return res.status(500).send('Server error');
  }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
