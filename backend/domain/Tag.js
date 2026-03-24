// domain/Tag.js
// Сущность тега

'use strict';

/* ─── Бизнес-правило: максимум тегов на трек ─── */
const MAX_TAGS_PER_TRACK = 20;

/* ─── Бизнес-правило: валидация тега ─── */
function validateTag(tag) {
  const errors = [];

  if (!tag || tag.trim().length === 0) {
    errors.push('Тег не может быть пустым');
  }
  if (tag && tag.length > 30) {
    errors.push('Тег не может быть длиннее 30 символов');
  }
  if (tag && !/^[a-zA-Zа-яА-Я0-9\-_]+$/.test(tag)) {
    errors.push('Тег может содержать только буквы, цифры, дефис и подчёркивание');
  }

  return errors;
}

module.exports = {
  MAX_TAGS_PER_TRACK,
  validateTag,
};