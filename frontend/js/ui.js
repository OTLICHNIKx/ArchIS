/* ──────────────────────────────────────────────
   НАВИГАЦИЯ ПО СТРАНИЦАМ
   ────────────────────────────────────────────── */

/**
 * Показывает нужную страницу и обновляет активную кнопку в демо-навигаторе.
 * @param {'home'|'profile'} name — идентификатор страницы
 */
function showPage(name) {
  // Закрываем все модальные окна перед сменой страницы
  document.querySelectorAll('.modal-overlay.open').forEach(modal => {
    modal.classList.remove('open');
  });

  // дальше как было
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

function openUploadWithReset() {
  // закрываем ВСЕ открытые модалки (на случай, если открыта авторизация)
  document.querySelectorAll('.modal-overlay.open').forEach(modal => {
    modal.classList.remove('open');
  });

  // открываем загрузку
  showModal('upload-modal');
}

function openAuthWithReset() {
  // закрываем ВСЕ открытые модалки (включая upload-modal, если она была)
  document.querySelectorAll('.modal-overlay.open').forEach(modal => {
    modal.classList.remove('open');
  });

  // открываем авторизацию
  showModal('auth-modal');
}

// все addEventListener для оверлеев, Escape и т.д.