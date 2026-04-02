// usecases/createTrack.js
// Сценарий: Создать трек (метаданные)
// POST /artists/{artist_id}/tracks

'use strict';

const { validateTrackMetadata, TrackStatus } = require('../domain/Track');
const { validateTag }                        = require('../domain/Tag');

function makeCreateTrack({ trackRepository, tagRepository }) {

  return async function createTrack(artistId, data) {
    const { title, genre, tags = [], description, duration, isPublic } = data;

    const errors = validateTrackMetadata({ title, genre, tags, description, duration });
    if (errors.length > 0) {
      const err = new Error(errors.join(', '));
      err.status = 400;
      throw err;
    }

    for (const tag of tags) {
      const tagErrors = validateTag(tag);
      if (tagErrors.length > 0) {
        const err = new Error(`Тег "${tag}": ${tagErrors.join(', ')}`);
        err.status = 400;
        throw err;
      }
    }

    const track = await trackRepository.create({
      title,
      artistId,
      artistName: data.artistName || undefined,
      genre,
      tags,
      description,
      duration,
      isPublic,
      status: TrackStatus.DRAFT,
    });

    if (tags.length > 0) {
      await tagRepository.incrementUsage(tags);
    }

    return {
      track_id:   track._id,
      status:     track.status,
      created_at: track.createdAt,
    };
  };
}

module.exports = makeCreateTrack;