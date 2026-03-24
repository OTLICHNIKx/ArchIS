// adapters/http/trackHandlers.js
// HTTP-адаптеры — единственное место, где Express встречается с Use Cases

const container = require('../../infrastructure/services/container');
const uploadMiddleware = require('../../middleware/upload');
const { protect } = require('../../middleware/auth');

/* ====================== ПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================== */
const handleError = (res, error) => {
  const status = error.status || 500;
  const message = error.message || 'Ошибка сервера';
  res.status(status).json({ error: message });
};

/* ====================== ХЕНДЛЕРЫ ====================== */

// 1. Создать трек (метаданные) — POST /api/artists/:artistId/tracks
const createTrack = async (req, res) => {
  try {
    const artistId = req.user._id;           // из protect
    const data = req.body;

    const result = await container.createTrack(artistId, data);
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// 2. Загрузить аудиофайл — POST /api/artists/:trackId/audio
const uploadAudio = [
  protect,
  uploadMiddleware.single('audio'),   // поле в форме должно называться "audio"
  async (req, res) => {
    try {
      const artistId = req.user._id;
      const { trackId } = req.params;
      const fileBuffer = req.file.buffer;
      const originalFilename = req.file.originalname;

      const result = await container.uploadAudio(trackId, artistId, fileBuffer, originalFilename);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }
];

// 3. Опубликовать трек — POST /api/artists/:trackId/publish
const publishTrack = async (req, res) => {
  try {
    const artistId = req.user._id;
    const { trackId } = req.params;

    const result = await container.publishTrack(trackId, artistId);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// 4. Архивировать (скрыть) трек — POST /api/artists/:trackId/archive
const archiveTrack = async (req, res) => {
  try {
    const artistId = req.user._id;
    const { trackId } = req.params;

    const result = await container.archiveTrack(trackId, artistId);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// 5. Удалить трек — DELETE /api/artists/tracks/:trackId
const deleteTrack = async (req, res) => {
  try {
    const artistId = req.user._id;
    const { trackId } = req.params;

    const result = await container.deleteTrack(trackId, artistId);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// 6. Получить все треки артиста — GET /api/artists/tracks
const getArtistTracks = async (req, res) => {
  try {
    const artistId = req.user._id;
    const tracks = await container.getArtistTracks(artistId);
    res.json(tracks);
  } catch (error) {
    handleError(res, error);
  }
};

// 7. Получить один трек — GET /api/artists/tracks/:trackId
const getTrack = async (req, res) => {
  try {
    const artistId = req.user._id;
    const { trackId } = req.params;

    const track = await container.getTrack(trackId, artistId);
    res.json(track);
  } catch (error) {
    handleError(res, error);
  }
};

// 8. Обновить метаданные — PATCH /api/artists/tracks/:trackId
const updateTrackMetadata = async (req, res) => {
  try {
    const artistId = req.user._id;
    const { trackId } = req.params;
    const data = req.body;

    const result = await container.updateTrackMetadata(trackId, artistId, data);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// 9. Популярные теги (публичный) — GET /api/tags/popular
const getPopularTags = async (req, res) => {
  try {
    const tags = await container.getPopularTags(20);
    res.json(tags);
  } catch (error) {
    handleError(res, error);
  }
};

// ==================== НОВЫЕ ХЕНДЛЕРЫ ДЛЯ ВОРКФЛОУ ИЗ ПРАКТИКИ 1 ====================

// Получить карточку артиста + его публичные треки
const getArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const result = await container.getArtist(artistId);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// Репост трека в свой профиль
const RepostTrack = async (req, res) => {
  try {
    const userId = req.user._id;           // берётся из middleware protect
    const { trackId } = req.params;        // songId = trackId

    const result = await container.RepostTrack(trackId, userId);
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createTrack,
  uploadAudio,
  publishTrack,
  archiveTrack,
  deleteTrack,
  getArtistTracks,
  getTrack,
  updateTrackMetadata,
  getPopularTags,
  getArtist,
  RepostTrack
};