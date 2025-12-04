// backend/models/Appointment.js
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  barber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('appointment', AppointmentSchema);