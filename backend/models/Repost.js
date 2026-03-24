// backend/models/Repost.js
const mongoose = require('mongoose');

const repostSchema = new mongoose.Schema({
  songId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

// Уникальный индекс — один пользователь не может репостнуть одну песню дважды
repostSchema.index({ songId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Repost', repostSchema);