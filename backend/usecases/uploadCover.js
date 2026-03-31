// backend/usecases/uploadCover.js
// Сценарий: Загрузить обложку для трека
// POST /artists/{artist_id}/tracks/{track_id}/cover

'use strict';

function makeUploadCover({ trackRepository, fileStorage }) {

  return async function uploadCover(trackId, artistId, fileBuffer, originalFilename) {
    // 1. Проверяем, что трек принадлежит артисту
    const track = await trackRepository.findByIdAndArtist(trackId, artistId);
    if (!track) {
      const err = new Error('Трек не найден');
      err.status = 404;
      throw err;
    }

    // 2. Сохраняем обложку через порт
    const coverUrl = await fileStorage.saveCover(trackId, fileBuffer, originalFilename);

    // 3. Обновляем трек в БД
    const updated = await trackRepository.update(trackId, { coverUrl });

    return {
      track_id: updated._id,
      cover_url: updated.coverUrl
    };
  };
}

module.exports = makeUploadCover;