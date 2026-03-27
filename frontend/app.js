/* ══════════════════════════════════════════════
   app.js — OtlichnikMusic UI Logic (ФИНАЛЬНАЯ ВЕРСИЯ С MERGE)
   ══════════════════════════════════════════════ */

// ================= API =================
const API_URL = 'http://localhost:5000/api';

async function apiRequest(path, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const res = await fetch(API_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: body ? JSON.stringify(body) : null
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Ошибка сервера');
  return data;
}

/* ──────────────────────────────────────────────
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
   ────────────────────────────────────────────── */
let currentUser = null;
let selectedFile = null;

/* ──────────────────────────────────────────────
   ЗАГРУЗКА ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
   ────────────────────────────────────────────── */
async function loadCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const user = await apiRequest('/auth/me');
    currentUser = user;
    console.log('✅ Текущий пользователь загружен:', currentUser);
    renderProfileHeader();
    renderProfileTracks();
    updateTopbarAuth();
  } catch (err) {
    console.warn('Токен устарел');
    localStorage.removeItem('token');
  }
}

/* ──────────────────────────────────────────────
   НАВИГАЦИЯ И МОДАЛКИ
   ────────────────────────────────────────────── */
function showPage(name) {
  document.querySelectorAll('.modal-overlay.open').forEach(modal => modal.classList.remove('open'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const pageElement = document.getElementById('page-' + name);
  if (pageElement) pageElement.classList.add('active');

  if (name === 'profile') {
    renderProfilePage();
  }

  document.querySelectorAll('.demo-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('nav-' + name);
  if (btn) btn.classList.add('active');

  updateTopbarAuth();
}

function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

/* ──────────────────────────────────────────────
   ЗАКРЫТИЕ МОДАЛКИ ТОЛЬКО ПО КРЕСТИКУ (от товарища)
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('mousedown', function(e) {
      overlay.dataset.mouseDownTarget = e.target;
    });

    overlay.addEventListener('mouseup', function(e) {
      if (overlay.dataset.mouseDownTarget === overlay && e.target === overlay) {
        // Закрываем только если нажали и отпустили именно на оверлее
        overlay.classList.remove('open');
      }
      delete overlay.dataset.mouseDownTarget;
    });
  });

  // Предотвращаем закрытие при клике внутри самой модалки
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });
});

/* ──────────────────────────────────────────────
   АВТОРИЗАЦИЯ
   ────────────────────────────────────────────── */
function clearAuthForms() {
  document.getElementById('reg-username').value = '';
  document.getElementById('reg-email').value = '';
  document.getElementById('reg-password').value = '';
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
}

function switchTab(tab) {
  const tabs = document.querySelectorAll('#auth-tabs .tab');
  tabs[0].classList.toggle('active', tab === 'login');
  tabs[1].classList.toggle('active', tab === 'register');
  document.getElementById('form-login').style.display = tab === 'login' ? '' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? '' : 'none';
}

async function handleRegister(e) {
  e.preventDefault();
  let username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  // Убираем @ если пользователь ввёл
  if (username.startsWith('@')) {
    username = username.substring(1);
  }

  if (!username) {
    showToast('Введите имя пользователя', 'error');
    return;
  }

  try {
    const data = await apiRequest('/auth/register', 'POST', { username, email, password });

    localStorage.setItem('token', data.token);
    currentUser = data;

    clearAuthForms();
    closeModal('auth-modal');

    showToast(`Добро пожаловать, @${data.username}! 🎉`, 'success');

    updateTopbarAuth();
    renderProfileHeader();
    renderProfileTracks();

    // Не переключаем страницу автоматически
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const data = await apiRequest('/auth/login', 'POST', { email, password });

    localStorage.setItem('token', data.token);
    currentUser = data;

    clearAuthForms();
    closeModal('auth-modal');

    showToast(`С возвращением, @${data.username}! 👋`, 'success');

    updateTopbarAuth();
    renderProfileHeader();
    renderProfileTracks();

  } catch (err) {
    showToast(err.message, 'error');
  }
}

function logout() {
  localStorage.removeItem('token');
  currentUser = null;
  updateTopbarAuth();
  showPage('home');
  showToast('Вы вышли из аккаунта', 'success');
}

/* ──────────────────────────────────────────────
   ЗАГРУЗКА ТРЕКА
   ────────────────────────────────────────────── */
function initUploadModal() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('audio-file');
  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => e.target.files.length && handleFile(e.target.files[0]));

  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = 'var(--accent)'; });
  dropZone.addEventListener('dragleave', () => dropZone.style.borderColor = 'rgba(249,115,22,0.3)');
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.style.borderColor = 'rgba(249,115,22,0.3)';
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  const createBtn = document.getElementById('create-track-btn');
  if (createBtn) createBtn.addEventListener('click', handleTrackUpload);
}

function handleFile(file) {
  if (!file.type.startsWith('audio/')) return showToast('Только аудиофайлы!', 'error');
  selectedFile = file;
  document.getElementById('drop-zone').innerHTML = `<p>✓ ${file.name} выбран</p>`;
}

