// usecases/updateTrackMetadata.js
// Сценарий: Обновить метаданные трека
// PATCH /artists/{artist_id}/tracks/{track_id}

'use strict';

const { validateTrackMetadata } = require('../domain/Track');

function makeUpdateTrackMetadata({ trackRepository }) {

  return async function updateTrackMetadata(trackId, artistId, data) {
    const track = await trackRepository.findByIdAndArtist(trackId, artistId);
    if (!track) {
      const err = new Error('Трек не найден');
      err.status = 404;
      throw err;
    }

    // Валидируем только переданные поля
    const toValidate = {
      title:       data.title       ?? track.title,
      genre:       data.genre       ?? track.genre,
      tags:        data.tags        ?? track.tags,
      description: data.description ?? track.description,
      duration:    data.duration    ?? track.duration,
    };

    if ('artistName' in data) {
      if (!data.artistName || data.artistName.trim() === '') {
        // Если поле пустое, удаляем его из объекта, чтобы не менять artistName
        delete data.artistName;
      }
    }

    const errors = validateTrackMetadata(toValidate);
    if (errors.length > 0) {
      const err = new Error(errors.join(', '));
      err.status = 400;
      throw err;
    }

    const updated = await trackRepository.update(trackId, data);
    return updated;
  };
}

module.exports = makeUpdateTrackMetadata;