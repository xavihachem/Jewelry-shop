// Check if user is authenticated before loading admin pages
document.addEventListener('DOMContentLoaded', async () => {
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
        const response = await fetch('http://localhost:3000/api/admin/verify', {
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
                    await fetch('/api/admin/logout', {
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
