// middleware/upload.js
const multer = require('multer');

// Используем memoryStorage — файл хранится в памяти (buffer)
// Это нужно, чтобы передать fileBuffer в use case
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 МБ
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|flac|aac|ogg/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Только аудио файлы: MP3, WAV, FLAC, AAC, OGG'));
  }
});

module.exports = upload;