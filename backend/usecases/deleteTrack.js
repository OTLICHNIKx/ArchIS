// usecases/deleteTrack.js
// Сценарий: Удалить трек
// DELETE /artists/{artist_id}/tracks/{track_id}

'use strict';

const { canDelete } = require('../domain/Track');

function makeDeleteTrack({ trackRepository, fileStorage }) {

  return async function deleteTrack(trackId, artistId) {
    const track = await trackRepository.findByIdAndArtist(trackId, artistId);
    if (!track) {
      const err = new Error('Трек не найден');
      err.status = 404;
      throw err;
    }

    if (!canDelete(track)) {
      const err = new Error('Нельзя удалить трек в статусе PROCESSING');
      err.status = 400;
      throw err;
    }

    await fileStorage.deleteTrackFiles(trackId);
    await trackRepository.delete(trackId);

    return { message: 'Трек удалён' };
  };
}

module.exports = makeDeleteTrack;