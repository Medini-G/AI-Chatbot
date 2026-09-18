/* ============================================================
   nav.js — auth-aware navigation + dark mode toggle
   Runs on every page after data.js.
   ============================================================ */

function initNav() {
  const user = Session.current();

  document.querySelectorAll('[data-auth="guest"]').forEach((el) => {
    el.style.display = user ? 'none' : '';
  });
  document.querySelectorAll('[data-auth="user"]').forEach((el) => {
    el.style.display = user ? '' : 'none';
  });
  document.querySelectorAll('[data-auth="admin"]').forEach((el) => {
    el.style.display = user && user.role === 'admin' ? '' : 'none';
  });

  const nameEl = document.getElementById('navUserName');
  if (nameEl && user) nameEl.textContent = user.name.split(' ')[0];

  const logoutBtn = document.getElementById('navLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      Session.logout();
      window.location.href = 'index.html';
    });
  }

  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('navMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => menu.classList.toggle('open'));
  }

  initTheme();
}

function initTheme() {
  const saved = localStorage.getItem(DB.THEME) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  toggle.setAttribute('aria-pressed', saved === 'dark');
  toggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(DB.THEME, next);
    toggle.setAttribute('aria-pressed', next === 'dark');
  });
}

function toast(message, kind = 'success') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `toast toast--${kind} show`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', initNav);
