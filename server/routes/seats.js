const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

// Get all seats by zone
router.get('/:zone', async (req, res) => {
  try {
    const { zone } = req.params;
    const seats = await Seat.find({ zone }).sort({ 'position.row': 1, 'position.col': 1 });
    res.json(seats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seats', error: error.message });
  }
});

// Initialize seats for all zones
router.post('/initialize', async (req, res) => {
  try {
    // Clear existing seats
    await Seat.deleteMany({});
    
    const zones = [
      {
        name: 'M-Block',
        count: 1010,
        prefix: 'MB'
      },
      {
        name: 'Law',
        count: 205,
        prefix: 'LL'
      },
      {
        name: 'Central',
        count: 105,
        prefix: 'CL'
      }
    ];
    
    const seats = [];
    
    for (const zone of zones) {
      const cols = zone.name === 'M-Block' ? 20 : 15;
      const rows = Math.ceil(zone.count / cols);
      
      for (let i = 1; i <= zone.count; i++) {
        const row = Math.ceil(i / cols);
        const col = ((i - 1) % cols) + 1;
        
        seats.push({
          seatId: `${zone.prefix}-${String(i).padStart(4, '0')}`,
          zone: zone.name,
          status: 'emerald',
          position: { row, col }
        });
      }
    }
    
    await Seat.insertMany(seats);
    res.json({ message: 'Seats initialized successfully', totalSeats: seats.length });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing seats', error: error.message });
  }
});

// Get seat by ID
router.get('/seat/:seatId', async (req, res) => {
  try {
    const { seatId } = req.params;
    const seat = await Seat.findOne({ seatId });
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }
    res.json(seat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seat', error: error.message });
  }
});

module.exports = router;
