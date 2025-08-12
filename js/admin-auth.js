// Check if user is authenticated before loading admin pages
document.addEventListener('DOMContentLoaded', async () => {
    // Resolve Admin API base URL flexibly (window var, meta tag, fallback to same origin)
    const __metaAdminBase = document.querySelector('meta[name="admin-base-url"]')?.content;
    const ADMIN_BASE = (
        (window.ADMIN_BASE_URL && window.ADMIN_BASE_URL.trim()) ||
        (__metaAdminBase && __metaAdminBase.trim()) ||
        ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:3000'
            : window.location.origin)
    ).replace(/\/$/, '');
    // Skip check for login page
    if (window.location.pathname.endsWith('login.html')) {
        return;
    }

    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Verify token with server
        const response = await fetch(`${ADMIN_BASE}/api/admin/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Invalid token');
        }
        
        // Add logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await fetch(`${ADMIN_BASE}/api/admin/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                }
                
                // Clear token and redirect to login
                localStorage.removeItem('adminToken');
                window.location.href = 'login.html';
            });
        }
        
    } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    }
});
