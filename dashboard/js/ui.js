document.addEventListener('DOMContentLoaded', () => {
  if (window.__dashboardUiBound__) {
    return;
  }
  window.__dashboardUiBound__ = true;

  // Lightweight language support and RTL handling
  const SUPPORTED = ['ar','fr','en'];
  const DEFAULT = 'ar';
  const storageKey = 'admin:lang';

  const getLangButtons = () => Array.from(document.querySelectorAll('.lang-option'));

  function getSavedLang(){
    const v = localStorage.getItem(storageKey);
    if (!v) return DEFAULT;
    return SUPPORTED.includes(v) ? v : DEFAULT;
  }

  function saveLang(l){ localStorage.setItem(storageKey, l); }

  function syncLangButtons(lang){
    const buttons = getLangButtons();
    buttons.forEach((button) => {
      const value = (button.dataset.lang || (button.textContent || '')).trim().toLowerCase();
      button.classList.toggle('active', value === lang);
    });
  }

  const translations = {
    ar: {
      dashboard: 'لوحة التحكم', cars: 'السيارات', messages: 'الرسائل', settings: 'الإعدادات',
      addCar: 'إضافة سيارة', refresh: 'تحديث', searchPlaceholder: 'بحث سريع في السيارات...',
      loginTitle: 'تسجيل الدخول', loginWelcome: 'مرحباً بك في AutoMarket Maroc', loginSubtitle: 'قم بتسجيل الدخول للمتابعة', loginButton: 'تسجيل الدخول',
      loginEmail: 'البريد الإلكتروني', loginPassword: 'كلمة المرور', loginRemember: 'تذكرني', loginForgot: 'نسيت كلمة المرور؟', loginResetTitle: 'إعادة تعيين كلمة المرور',
      pageHead: { overview: 'Royal dashboard', cars: 'إدارة السيارات', messages: 'سجل الرسائل', settings: 'إعدادات لوحة التحكم' },
      table: { image: 'الصورة', title: 'العلامة والنوع', year: 'السنة', price: 'الثمن', status: 'الحالة', actions: 'الإجراءات' },
      modal: { save: 'حفظ', saveChanges: 'حفظ التغييرات', cancel: 'إلغاء', delete: 'حذف' }
    },
  fr: {
    dashboard: 'Tableau de bord', cars: 'Véhicules', messages: 'Messages', settings: 'Paramètres',
    addCar: 'Ajouter une voiture', refresh: 'Actualiser', searchPlaceholder: 'Recherche rapide...',
    loginTitle: 'Connexion', loginWelcome: 'Bienvenue sur AutoMarket Maroc', loginSubtitle: 'Veuillez vous connecter', loginButton: 'Se connecter',
    loginEmail: 'Adresse e-mail', loginPassword: 'Mot de passe', loginRemember: 'Rester connecté', loginForgot: 'Mot de passe oublié ?', loginResetTitle: 'Réinitialiser le mot de passe',
    pageHead: { overview: 'Royal dashboard', cars: 'Gérer les véhicules', messages: 'Messages', settings: 'Paramètres' },
    table: { image: 'Image', title: 'Marque & Modèle', year: 'Année', price: 'Prix', status: 'Statut', actions: 'Actions' },
    modal: { save: 'Enregistrer', saveChanges: 'Enregistrer les modifications', cancel: 'Annuler', delete: 'Supprimer' }
  },
  en: {
    dashboard: 'Dashboard', cars: 'Cars', messages: 'Messages', settings: 'Settings',
    addCar: 'Add Car', refresh: 'Refresh', searchPlaceholder: 'Quick search...',
    loginTitle: 'Login', loginWelcome: 'Welcome to AutoMarket Maroc', loginSubtitle: 'Sign in to continue', loginButton: 'Sign in',
    loginEmail: 'Email', loginPassword: 'Password', loginRemember: 'Remember me', loginForgot: 'Forgot password?', loginResetTitle: 'Reset password',
    pageHead: { overview: 'Royal dashboard', cars: 'Manage Cars', messages: 'Messages', settings: 'Settings' },
    table: { image: 'Image', title: 'Brand & Model', year: 'Year', price: 'Price', status: 'Status', actions: 'Actions' },
    modal: { save: 'Save', saveChanges: 'Save Changes', cancel: 'Cancel', delete: 'Delete' }
  }
  };

  function applyLanguage(lang){
  const safeLang = SUPPORTED.includes(lang) ? lang : DEFAULT;
  document.documentElement.lang = safeLang;
  document.documentElement.setAttribute('dir', safeLang === 'ar' ? 'rtl' : 'ltr');
  document.body.classList.toggle('rtl', safeLang === 'ar');
  document.body.classList.toggle('ltr', safeLang !== 'ar');
  document.body.style.direction = safeLang === 'ar' ? 'rtl' : 'ltr';
  syncLangButtons(safeLang);

  // small UI text substitutions for nav and common buttons
  const t = translations[lang] || translations[DEFAULT];
  try {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop();
      if (!href) return;
      if (href.includes('dashboard')) a.querySelectorAll('span')[1].textContent = t.dashboard;
      if (href.includes('cars')) a.querySelectorAll('span')[1].textContent = t.cars;
      if (href.includes('messages')) a.querySelectorAll('span')[1].textContent = t.messages;
      if (href.includes('settings')) a.querySelectorAll('span')[1].textContent = t.settings;
    });

    const addBtn = document.getElementById('addCarBtn'); if (addBtn) addBtn.textContent = t.addCar;
    const refreshBtn = document.getElementById('refreshBtn'); if (refreshBtn) refreshBtn.textContent = t.refresh;
    const headerCarSearch = document.getElementById('headerCarSearch');
    if (headerCarSearch) headerCarSearch.placeholder = 'بحث سريع في السيارات...';

    // page headings
    document.querySelectorAll('.page-head h1').forEach(h => {
      const page = (window.location.pathname || '').split('/').pop();
      if (page.includes('dashboard')) h.textContent = t.pageHead.overview || h.textContent;
      if (page.includes('cars')) h.textContent = t.pageHead.cars || h.textContent;
      if (page.includes('messages')) h.textContent = t.pageHead.messages || h.textContent;
      if (page.includes('settings')) h.textContent = t.pageHead.settings || h.textContent;
    });

    // table headers
    document.querySelectorAll('.data-table thead').forEach(thead => {
      const ths = thead.querySelectorAll('th');
      if (ths.length >= 6) {
        ths[0].textContent = translations[lang].table.image;
        ths[1].textContent = translations[lang].table.title;
        ths[2].textContent = translations[lang].table.year;
        ths[3].textContent = translations[lang].table.price;
        ths[4].textContent = translations[lang].table.status;
        ths[5].textContent = translations[lang].table.actions;
      }
    });

    // Login page substitutions
    const loginTitle = document.querySelector('.login-title'); if (loginTitle) loginTitle.textContent = t.loginTitle;
    const loginWelcome = document.querySelector('.login-subtitle'); if (loginWelcome) loginWelcome.textContent = t.loginWelcome || t.loginSubtitle;
    const loginBtn = document.querySelector('.login-card button[type="submit"]'); if (loginBtn) loginBtn.textContent = t.loginButton;
    const loginEmail = document.querySelector('#email + label, label[for="email"]'); if (loginEmail) loginEmail.textContent = t.loginEmail || 'Email';
    const loginPassword = document.querySelector('#password + label, label[for="password"]'); if (loginPassword) loginPassword.textContent = t.loginPassword || 'Password';
    const rememberText = document.querySelector('.remember-me span'); if (rememberText) rememberText.textContent = t.loginRemember || 'Remember me';
    const forgotText = document.querySelector('.forgot-password-link'); if (forgotText) forgotText.textContent = t.loginForgot || 'Forgot password?';
    const resetTitle = document.querySelector('.reset-title'); if (resetTitle) resetTitle.textContent = t.loginResetTitle || 'Reset password';

    // modal button texts
    const addCarSubmit = document.getElementById('addCarSubmit'); if (addCarSubmit) addCarSubmit.textContent = t.modal.save;
    const addCarCancel = document.getElementById('addCarCancel'); if (addCarCancel) addCarCancel.textContent = t.modal.cancel;
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn'); if (confirmDeleteBtn) confirmDeleteBtn.textContent = t.modal.delete;
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn'); if (cancelDeleteBtn) cancelDeleteBtn.textContent = t.modal.cancel;

  } catch (err) {
    // Non-fatal if DOM shape differs
    console.warn('applyLanguage partial failure', err);
  }

  // update active state on lang buttons
  langButtons.forEach(b => b.classList.toggle('active', (b.textContent || '').toLowerCase().startsWith(lang)));
  };
  function setLang(lang){
    if (!SUPPORTED.includes(lang)) lang = DEFAULT;
    saveLang(lang);
    applyLanguage(lang);
  }

  // Initialize
  const current = getSavedLang();
  applyLanguage(current);

  // Wire events
  getLangButtons().forEach(btn => {
    btn.addEventListener('click', () => {
      const target = (btn.dataset.lang || (btn.textContent || '').trim().toLowerCase()) || 'ar';
      setLang(target);
      document.dispatchEvent(new CustomEvent('admin:lang:changed', { detail: { lang: target } }));
    });
  });

  // respond to programmatic language changes
  document.addEventListener('admin:lang:changed', (ev) => {
    const l = ev?.detail?.lang || getSavedLang();
    applyLanguage(l);
  });

  // Sidebar active highlighting
  try {
    const path = window.location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(a => a.classList.remove('active'));
    const candidate = Array.from(document.querySelectorAll('.sidebar-nav .nav-item'))
      .find(a => (a.getAttribute('href')||'').split('/').pop() === path);
    if (candidate) candidate.classList.add('active');
  } catch (err) { /* ignore */ }

  // Small RTL polish: prevent clipping for sidebar footer + main content
  try {
    const shell = document.querySelector('.dashboard-shell');
    if (shell) {
      shell.style.backgroundColor = 'var(--bg)';
    }
  } catch (err) {}

});
