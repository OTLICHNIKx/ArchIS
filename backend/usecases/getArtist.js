// backend/usecases/getArtist.js
'use strict';

function makeGetArtist({ trackRepository, userRepository }) {
  return async function getArtist(artistId) {
    if (!artistId) {
      const err = new Error('artistId обязателен');
      err.status = 400;
      throw err;
    }

    const artistUser = await userRepository.findArtistCardById(artistId);

    if (!artistUser) {
      const err = new Error('Артист не найден');
      err.status = 404;
      throw err;
    }

    const tracks = await trackRepository.findAllByArtist(artistId);

    const publicTracks = tracks.filter(track =>
      track.isPublic !== false && track.status === 'PUBLISHED'
    );

    return {
      id: String(artistId),
      username: artistUser.username,
      name: artistUser.username,
      avatar: artistUser.avatar,
      bio: artistUser.bio || 'Артист платформы OtlichnikMusic',

      songs: publicTracks.map(track => ({
        id: String(track._id),
        title: track.title,
        genre: track.genre,
        duration: track.duration,
        repostCount: track.repostCount || 0,
        isPublic: track.isPublic,
        audioUrl: track.audioUrl,
        coverUrl: track.coverUrl,
        plays: track.plays || 0,
        artistName: track.artistName || artistUser.username,
        artistUsername: artistUser.username
      })),

      totalSongs: publicTracks.length
    };
  };
}

module.exports = makeGetArtist;