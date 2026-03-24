// usecases/createTrack.js
// Сценарий: Создать трек (метаданные)
// POST /artists/{artist_id}/tracks

'use strict';

const { validateTrackMetadata, TrackStatus } = require('../domain/Track');
const { validateTag }                        = require('../domain/Tag');

/**
 * @param {object} deps — зависимости (инжектируются снаружи)
 * @param {import('../ports/ITrackRepository')} deps.trackRepository
 * @param {import('../ports/ITagRepository')}   deps.tagRepository
 */
function makeCreateTrack({ trackRepository, tagRepository }) {

  return async function createTrack(artistId, data) {
    const { title, genre, tags = [], description, duration, isPublic } = data;

    // 1. Валидация метаданных (бизнес-правила из domain)
    const errors = validateTrackMetadata({ title, genre, tags, description, duration });
    if (errors.length > 0) {
      const err = new Error(errors.join(', '));
      err.status = 400;
      throw err;
    }

    // 2. Валидация каждого тега
    for (const tag of tags) {
      const tagErrors = validateTag(tag);
      if (tagErrors.length > 0) {
        const err = new Error(`Тег "${tag}": ${tagErrors.join(', ')}`);
        err.status = 400;
        throw err;
      }
    }

    // 3. Создаём трек со статусом DRAFT
    const track = await trackRepository.create({
      title,
      artistId,
      genre,
      tags,
      description,
      duration,
      isPublic,
      status: TrackStatus.DRAFT,
    });

    // 4. Увеличиваем счётчик использования тегов
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