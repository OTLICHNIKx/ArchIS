const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  title:  { type: String, required: true },
  owner:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);