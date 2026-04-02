// repositories/mongo/MongoTagRepository.js

'use strict';

const ITagRepository = require('../../ports/ITagRepository');
const TagModel       = require('../../models/Tag');

class MongoTagRepository extends ITagRepository {

  async getPopular(limit = 20) {
    const tags = await TagModel.find()
      .sort({ usage: -1 })
      .limit(limit)
      .lean();
    return tags;
  }

  async incrementUsage(tags) {
    const ops = tags.map(tag => ({
      updateOne: {
        filter: { name: tag.toLowerCase() },
        update: { $inc: { usage: 1 } },
        upsert: true,   // создать если не существует
      },
    }));
    await TagModel.bulkWrite(ops);
  }

}

module.exports = MongoTagRepository;