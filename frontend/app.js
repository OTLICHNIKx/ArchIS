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
let selectedCover = null;
let audioPlayer = null;
let currentPlayingTrack = null;
let currentArtistProfileId = null;
let isPlaying = false;

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
  let username = document.getElementById('reg-username').value.trim();
  if (username.startsWith('@')) {
      username = username.substring(1);
    }
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  try {
    const data = await apiRequest('/auth/register', 'POST', { username, email, password });
    localStorage.setItem('token', data.token);
    currentUser = data;

    clearAuthForms();
    closeModal('auth-modal');
    updateTopbarAuth();
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
    updateTopbarAuth();
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

  showPage('home');
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

/* Автоподхват метаданных + имя артиста */
/* Автоподхват метаданных + имя артиста */
function handleFile(file) {
  if (!file.type.startsWith('audio/')) {
    return showToast('Только аудиофайлы!', 'error');
  }
  selectedFile = file;

  const titleInput = document.getElementById('track-title');
  let filename = file.name.replace(/\.[^/.]+$/, "");
  if (titleInput) titleInput.value = filename;

  // Автоподстановка имени артиста
  const artistInput = document.getElementById('artist-name');
  if (currentUser && currentUser.username && artistInput) {
    artistInput.value = currentUser.username;
  }

  // === БЕЗОПАСНОЕ ПОЛУЧЕНИЕ ДЛИТЕЛЬНОСТИ ===
  const audio = new Audio();
  audio.src = URL.createObjectURL(file);

  audio.onloadedmetadata = () => {
    const duration = Math.round(audio.duration) || 0;

    // Сохраняем в глобальную переменную (главное!)
    window.selectedTrackDuration = duration;

    // Если поле существует — заполняем его
    const durationInput = document.getElementById('track-duration');
    if (durationInput) {
      durationInput.value = duration;
    }

    console.log(`✅ Длительность определена: ${duration} секунд`);
    URL.revokeObjectURL(audio.src);
  };

  audio.onerror = () => {
    console.warn('⚠️ Не удалось прочитать длительность');
    window.selectedTrackDuration = 0;
  };

  // Обновляем drop-zone
  const dropZone = document.getElementById('drop-zone');
  if (dropZone) {
    dropZone.innerHTML = `<p>✓ ${file.name} выбран</p>`;
  }
}

/* Обновлённая загрузка трека (с обложкой) */
/* Обновлённая загрузка трека (с обложкой) */
async function handleTrackUpload() {
  // Защита: проверяем, что модалка открыта и элементы существуют
  const titleInput = document.getElementById('track-title');
  if (!titleInput) {
    return showToast('Модальное окно загрузки не открыто', 'error');
  }

  if (!currentUser || !currentUser._id) {
    return showToast('Сначала войди в аккаунт!', 'error');
  }

  const title       = titleInput.value.trim();
  const artistName  = document.getElementById('artist-name')?.value.trim() || currentUser.username;
  const genre       = document.getElementById('track-genre')?.value || '';
  const tagsInput   = document.getElementById('track-tags')?.value || '';
  const description = document.getElementById('track-desc')?.value.trim() || '';
  const durationStr = document.getElementById('track-duration')?.value;
  const duration    = durationStr ? parseInt(durationStr) : 0;
  const isPublic    = !document.getElementById('public-toggle')?.classList.contains('off');

  // Валидация
  if (!title) {
    return showToast('Название трека обязательно!', 'error');
  }
  if (!genre) {
    return showToast('Выберите жанр!', 'error');
  }

  if (!selectedFile) {
    return showToast('Выбери аудиофайл!', 'error');
  }

  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

  try {
    showToast('Загружаем трек...', 'success');

    // 1. Создаём трек (метаданные)
    const trackResponse = await apiRequest(`/artists/${currentUser._id}/tracks`, 'POST', {
      title,
      artistName,
      genre,
      tags,
      description,
      duration,
      isPublic
    });

    const trackId = trackResponse.track_id || trackResponse._id || trackResponse.id;
    if (!trackId) throw new Error('Не удалось получить ID трека');

    // 2. Загружаем аудио
    const audioForm = new FormData();
    audioForm.append('audio', selectedFile);
    const audioRes = await fetch(`${API_URL}/artists/${trackId}/audio`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: audioForm
    });

    if (!audioRes.ok) {
      const errData = await audioRes.json();
      throw new Error(errData.message || 'Ошибка загрузки аудио');
    }

    // 3. Загружаем обложку (если выбрана)
    if (selectedCover) {
      const coverForm = new FormData();
      coverForm.append('cover', selectedCover);
      await fetch(`${API_URL}/artists/${trackId}/cover`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: coverForm
      });
    }

    // 4. Публикуем трек
    await apiRequest(`/artists/${trackId}/publish`, 'POST');

    showToast('🎵 Трек успешно опубликован!', 'success');

    // Закрываем модалку и очищаем данные
    closeModal('upload-modal');
    selectedFile = null;
    selectedCover = null;

    // Обновляем список треков в профиле
    if (currentUser) {
      renderProfileTracks();
    }

  } catch (err) {
    console.error(err);
    showToast(err.message || 'Ошибка при загрузке трека', 'error');
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
    @${(currentUser.username || 'user').replace(/^@/, '')}
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
          <div id="profile-handle" class="profile-handle">@${(currentUser.username || 'user').replace(/^@/, '')}</div>
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
/* ──────────────────────────────────────────────
   РЕНДЕР ТРЕКОВ В ПРОФИЛЕ (с обложкой)
   ────────────────────────────────────────────── */
async function renderProfileTracks() {
  const container = document.getElementById('profile-tracks');
  if (!container || !currentUser) return;

  try {
    const tracks = await apiRequest('/artists/tracks');

    const PLAY_ICON = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;

    container.innerHTML = tracks.map(t => {
     // Если есть обложка — используем её, иначе градиент
    const coverStyle = t.coverUrl
      ? `background-image: url('http://localhost:5000${t.coverUrl}'); background-size: cover; background-position: center;`
      : `background: linear-gradient(135deg, #7c3aed, #f97316);`;

      return `
        <div class="profile-track">
          <div
              class="pt-cover trending-cover track-cover-interactive"
              style="${coverStyle}"
              onclick='toggleTrack(${JSON.stringify(t).replace(/"/g, "&quot;")})'
            >
              <div
                class="track-overlay"
                data-track-play="1"
                data-track-json='${JSON.stringify(t).replace(/'/g, "&apos;")}'
              >
                ${getTrackButtonIcon(t)}
              </div>
            </div>

          <div class="pt-info">
            <div class="pt-title">${t.title}</div>
            <div class="pt-date">${t.artistName || currentUser.username}</div>
          </div>

          <div class="pt-wave">
            ${Array.from({length: 24}, () =>
              `<div class="ptb" style="height:${4 + Math.random()*22}px"></div>`
            ).join('')}
          </div>

          <div class="pt-plays">${PLAY_ICON} ${t.plays || '0K'}</div>
          <div class="pt-duration">
            ${t.duration ? Math.floor(t.duration/60) + ':' + (t.duration % 60).toString().padStart(2, '0') : '0:00'}
          </div>
        </div>
      `;
    }).join('');
    refreshTrackPlayStates();

  } catch (e) {
    console.log('Нет треков или ошибка загрузки');
    container.innerHTML = `<div style="padding:20px;color:var(--text2);text-align:center;">Пока нет треков</div>`;
  }
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
  initModalCloseBehavior();
  initCoverUpload();
  generateWave('wave1'); generateWave('wave2'); generateWave('wave3'); generateWave('wave4');

  initAudioPlayer();
  initSearch();

  loadCurrentUser();   // ←←← главное исправление
});

