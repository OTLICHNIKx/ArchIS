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

window.renderProfileTracks = renderProfileTracks;