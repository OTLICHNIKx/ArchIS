

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('reg-username').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  try {
    const data = await apiRequest('/auth/register', 'POST', { username, email, password });
    localStorage.setItem('token', data.token);
    closeModal('auth-modal');
    showToast('✅ Регистрация прошла успешно!', 'success');
  } catch (err) {
    showToast(err.message || 'Ошибка регистрации', 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    const data = await apiRequest('/auth/login', 'POST', { email, password });
    localStorage.setItem('token', data.token);
    closeModal('auth-modal');
    showToast('✅ Вы успешно вошли в аккаунт!', 'success');
  } catch (err) {
    showToast(err.message || 'Ошибка входа', 'error');
  }
}

/* ====================== TOAST ====================== */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const text  = document.getElementById('toast-text');

  text.textContent = message;

  // Цвет акцента в зависимости от типа
  if (type === 'error') {
    toast.style.borderColor = '#ef4444';
  } else {
    toast.style.borderColor = 'var(--accent)';
  }

  toast.classList.add('show');

  // Автоскрытие через 3 секунды
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}