// backend/models/Track.js
const mongoose = require('mongoose');
const { TrackStatus } = require('../domain/Track');

const trackSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  artistId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artistName:   { type: String, default: null, trim: true },
  audioUrl:     { type: String, default: null },
  coverUrl:     { type: String, default: null },
  genre:        { type: String, required: true },
  tags:         { type: [String], default: [] },
  description:  { type: String, default: '' },
  duration:     { type: Number, default: 0 },
  isPublic:     { type: Boolean, default: true },
  plays:        { type: Number, default: 0 },
  status: {
    type:    String,
    enum:    Object.values(TrackStatus),
    default: TrackStatus.DRAFT,
  },
}, { timestamps: true });

module.exports = mongoose.model('Track', trackSchema);