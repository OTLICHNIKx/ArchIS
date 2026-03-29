'use strict';

class IRepostRepository {
  async create(data) {
    throw new Error('IRepostRepository.create() не реализован');
  }

  async findByUserAndSong(userId, songId) {
    throw new Error('IRepostRepository.findByUserAndSong() не реализован');
  }

  async findAllByUser(userId) {
    throw new Error('IRepostRepository.findAllByUser() не реализован');
  }
}

module.exports = IRepostRepository;