// repositories/mongo/MongoRepostRepository.js

'use strict';

const IRepostRepository = require('../../ports/IRepostRepository');
const RepostModel       = require('../../models/Repost');

class MongoRepostRepository extends IRepostRepository {

  async create(data) {
    const repost = await RepostModel.create({
      songId:    data.songId,
      userId:    data.userId,
      timestamp: data.timestamp || new Date(),
    });
    return repost.toObject();
  }

  async findByUserAndSong(userId, songId) {
    const repost = await RepostModel.findOne({
      userId: userId,
      songId: songId,
    }).lean();
    return repost;  // null если не найдено
  }

}

module.exports = MongoRepostRepository;