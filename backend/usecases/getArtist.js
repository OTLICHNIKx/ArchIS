// backend/usecases/getArtist.js
'use strict';

function makeGetArtist({ trackRepository }) {

  return async function getArtist(artistId) {
    if (!artistId) {
      const err = new Error('artistId обязателен');
      err.status = 400;
      throw err;
    }

    // Получаем все треки артиста
    const tracks = await trackRepository.findAllByArtist(artistId);

    // Фильтруем только публичные треки (как должно быть в социальной платформе)
    const publicTracks = tracks.filter(track => track.isPublic !== false);

    return {
      id: artistId,
      name: `Artist_${artistId}`,
      bio: "Артист платформы OtlichnikMusic",
      songs: publicTracks.map(track => ({
        id: track._id,
        title: track.title,
        genre: track.genre,
        duration: track.duration,
        repostCount: track.repostCount || 0,
        isPublic: track.isPublic,
        // === НОВОЕ ===
        audioUrl: track.audioUrl,
        coverUrl: track.coverUrl,
        plays: track.plays || 0,
        artistName: track.artistName || 'Unknown Artist'
      })),
      totalSongs: publicTracks.length
    };
  };
}

module.exports = makeGetArtist;