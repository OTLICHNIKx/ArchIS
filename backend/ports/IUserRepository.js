// backend/ports/IUserRepository.js
'use strict';

class IUserRepository {
  async findById(userId) {
    throw new Error('IUserRepository.findById() не реализован');
  }

  async findArtistCardById(artistId) {
    throw new Error('IUserRepository.findArtistCardById() не реализован');
  }

  async searchByUsername(query, limit = 10) {
    throw new Error('IUserRepository.searchByUsername() не реализован');
  }
}

module.exports = IUserRepository;