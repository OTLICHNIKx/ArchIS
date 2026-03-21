/* ══════════════════════════════════════════════
   app.js — OtlichnikMusic UI Logic
   ══════════════════════════════════════════════ */


/* ──────────────────────────────────────────────
   НАВИГАЦИЯ ПО СТРАНИЦАМ
   ────────────────────────────────────────────── */

/**
 * Показывает нужную страницу и обновляет активную кнопку в демо-навигаторе.
 * @param {'home'|'profile'} name — идентификатор страницы
 */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');

  document.querySelectorAll('.demo-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('nav-' + name);
  if (btn) btn.classList.add('active');
}


/* ──────────────────────────────────────────────
   МОДАЛЬНЫЕ ОКНА
   ────────────────────────────────────────────── */

/**
 * Открывает модалку по id.
 * @param {string} id
 */
function showModal(id) {
  document.getElementById(id).classList.add('open');
}

/**
 * Закрывает модалку по id.
 * @param {string} id
 */
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Закрытие кликом по оверлею (вне .modal)
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => {
    if (e.target === el) el.classList.remove('open');
  });
});

// Закрытие по Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(el => {
      el.classList.remove('open');
    });
  }
});


/* ──────────────────────────────────────────────
   АВТОРИЗАЦИЯ — переключение форм
   ────────────────────────────────────────────── */

/**
 * Переключает между формами «Войти» и «Регистрация».
 * @param {'login'|'register'} tab
 */
function switchTab(tab) {
  const tabs = document.querySelectorAll('#auth-tabs .tab');
  tabs[0].classList.toggle('active', tab === 'login');
  tabs[1].classList.toggle('active', tab === 'register');

  document.getElementById('form-login').style.display    = tab === 'login'    ? '' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? '' : 'none';
}


/* ──────────────────────────────────────────────
   ГЕНЕРАЦИЯ ВОЛНЫ (waveform bars)
   ────────────────────────────────────────────── */

/**
 * Заполняет контейнер случайными барами-волнами.
 * @param {string} id     — id элемента-контейнера
 * @param {number} count  — количество баров
 */
function generateWave(id, count = 40) {
  const el = document.getElementById(id);
  if (!el) return;
  const heights = Array.from({ length: count }, () => 4 + Math.random() * 22);
  el.innerHTML = heights.map(h => `<div class="bar" style="height:${h}px"></div>`).join('');
}

// Инициализация волн на карточках главной
generateWave('wave1');
generateWave('wave2');
generateWave('wave3');
generateWave('wave4');


/* ──────────────────────────────────────────────
   ПРОФИЛЬ — генерация списка треков
   ────────────────────────────────────────────── */

/** Данные треков профиля */
const PROFILE_TRACKS = [
  { title: 'Neon Pulse — Original Mix',  date: '15 марта 2026',    plays: '71K', dur: '6:24', cls: 'cover-5' },
  { title: 'Dark Room Sessions',          date: '2 марта 2026',     plays: '48K', dur: '4:51', cls: 'cover-1' },
  { title: 'Subterranean Groove',         date: '18 февраля 2026',  plays: '33K', dur: '7:02', cls: 'cover-3' },
  { title: 'Afterhours EP — Track 3',     date: '5 февраля 2026',   plays: '22K', dur: '5:38', cls: 'cover-6' },
  { title: 'Voltage Rise (Club Edit)',    date: '20 января 2026',   plays: '19K', dur: '3:44', cls: 'cover-4' },
];

/**
 * Генерирует HTML случайных мини-баров волны для трека.
 * @param {number} n — количество баров
 * @returns {string}
 */
function rndBars(n = 24) {
  return Array.from({ length: n }, () => {
    const h = 4 + Math.random() * 22;
    return `<div class="ptb" style="height:${h}px; width:2px;"></div>`;
  }).join('');
}

/** SVG-иконка воспроизведения (play) */
const PLAY_ICON = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
  <polygon points="5 3 19 12 5 21 5 3"/>
</svg>`;

/**
 * Рендерит список треков профиля в контейнер #profile-tracks.
 */
function renderProfileTracks() {
  const container = document.getElementById('profile-tracks');
  if (!container) return;

  container.innerHTML = PROFILE_TRACKS.map(t => `
    <div class="profile-track">
      <div class="trending-num" style="color:var(--text3);">${PLAY_ICON}</div>
      <div class="pt-cover trending-cover ${t.cls}"></div>
      <div class="pt-info">
        <div class="pt-title">${t.title}</div>
        <div class="pt-date">${t.date}</div>
      </div>
      <div class="pt-wave">${rndBars()}</div>
      <div class="pt-plays">${PLAY_ICON} ${t.plays}</div>
      <div class="pt-duration">${t.dur}</div>
    </div>
  `).join('');
}

renderProfileTracks();


/* ──────────────────────────────────────────────
   ИНИЦИАЛИЗАЦИЯ
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Убеждаемся, что стартовая страница — главная
  showPage('home');
});