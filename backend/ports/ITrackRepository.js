// ports/ITrackRepository.js
// Интерфейс репозитория треков
// Use cases зависят от этого интерфейса, а НЕ от конкретной реализации MongoDB

'use strict';

class ITrackRepository {

  // Создать трек
  async create(trackData) {
    throw new Error('ITrackRepository.create() не реализован');
  }

  // Найти трек по id
  async findById(trackId) {
    throw new Error('ITrackRepository.findById() не реализован');
  }

  // Найти трек по id и id артиста
  async findByIdAndArtist(trackId, artistId) {
    throw new Error('ITrackRepository.findByIdAndArtist() не реализован');
  }

  // Получить все треки артиста
  async findAllByArtist(artistId) {
    throw new Error('ITrackRepository.findAllByArtist() не реализован');
  }

  // Обновить трек
  async update(trackId, updateData) {
    throw new Error('ITrackRepository.update() не реализован');
  }

  // Удалить трек
  async delete(trackId) {
    throw new Error('ITrackRepository.delete() не реализован');
  }

}

module.exports = ITrackRepository;