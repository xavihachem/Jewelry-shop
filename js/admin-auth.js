// Check if user is authenticated before loading admin pages
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin auth script loaded');
    
    // Skip check for login page
    if (window.location.pathname.endsWith('login.html')) {
        console.log('Login page detected, skipping auth check');
        return;
    }

    // Resolve Admin API base URL flexibly (window var, meta tag, or fallback to API_BASE_URL)
    const __metaAdminBase = document.querySelector('meta[name="admin-base-url"]')?.content;
    const ADMIN_BASE = (
        (window.ADMIN_BASE_URL && window.ADMIN_BASE_URL.trim()) ||
        (__metaAdminBase && __metaAdminBase.trim()) ||
        (window.API_BASE_URL && window.API_BASE_URL.trim()) ||
        window.location.origin
    ).replace(/\/$/, '');
    
    console.log('Using ADMIN_BASE:', ADMIN_BASE);
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('Token found in localStorage:', token ? 'Yes' : 'No');
    
    if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    try {
        console.log('Verifying token with server...');
        // Verify token with server
        const response = await fetch(`${ADMIN_BASE}/api/admin/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include' // Important for cookies if using them
        });
        
        const data = await response.json().catch(() => ({}));
        console.log('Token verification response:', { status: response.status, data });
        
        if (!response.ok) {
            throw new Error(data.message || 'Invalid token');
        }
        
        console.log('Token verified successfully');
        
        // Add logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            console.log('Adding logout handler');
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Logout initiated');
                try {
                    const logoutResponse = await fetch(`${ADMIN_BASE}/api/admin/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    });
                    
                    console.log('Logout response status:', logoutResponse.status);
                } catch (error) {
                    console.error('Logout error:', error);
                    // Continue with logout even if server logout fails
                }
                
                // Clear token and redirect to login
                console.log('Removing token and redirecting to login');
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            });
        }
        
    } catch (error) {
        console.error('Authentication error:', error);
        // Clear any invalid token
        localStorage.removeItem('token');
        // Redirect to login with error message
        window.location.href = `login.html?error=${encodeURIComponent(error.message || 'Authentication failed')}`;
    }
});
