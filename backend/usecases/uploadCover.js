// backend/usecases/uploadCover.js
// Сценарий: Загрузить обложку для трека
// POST /artists/{artist_id}/tracks/{track_id}/cover

'use strict';

function makeUploadCover({ trackRepository, fileStorage }) {

  return async function uploadCover(trackId, artistId, fileBuffer, originalFilename) {
    const track = await trackRepository.findByIdAndArtist(trackId, artistId);
    if (!track) {
      const err = new Error('Трек не найден');
      err.status = 404;
      throw err;
    }

    const coverUrl = await fileStorage.saveCover(trackId, fileBuffer, originalFilename);

    const updated = await trackRepository.update(trackId, { coverUrl });

    return {
      track_id: updated._id,
      cover_url: updated.coverUrl
    };
  };
}

module.exports = makeUploadCover;