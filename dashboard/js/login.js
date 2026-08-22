document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (loginError) loginError.style.display = 'none';

            // التحقق من أن Client الموحد متاح وجاهز للاستخدام
            if (!window.supabase || !window.supabase.auth || typeof window.supabase.auth.signInWithPassword !== 'function') {
                console.error('Supabase client is not initialized properly.');
                if (loginError) {
                    loginError.textContent = 'فشل الاتصال بخدمة المصادقة. يرجى إعادة تحميل الصفحة.';
                    loginError.style.display = 'block';
                }
                return;
            }

            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            try {
                // استخدام العميل الموحد window.supabase مباشرة بدون إنشاء client جديد
                const { data, error } = await window.supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    if (loginError) {
                        loginError.textContent = error.message;
                        loginError.style.display = 'block';
                    }
                    return;
                }

                // النجاح -> التوجيه إلى صفحة لوحة التحكم الصحيحة
                window.location.href = 'dashboard.html';

            } catch (err) {
                console.error('Login error:', err);
                if (loginError) {
                    loginError.textContent = 'حدث خطأ غير متوقع أثناء تسجيل الدخول.';
                    loginError.style.display = 'block';
                }
            }
        });
    }
});