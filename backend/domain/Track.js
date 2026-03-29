// domain/Track.js
// Сущность трека — чистая бизнес-логика, без зависимостей от БД или фреймворков

'use strict';

/* ─── Допустимые статусы трека ─── */
const TrackStatus = {
  DRAFT:      'DRAFT',       // метаданные созданы, аудио не загружено
  PROCESSING: 'PROCESSING',  // аудио загружено, обрабатывается
  PUBLISHED:  'PUBLISHED',   // трек опубликован
  FAILED:     'FAILED',      // ошибка обработки аудио
  ARCHIVED:   'ARCHIVED',    // трек скрыт артистом
};

/* ─── Допустимые жанры ─── */
const ALLOWED_GENRES = [
  'Electronic', 'House', 'Techno', 'Ambient',
  'Hip-Hop', 'Lo-Fi', 'Pop', 'Rock', 'Jazz', 'Other',
];

/* ─── Бизнес-правила валидации метаданных ─── */
function validateTrackMetadata({ title, genre, tags, description, duration }) {
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Название трека обязательно');
  }
  if (title && title.length > 100) {
    errors.push('Название не может быть длиннее 100 символов');
  }
  if (!genre) {
    errors.push('Жанр обязателен');
  }
  if (genre && genre.length > 50) {
    errors.push('Жанр не может быть длиннее 50 символов');
  }
  if (tags && tags.length > 20) {
    errors.push('Максимум 20 тегов');
  }
  if (description && description.length > 1000) {
    errors.push('Описание не может быть длиннее 1000 символов');
  }

  // Длительность больше НЕ обязательна при создании метаданных
  // (будет заполнена позже при загрузке аудио или оставлена 0)
  if (duration !== undefined && duration !== null && duration < 0) {
     errors.push('Длительность не может быть отрицательной');
  }

  return errors;
}

/* ─── Бизнес-правило: можно ли публиковать трек ─── */
function canPublish(track) {
  return track.status === TrackStatus.PROCESSING ||
         track.status === TrackStatus.DRAFT;
}

/* ─── Бизнес-правило: можно ли архивировать трек ─── */
function canArchive(track) {
  return track.status === TrackStatus.PUBLISHED;
}

/* ─── Бизнес-правило: можно ли удалить трек ─── */
function canDelete(track) {
  return track.status !== TrackStatus.PROCESSING;
}

module.exports = {
  TrackStatus,
  ALLOWED_GENRES,
  validateTrackMetadata,
  canPublish,
  canArchive,
  canDelete,
};