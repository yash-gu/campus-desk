const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true // Enforces single seat constraint
  },
  seatId: {
    type: String,
    required: true,
    ref: 'Seat'
  },
  zone: {
    type: String,
    required: true,
    enum: ['M-Block', 'Law', 'Central']
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  lastCheckedIn: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'ghosted', 'checked-out'],
    default: 'active'
  },
  qrCode: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
