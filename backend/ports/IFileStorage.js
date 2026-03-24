// ports/IFileStorage.js
// Интерфейс файлового хранилища (аудио и обложки)

'use strict';

class IFileStorage {

  // Сохранить аудиофайл, вернуть путь
  async saveAudio(trackId, fileBuffer, filename) {
    throw new Error('IFileStorage.saveAudio() не реализован');
  }

  // Сохранить обложку, вернуть путь
  async saveCover(trackId, fileBuffer, filename) {
    throw new Error('IFileStorage.saveCover() не реализован');
  }

  // Удалить файлы трека
  async deleteTrackFiles(trackId) {
    throw new Error('IFileStorage.deleteTrackFiles() не реализован');
  }

}

module.exports = IFileStorage;