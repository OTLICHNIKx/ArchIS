// backend/ports/IRepostRepository.js
'use strict';

class IRepostRepository {

  /**
   * Создать новый репост
   * @param {Object} data - { songId, userId }
   * @returns {Promise<Object>}
   */
  async create(data) {
    throw new Error('IRepostRepository.create() не реализован');
  }

  /**
   * Найти репост по пользователю и песне (для проверки дубликата)
   * @param {string} userId
   * @param {string} songId
   * @returns {Promise<Object|null>}
   */
  async findByUserAndSong(userId, songId) {
    throw new Error('IRepostRepository.findByUserAndSong() не реализован');
  }
}

module.exports = IRepostRepository;