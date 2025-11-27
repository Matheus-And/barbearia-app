const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: { type: String },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin', 'barber']
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('user', UserSchema);