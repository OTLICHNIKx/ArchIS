// backend/routes/tracks.js
// Роуты для работы с треками артиста
// ВСЕГДА вызываем handlers из adapters/http

const express = require('express');
const router = express.Router();

const {
  createTrack,
  uploadAudio,
  publishTrack,
  archiveTrack,
  deleteTrack,
  getArtistTracks,
  getTrack,
  updateTrackMetadata,
  getPopularTags,
} = require('../adapters/http/trackHandlers');

const { protect } = require('../middleware/auth');

// ==============================================
// ЭНДПОИНТЫ
// ==============================================

// 1. Создать трек (метаданные)
router.post('/artists/:artistId/tracks', protect, createTrack);

// 2. Загрузить аудиофайл к треку
router.post('/artists/:trackId/audio', protect, uploadAudio);

// 3. Опубликовать трек (отправить на обработку)
router.post('/artists/:trackId/publish', protect, publishTrack);

// 4. Архивировать (скрыть) трек
router.post('/artists/:trackId/archive', protect, archiveTrack);

// 5. Удалить трек
router.delete('/artists/tracks/:trackId', protect, deleteTrack);

// 6. Получить все треки артиста
router.get('/artists/tracks', protect, getArtistTracks);

// 7. Получить один трек артиста
router.get('/artists/tracks/:trackId', protect, getTrack);

// 8. Обновить метаданные трека
router.patch('/artists/tracks/:trackId', protect, updateTrackMetadata);

// 9. Получить популярные теги (публичный эндпоинт)
router.get('/tags/popular', getPopularTags);

module.exports = router;