// ============================================================
// auth.js — Session guard + sidebar user display
// Load AFTER supabase.js on every protected page
// ============================================================

(async function () {
  // ── 1. Without Supabase: use localStorage session ──────────
  if (!DB.isConfigured()) {
    const saved = JSON.parse(localStorage.getItem('tf_current_user') || 'null');
    window.CURRENT_USER = saved || {
      name: 'Admin User',
      role: 'Admin',
      email: 'admin@taskflow.local',
      department: '',
      status: 'active',
    };
    _injectSidebarUser(window.CURRENT_USER);
    _applyRoleNav(window.CURRENT_USER.role);
    return;
  }

  // ── 2. Check for active Supabase session ──────────────────
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) {
    window.location.replace('login.html');
    return;
  }

  // ── 3. Load user profile (includes department) ────────────
  const email = session.user.email;
  let profile = null;
  try {
    const { data } = await _sb
      .from('users')
      .select('name, role, email, department, status')
      .eq('email', email)
      .maybeSingle();
    profile = data;
  } catch (_) {}

  window.CURRENT_USER = profile || {
    name: email.split('@')[0],
    role: 'Admin',
    email,
    department: '',
    status: 'active',
  };

  // ── 4. Sidebar user section + sign-out ────────────────────
  _injectSidebarUser(window.CURRENT_USER);

  // ── 5. Role-based nav ────────────────────────────────────
  _applyRoleNav(window.CURRENT_USER.role);

  // ── 6. Session expiry listener ───────────────────────────
  _sb.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') window.location.replace('login.html');
  });
})();

// ── ROLE NAV ─────────────────────────────────────────────────
function _applyRoleNav(role) {
  const r = (role || '').toLowerCase();
  const isAdmin = r === 'admin';
  if (!isAdmin) {
    document.querySelectorAll('a[href="admin.html"]').forEach(el => el.remove());
    if (r === 'viewer' || r === 'field staff') {
      document.querySelectorAll('a[href="workflow.html"]').forEach(el => el.remove());
    }
  }
}

// ── SIDEBAR INJECTION ─────────────────────────────────────────
function _injectSidebarUser(user) {
  const style = document.createElement('style');
  style.textContent = `
    .sidebar-user {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 8px 10px; margin-top: auto;
      border-top: 1px solid var(--border);
    }
    .sidebar-avatar {
      width: 32px; height: 32px; border-radius: 8px;
      background: var(--accent); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.88rem; font-weight: 700; flex-shrink: 0;
      text-transform: uppercase;
    }
    .sidebar-user-info { min-width: 0; }
    .sidebar-user-name {
      font-size: 0.8rem; font-weight: 600; color: var(--text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .sidebar-user-role {
      font-size: 0.68rem; color: var(--muted); margin-top: 1px;
    }
    .sidebar-user-dept {
      font-size: 0.65rem; color: var(--accent2); margin-top: 1px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .signout-btn {
      width: 100%; background: transparent; border: 1px solid var(--border);
      border-radius: 8px; padding: 7px 10px; font-size: 0.8rem;
      color: var(--muted); cursor: pointer; font-family: inherit;
      text-align: left; transition: all 0.15s; margin-bottom: 6px;
    }
    .signout-btn:hover { border-color: var(--red); color: var(--red); background: rgba(239,68,68,0.07); }
    .sidebar > .theme-toggle { margin-top: 0 !important; }
  `;
  document.head.appendChild(style);

  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const themeBtn  = sidebar.querySelector('.theme-toggle');
  const initial   = (user.name || user.email || '?')[0].toUpperCase();
  const deptLabel = user.department ? `🏢 ${user.department}` : '';

  const userEl = document.createElement('div');
  userEl.className = 'sidebar-user';
  userEl.innerHTML = `
    <div class="sidebar-avatar">${_escHtml(initial)}</div>
    <div class="sidebar-user-info">
      <div class="sidebar-user-name">${_escHtml(user.name || user.email)}</div>
      <div class="sidebar-user-role">${_escHtml(user.role || 'User')}</div>
      ${deptLabel ? `<div class="sidebar-user-dept">${_escHtml(deptLabel)}</div>` : ''}
    </div>`;

  const signOutBtn = document.createElement('button');
  signOutBtn.className = 'signout-btn';
  signOutBtn.textContent = '🚪 Sign Out';
  signOutBtn.onclick = authSignOut;

  if (themeBtn) {
    sidebar.insertBefore(signOutBtn, themeBtn);
    sidebar.insertBefore(userEl, signOutBtn);
  } else {
    sidebar.appendChild(userEl);
    sidebar.appendChild(signOutBtn);
  }
}

// ── SIGN OUT ──────────────────────────────────────────────────
async function authSignOut() {
  if (typeof _sb !== 'undefined') await _sb.auth.signOut();
  localStorage.removeItem('tf_current_user');
  window.location.replace('login.html');
}

// ── HELPER ────────────────────────────────────────────────────
function _escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
