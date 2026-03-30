'use strict';

const IRepostRepository = require('../../ports/IRepostRepository');
const RepostModel = require('../../models/Repost');

class MongoRepostRepository extends IRepostRepository {
  async create(data) {
    const repost = await RepostModel.create({
      songId: data.songId,
      userId: data.userId,
      originalArtistId: data.originalArtistId,
      originalArtistName: data.originalArtistName,
      timestamp: data.timestamp || new Date(),
    });

    return repost.toObject();
  }

  async findByUserAndSong(userId, songId) {
    return await RepostModel.findOne({
      userId,
      songId,
    }).lean();
  }

   async findAllByUser(userId) {
     return await RepostModel.find({ userId })
       .sort({ createdAt: -1 })
       .populate({
         path: 'songId',
         select: 'title artistId artistName audioUrl coverUrl duration plays repostCount status isPublic'
       })
       .populate({
         path: 'originalArtistId',
         select: 'username'
       })
       .lean();
   }
}

module.exports = MongoRepostRepository;