/* ====================== ГЛОБАЛЬНЫЙ ПЛЕЕР ====================== */
function initAudioPlayer() {
  audioPlayer = document.createElement('audio');
  audioPlayer.style.display = 'none';
  document.body.appendChild(audioPlayer);

  audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    updateMiniPlayer();
    refreshTrackPlayStates();
  });

  audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    updateMiniPlayer();
    refreshTrackPlayStates();
  });

  audioPlayer.addEventListener('ended', () => {
    isPlaying = false;
    currentPlayingTrack = null;
    updateMiniPlayer();
    refreshTrackPlayStates();
  });
}

function isSameTrack(a, b) {
  if (!a || !b) return false;
  return String(a.id || a._id) === String(b.id || b._id);
}

function pauseTrack() {
  if (!audioPlayer) return;
  audioPlayer.pause();
}

function stopTrack() {
  if (!audioPlayer) return;

  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  currentPlayingTrack = null;
  isPlaying = false;

  updateMiniPlayer();
  refreshTrackPlayStates();
}

function toggleTrack(track) {
  if (!track) return;

  const sameTrack = isSameTrack(track, currentPlayingTrack);

  if (sameTrack && isPlaying) {
    pauseTrack();
    return;
  }

  playTrack(track);
}

function toggleCurrentTrack() {
  if (!currentPlayingTrack) return;

  if (isPlaying) {
    pauseTrack();
  } else {
    playTrack(currentPlayingTrack);
  }
}

