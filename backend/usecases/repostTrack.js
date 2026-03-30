'use strict';

const { validateRepost } = require('../domain/Repost');
const { TrackStatus } = require('../domain/Track');

function extractArtistId(track) {
  if (!track) return null;
  if (track.artistId && typeof track.artistId === 'object' && track.artistId._id) {
    return String(track.artistId._id);
  }
  return track.artistId ? String(track.artistId) : null;
}

function extractArtistName(track) {
  if (!track) return 'Unknown artist';
  if (track.artistName && track.artistName.trim()) return track.artistName;
  return 'Unknown artist';
}

function makeRepostTrack({ trackRepository, repostRepository, notificationService }) {
  return async function repostTrack(songId, userId) {
    const track = await trackRepository.findById(songId);
    if (!track) {
      const err = new Error('Трек не найден');
      err.status = 404;
      throw err;
    }

    if (track.status !== TrackStatus.PUBLISHED || track.isPublic === false) {
      const err = new Error('Репост возможен только для публичного опубликованного трека');
      err.status = 403;
      throw err;
    }

    const originalArtistId = extractArtistId(track);
    const originalArtistName = extractArtistName(track);

    if (String(originalArtistId) === String(userId)) {
      const err = new Error('Нельзя репостнуть собственный трек');
      err.status = 400;
      throw err;
    }

    const existingRepost = await repostRepository.findByUserAndSong(userId, songId);
    if (existingRepost) {
      const err = new Error('Вы уже репостнули этот трек');
      err.status = 400;
      throw err;
    }

    const errors = validateRepost({ songId, userId });
    if (errors.length > 0) {
      const err = new Error(errors.join(', '));
      err.status = 400;
      throw err;
    }

    const repost = await repostRepository.create({
      songId,
      userId,
      originalArtistId,
      originalArtistName,
      timestamp: new Date(),
    });

    const newRepostCount = (track.repostCount || 0) + 1;
    await trackRepository.update(songId, { repostCount: newRepostCount });

    if (notificationService) {
      await notificationService.sendRepostNotification(userId, track).catch(console.error);
    }

    return {
      id: repost._id || repost.id,
      type: 'REPOST',
      originalTrackId: String(track._id || songId),
      title: track.title,
      audioUrl: track.audioUrl,
      coverUrl: track.coverUrl,
      duration: track.duration || 0,
      plays: track.plays || 0,
      repostCount: newRepostCount,
      artistName: originalArtistName,
      source: {
        artistId: String(originalArtistId),
        artistName: originalArtistName,
      },
      createdAt: repost.createdAt || repost.timestamp || new Date().toISOString(),
    };
  };
}

module.exports = makeRepostTrack;