const mongoose = require('mongoose');

const repostSchema = new mongoose.Schema({
  songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  originalArtistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalArtistName: { type: String, required: true, trim: true },

  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

repostSchema.index({ songId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Repost', repostSchema);