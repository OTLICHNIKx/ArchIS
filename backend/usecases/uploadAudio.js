// usecases/uploadAudio.js
// Сценарий: Загрузить аудиофайл для трека
// POST /artists/{track_id}/audio

'use strict';

function makeUploadAudio({ trackRepository, fileStorage }) {

  return async function uploadAudio(trackId, artistId, fileBuffer, originalFilename) {
    // 1. Проверяем, что трек принадлежит артисту
    const track = await trackRepository.findByIdAndArtist(trackId, artistId);
    if (!track) {
      const err = new Error('Трек не найден');
      err.status = 404;
      throw err;
    }

    // 2. Сохраняем файл через порт (LocalFileStorage)
    const audioUrl = await fileStorage.saveAudio(trackId, fileBuffer, originalFilename);

    // 3. Обновляем трек в БД
    const updated = await trackRepository.update(trackId, { audioUrl });

    return {
      track_id: updated._id,
      audio_url: updated.audioUrl,
      status: updated.status
    };
  };
}

module.exports = makeUploadAudio;