const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },          // хранить только хэш (bcrypt)
  avatar:    { type: String, default: null },
  bio:       { type: String, default: '' },
  location:  { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });   // createdAt / updatedAt автоматически

module.exports = mongoose.model('User', userSchema);