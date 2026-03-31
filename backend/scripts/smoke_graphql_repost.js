'use strict';

const API = process.env.API_URL || 'http://localhost:5000/api';
const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://localhost:5000/graphql';

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

async function registerUser({ username, email, password }) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await readJsonSafe(res);
  assert(res.ok, `Регистрация неуспешна: ${JSON.stringify(data)}`);
  assert(data.token, 'Не получен token после регистрации');
  assert(data._id, 'Не получен _id после регистрации');

  return data;
}

async function graphqlRequest({ query, variables = {}, token = null }) {
  const res = await withTimeout(
    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ query, variables }),
    }),
    10000,
    'GraphQL request'
  );

  const data = await withTimeout(
    readJsonSafe(res),
    10000,
    'GraphQL response body'
  );

  return {
    ok: res.ok,
    status: res.status,
    data,
  };
}

async function main() {
  const suffix = Date.now();

  const artistCreds = {
    username: `artist_${suffix}`,
    email: `artist_${suffix}@test.com`,
    password: '12345678',
  };

  const listenerCreds = {
    username: `listener_${suffix}`,
    email: `listener_${suffix}@test.com`,
    password: '12345678',
  };

  console.log('1) Регистрация артиста...');
  const artist = await registerUser(artistCreds);
  const artistId = artist._id;
  const artistToken = artist.token;
  console.log(`OK: артист зарегистрирован (${artist.username})`);

  console.log('2) Регистрация слушателя...');
  const listener = await registerUser(listenerCreds);
  const listenerId = listener._id;
  const listenerToken = listener.token;
  console.log(`OK: слушатель зарегистрирован (${listener.username})`);

  console.log('3) Создание трека артистом через REST...');
  const createRes = await fetch(`${API}/artists/${artistId}/tracks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${artistToken}`,
    },
    body: JSON.stringify({
      title: 'GraphQL Repost Smoke Track',
      genre: 'Hip-Hop',
      tags: ['graphql', 'smoke'],
      description: 'Track for GraphQL repost smoke test',
      isPublic: true,
      duration: 180,
    }),
  });

  const createData = await readJsonSafe(createRes);
  assert(createRes.ok, `Создание трека неуспешно: ${JSON.stringify(createData)}`);
  assert(createData.track_id, 'Нет track_id после createTrack');

  const trackId = createData.track_id;
  console.log(`OK: трек создан, trackId=${trackId}`);

  console.log('4) Загрузка аудио...');
  const audioForm = new FormData();
  const fakeAudio = new Blob(
    [Buffer.from('FAKE_MP3_CONTENT_FOR_GRAPHQL_REPOST_SMOKE')],
    { type: 'audio/mpeg' }
  );
  audioForm.append('audio', fakeAudio, 'graphql-smoke.mp3');

  const uploadRes = await fetch(
    `${API}/artists/${artistId}/tracks/${trackId}/audio`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${artistToken}`,
      },
      body: audioForm,
    }
  );

  const uploadData = await readJsonSafe(uploadRes);
  assert(uploadRes.ok, `Загрузка аудио неуспешна: ${JSON.stringify(uploadData)}`);
  assert(uploadData.audio_url, 'Нет audio_url после uploadAudio');

  console.log('OK: аудио загружено');

  console.log('5) Публикация трека...');
  const publishRes = await fetch(
    `${API}/artists/${artistId}/tracks/${trackId}/publish`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${artistToken}`,
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

  console.log('6) GraphQL query getArtist...');
  const getArtistQuery = `
    query GetArtist($id: ID!) {
      getArtist(id: $id) {
        id
        name
        bio
        songs {
          id
          title
          repostCount
        }
      }
    }
  `;

  const getArtistBefore = await graphqlRequest({
    query: getArtistQuery,
    variables: { id: artistId },
  });

  assert(getArtistBefore.ok, `getArtist вернул HTTP ${getArtistBefore.status}`);
  assert(!getArtistBefore.data.errors, `getArtist вернул GraphQL errors: ${JSON.stringify(getArtistBefore.data.errors)}`);
  assert(getArtistBefore.data.data?.getArtist, 'Нет data.getArtist');
  assert(
    Array.isArray(getArtistBefore.data.data.getArtist.songs),
    'getArtist.songs не массив'
  );

  const beforeSong = getArtistBefore.data.data.getArtist.songs.find(
    (s) => String(s.id) === String(trackId)
  );
  assert(beforeSong, 'Опубликованный трек не найден в getArtist');
  assert(
    Number(beforeSong.repostCount) === 0,
    `До репоста ожидался repostCount=0, получено: ${beforeSong.repostCount}`
  );

  console.log('OK: getArtist показывает трек до репоста');

  console.log('7) GraphQL mutation repostSong от имени слушателя...');
  const repostMutation = `
    mutation RepostSong($songId: ID!) {
      repostSong(songId: $songId) {
        id
        timestamp
        song {
          id
          title
          repostCount
        }
        user {
          id
          username
        }
      }
    }
  `;

  const repostOnce = await graphqlRequest({
    query: repostMutation,
    variables: { songId: trackId },
    token: listenerToken,
  });

  assert(repostOnce.ok, `repostSong вернул HTTP ${repostOnce.status}`);
  assert(!repostOnce.data.errors, `repostSong вернул GraphQL errors: ${JSON.stringify(repostOnce.data.errors)}`);
  assert(repostOnce.data.data?.repostSong, 'Нет data.repostSong');

  const repostPayload = repostOnce.data.data.repostSong;
  assert(String(repostPayload.song.id) === String(trackId), 'repostSong вернул неверный song.id');
  assert(String(repostPayload.user.id) === String(listenerId), 'repostSong вернул неверный user.id');
  assert(
    repostPayload.user.username === listener.username,
    `Ожидался username=${listener.username}, получено: ${repostPayload.user.username}`
  );
  assert(
    Number(repostPayload.song.repostCount) === 1,
    `После первого репоста ожидался repostCount=1, получено: ${repostPayload.song.repostCount}`
  );

    console.log('8) Повторный repostSong тем же пользователем должен вернуть ошибку...');
    const repostTwice = await graphqlRequest({
      query: repostMutation,
      variables: { songId: trackId },
      token: listenerToken,
    });

    // Для GraphQL бизнес-ошибка может прийти как 200 с errors,
    // а может как 400 с errors — оба варианта для нашего теста допустимы.
    assert(
      repostTwice.status === 200 || repostTwice.status === 400,
      `Ожидался HTTP 200 или 400 при повторном репосте, получено: ${repostTwice.status}`
    );

    assert(
      Array.isArray(repostTwice.data.errors) && repostTwice.data.errors.length > 0,
      `Ожидалась GraphQL ошибка при повторном репосте, получено: ${JSON.stringify(repostTwice.data)}`
    );

    const duplicateMessage = repostTwice.data.errors[0]?.message || '';
    assert(
      duplicateMessage.includes('уже репостнули') ||
      duplicateMessage.includes('уже репостнул') ||
      duplicateMessage.includes('already'),
      `Неожиданное сообщение ошибки повторного репоста: ${duplicateMessage}`
    );

    console.log('OK: повторный репост корректно отклонён');

  console.log('9) Повторная проверка getArtist — счётчик репостов должен быть увеличен...');
  const getArtistAfter = await graphqlRequest({
    query: getArtistQuery,
    variables: { id: artistId },
  });

  assert(getArtistAfter.ok, `getArtist(after) вернул HTTP ${getArtistAfter.status}`);
  assert(!getArtistAfter.data.errors, `getArtist(after) вернул GraphQL errors: ${JSON.stringify(getArtistAfter.data.errors)}`);

  const afterSong = getArtistAfter.data.data?.getArtist?.songs?.find(
    (s) => String(s.id) === String(trackId)
  );

  assert(afterSong, 'После репоста трек не найден в getArtist');
  assert(
    Number(afterSong.repostCount) === 1,
    `После репоста ожидался repostCount=1, получено: ${afterSong.repostCount}`
  );

  console.log('OK: getArtist показывает обновлённый repostCount');
  console.log('\nGRAPHQL REPOST SMOKE TEST PASSED');
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms)
    ),
  ]);
}

main().catch((err) => {
  console.error('\nGRAPHQL REPOST SMOKE TEST FAILED');
  console.error(err.message);
  process.exit(1);
});
