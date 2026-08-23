document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    const loginSuccess = document.getElementById('loginSuccess');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const resetPasswordPanel = document.getElementById('resetPasswordPanel');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const resetSubmitBtn = document.getElementById('resetSubmitBtn');
    const resetEmailInput = document.getElementById('resetEmail');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const resetStatus = document.getElementById('resetStatus');

    function getCurrentLanguage() {
        const stored = localStorage.getItem('admin:lang');
        if (stored === 'fr' || stored === 'en') return stored;
        return 'ar';
    }

    function t(key) {
        const lang = getCurrentLanguage();
        const map = {
            ar: {
                invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح.',
                missingCredentials: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
                authUnavailable: 'إعادة تعيين كلمة المرور غير متاحة الآن. يرجى التواصل مع المسؤول.',
                resetEmailFailed: 'تعذر إرسال رابط إعادة التعيين. يرجى التحقق من البريد الإلكتروني والمحاولة مرة أخرى.',
                resetEmailSent: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
                resetSending: 'جارٍ الإرسال...',
                resetSendButton: 'إرسال رابط إعادة التعيين',
                cancelButton: 'إلغاء',
                loginFailed: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
                loginUnexpected: 'حدث خطأ غير متوقع أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.',
                authUnavailableLogin: 'فشل الاتصال بخدمة المصادقة. يرجى إعادة تحميل الصفحة.'
            },
            fr: {
                invalidEmail: 'Veuillez saisir une adresse e-mail valide.',
                missingCredentials: 'Veuillez saisir votre e-mail et votre mot de passe.',
                authUnavailable: 'La réinitialisation du mot de passe n\'est pas disponible pour le moment. Contactez l\'administrateur.',
                resetEmailFailed: 'Impossible d\'envoyer le lien de réinitialisation. Vérifiez l\'adresse e-mail et réessayez.',
                resetEmailSent: 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.',
                resetSending: 'Envoi en cours...',
                resetSendButton: 'Envoyer le lien de réinitialisation',
                cancelButton: 'Annuler',
                loginFailed: 'L\'adresse e-mail ou le mot de passe est incorrect. Veuillez réessayer.',
                loginUnexpected: 'Une erreur inattendue s\'est produite pendant la connexion. Veuillez réessayer.',
                authUnavailableLogin: 'Impossible de se connecter au service d\'authentification. Veuillez recharger la page.'
            },
            en: {
                invalidEmail: 'Please enter a valid email address.',
                missingCredentials: 'Please enter both email and password.',
                authUnavailable: 'Password reset is not available right now. Please contact the administrator.',
                resetEmailFailed: 'We could not send the reset email. Please check the email address and try again.',
                resetEmailSent: 'A password reset link has been sent to your email.',
                resetSending: 'Sending...',
                resetSendButton: 'Send reset link',
                cancelButton: 'Cancel',
                loginFailed: 'The email or password is incorrect. Please try again.',
                loginUnexpected: 'Something went wrong while logging in. Please try again.',
                authUnavailableLogin: 'Unable to connect to the authentication service. Please refresh the page and try again.'
            }
        };
        return map[lang] && map[lang][key] ? map[lang][key] : map.ar[key];
    }

    function clearMessages() {
        if (loginError) loginError.style.display = 'none';
        if (loginSuccess) loginSuccess.style.display = 'none';
        if (resetStatus) {
            resetStatus.classList.remove('visible');
            resetStatus.textContent = '';
            resetStatus.classList.remove('alert-danger', 'alert-success');
        }
    }

    function showError(message) {
        if (loginError) {
            loginError.textContent = message;
            loginError.style.display = 'block';
        }
        if (loginSuccess) loginSuccess.style.display = 'none';
    }

    function showSuccess(message) {
        if (loginSuccess) {
            loginSuccess.textContent = message;
            loginSuccess.style.display = 'block';
        }
        if (loginError) loginError.style.display = 'none';
    }

    function showResetStatus(message, kind = 'info') {
        if (!resetStatus) return;
        resetStatus.textContent = message;
        resetStatus.classList.add('visible');
        resetStatus.classList.remove('alert-danger', 'alert-success');
        if (kind === 'error') {
            resetStatus.classList.add('alert-danger');
        } else if (kind === 'success') {
            resetStatus.classList.add('alert-success');
        }
    }

    function syncResetUi() {
        if (resetSubmitBtn) {
            const isLoading = resetSubmitBtn.disabled;
            resetSubmitBtn.textContent = isLoading ? t('resetSending') : t('resetSendButton');
        }
        if (cancelResetBtn) {
            cancelResetBtn.textContent = t('cancelButton');
        }
        const title = document.getElementById('resetPasswordTitle');
        if (title) {
            title.textContent = getCurrentLanguage() === 'ar' ? 'إعادة تعيين كلمة المرور' : getCurrentLanguage() === 'fr' ? 'Réinitialiser le mot de passe' : 'Reset password';
        }
    }

    function setResetLoading(isLoading) {
        if (!resetSubmitBtn) return;
        resetSubmitBtn.disabled = isLoading;
        resetSubmitBtn.textContent = isLoading ? t('resetSending') : t('resetSendButton');
    }

    function getResetRedirectUrl() {
        const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:8000';
        return `${origin}/dashboard/login.html`;
    }

    if (forgotPasswordBtn && resetPasswordPanel) {
        forgotPasswordBtn.addEventListener('click', () => {
            clearMessages();
            syncResetUi();
            resetPasswordPanel.hidden = false;
            document.body.style.overflow = 'hidden';
            if (resetEmailInput) {
                const emailValue = emailInput ? emailInput.value.trim() : '';
                resetEmailInput.value = emailValue;
                setTimeout(() => resetEmailInput.focus(), 50);
            }
        });
    }

    if (cancelResetBtn && resetPasswordPanel) {
        cancelResetBtn.addEventListener('click', () => {
            resetPasswordPanel.hidden = true;
            document.body.style.overflow = '';
            clearMessages();
            if (resetEmailInput) resetEmailInput.value = '';
        });
    }

    if (resetPasswordPanel) {
        resetPasswordPanel.addEventListener('click', (event) => {
            if (event.target === resetPasswordPanel) {
                resetPasswordPanel.hidden = true;
                document.body.style.overflow = '';
                clearMessages();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (!resetPasswordPanel.hidden && event.key === 'Escape') {
                resetPasswordPanel.hidden = true;
                document.body.style.overflow = '';
                clearMessages();
            }
        });
    }

    document.addEventListener('admin:lang:changed', () => {
        syncResetUi();
    });

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages();

            if (!window.supabase || !window.supabase.auth || typeof window.supabase.auth.resetPasswordForEmail !== 'function') {
                showResetStatus(t('authUnavailable'), 'error');
                return;
            }

            const email = resetEmailInput ? resetEmailInput.value.trim() : '';
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showResetStatus(t('invalidEmail'), 'error');
                return;
            }

            try {
                setResetLoading(true);
                const { error } = await window.supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: getResetRedirectUrl()
                });

                if (error) {
                    showResetStatus(t('resetEmailFailed'), 'error');
                    return;
                }

                showResetStatus(t('resetEmailSent'), 'success');
                if (resetEmailInput) resetEmailInput.value = '';
                setTimeout(() => {
                    resetPasswordPanel.hidden = true;
                    document.body.style.overflow = '';
                    clearMessages();
                }, 1400);
            } catch (err) {
                console.error('Password reset error:', err);
                showResetStatus(t('resetEmailFailed'), 'error');
            } finally {
                setResetLoading(false);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages();

            if (!window.supabase || !window.supabase.auth || typeof window.supabase.auth.signInWithPassword !== 'function') {
                console.error('Supabase client is not initialized properly.');
                showError(t('authUnavailableLogin'));
                return;
            }

            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!email || !password) {
                showError(t('missingCredentials'));
                return;
            }

            try {
                const { data, error } = await window.supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    showError(t('loginFailed'));
                    return;
                }

                window.location.replace('dashboard.html');

            } catch (err) {
                console.error('Login error:', err);
                showError(t('loginUnexpected'));
            }
        });
    }
});