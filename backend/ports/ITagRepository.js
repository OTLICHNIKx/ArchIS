// ports/ITagRepository.js
// Интерфейс репозитория тегов

'use strict';

class ITagRepository {

  // Получить популярные теги
  async getPopular(limit) {
    throw new Error('ITagRepository.getPopular() не реализован');
  }

  // Увеличить счётчик использования теговs
  async incrementUsage(tags) {
    throw new Error('ITagRepository.incrementUsage() не реализован');
  }

}

module.exports = ITagRepository;