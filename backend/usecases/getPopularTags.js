// usecases/getPopularTags.js
// Сценарий: Получить список популярных тегов
// GET /tags/popular

'use strict';

function makeGetPopularTags({ tagRepository }) {

  return async function getPopularTags(limit = 20) {
    const tags = await tagRepository.getPopular(limit);
    return tags;
  };
}

module.exports = makeGetPopularTags;