document.addEventListener('DOMContentLoaded', async () => {
  const pageShell = document.querySelector('.dashboard-shell');
  if (!pageShell) return;

  if (window.__dashboardHeaderSharedBound__) {
    return;
  }
  window.__dashboardHeaderSharedBound__ = true;

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

  const preferredTheme = localStorage.getItem('admin:theme') || 'dark';
  if (preferredTheme === 'light') {
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
  } else {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
  }

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

  const topbarActions = topbar.querySelector('.topbar-actions');
  if (topbarActions && !document.getElementById('notificationButton')) {
    const notificationButton = document.createElement('button');
    notificationButton.id = 'notificationButton';
    notificationButton.type = 'button';
    notificationButton.className = 'icon-button';
    notificationButton.setAttribute('aria-label', 'Notifications');
    notificationButton.setAttribute('aria-expanded', 'false');
    notificationButton.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0" />
      </svg>
      <span id="notificationBadge" class="icon-badge" hidden>0</span>
    `;
    topbarActions.insertBefore(notificationButton, topbarActions.firstChild);
  }

  const notificationButton = document.getElementById('notificationButton');
  const notificationBadge = document.getElementById('notificationBadge');

  if (!document.getElementById('notificationPanel')) {
    const panel = document.createElement('div');
    panel.id = 'notificationPanel';
    panel.className = 'notification-panel hidden';
    panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = `
      <div class="panel-header compact">
        <div>
          <p class="eyebrow">Notifications</p>
          <h3>الإشعارات</h3>
        </div>
        <button type="button" class="btn btn-ghost" id="markNotificationsRead">تحديد كمقروء</button>
      </div>
      <div id="notificationList" class="notification-list"></div>
    `;
    document.body.appendChild(panel);
  }

  const notificationPanel = document.getElementById('notificationPanel');
  const notificationList = document.getElementById('notificationList');
  const markReadBtn = document.getElementById('markNotificationsRead');

  const messageStore = window.__dashboardMessageStore__ || {
    isUnread: (message) => (message?.status || 'new') !== 'read',
    async load(limit = 20) {
      if (!window.supabase || typeof window.supabase.from !== 'function') return [];
      const { data, error } = await window.supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
    async markAllRead() {
      const messages = await this.load(200);
      const ids = messages.filter(this.isUnread).map((message) => message.id).filter(Boolean);
      if (!ids.length) return;
      const { error } = await window.supabase
        .from('messages')
        .update({ status: 'read' })
        .in('id', ids);
      if (error) throw error;
    }
  };
  window.__dashboardMessageStore__ = messageStore;

  if (!document.getElementById('profileTrigger')) {
    const profileTrigger = document.createElement('button');
    profileTrigger.type = 'button';
    profileTrigger.id = 'profileTrigger';
    profileTrigger.className = 'admin-pill';
    profileTrigger.setAttribute('aria-expanded', 'false');
    profileTrigger.setAttribute('aria-haspopup', 'menu');
    profileTrigger.innerHTML = `
      <div class="admin-avatar">AM</div>
      <div>
        <strong id="profileName">Admin</strong>
        <small id="profileRole">Operations</small>
      </div>
    `;
    const langSwitcher = topbarActions.querySelector('.lang-switcher');
    if (langSwitcher) {
      langSwitcher.insertAdjacentElement('afterend', profileTrigger);
    } else {
      topbarActions.appendChild(profileTrigger);
    }
  }

  const profileTrigger = document.getElementById('profileTrigger');

  if (!document.getElementById('profileMenu')) {
    const profileMenu = document.createElement('div');
    profileMenu.id = 'profileMenu';
    profileMenu.className = 'profile-menu hidden';
    profileMenu.setAttribute('role', 'menu');
    profileMenu.setAttribute('aria-label', 'Profile menu');
    profileMenu.innerHTML = `
      <button type="button" class="profile-menu-item" data-action="profile">Profile</button>
      <button type="button" class="profile-menu-item" data-action="settings">Settings</button>
      <button type="button" class="profile-menu-item" data-action="language">Language</button>
      <button type="button" class="profile-menu-item" data-action="appearance">Appearance</button>
      <button type="button" class="profile-menu-item danger" data-action="logout">Logout</button>
    `;
    document.body.appendChild(profileMenu);
  }

  const profileMenu = document.getElementById('profileMenu');

  const setProfileMenuState = (open) => {
    if (!profileMenu) return;
    profileMenu.classList.toggle('hidden', !open);
    if (profileTrigger) {
      profileTrigger.setAttribute('aria-expanded', String(open));
    }
  };

  const setNotificationPanelState = (open) => {
    if (!notificationPanel) return;
    notificationPanel.classList.toggle('hidden', !open);
    if (notificationButton) {
      notificationButton.setAttribute('aria-expanded', String(open));
    }
  };

  const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  const setProfileMeta = async () => {
    const profileNameEl = document.getElementById('profileName');
    const profileRoleEl = document.getElementById('profileRole');
    const adminAvatar = document.querySelector('.admin-avatar');

    try {
      if (!window.supabase || !window.supabase.auth || typeof window.supabase.auth.getSession !== 'function') {
        return;
      }

      const { data: { session } } = await window.supabase.auth.getSession();
      const email = session?.user?.email || 'Admin';
      const name = email.split('@')[0] || 'Admin';

      if (profileNameEl) profileNameEl.textContent = name;
      if (profileRoleEl) profileRoleEl.textContent = 'Administrator';
      if (adminAvatar) adminAvatar.textContent = (email.charAt(0) || 'A').toUpperCase();
    } catch (error) {
      console.warn('Profile metadata unavailable:', error);
    }
  };

  const renderNotifications = async () => {
    if (!notificationList || !notificationBadge) return;

    try {
      if (!window.supabase || typeof window.supabase.from !== 'function') {
        notificationList.innerHTML = '<div class="empty-state compact"><h3>لا توجد إشعارات</h3><p>لا توجد رسائل أو أنشطة جديدة حالياً.</p></div>';
        notificationBadge.hidden = true;
        notificationBadge.textContent = '0';
        return;
      }

      const list = await messageStore.load(15);
      const unread = list.filter(messageStore.isUnread);
      const unreadCount = unread.length;

      notificationBadge.textContent = String(unreadCount);
      notificationBadge.hidden = unreadCount === 0;

      if (!list.length) {
        notificationList.innerHTML = '<div class="empty-state compact"><h3>لا توجد إشعارات</h3><p>لا توجد رسائل أو أنشطة جديدة حالياً.</p></div>';
        return;
      }

      notificationList.innerHTML = list.map((item) => `
        <div class="notification-item ${messageStore.isUnread(item) ? 'unread' : ''}" data-id="${escapeHtml(String(item.id ?? ''))}">
          <div class="notification-bullet"></div>
          <div class="notification-copy">
            <strong>${escapeHtml(item.text || item.message || 'New notification')}</strong>
            <span>${escapeHtml(item.meta || item.created_at || '')}</span>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.warn('Unable to load shared notifications:', error);
      notificationList.innerHTML = '<div class="empty-state compact"><h3>لا توجد إشعارات</h3><p>لا توجد رسائل أو أنشطة جديدة حالياً.</p></div>';
      notificationBadge.hidden = true;
      notificationBadge.textContent = '0';
    }
  };

  const markNotificationsRead = async () => {
    try {
      await messageStore.markAllRead();
      await renderNotifications();
    } catch (error) {
      console.warn('Unable to mark notifications as read:', error);
    }
  };

  const bindSharedHeader = () => {
    if (window.__dashboardHeaderMenuBound__) return;
    window.__dashboardHeaderMenuBound__ = true;

    if (profileTrigger) {
      profileTrigger.addEventListener('click', () => {
        const currentlyHidden = profileMenu?.classList.contains('hidden');
        setProfileMenuState(Boolean(currentlyHidden));
        setNotificationPanelState(false);
      });

      profileTrigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          const currentlyHidden = profileMenu?.classList.contains('hidden');
          setProfileMenuState(Boolean(currentlyHidden));
        }
      });
    }

    if (notificationButton) {
      notificationButton.addEventListener('click', () => {
        const currentlyHidden = notificationPanel?.classList.contains('hidden');
        setNotificationPanelState(Boolean(currentlyHidden));
        setProfileMenuState(false);
      });
    }

    if (markReadBtn) {
      markReadBtn.addEventListener('click', async () => {
        await markNotificationsRead();
      });
    }

    document.addEventListener('click', (event) => {
      const target = event.target;
      const clickedInsideProfile = profileTrigger && profileTrigger.contains(target);
      const clickedInsideMenu = profileMenu && profileMenu.contains(target);
      const clickedOnNotification = notificationButton && notificationButton.contains(target);
      const clickedOnPanel = notificationPanel && notificationPanel.contains(target);

      if (!clickedInsideProfile && !clickedInsideMenu) {
        setProfileMenuState(false);
      }

      if (!clickedOnNotification && !clickedOnPanel) {
        setNotificationPanelState(false);
      }
    });

    const menuActions = document.querySelectorAll('.profile-menu-item');
    menuActions.forEach((button) => {
      button.addEventListener('click', async () => {
        const action = button.dataset.action;

        if (action === 'logout') {
          try {
            if (window.supabase && window.supabase.auth && typeof window.supabase.auth.signOut === 'function') {
              await window.supabase.auth.signOut();
            }
          } catch (error) {
            console.error('Logout failed:', error);
          } finally {
            window.location.href = 'login.html';
          }
          return;
        }

        if (action === 'settings' || action === 'profile' || action === 'appearance') {
          window.location.href = 'settings.html';
          return;
        }

        if (action === 'language') {
          const languageSwitcher = document.querySelector('.lang-switcher');
          if (languageSwitcher) {
            languageSwitcher.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          setProfileMenuState(false);
        }
      });
    });
  };

  const bindLanguageButtons = () => {
    if (window.__dashboardLanguageButtonsBound__) {
      return;
    }
    window.__dashboardLanguageButtonsBound__ = true;

    const buttons = document.querySelectorAll('.lang-option');
    buttons.forEach((button) => {
      const btnLang = button.dataset.lang || (button.textContent || '').trim().toLowerCase();
      if (btnLang) {
        button.dataset.lang = btnLang;
      }

      button.addEventListener('click', () => {
        buttons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');

        const lang = button.dataset.lang || 'ar';
        localStorage.setItem('admin:lang', lang);
        localStorage.setItem('am_dashboard_language', lang);
        document.dispatchEvent(new CustomEvent('admin:lang:changed', { detail: { lang } }));
      });
    });
  };

  bindLanguageButtons();
  bindSharedHeader();
  await setProfileMeta();
  await renderNotifications();
});
