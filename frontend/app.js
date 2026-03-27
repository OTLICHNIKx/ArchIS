/* ══════════════════════════════════════════════
   app.js — OtlichnikMusic UI Logic (ИСПРАВЛЕННАЯ ВЕРСИЯ)
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
   ЗАГРУЗКА ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ (главное исправление)
   ────────────────────────────────────────────── */
async function loadCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const user = await apiRequest('/auth/me');
    currentUser = user;
    console.log('✅ Текущий пользователь загружен:', currentUser);
    renderProfileTracks();
    updateTopbarAuth();
  } catch (err) {
    console.warn('Не удалось загрузить пользователя (токен устарел?)');
    localStorage.removeItem('token');
  }
  renderProfileHeader();
}

/* ──────────────────────────────────────────────
   НАВИГАЦИЯ И МОДАЛКИ
   ────────────────────────────────────────────── */
function showPage(name) {
  // Закрываем все модалки
  document.querySelectorAll('.modal-overlay.open').forEach(modal => modal.classList.remove('open'));

  // Снимаем active со всех страниц
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Активируем нужную страницу
  const pageElement = document.getElementById('page-' + name);
  if (pageElement) {
    pageElement.classList.add('active');
  }

  // Специальная логика для профиля
  if (name === 'profile') {
    renderProfilePage();
  }

  // Обновляем активную кнопку в демо-навигаторе
  document.querySelectorAll('.demo-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('nav-' + name);
  if (btn) btn.classList.add('active');

  // Обновляем топбар (кнопки Войти/Регистрация → Аватар + Выйти)
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

function switchTab(tab) { /* оставил твой оригинальный код */
  const tabs = document.querySelectorAll('#auth-tabs .tab');
  tabs[0].classList.toggle('active', tab === 'login');
  tabs[1].classList.toggle('active', tab === 'register');
  document.getElementById('form-login').style.display = tab === 'login' ? '' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? '' : 'none';
}

/* ──────────────────────────────────────────────
   АВТОРИЗАЦИЯ
   ────────────────────────────────────────────── */
function clearAuthForms() {
  // Очищаем все поля
  document.getElementById('reg-username').value = '';
  document.getElementById('reg-email').value = '';
  document.getElementById('reg-password').value = '';
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
}


async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  try {
    const data = await apiRequest('/auth/register', 'POST', { username, email, password });
    localStorage.setItem('token', data.token);
    currentUser = data;

    clearAuthForms();
    closeModal('auth-modal');
    showToast(`Добро пожаловать, ${data.username}! 🎉`, 'success');

    renderProfileHeader();
    renderProfileTracks();
    // Если сейчас открыт профиль — обновляем его содержимое
    if (document.getElementById('page-profile').classList.contains('active')) {
      renderProfilePage();
    }

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
    showToast(`С возвращением, ${data.username}! 👋`, 'success')
    renderProfileHeader();
    renderProfileTracks();
    // Если сейчас открыт профиль — обновляем его содержимое
    if (document.getElementById('page-profile').classList.contains('active')) {
      renderProfilePage();
    }

  } catch (err) {
    showToast(err.message, 'error');
  }
}

function logout() {
  localStorage.removeItem('token');
  currentUser = null;
  updateTopbarAuth();
  if (document.getElementById('page-profile').classList.contains('active')) {
      renderProfilePage();
    }
  showToast('Вы вышли из аккаунта', 'success');
}

/* ──────────────────────────────────────────────
   ЗАГРУЗКА ТРЕКА (с защитой от undefined)
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
  if (!currentUser || !currentUser._id) {
    return showToast('Сначала войди в аккаунт!', 'error');
  }
  if (!selectedFile) {
    return showToast('Выбери аудиофайл!', 'error');
  }

  const title       = document.getElementById('track-title').value.trim();
  const genre       = document.getElementById('track-genre').value;
  const tagsInput   = document.getElementById('track-tags').value;
  const description = document.getElementById('track-desc').value.trim();
  const duration    = parseInt(document.getElementById('track-duration').value);

  if (!title || !genre || !duration) {
    return showToast('Заполни название, жанр и длительность!', 'error');
  }

  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

  try {
    console.log('🚀 Создаём трек для userId:', currentUser._id);

    const trackResponse = await apiRequest(`/artists/${currentUser._id}/tracks`, 'POST', {
      title, genre, tags, description, duration
    });

    console.log('✅ Полный ответ от createTrack:', trackResponse);

    // ←←← ИСПРАВЛЕНИЕ ЗДЕСЬ
    const trackId = trackResponse.track_id || trackResponse._id || trackResponse.id;

    if (!trackId) {
      console.error('❌ В ответе нет ID трека!', trackResponse);
      return showToast('Ошибка: сервер не вернул ID трека', 'error');
    }

    console.log('✅ Трек создан, ID:', trackId);

    // 2. Загружаем аудиофайл
    const formData = new FormData();
    formData.append('audio', selectedFile);

    const uploadRes = await fetch(`${API_URL}/artists/${trackId}/audio`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Ошибка загрузки файла:', errText);
      throw new Error('Ошибка загрузки файла');
    }

    // 3. Публикуем трек
    await apiRequest(`/artists/${trackId}/publish`, 'POST');

    showToast('🎵 Трек успешно загружен и опубликован!', 'success');
    closeModal('upload-modal');
    selectedFile = null;
    renderProfileTracks();

  } catch (err) {
    console.error('❌ Ошибка в handleTrackUpload:', err);
    showToast(err.message || 'Ошибка загрузки трека', 'error');
  }
}

/* ──────────────────────────────────────────────
   ОБНОВЛЕНИЕ TOPBAR (кнопки авторизации)
   ────────────────────────────────────────────── */
function updateTopbarAuth() {
  const container = document.getElementById('topbar-auth');
  if (!container) return;

  if (currentUser) {
    // Пользователь залогинен
    container.innerHTML = `
      <div onclick="logout()" class="btn btn-ghost" style="cursor:pointer; margin-right:12px;">
        Выйти
      </div>
      <div class="avatar" onclick="showPage('profile')">
        ${currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}
      </div>
    `;
  } else {
    // Пользователь не залогинен
    container.innerHTML = `
      <button class="btn btn-ghost" onclick="showModal('auth-modal')">Войти</button>
      <button class="btn btn-accent" onclick="showModal('auth-modal')">Регистрация</button>
    `;
  }
}

/* ──────────────────────────────────────────────
   РЕНДЕР ШАПКИ ПРОФИЛЯ (реальные данные)
   ────────────────────────────────────────────── */
function renderProfileHeader() {
  if (!currentUser) return;

  // Защита от null
  const nameEl = document.getElementById('profile-name');
  const handleEl = document.getElementById('profile-handle');
  const avatarEl = document.getElementById('profile-avatar');
  const avatarTop = document.getElementById('profile-avatar-top');

  if (nameEl) nameEl.textContent = currentUser.username || 'Пользователь';
  if (handleEl) handleEl.innerHTML = `
    @${(currentUser.username || 'user').replace('@','')}
    <span style="color:var(--text3)">· Москва, RU</span>
  `;
  if (avatarEl) avatarEl.textContent = currentUser.username?.[0]?.toUpperCase() || 'U';
  if (avatarTop) avatarTop.textContent = currentUser.username?.[0]?.toUpperCase() || 'U';

  const actions = document.getElementById('profile-actions');
  if (actions) {
    actions.innerHTML = `
      <button onclick="alert('Редактирование профиля в разработке')" class="btn btn-outline-accent btn-ghost">Редактировать профиль</button>
    `;
  }
}

/* ──────────────────────────────────────────────
   РЕНДЕР ПРОФИЛЯ (с проверкой авторизации)
   ────────────────────────────────────────────── */
function renderProfilePage() {
  const content = document.getElementById('profile-content');
  if (!content) return;

  if (!currentUser) {
    // Не авторизован — пустая страница
    content.innerHTML = `
      <div style="flex:1; display:flex; align-items:center; justify-content:center; flex-direction:column; height:100%; color:var(--text2); text-align:center; padding:40px;">
        <div style="font-size:72px; margin-bottom:24px; opacity:0.25;">👤</div>
        <div style="font-family:'Syne',sans-serif; font-size:28px; font-weight:700; color:var(--text); margin-bottom:16px;">
          Вы не авторизованы
        </div>
        <div style="font-size:16px; max-width:380px; line-height:1.6; margin-bottom:40px;">
          Чтобы просматривать свой профиль, загружать треки и взаимодействовать с другими артистами — войдите или зарегистрируйтесь.
        </div>
        <button onclick="openAuthWithReset()" class="btn btn-accent" style="padding:14px 36px; font-size:15px;">
          Войти / Зарегистрироваться
        </button>
      </div>
    `;
    return;
  }

  // Авторизован — нормальный профиль
  content.innerHTML = `
    <div class="topbar">
      <button class="btn btn-ghost" style="gap:6px;display:flex;align-items:center;" onclick="showPage('home')">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Назад
      </button>
      <div class="topbar-right">
        <button onclick="logout()" class="btn btn-ghost" style="margin-right:12px;">Выйти</button>
        <div class="avatar" onclick="showPage('profile')">${currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}</div>
      </div>
    </div>

    <div class="profile-hero">
      <div class="hero-bg"></div>
      <div class="hero-noise"></div>
      <div class="hero-overlay"></div>
      <div class="profile-info">
        <div id="profile-avatar" class="profile-avatar">${currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}</div>
        <div class="profile-meta">
          <div id="profile-name" class="profile-name">${currentUser.username || 'Пользователь'}</div>
          <div id="profile-handle" class="profile-handle">@${(currentUser.username || 'user').replace('@','')} · Москва, RU</div>
        </div>
        <div id="profile-actions" class="profile-actions">
          <button onclick="alert('Редактирование профиля в разработке')" class="btn btn-outline-accent btn-ghost">Редактировать профиль</button>
        </div>
      </div>
    </div>

    <div class="profile-body">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div class="profile-stats">
          <div class="stat"><div id="stat-tracks" class="stat-val">—</div><div class="stat-key">Треков</div></div>
          <div class="stat"><div id="stat-followers" class="stat-val">0</div><div class="stat-key">Подписчиков</div></div>
          <div class="stat"><div id="stat-plays" class="stat-val">0</div><div class="stat-key">Прослушиваний</div></div>
          <div class="stat"><div id="stat-following" class="stat-val">0</div><div class="stat-key">Подписан</div></div>
        </div>
        <div id="profile-bio" style="color:var(--text2);font-size:13px;max-width:320px;line-height:1.6;min-height:20px;"></div>
      </div>

      <div class="profile-tabs">
        <div class="ptab active">Треки</div>
        <div class="ptab">Плейлисты</div>
        <div class="ptab">Лайки</div>
        <div class="ptab">Информация</div>
      </div>

      <div class="profile-tracks" id="profile-tracks"></div>
    </div>
  `;

  // Теперь безопасно обновляем шапку
  renderProfileHeader();
  renderProfileTracks();
}

/* ──────────────────────────────────────────────
   ПРОФИЛЬ + ВОЛНЫ + TOAST
   ────────────────────────────────────────────── */
async function renderProfileTracks() { /* твой оригинальный код */
  const container = document.getElementById('profile-tracks');
  if (!container || !currentUser) return;

  try {
    const tracks = await apiRequest('/artists/tracks');
    const PLAY_ICON = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    container.innerHTML = tracks.map(t => `
      <div class="profile-track">
        <div class="trending-num" style="color:var(--text3);">${PLAY_ICON}</div>
        <div class="pt-cover trending-cover" style="background: linear-gradient(135deg, #7c3aed, #f97316);"></div>
        <div class="pt-info">
          <div class="pt-title">${t.title}</div>
          <div class="pt-date">${new Date(t.createdAt || Date.now()).toLocaleDateString('ru-RU')}</div>
        </div>
        <div class="pt-wave">${Array.from({length:24},()=>`<div class="ptb" style="height:${4+Math.random()*22}px"></div>`).join('')}</div>
        <div class="pt-plays">${PLAY_ICON} ${t.plays || '0K'}</div>
        <div class="pt-duration">${t.duration ? Math.floor(t.duration/60)+':'+(t.duration%60).toString().padStart(2,'0') : '0:00'}</div>
      </div>
    `).join('');
  } catch (e) { console.log('Нет треков'); }
}

function generateWave(id, count = 40) { /* твой оригинальный код */
  const el = document.getElementById(id);
  if (!el) return;
  const heights = Array.from({ length: count }, () => 4 + Math.random() * 22);
  el.innerHTML = heights.map(h => `<div class="bar" style="height:${h}px"></div>`).join('');
}

function showToast(message, type = 'success') { /* твой оригинальный код */
  const toast = document.getElementById('toast');
  const text = document.getElementById('toast-text');
  const iconHTML = type === 'success'
    ? `<svg width="20" height="20" fill="none" stroke="#22c55e" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>`
    : `<svg width="20" height="20" fill="none" stroke="#ef4444" stroke-width="3" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6h12v12"/></svg>`;
  text.innerHTML = `${iconHTML} <span style="margin-left:8px;">${message}</span>`;
  toast.style.borderColor = type === 'success' ? '#22c55e' : '#ef4444';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ──────────────────────────────────────────────
   ИНИЦИАЛИЗАЦИЯ
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
  initUploadModal();
  generateWave('wave1'); generateWave('wave2'); generateWave('wave3'); generateWave('wave4');

  loadCurrentUser();   // ←←← главное исправление
});

/* Глобальные функции для onclick в HTML */
window.showModal = showModal;
window.closeModal = closeModal;
window.showPage = showPage;
window.logout = logout;
window.openAuthWithReset = () => {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  showModal('auth-modal');
};
window.openUploadWithReset = () => {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  if (!currentUser) {
    showToast('Сначала войди в аккаунт!', 'error');
    return;
  }
  showModal('upload-modal');
};