function playTrack(track) {
  if (!track?.audioUrl) {
    return showToast('Трек ещё не обработан', 'error');
  }

  const fullUrl = `http://localhost:5000${track.audioUrl}`;
  const sameTrack = isSameTrack(track, currentPlayingTrack);

  currentPlayingTrack = track;

  if (!audioPlayer) return;

  if (!sameTrack || audioPlayer.src !== fullUrl) {
    audioPlayer.src = fullUrl;
  }

  audioPlayer.play().catch(() => {
    showToast('Не удалось воспроизвести', 'error');
  });
}

function updateMiniPlayer(track = currentPlayingTrack) {
  const playerEl = document.getElementById('mini-player');
  const nameEl = document.getElementById('mini-track-name');
  const artistEl = document.getElementById('mini-artist-name');
  const playPauseBtn = document.getElementById('mini-play-pause');

  if (!playerEl || !nameEl || !artistEl || !playPauseBtn) return;

  if (track) {
    playerEl.classList.remove('hidden');
    document.body.classList.add('player-visible');

    nameEl.textContent = track.title || 'Без названия';
    artistEl.textContent = track.artistName || 'Unknown';
    playPauseBtn.textContent = isPlaying ? '❚❚' : '▶';
  } else {
    playerEl.classList.add('hidden');
    document.body.classList.remove('player-visible');

    nameEl.textContent = 'Ничего не играет';
    artistEl.textContent = 'OtlichnikMusic';
    playPauseBtn.textContent = '▶';
  }
}

/* ====================== ПОИСК ====================== */
function initSearch() {
  const input = document.getElementById('search-input');
  const dropdown = document.getElementById('search-dropdown');
  if (!input || !dropdown) return;
  let timeout;

  input.addEventListener('input', () => {
    clearTimeout(timeout);

    timeout = setTimeout(async () => {
      const q = input.value.trim();

      if (q.length < 2) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        return;
      }

      try {
        const res = await fetch(`${API_URL}/search/users?q=${encodeURIComponent(q)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Ошибка поиска');
        }

        const users = Array.isArray(data) ? data : [];

        if (users.length === 0) {
          dropdown.innerHTML = `
            <div style="padding:20px;text-align:center;color:var(--text2);">
              Ничего не найдено
            </div>
          `;
        } else {
          dropdown.innerHTML = users.map(u => `
            <div class="search-result" onclick="viewArtistProfile('${u.id}')">
              <div class="search-avatar">${(u.username || '?')[0].toUpperCase()}</div>
              <div>
                <div style="font-weight:600;">${u.username}</div>
                <div style="font-size:12px;color:var(--text2);">${u.bio || ''}</div>
              </div>
            </div>
          `).join('');
        }

        dropdown.style.display = 'block';
      } catch (err) {
        console.error('Search error:', err);
        dropdown.innerHTML = `
          <div style="padding:20px;text-align:center;color:var(--text2);">
            Ошибка поиска
          </div>
        `;
        dropdown.style.display = 'block';
      }
    }, 250);
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrapper')) {
      dropdown.style.display = 'none';
    }
  });
}

window.viewArtistProfile = async function(artistId) {
  document.getElementById('search-dropdown').style.display = 'none';
  currentArtistProfileId = artistId;
  showPage('artist');
  renderArtistProfile(artistId);
};

/* ====================== ПУБЛИЧНЫЙ ПРОФИЛЬ ====================== */
async function renderArtistProfile(artistId) {
  const content = document.getElementById('artist-content');
  try {
    const data = await apiRequest(`/artists/${artistId}`);

    const handle = `@${data.username || data.name}`;

    content.innerHTML = `
      <div class="topbar">
        <button class="btn btn-ghost" onclick="showPage('home')">← Назад</button>
        <div class="topbar-right" id="topbar-auth"></div>
      </div>

      <div class="profile-hero">
        <div class="hero-bg"></div>
        <div class="hero-noise"></div>
        <div class="hero-overlay"></div>
        <div class="profile-info">
          <div class="profile-avatar" style="background:linear-gradient(135deg,#7c3aed,#f97316);">
            ${(data.username || '?')[0].toUpperCase()}
          </div>
          <div class="profile-meta">
            <div class="profile-name">${data.name || data.username}</div>
            <div class="profile-handle">${handle}</div>
          </div>
        </div>
      </div>

      <div class="profile-body">
        <div class="profile-stats">
          <div class="stat"><div class="stat-val">${data.totalSongs}</div><div class="stat-key">Треков</div></div>
        </div>

        ${data.bio ? `<div style="color:var(--text2); margin-bottom:24px; font-size:14px;">${data.bio}</div>` : ''}

        <div class="profile-tracks" id="artist-tracks"></div>
      </div>
    `;
    updateTopbarAuth();
    // Рендер треков
    const container = document.getElementById('artist-tracks');
    if (!data.songs || data.songs.length === 0) {
      container.innerHTML = `
        <div style="color:var(--text2); padding:20px 0;">
          У артиста пока нет публичных треков
        </div>
      `;
      return;
    }
    const PLAY_ICON = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;

    container.innerHTML = data.songs.map(t => {
      const coverStyle = t.coverUrl
        ? `background-image:url('http://localhost:5000${t.coverUrl}');background-size:cover;background-position:center;`
        : `background:linear-gradient(135deg,#7c3aed,#f97316);`;

      return `
        <div class="profile-track">
          <div
              class="pt-cover trending-cover track-cover-interactive"
              style="${coverStyle}"
              onclick='toggleTrack(${JSON.stringify(t).replace(/"/g, "&quot;")})'
            >
              <div
                class="track-overlay"
                data-track-play="1"
                data-track-json='${JSON.stringify(t).replace(/'/g, "&apos;")}'
              >
                ${getTrackButtonIcon(t)}
              </div>
            </div>
          <div class="pt-info">
            <div class="pt-title">${t.title}</div>
            <div class="pt-date">${t.artistName}</div>
          </div>
          <div class="pt-plays">${PLAY_ICON} ${t.plays || '0K'}</div>
          <div class="pt-duration">${Math.floor(t.duration/60)}:${(t.duration%60).toString().padStart(2,'0')}</div>
        </div>
      `;
    }).join('');
    refreshTrackPlayStates();

  } catch (e) {
    console.error(e);
    content.innerHTML = `<div style="padding:40px;color:var(--text2);text-align:center;">Артист не найден</div>`;
  }
}

/* Глобальные функции для onclick в HTML */
window.showModal = showModal;
window.closeModal = closeModal;
window.showPage = showPage;
window.logout = logout;
window.toggleTrack = toggleTrack;
window.toggleCurrentTrack = toggleCurrentTrack;
window.stopTrack = stopTrack;

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

function initModalCloseBehavior() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('mousedown', e => { overlay.dataset.mouseDownTarget = e.target; });
    overlay.addEventListener('mouseup', e => {
      if (overlay.dataset.mouseDownTarget === overlay && e.target === overlay) {
        // НИЧЕГО НЕ ДЕЛАЕМ — закрытие только по крестику
      }
      delete overlay.dataset.mouseDownTarget;
    });
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => e.stopPropagation());
  });
}

