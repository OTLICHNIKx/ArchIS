// backend/middleware/upload.js
const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Более гибкая проверка — принимаем ВСЕ аудио-форматы
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Файл должен быть аудио (MP3, WAV, FLAC, AAC, OGG и другие аудиоформаты)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // до 500 МБ
});

module.exports = upload;