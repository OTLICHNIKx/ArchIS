/* ══════════════════════════════════════════════
   app.js — OtlichnikMusic UI Logic
   ══════════════════════════════════════════════ */

// ================= API =================
const API_URL = 'http://localhost:5000/api';

async function apiRequest(path, method = 'GET', body = null) {
  const token = localStorage.getItem('token');

  const res = await fetch(API_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: 'Bearer ' + token })
    },
    body: body ? JSON.stringify(body) : null
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Ошибка');
  }

  return data;
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




/** SVG-иконка воспроизведения (play) */
const PLAY_ICON = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
  <polygon points="5 3 19 12 5 21 5 3"/>
</svg>`;




/* ──────────────────────────────────────────────
   ИНИЦИАЛИЗАЦИЯ
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Убеждаемся, что стартовая страница — главная
  showPage('home');
});







async function loadMe() {
  try {
    const user = await apiRequest('/auth/me');
    console.log('User:', user);
  } catch {
    console.log('Не авторизован');
  }
}

loadMe();