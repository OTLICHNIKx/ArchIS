// usecases/archiveTrack.js
// Сценарий: Скрыть трек
// POST /artists/{track_id}/archive

'use strict';

const { canArchive, TrackStatus } = require('../domain/Track');

function makeArchiveTrack({ trackRepository }) {

  return async function archiveTrack(trackId, artistId) {
    const track = await trackRepository.findByIdAndArtist(trackId, artistId);
    if (!track) {
      const err = new Error('Трек не найден');
      err.status = 404;
      throw err;
    }

    if (!canArchive(track)) {
      const err = new Error(`Нельзя архивировать трек со статусом ${track.status}`);
      err.status = 400;
      throw err;
    }

    const updated = await trackRepository.update(trackId, {
      status: TrackStatus.ARCHIVED,
    });
    return updated;
  };
}

module.exports = makeArchiveTrack;