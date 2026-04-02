// ports/ITagRepository.js

'use strict';

class ITagRepository {

  async getPopular(limit) {
    throw new Error('ITagRepository.getPopular() не реализован');
  }

  async incrementUsage(tags) {
    throw new Error('ITagRepository.incrementUsage() не реализован');
  }

}

module.exports = ITagRepository;