// backend/domain/Repost.js
'use strict';

function validateRepost({ songId, userId }) {
  const errors = [];
  if (!songId) errors.push('songId обязателен');
  if (!userId) errors.push('userId обязателен');
  return errors;
}

module.exports = {
  validateRepost
};
