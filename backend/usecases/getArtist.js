// backend/usecases/getArtist.js
'use strict';

const User = require('../models/User');        // ← добавили
const Track = require('../models/Track');      // для надёжности

function makeGetArtist({ trackRepository }) {

  return async function getArtist(artistId) {
    if (!artistId) {
      const err = new Error('artistId обязателен');
      err.status = 400;
      throw err;
    }

    // Получаем реального пользователя
    const artistUser = await User.findById(artistId)
      .select('username avatar bio')
      .lean();

    if (!artistUser) {
      const err = new Error('Артист не найден');
      err.status = 404;
      throw err;
    }

    // Получаем все треки артиста
    const tracks = await trackRepository.findAllByArtist(artistId);

    // Фильтруем только публичные треки
    const publicTracks = tracks.filter(track => track.isPublic !== false);

    return {
      id: artistId,
      username: artistUser.username,                    // настоящее имя пользователя
      name: artistUser.username,                        // для отображения как "Имя артиста"
      avatar: artistUser.avatar,
      bio: artistUser.bio || "Артист платформы OtlichnikMusic",

      songs: publicTracks.map(track => ({
        id: track._id,
        title: track.title,
        genre: track.genre,
        duration: track.duration,
        repostCount: track.repostCount || 0,
        isPublic: track.isPublic,
        audioUrl: track.audioUrl,
        coverUrl: track.coverUrl,
        plays: track.plays || 0,
        artistName: artistUser.username                   // правильное имя артиста в треках
      })),
      totalSongs: publicTracks.length
    };
  };
}

module.exports = makeGetArtist;