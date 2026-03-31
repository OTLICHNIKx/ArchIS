// backend/routes/tracks.js
const express = require('express');
const router = express.Router();

const {
  createTrack,
  uploadAudio,
  uploadCover,
  publishTrack,
  archiveTrack,
  deleteTrack,
  getArtistTracks,
  getTrack,
  updateTrackMetadata,
  getPopularTags,
  getArtist,
  repostTrack,
  searchUsers,
  getProfileFeed
} = require('../adapters/http/trackHandlers');

const { protect } = require('../middleware/auth');

// === canonical REST routes for the report ===
router.post('/artists/:artistId/tracks', protect, createTrack);
router.get('/artists/:artistId/tracks', protect, getArtistTracks);
router.get('/artists/:artistId/tracks/:trackId', protect, getTrack);
router.patch('/artists/:artistId/tracks/:trackId', protect, updateTrackMetadata);
router.delete('/artists/:artistId/tracks/:trackId', protect, deleteTrack);

router.post('/artists/:artistId/tracks/:trackId/audio', uploadAudio);
router.post('/artists/:artistId/tracks/:trackId/cover', uploadCover);
router.post('/artists/:artistId/tracks/:trackId/publish', protect, publishTrack);
router.post('/artists/:artistId/tracks/:trackId/archive', protect, archiveTrack);

// public/supporting endpoints
router.get('/tags/popular', getPopularTags);
router.get('/artists/:artistId', getArtist);

router.get('/search/users', searchUsers);
router.post('/tracks/:trackId/repost', protect, repostTrack);
router.get('/profile/feed', protect, getProfileFeed);

module.exports = router;