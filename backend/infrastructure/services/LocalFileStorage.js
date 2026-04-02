// infrastructure/services/LocalFileStorage.js

'use strict';

const fs   = require('fs');
const path = require('path');
const IFileStorage = require('../../ports/IFileStorage');

class LocalFileStorage extends IFileStorage {

  constructor() {
    super();
    this.audioDir = path.join(__dirname, '../../uploads/audio');
    this.coverDir = path.join(__dirname, '../../uploads/covers');
    // Создаём папки если не существуют
    fs.mkdirSync(this.audioDir, { recursive: true });
    fs.mkdirSync(this.coverDir, { recursive: true });
  }

  async saveAudio(trackId, fileBuffer, filename) {
    const ext      = path.extname(filename);
    const filePath = path.join(this.audioDir, `${trackId}${ext}`);
    fs.writeFileSync(filePath, fileBuffer);
    return `/uploads/audio/${trackId}${ext}`;
  }

  async saveCover(trackId, fileBuffer, filename) {
    const ext      = path.extname(filename);
    const filePath = path.join(this.coverDir, `${trackId}${ext}`);
    fs.writeFileSync(filePath, fileBuffer);
    return `/uploads/covers/${trackId}${ext}`;
  }

  async deleteTrackFiles(trackId) {
    // Удаляем все файлы трека если они есть
    const extensions = ['.mp3', '.wav', '.flac', '.jpg', '.png'];
    for (const ext of extensions) {
      const audioPath = path.join(this.audioDir, `${trackId}${ext}`);
      const coverPath = path.join(this.coverDir, `${trackId}${ext}`);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }
  }
}

module.exports = LocalFileStorage;