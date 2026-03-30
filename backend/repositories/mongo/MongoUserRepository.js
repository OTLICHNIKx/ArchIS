// backend/repositories/mongo/MongoUserRepository.js
'use strict';

const IUserRepository = require('../../ports/IUserRepository');
const UserModel = require('../../models/User');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class MongoUserRepository extends IUserRepository {
  async findById(userId) {
    return await UserModel.findById(userId)
      .select('_id username avatar bio')
      .lean();
  }

  async findArtistCardById(artistId) {
    return await UserModel.findById(artistId)
      .select('_id username avatar bio')
      .lean();
  }

  async searchByUsername(query, limit = 10) {
    const safeQ = escapeRegex(query);

    return await UserModel.find({
      username: { $regex: safeQ, $options: 'i' }
    })
      .select('_id username avatar bio')
      .limit(limit)
      .lean();
  }
}

module.exports = MongoUserRepository;