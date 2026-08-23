document.addEventListener('DOMContentLoaded', () => {
  const pageShell = document.querySelector('.dashboard-shell');
  if (!pageShell) return;

  const body = document.body;
  const sidebar = pageShell.querySelector('.sidebar-panel');
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const backdrop = document.getElementById('mobileSidebarBackdrop') || document.createElement('div');
  backdrop.id = 'mobileSidebarBackdrop';
  backdrop.className = 'mobile-backdrop';
  document.body.appendChild(backdrop);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mobile-sidebar-toggle';
  toggle.setAttribute('aria-label', 'Open navigation');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  const titleEl = topbar.querySelector('.topbar-title');
  if (topbar.firstChild && !topbar.querySelector('.mobile-sidebar-toggle')) {
    topbar.insertBefore(toggle, topbar.firstChild);
  } else if (!topbar.querySelector('.mobile-sidebar-toggle')) {
    topbar.appendChild(toggle);
  }

  const setSidebarState = (isOpen) => {
    body.classList.toggle('sidebar-open', isOpen);
    backdrop.classList.toggle('show', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (toggle && toggle.querySelector('svg')) {
      toggle.title = isOpen ? 'Close navigation' : 'Open navigation';
    }
  };

  const closeSidebar = () => setSidebarState(false);
  const openSidebar = () => setSidebarState(true);

  toggle.addEventListener('click', () => {
    const isOpen = body.classList.contains('sidebar-open');
    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  backdrop.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && body.classList.contains('sidebar-open')) {
      closeSidebar();
    }
  });

  if (sidebar) {
    sidebar.querySelectorAll('.nav-item').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 991) {
          closeSidebar();
        }
      });
    });
  }

  const syncSidebar = () => {
    if (window.innerWidth > 991) {
      body.classList.remove('sidebar-open');
      backdrop.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    }
  };

  window.addEventListener('resize', syncSidebar);
  syncSidebar();
});
