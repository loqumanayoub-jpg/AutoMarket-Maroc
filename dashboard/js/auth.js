document.addEventListener('DOMContentLoaded', async () => {
    const isLoginPage = window.location.pathname.toLowerCase().endsWith('/login.html') || window.location.pathname.toLowerCase().endsWith('login.html');

    if (isLoginPage) {
        return;
    }

    // التأكد من استخدام العميل الموحد window.supabase
    if (!window.supabase || !window.supabase.auth || typeof window.supabase.auth.getSession !== 'function') {
        console.error('Supabase client not initialized in auth.js');
        window.location.replace('login.html');
        return;
    }

    try {
        const { data: { session }, error } = await window.supabase.auth.getSession();

        if (error || !session) {
            window.location.replace('login.html');
            return;
        }

        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement && session.user) {
            userEmailElement.textContent = session.user.email;
        }

    } catch (err) {
        console.error('Auth verification failed:', err);
        window.location.replace('login.html');
    }

    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.onclick = async (event) => {
            event.preventDefault();
            event.stopPropagation();
            try {
                if (window.supabase && window.supabase.auth && typeof window.supabase.auth.signOut === 'function') {
                    const { error } = await window.supabase.auth.signOut();
                    if (error) {
                        console.warn('Logout warning:', error.message || error);
                    }
                }
            } catch (err) {
                console.error('Logout failed:', err);
            }
            try {
                localStorage.removeItem('admin:lang');
                sessionStorage.clear();
            } catch (_) {}
            window.location.replace('login.html');
        };
    }
});

async function logout() {
    if (window.supabase && window.supabase.auth && typeof window.supabase.auth.signOut === 'function') {
        const { error } = await window.supabase.auth.signOut();
        if (error) {
            console.warn('Logout warning:', error.message || error);
        }
    }
    try {
        localStorage.removeItem('admin:lang');
        sessionStorage.clear();
    } catch (_) {}
    window.location.replace('login.html');
}