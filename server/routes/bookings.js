const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check if student has active booking
router.get('/active', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      studentId: req.user.studentId, 
      status: 'active' 
    });
    
    res.json({ hasActiveBooking: !!booking, booking });
  } catch (error) {
    res.status(500).json({ message: 'Error checking active booking', error: error.message });
  }
});

// Check-in to a seat (strict single-seat validation)
router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const { seatId, qrCode } = req.body;
    
    // Check if student already has an active booking
    const existingBooking = await Booking.findOne({ 
      studentId: req.user.studentId, 
      status: 'active' 
    });
    
    if (existingBooking) {
      return res.status(400).json({ 
        message: `Access Denied: You are already seated at ${existingBooking.seatId}` 
      });
    }
    
    // Check if seat is available
    const seat = await Seat.findOne({ seatId });
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }
    
    if (seat.status !== 'emerald') {
      return res.status(400).json({ 
        message: `Seat ${seatId} is not available. Current status: ${seat.status}` 
      });
    }
    
    // Create new booking
    const booking = new Booking({
      studentId: req.user.studentId,
      seatId,
      zone: seat.zone,
      qrCode
    });
    
    await booking.save();
    
    // Update seat status
    seat.status = 'rose';
    seat.lastUpdated = new Date();
    await seat.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    console.log('Emitting seat update:', {
      seatId,
      status: 'rose',
      zone: seat.zone,
      studentId: req.user.studentId
    });
    io.emit('seatUpdate', {
      seatId,
      status: 'rose',
      zone: seat.zone,
      studentId: req.user.studentId
    });
    
    res.json({ message: 'Successfully checked in', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error checking in', error: error.message });
  }
});

// Check-out from a seat
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      studentId: req.user.studentId, 
      status: 'active' 
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'No active booking found' });
    }
    
    // Update booking status
    booking.status = 'checked-out';
    await booking.save();
    
    // Update seat status
    const seat = await Seat.findOne({ seatId: booking.seatId });
    if (seat) {
      seat.status = 'emerald';
      seat.lastUpdated = new Date();
      await seat.save();
      
      // Emit real-time update
      const io = req.app.get('io');
      console.log('Emitting seat update (checkout):', {
        seatId: booking.seatId,
        status: 'emerald',
        zone: booking.zone
      });
      io.emit('seatUpdate', {
        seatId: booking.seatId,
        status: 'emerald',
        zone: booking.zone
      });
    }
    
    res.json({ message: 'Successfully checked out' });
  } catch (error) {
    res.status(500).json({ message: 'Error checking out', error: error.message });
  }
});

// Re-check-in (pulse check for 90-minute validation)
router.post('/recheckin', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      studentId: req.user.studentId, 
      status: 'active' 
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'No active booking found' });
    }
    
    // Update last checked in time
    booking.lastCheckedIn = new Date();
    await booking.save();
    
    res.json({ message: 'Successfully re-checked in', nextCheckIn: new Date(Date.now() + 90 * 60 * 1000) });
  } catch (error) {
    res.status(500).json({ message: 'Error re-checking in', error: error.message });
  }
});

// Get all bookings (for librarians)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'librarian' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const bookings = await Booking.find({ status: 'active' })
      .populate('seatId')
      .sort({ checkInTime: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

module.exports = router;
