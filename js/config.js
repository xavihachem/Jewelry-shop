// Centralized API configuration for ONYXIA
// Set these to your production endpoints. Leave empty to use defaults
// handled by js/api.js and js/admin-auth.js (localhost in dev, same-origin otherwise).

// Example for split domains in production:
 window.API_BASE_URL = 'http://onyxia.store:5001';
 window.ADMIN_BASE_URL = 'http://onyxia.store/admin';

// Default: keep empty; dynamic resolvers will choose sensible values.
//window.API_BASE_URL = window.API_BASE_URL || '';
//window.ADMIN_BASE_URL = window.ADMIN_BASE_URL || '';
