'use strict';

const { TrackStatus } = require('../domain/Track');

function normalizeOwnTrack(track) {
  return {
    type: 'TRACK',
    feedId: `track-${track._id}`,
    id: String(track._id),
    title: track.title,
    artistName: track.artistName,
    audioUrl: track.audioUrl,
    coverUrl: track.coverUrl,
    duration: track.duration || 0,
    plays: track.plays || 0,
    repostCount: track.repostCount || 0,
    source: null,
    createdAt: track.createdAt,
  };
}

function normalizeRepost(repost) {
  const track = repost.songId;
  if (!track) return null;
  if (track.status !== TrackStatus.PUBLISHED || track.isPublic === false) return null;

  return {
    type: 'REPOST',
    feedId: `repost-${repost._id}`,
    id: String(track._id),
    title: track.title,
    artistName: track.artistName || repost.originalArtistName,
    audioUrl: track.audioUrl,
    coverUrl: track.coverUrl,
    duration: track.duration || 0,
    plays: track.plays || 0,
    repostCount: track.repostCount || 0,
    source: {
      artistId: repost.originalArtistId?._id || repost.originalArtistId,
      artistName: repost.originalArtistName,
      username: repost.originalArtistId?.username || repost.originalArtistName,
    },
    createdAt: repost.createdAt || repost.timestamp,
  };
}

function makeGetProfileFeed({ trackRepository, repostRepository }) {
  return async function getProfileFeed(userId) {
    const ownTracks = await trackRepository.findAllByArtist(userId);
    const reposts = await repostRepository.findAllByUser(userId);

    const ownItems = ownTracks.map(normalizeOwnTrack);
    const repostItems = reposts.map(normalizeRepost).filter(Boolean);

    return [...ownItems, ...repostItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };
}

module.exports = makeGetProfileFeed;