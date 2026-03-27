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

window.apiRequest = apiRequest;