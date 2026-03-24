// usecases/getTrack.js
// Сценарий: Получить конкретный трек
// GET /artists/tracks/{track_id}

'use strict';

function makeGetTrack({ trackRepository }) {

  return async function getTrack(trackId, artistId) {
    const track = await trackRepository.findByIdAndArtist(trackId, artistId);
    if (!track) {
      const err = new Error('Трек не найден');
      err.status = 404;
      throw err;
    }
    return track;
  };
}

module.exports = makeGetTrack;