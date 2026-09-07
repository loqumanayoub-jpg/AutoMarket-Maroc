document.addEventListener('DOMContentLoaded', () => {
  const rtlToggle = document.getElementById('rtlToggle');
  const compactToggle = document.getElementById('compactToggle');
  const themeOptions = document.querySelectorAll('.theme-option');

  // Load saved prefs
  const prefs = JSON.parse(localStorage.getItem('admin:prefs') || '{}');

  function applyPrefs() {
    const isRtl = !!prefs.rtl;

    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.lang = localStorage.getItem('admin:lang') || 'ar';
    document.body.classList.toggle('rtl', isRtl);
    document.body.classList.toggle('ltr', !isRtl);
    document.body.style.direction = isRtl ? 'rtl' : 'ltr';

    if (prefs.compact) {
      document.body.classList.add('compact-tables');
    } else {
      document.body.classList.remove('compact-tables');
    }

    if (rtlToggle) rtlToggle.checked = isRtl;
    if (compactToggle) compactToggle.checked = !!prefs.compact;
  }

  applyPrefs();

  function applyTheme(theme) {
    const safeTheme = theme === 'light' ? 'light' : 'dark';
    document.body.classList.toggle('light-mode', safeTheme === 'light');
    document.body.classList.toggle('dark-mode', safeTheme === 'dark');
    localStorage.setItem('admin:theme', safeTheme);
    themeOptions.forEach((button) => {
      const active = button.dataset.theme === safeTheme;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  applyTheme(localStorage.getItem('admin:theme') || 'dark');
  themeOptions.forEach((button) => {
    button.addEventListener('click', () => applyTheme(button.dataset.theme));
  });

  function savePrefs() {
    localStorage.setItem('admin:prefs', JSON.stringify(prefs));
  }

  // language select integration (keeps small client-side preference)
  const langSelect = document.querySelector('.mini-select');
  if (langSelect) {
    // map labels to codes
    const map = { 'العربية':'ar', 'Français':'fr', 'English':'en' };
    const currentLang = localStorage.getItem('admin:lang') || 'ar';
    // try to set select based on stored lang
    for (let i=0;i<langSelect.options.length;i++){
      const opt = langSelect.options[i];
      if (map[opt.text] === currentLang) { langSelect.selectedIndex = i; break; }
    }

    langSelect.addEventListener('change', (e) => {
      const code = map[e.target.value] || 'ar';
      localStorage.setItem('admin:lang', code);
      // notify UI
      document.dispatchEvent(new CustomEvent('admin:lang:changed', { detail: { lang: code } }));
    });
  }

  if (rtlToggle) {
    rtlToggle.addEventListener('change', (e) => {
      prefs.rtl = !!e.target.checked;
      applyPrefs();
      savePrefs();
      document.dispatchEvent(new CustomEvent('admin:lang:changed', { detail: { lang: localStorage.getItem('admin:lang') || 'ar' } }));
    });
  }

  if (compactToggle) {
    compactToggle.addEventListener('change', (e) => {
      prefs.compact = !!e.target.checked;
      applyPrefs();
      savePrefs();
    });
  }

});
