const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatId: {
    type: String,
    required: true,
    unique: true
  },
  zone: {
    type: String,
    required: true,
    enum: ['M-Block', 'Law', 'Central']
  },
  status: {
    type: String,
    required: true,
    enum: ['emerald', 'amber', 'rose', 'ghosted'],
    default: 'emerald'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  position: {
    row: Number,
    col: Number
  }
});

module.exports = mongoose.model('Seat', seatSchema);
