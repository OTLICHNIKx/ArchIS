// ports/ITrackRepository.js

'use strict';

class ITrackRepository {

  async create(trackData) {
    throw new Error('ITrackRepository.create() не реализован');
  }

  async findById(trackId) {
    throw new Error('ITrackRepository.findById() не реализован');
  }

  async findByIdAndArtist(trackId, artistId) {
    throw new Error('ITrackRepository.findByIdAndArtist() не реализован');
  }

  async findAllByArtist(artistId) {
    throw new Error('ITrackRepository.findAllByArtist() не реализован');
  }

  async update(trackId, updateData) {
    throw new Error('ITrackRepository.update() не реализован');
  }

  async delete(trackId) {
    throw new Error('ITrackRepository.delete() не реализован');
  }

}

module.exports = ITrackRepository;