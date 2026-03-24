// backend/domain/Repost.js
'use strict';

/**
 * Бизнес-правила для сущности Repost
 */
function validateRepost({ songId, userId }) {
  const errors = [];

  if (!songId || typeof songId !== 'string') {
    errors.push('songId обязателен');
  }
  if (!userId || typeof userId !== 'string') {
    errors.push('userId обязателен');
  }

  // Можно добавить другие правила позже (например, лимит репостов в день)

  return errors;
}

module.exports = {
  validateRepost
};
