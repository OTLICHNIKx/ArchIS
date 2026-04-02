// ports/IFileStorage.js

'use strict';

class IFileStorage {

  async saveAudio(trackId, fileBuffer, filename) {
    throw new Error('IFileStorage.saveAudio() не реализован');
  }

  async saveCover(trackId, fileBuffer, filename) {
    throw new Error('IFileStorage.saveCover() не реализован');
  }

  async deleteTrackFiles(trackId) {
    throw new Error('IFileStorage.deleteTrackFiles() не реализован');
  }
}

module.exports = IFileStorage;