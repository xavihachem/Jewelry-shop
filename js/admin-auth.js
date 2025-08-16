// Check if user is authenticated before loading admin pages
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin auth script loaded');

    // Skip check for login page
    if (window.location.pathname.endsWith('login.html')) {
        console.log('Login page detected, skipping auth check');
        return;
    }

    // Resolve Admin API base URL
    const ADMIN_BASE = (window.ADMIN_BASE_URL || window.API_BASE_URL || window.location.origin).replace(/\/$/, '');
    console.log('Using ADMIN_BASE:', ADMIN_BASE);

    try {
        // Verify session with the server
        console.log('Verifying session with server...');
        const response = await fetch(`${ADMIN_BASE}/api/admin/verify`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include' // Crucial for sending session cookies
        });
        let data; 
        try {
            data = await response.json();
        } catch (e) {
            console.error('Failed to parse JSON from /api/admin/verify:', e);
            console.error('Response status/text:', response.status, response.statusText);
            window.location.href = `login.html?error=${encodeURIComponent('Received non-JSON response from server.')}`;
            return;
        }

        if (!response.ok || !data?.success) {
            console.error('Session verification failed. Details:', {
                status: response.status,
                statusText: response.statusText,
                body: data
            });
            window.location.href = `login.html?error=${encodeURIComponent(data?.message || 'Session expired. Please log in again.')}`;
            return;
        }

        console.log('Session verified successfully.', data);

        // Add logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            console.log('Adding logout handler');
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Logout initiated');
                try {
                    await fetch(`${ADMIN_BASE}/api/admin/logout`, {
                        method: 'POST',
                        credentials: 'include'
                    });
                } catch (error) {
                    console.error('Logout request failed:', error);
                    // Proceed with client-side logout regardless
                }
                
                console.log('Redirecting to login page after logout.');
                window.location.href = 'login.html?success=You have been logged out.';
            });
        }

    } catch (error) {
        console.error('Authentication check failed:', error);
        // Redirect to login on any other error
        window.location.href = `login.html?error=${encodeURIComponent('An error occurred. Please log in again.')}`;
    }
});
