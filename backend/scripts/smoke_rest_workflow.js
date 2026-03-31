'use strict';

const API = process.env.API_URL || 'http://localhost:5000/api';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

async function main() {
  const suffix = Date.now();
  const user = {
    username: `lab_user_${suffix}`,
    email: `lab_${suffix}@test.com`,
    password: '12345678',
  };

  console.log('1) Регистрация пользователя...');
  const registerRes = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });

  const registerData = await readJsonSafe(registerRes);
  assert(registerRes.ok, `Регистрация неуспешна: ${JSON.stringify(registerData)}`);

  const token = registerData.token;
  const artistId = registerData._id;

  assert(token, 'Не получен token');
  assert(artistId, 'Не получен _id пользователя');

  console.log('OK: пользователь зарегистрирован');

  console.log('2) Создание трека...');
  const createRes = await fetch(`${API}/artists/${artistId}/tracks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Smoke Test Track',
      genre: 'Hip-Hop',
      tags: ['smoke', 'lab2'],
      description: 'Integration smoke test',
      isPublic: true,
      duration: 120,
    }),
  });

  const createData = await readJsonSafe(createRes);
  assert(createRes.ok, `Создание трека неуспешно: ${JSON.stringify(createData)}`);
  assert(createData.track_id, 'Нет track_id после createTrack');
  assert(createData.status === 'DRAFT', `Ожидался DRAFT, получено: ${createData.status}`);

  const trackId = createData.track_id;
  console.log(`OK: трек создан, trackId=${trackId}`);

  console.log('3) Публикация без аудио должна упасть...');
  const publishWithoutAudioRes = await fetch(
    `${API}/artists/${artistId}/tracks/${trackId}/publish`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const publishWithoutAudioData = await readJsonSafe(publishWithoutAudioRes);
  assert(
    publishWithoutAudioRes.status === 400,
    `Ожидался 400 без аудио, получено: ${publishWithoutAudioRes.status}, body=${JSON.stringify(publishWithoutAudioData)}`
  );

  console.log('OK: publish без аудио корректно вернул 400');

  console.log('4) Загрузка аудио...');
  const audioForm = new FormData();
  const fakeAudio = new Blob(
    [Buffer.from('FAKE_MP3_CONTENT_FOR_SMOKE_TEST')],
    { type: 'audio/mpeg' }
  );
  audioForm.append('audio', fakeAudio, 'smoke.mp3');

  const uploadRes = await fetch(
    `${API}/artists/${artistId}/tracks/${trackId}/audio`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: audioForm,
    }
  );

  const uploadData = await readJsonSafe(uploadRes);
  assert(uploadRes.ok, `Загрузка аудио неуспешна: ${JSON.stringify(uploadData)}`);
  assert(uploadData.audio_url, 'Нет audio_url после uploadAudio');

  console.log('OK: аудио загружено');

  console.log('5) Публикация после загрузки аудио...');
  const publishRes = await fetch(
    `${API}/artists/${artistId}/tracks/${trackId}/publish`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const publishData = await readJsonSafe(publishRes);
  assert(publishRes.ok, `Publish неуспешен: ${JSON.stringify(publishData)}`);
  assert(
    publishData.status === 'PUBLISHED',
    `Ожидался статус PUBLISHED, получено: ${publishData.status}`
  );

  console.log('OK: трек опубликован');

  console.log('6) Получение трека...');
  const getRes = await fetch(
    `${API}/artists/${artistId}/tracks/${trackId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const getData = await readJsonSafe(getRes);
  assert(getRes.ok, `GET трека неуспешен: ${JSON.stringify(getData)}`);
  assert(getData.audioUrl, 'У трека нет audioUrl');
  assert(getData.status === 'PUBLISHED', `Финальный статус не PUBLISHED: ${getData.status}`);

  console.log('OK: финальная проверка трека успешна');
  console.log('\nSMOKE TEST PASSED');
}

main().catch((err) => {
  console.error('\nSMOKE TEST FAILED');
  console.error(err.message);
  process.exit(1);
});