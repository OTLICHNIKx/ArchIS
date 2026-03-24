// backend/repositories/in_memory/InMemoryRepostRepository.js
'use strict';

const IRepostRepository = require('../../ports/IRepostRepository');

class InMemoryRepostRepository extends IRepostRepository {
  constructor() {
    super();
    this.reposts = new Map(); // ключ: `${userId}-${songId}`
  }

  async create(data) {
    const key = `${data.userId}-${data.songId}`;
    const repost = {
      _id: 'repost_' + Date.now().toString(36),
      ...data,
      timestamp: data.timestamp || new Date()
    };
    this.reposts.set(key, repost);
    return repost;
  }

  async findByUserAndSong(userId, songId) {
    const key = `${userId}-${songId}`;
    return this.reposts.get(key) || null;
  }
}

module.exports = InMemoryRepostRepository;