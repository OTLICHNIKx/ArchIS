// repositories/mongo/MongoTrackRepository.js
// Реализация ITrackRepository через MongoDB/Mongoose

'use strict';

const ITrackRepository = require('../../ports/ITrackRepository');
const TrackModel       = require('../../models/Track');

class MongoTrackRepository extends ITrackRepository {

  async create(trackData) {
    const track = await TrackModel.create(trackData);
    return track.toObject();
  }

  async findById(trackId) {
    const track = await TrackModel.findById(trackId)
      .populate('artistId', 'username avatar')
      .lean();
    return track;
  }

  async findByIdAndArtist(trackId, artistId) {
    const track = await TrackModel.findOne({
      _id:      trackId,
      artistId: artistId,
    }).lean();
    return track;
  }

  async findAllByArtist(artistId) {
    const tracks = await TrackModel.find({ artistId })
      .sort({ createdAt: -1 })
      .lean();
    return tracks;
  }

  async update(trackId, updateData) {
    const track = await TrackModel.findByIdAndUpdate(
      trackId,
      { $set: updateData },
      { new: true }          // вернуть обновлённый документ
    ).lean();
    return track;
  }

  async delete(trackId) {
    await TrackModel.findByIdAndDelete(trackId);
  }

}

module.exports = MongoTrackRepository;