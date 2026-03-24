// backend/models/Tag.js
const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name:  { type: String, required: true, unique: true, lowercase: true, trim: true },
  usage: { type: Number, default: 0 },  // счётчик использования
}, { timestamps: true });

module.exports = mongoose.model('Tag', tagSchema);