async function handleTrackUpload() {
  if (!currentUser || !currentUser._id) return showToast('Сначала войди в аккаунт!', 'error');
  if (!selectedFile) return showToast('Выбери аудиофайл!', 'error');

  const title = document.getElementById('track-title').value.trim();
  const genre = document.getElementById('track-genre').value;
  const tagsInput = document.getElementById('track-tags').value;
  const description = document.getElementById('track-desc').value.trim();
  const duration = parseInt(document.getElementById('track-duration').value);

  if (!title || !genre || !duration) return showToast('Заполни название, жанр и длительность!', 'error');

  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

  try {
    const trackResponse = await apiRequest(`/artists/${currentUser._id}/tracks`, 'POST', { title, genre, tags, description, duration });
    const trackId = trackResponse.track_id || trackResponse._id || trackResponse.id;

    if (!trackId) return showToast('Ошибка: сервер не вернул ID трека', 'error');

    const formData = new FormData();
    formData.append('audio', selectedFile);

    const uploadRes = await fetch(`${API_URL}/artists/${trackId}/audio`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData
    });

    if (!uploadRes.ok) throw new Error('Ошибка загрузки файла');

    await apiRequest(`/artists/${trackId}/publish`, 'POST');

    showToast('🎵 Трек успешно загружен и опубликован!', 'success');
    closeModal('upload-modal');
    selectedFile = null;
    renderProfileTracks();
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Ошибка загрузки трека', 'error');
  }
}

/* ──────────────────────────────────────────────
   TOPBAR + ПРОФИЛЬ
   ────────────────────────────────────────────── */
function updateTopbarAuth() {
  const container = document.getElementById('topbar-auth');
  if (!container) return;

  if (currentUser) {
    container.innerHTML = `
      <div onclick="logout()" class="btn btn-ghost" style="cursor:pointer; margin-right:12px;">Выйти</div>
      <div class="avatar" onclick="showPage('profile')">${currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}</div>
    `;
  } else {
    container.innerHTML = `
      <button class="btn btn-ghost" onclick="showModal('auth-modal')">Войти</button>
      <button class="btn btn-accent" onclick="showModal('auth-modal')">Регистрация</button>
    `;
  }
}

function renderProfileHeader() {
  if (!currentUser) return;

  const nameEl = document.getElementById('profile-name');
  const handleEl = document.getElementById('profile-handle');
  const avatarEl = document.getElementById('profile-avatar');
  const avatarTop = document.getElementById('profile-avatar-top');

  if (nameEl) nameEl.textContent = currentUser.username || 'Пользователь';
  if (handleEl) handleEl.innerHTML = `@${(currentUser.username || 'user').replace('@','')} <span style="color:var(--text3)">· Москва, RU</span>`;
  if (avatarEl) avatarEl.textContent = currentUser.username?.[0]?.toUpperCase() || 'U';
  if (avatarTop) avatarTop.textContent = currentUser.username?.[0]?.toUpperCase() || 'U';
}

/* ──────────────────────────────────────────────
   РЕНДЕР ПРОФИЛЯ
   ────────────────────────────────────────────── */
function renderProfilePage() {
  const content = document.getElementById('profile-content');
  if (!content) return;

  if (!currentUser) {
    content.innerHTML = `
      <div style="flex:1; display:flex; align-items:center; justify-content:center; flex-direction:column; height:100%; color:var(--text2); text-align:center; padding:40px;">
        <div style="font-size:72px; margin-bottom:24px; opacity:0.25;">👤</div>
        <div style="font-family:'Syne',sans-serif; font-size:28px; font-weight:700; color:var(--text); margin-bottom:16px;">Вы не авторизованы</div>
        <div style="font-size:16px; max-width:380px; line-height:1.6; margin-bottom:40px;">
          Чтобы просматривать свой профиль и загружать треки — войдите или зарегистрируйтесь.
        </div>
        <button onclick="openAuthWithReset()" class="btn btn-accent" style="padding:14px 36px; font-size:15px;">
          Войти / Зарегистрироваться
        </button>
      </div>
    `;
    return;
  }

  // Залогинен
  content.innerHTML = `... (твой предыдущий код нормального профиля) ...`;
  // (я не стал его копировать полностью, чтобы не раздувать сообщение — оставь свой последний рабочий вариант)

  renderProfileHeader();
  renderProfileTracks();
}

/* ──────────────────────────────────────────────
   ИНИЦИАЛИЗАЦИЯ
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
  initUploadModal();
  generateWave('wave1'); generateWave('wave2'); generateWave('wave3'); generateWave('wave4');
  loadCurrentUser();
});

/* Глобальные функции */
window.showModal = showModal;
window.closeModal = closeModal;
window.showPage = showPage;
window.logout = logout;
window.openAuthWithReset = () => showModal('auth-modal');
window.openUploadWithReset = () => {
  if (!currentUser) {
    showToast('Сначала войди в аккаунт!', 'error');
    return;
  }
  showModal('upload-modal');
};