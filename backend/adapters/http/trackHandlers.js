// backend/adapters/http/trackHandlers.js
const container = require('../../infrastructure/container');
const uploadMiddleware = require('../../middleware/upload');
const { protect } = require('../../middleware/auth');

const handleError = (res, error) => {
  const status = error.status || 500;
  const message = error.message || 'Ошибка сервера';
  res.status(status).json({ error: message });
};

const idsEqual = (a, b) => String(a) === String(b);

const requireOwnedArtist = (req, res) => {
  const artistId = req.params.artistId || req.user?._id;

  if (!artistId || !req.user || !idsEqual(artistId, req.user._id)) {
    res.status(403).json({ error: 'Access denied' });
    return null;
  }

  return artistId;
};

const toRestRepostResponse = (dto, currentUser) => ({
  id: dto.id,
  type: 'REPOST',
  originalTrackId: dto.song.id,
  title: dto.song.title,
  audioUrl: dto.meta.audioUrl,
  coverUrl: dto.meta.coverUrl,
  duration: dto.meta.duration,
  plays: dto.meta.plays,
  repostCount: dto.song.repostCount,
  artistName: dto.meta.originalArtistName,
  source: {
    artistId: dto.meta.originalArtistId,
    artistName: dto.meta.originalArtistName,
  },
  createdAt: dto.timestamp,
  reposter: {
    id: String(currentUser._id),
    username: currentUser.username,
  }
});

const createTrack = async (req, res) => {
  try {
    const artistId = requireOwnedArtist(req, res);
    if (!artistId) return;

    const result = await container.createTrack(artistId, req.body);
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const uploadAudio = [
  protect,
  uploadMiddleware.single('audio'),
  async (req, res) => {
    try {
      const artistId = requireOwnedArtist(req, res);
      if (!artistId) return;

      const { trackId } = req.params;
      const result = await container.uploadAudio(
        trackId,
        artistId,
        req.file.buffer,
        req.file.originalname
      );

      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }
];

const publishTrack = async (req, res) => {
  try {
    const artistId = requireOwnedArtist(req, res);
    if (!artistId) return;

    const { trackId } = req.params;
    const result = await container.publishTrack(trackId, artistId);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const archiveTrack = async (req, res) => {
  try {
    const artistId = requireOwnedArtist(req, res);
    if (!artistId) return;

    const { trackId } = req.params;
    const result = await container.archiveTrack(trackId, artistId);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const deleteTrack = async (req, res) => {
  try {
    const artistId = requireOwnedArtist(req, res);
    if (!artistId) return;

    const { trackId } = req.params;
    const result = await container.deleteTrack(trackId, artistId);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const getArtistTracks = async (req, res) => {
  try {
    const artistId = requireOwnedArtist(req, res);
    if (!artistId) return;

    const tracks = await container.getArtistTracks(artistId);
    res.json(tracks);
  } catch (error) {
    handleError(res, error);
  }
};

const getTrack = async (req, res) => {
  try {
    const artistId = requireOwnedArtist(req, res);
    if (!artistId) return;

    const { trackId } = req.params;
    const track = await container.getTrack(trackId, artistId);
    res.json(track);
  } catch (error) {
    handleError(res, error);
  }
};

const updateTrackMetadata = async (req, res) => {
  try {
    const artistId = requireOwnedArtist(req, res);
    if (!artistId) return;

    const { trackId } = req.params;
    const result = await container.updateTrackMetadata(trackId, artistId, req.body);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const getPopularTags = async (req, res) => {
  try {
    const tags = await container.getPopularTags(20);
    res.json(tags);
  } catch (error) {
    handleError(res, error);
  }
};

const getArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const result = await container.getArtist(artistId);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const RepostTrack = async (req, res) => {
  try {
    const userId = req.user._id;
    const { trackId } = req.params;

    const dto = await container.RepostTrack(trackId, userId);
    res.status(201).json(toRestRepostResponse(dto, req.user));
  } catch (error) {
    handleError(res, error);
  }
};

const uploadCover = [
  protect,
  uploadMiddleware.single('cover'),
  async (req, res) => {
    try {
      const artistId = requireOwnedArtist(req, res);
      if (!artistId) return;

      const { trackId } = req.params;
      const result = await container.uploadCover(
        trackId,
        artistId,
        req.file.buffer,
        req.file.originalname
      );

      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }
];

const searchUsers = async (req, res) => {
  try {
    const q = req.query.q;
    const result = await container.searchUsers(q);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const getProfileFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await container.getProfileFeed(userId);
    res.json(result);
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
  RepostTrack,
  uploadCover,
  searchUsers,
  getProfileFeed,
};