const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  artist:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  audioUrl:    { type: String, required: true },     // путь к файлу
  coverUrl:    { type: String, default: null },
  genre:       { type: String, default: 'Other' },
  bpm:         { type: Number, default: null },
  tags:        [String],
  description: { type: String, default: '' },
  duration:    { type: Number, default: 0 },         // секунды
  plays:       { type: Number, default: 0 },
  likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublic:    { type: Boolean, default: true },
  allowDownload: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Track', trackSchema);