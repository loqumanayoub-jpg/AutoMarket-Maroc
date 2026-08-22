document.addEventListener('DOMContentLoaded', () => {
  const rtlToggle = document.getElementById('rtlToggle');
  const compactToggle = document.getElementById('compactToggle');

  // Load saved prefs
  const prefs = JSON.parse(localStorage.getItem('admin:prefs') || '{}');

  function applyPrefs() {
    if (prefs.rtl) {
      document.documentElement.setAttribute('dir','rtl');
      document.body.classList.add('rtl');
    } else {
      document.documentElement.setAttribute('dir','ltr');
      document.body.classList.remove('rtl');
    }

    if (prefs.compact) {
      document.body.classList.add('compact-tables');
    } else {
      document.body.classList.remove('compact-tables');
    }

    if (rtlToggle) rtlToggle.checked = !!prefs.rtl;
    if (compactToggle) compactToggle.checked = !!prefs.compact;
  }

  applyPrefs();

  function savePrefs() {
    localStorage.setItem('admin:prefs', JSON.stringify(prefs));
  }

  if (rtlToggle) {
    rtlToggle.addEventListener('change', (e) => {
      prefs.rtl = !!e.target.checked;
      applyPrefs();
      savePrefs();
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
