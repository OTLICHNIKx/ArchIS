// backend/routes/tracks.js
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

// === ЭНДПОИНТЫ ===
router.post('/artists/:artistId/tracks', protect, createTrack);          // 1. Создать метаданные
router.post('/artists/:trackId/audio', uploadAudio);                     // 2. Загрузить аудио
router.post('/artists/:trackId/publish', protect, publishTrack);         // 3. Опубликовать
router.post('/artists/:trackId/archive', protect, archiveTrack);         // 4. Архивировать
router.delete('/artists/tracks/:trackId', protect, deleteTrack);         // 5. Удалить
router.get('/artists/tracks', protect, getArtistTracks);                 // 6. Все треки артиста
router.get('/artists/tracks/:trackId', protect, getTrack);               // 7. Один трек
router.patch('/artists/tracks/:trackId', protect, updateTrackMetadata);  // 8. Обновить метаданные
router.get('/tags/popular', getPopularTags);                             // 9. Популярные теги

module.exports = router;