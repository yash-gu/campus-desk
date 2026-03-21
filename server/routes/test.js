const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');

// Clear all bookings (for testing only)
router.delete('/clear-bookings', async (req, res) => {
  try {
    await Booking.deleteMany({});
    await Seat.updateMany({}, { status: 'emerald' });
    
    // Emit update to all clients
    const io = req.app.get('io');
    io.emit('seatUpdate', {
      action: 'clearAll',
      message: 'All bookings cleared'
    });
    
    res.json({ message: 'All bookings cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing bookings', error: error.message });
  }
});

// Test socket emission
router.post('/test-socket', async (req, res) => {
  try {
    const { seatId, status, zone } = req.body;
    
    // Update seat in database
    await Seat.findOneAndUpdate(
      { seatId },
      { status, lastUpdated: new Date() }
    );
    
    // Emit socket update
    const io = req.app.get('io');
    console.log('Test socket emission:', { seatId, status, zone });
    io.emit('seatUpdate', { seatId, status, zone });
    
    res.json({ message: 'Socket test sent', seatId, status, zone });
  } catch (error) {
    res.status(500).json({ message: 'Error testing socket', error: error.message });
  }
});

module.exports = router;