/* Обработка выбора обложки */
function handleCoverFile(file) {
  if (!file.type.startsWith('image/')) {
    return showToast('Только JPG или PNG!', 'error');
  }
  selectedCover = file;

  const reader = new FileReader();
  reader.onload = function(e) {
    const thumb = document.getElementById('cover-thumb');
    thumb.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
  };
  reader.readAsDataURL(file);
}

/* Drag & Drop + клик для обложки */
function initCoverUpload() {
  const area = document.getElementById('cover-upload-area');
  const input = document.getElementById('cover-file');

  input.addEventListener('change', e => {
    if (e.target.files.length) handleCoverFile(e.target.files[0]);
  });

  area.addEventListener('dragover', e => {
    e.preventDefault();
    area.style.borderColor = 'var(--accent)';
  });
  area.addEventListener('dragleave', () => area.style.borderColor = 'var(--border)');
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.style.borderColor = 'var(--border)';
    if (e.dataTransfer.files.length) handleCoverFile(e.dataTransfer.files[0]);
  });
}

function getTrackButtonIcon(track) {
  const isCurrent = isSameTrack(track, currentPlayingTrack);

  if (isCurrent && isPlaying) {
    return `
      <div class="track-overlay-icon pause">
        <span></span><span></span>
      </div>
    `;
  }

  return `
    <div class="track-overlay-icon play"></div>
  `;
}

function refreshTrackPlayStates() {
  document.querySelectorAll('[data-track-play]').forEach(el => {
    const raw = el.getAttribute('data-track-json');
    if (!raw) return;

    try {
      const track = JSON.parse(raw);
      el.innerHTML = getTrackButtonIcon(track);

      if (isSameTrack(track, currentPlayingTrack)) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    } catch (e) {
      console.warn('Не удалось обновить состояние трека', e);
    }
  });
}