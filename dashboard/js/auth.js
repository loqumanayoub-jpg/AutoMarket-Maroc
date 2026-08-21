document.addEventListener('DOMContentLoaded', async () => {
    // التأكد من استخدام العميل الموحد window.supabase
    if (!window.supabase || !window.supabase.auth || typeof window.supabase.auth.getSession !== 'function') {
        console.error('Supabase client not initialized in auth.js');
        window.location.href = 'login.html';
        return;
    }

    try {
        const { data: { session }, error } = await window.supabase.auth.getSession();

        if (error || !session) {
            window.location.href = 'login.html';
            return;
        }

        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement && session.user) {
            userEmailElement.textContent = session.user.email;
        }

    } catch (err) {
        console.error('Auth verification failed:', err);
        window.location.href = 'login.html';
    }
});

async function logout() {
    if (window.supabase && window.supabase.auth && typeof window.supabase.auth.signOut === 'function') {
        await window.supabase.auth.signOut();
    }
    window.location.href = 'login.html';
}