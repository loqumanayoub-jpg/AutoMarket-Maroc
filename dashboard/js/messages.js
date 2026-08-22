document.addEventListener('DOMContentLoaded', async () => {
  const area = document.getElementById('messagesArea');
  const modal = document.getElementById('messageModal');
  const modalBody = document.getElementById('messageModalBody');

  function showEmptyState(message) {
    area.innerHTML = `
      <div class="empty-state">
        <h3>Aucune donnée de messages</h3>
        <p>${message}</p>
      </div>
    `;
  }

  if (!window.supabase || typeof window.supabase.from !== 'function') {
    showEmptyState('Supabase client is not available. Check ../🌐 Frontend/js/supabase.js');
    return;
  }

  try {
    // Try to fetch messages; select * so we render available fields generically
    const { data, error } = await window.supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    if (!data || !data.length) {
      showEmptyState('No messages found. If you expect messages, ensure your Supabase table `messages` exists and the API key/session has permission to read it.');
      return;
    }

    // Build a simple table
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>From</th>
        <th>Contact</th>
        <th>Preview</th>
        <th>Received</th>
        <th>Actions</th>
      </tr>
    `;

    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    data.forEach(row => {
      const tr = document.createElement('tr');

      const name = row.name || row.full_name || row.contact_name || '—';
      const phone = row.phone || row.email || '—';

      // Build a short preview from common fields
      let preview = row.message || row.description || '';
      if (!preview) {
        const keys = Object.keys(row).filter(k => !['id','created_at','name','phone','email'].includes(k));
        preview = keys.slice(0,3).map(k => `${k}: ${String(row[k]).slice(0,40)}`).join(' | ');
      }
      preview = String(preview).slice(0,120);

      tr.innerHTML = `
        <td>${escapeHtml(name)}</td>
        <td>${escapeHtml(phone)}</td>
        <td>${escapeHtml(preview)}</td>
        <td>${row.created_at ? new Date(row.created_at).toLocaleString() : '—'}</td>
        <td><button class="btn btn-light view-btn">View</button></td>
      `;

      tr.querySelector('.view-btn').addEventListener('click', () => {
        openMessage(row);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    area.innerHTML = '';
    area.appendChild(table);

  } catch (err) {
    console.error('Failed to load messages:', err);

    // Show a professional empty state with guidance
    showEmptyState('Failed to load messages from Supabase. Check console for details and verify a `messages` table exists and your RLS/policies allow SELECT for the current role.');
  }

  function openMessage(row) {
    // Render message details in modal
    const lines = [];
    Object.keys(row).forEach(k => {
      lines.push(`<div class="kv"><strong>${escapeHtml(k)}</strong>: <span>${escapeHtml(String(row[k] === null ? '' : row[k]))}</span></div>`);
    });

    modalBody.innerHTML = `<div class="message-detail">${lines.join('')}</div>`;

    try {
      if (typeof modal.showModal === 'function') modal.showModal();
      else modal.style.display = 'block';
    } catch (err) {
      // fallback
      modal.style.display = 'block';
    }
  }

  // simple escaping
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

});
