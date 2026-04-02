// backend/usecases/publishTrack.js
// Сценарий: Отправить трек на публикацию
// POST /artists/{artist_id}/tracks/{track_id}/publish

'use strict';

const { canPublish, TrackStatus } = require('../domain/Track');

function makePublishTrack({ trackRepository, audioService }) {
  return async function publishTrack(trackId, artistId) {
    const track = await trackRepository.findByIdAndArtist(trackId, artistId);
    if (!track) {
      const err = new Error('Трек не найден');
      err.status = 404;
      throw err;
    }

    if (!track.audioUrl) {
      const err = new Error('Нельзя опубликовать трек без аудио');
      err.status = 400;
      throw err;
    }

    if (!canPublish(track)) {
      const err = new Error(`Нельзя опубликовать трек со статусом ${track.status}`);
      err.status = 400;
      throw err;
    }

    await trackRepository.update(trackId, { status: TrackStatus.PROCESSING });

    const result = await audioService.process(trackId);

    const newStatus = result.success ? TrackStatus.PUBLISHED : TrackStatus.FAILED;
    const updated = await trackRepository.update(trackId, { status: newStatus });

    return updated;
  };
}

module.exports = makePublishTrack;