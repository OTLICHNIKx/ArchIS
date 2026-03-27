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
  document.querySelectorAll('.modal-overlay.open').forEach(modal => modal.classList.remove('open'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');

  document.querySelectorAll('.demo-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('nav-' + name);
  if (btn) btn.classList.add('active');
}

function showModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(el => el.classList.remove('open'));
});

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
    //showPage('profile');

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
    //showPage('profile');

  } catch (err) {
    showToast(err.message, 'error');
  }
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
   РЕНДЕР ШАПКИ ПРОФИЛЯ (реальные данные)
   ────────────────────────────────────────────── */
function renderProfileHeader() {
  if (!currentUser) return;

  // Ник и handle
  document.getElementById('profile-name').textContent = currentUser.username || 'Пользователь';
  document.getElementById('profile-handle').innerHTML = `
    @${currentUser.username?.replace('@','') || 'user'}
    <span style="color:var(--text3)">· Москва, RU</span>
  `;

  // Аватар
  const avatarEl = document.getElementById('profile-avatar');
  const avatarTop = document.getElementById('profile-avatar-top');
  avatarEl.textContent = currentUser.username?.[0]?.toUpperCase() || 'U';
  avatarTop.textContent = currentUser.username?.[0]?.toUpperCase() || 'U';

  // Кнопки для своего профиля
  const actions = document.getElementById('profile-actions');
  actions.innerHTML = `
    <button onclick="alert('Редактирование профиля в разработке')" class="btn btn-outline-accent btn-ghost">Редактировать профиль</button>
  `;

  // Статистика (реальное количество треков + заглушки)
  document.getElementById('stat-tracks').textContent = '—'; // позже сделаем реальное
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

window.openUploadWithReset = () => {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  if (!currentUser) return showToast('Сначала войди в аккаунт!', 'error');
  showModal('upload-modal');
};

window.openAuthWithReset = () => {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  showModal('auth-modal');
};