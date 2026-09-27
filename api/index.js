const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io configuration for Vercel
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.VERCEL_URL 
      : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-desk')
.then(() => console.log('MongoDB connected to Campus Desk'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected to Campus Desk:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Ghosting Detection Cron Job (runs every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
  console.log('Running ghosting detection check...');
  try {
    const Booking = require('../server/models/Booking');
    const Seat = require('../server/models/Seat');
    
    // Find bookings that haven't been checked in for 90 minutes
    const ninetyMinutesAgo = new Date(Date.now() - 90 * 60 * 1000);
    
    const ghostedBookings = await Booking.find({
      status: 'active',
      lastCheckedIn: { $lt: ninetyMinutesAgo }
    });
    
    console.log(`Found ${ghostedBookings.length} ghosted bookings`);
    
    for (const booking of ghostedBookings) {
      // Update booking status to ghosted
      booking.status = 'ghosted';
      await booking.save();
      
      // Update seat status to ghosted
      await Seat.findOneAndUpdate(
        { seatId: booking.seatId },
        { status: 'ghosted', lastUpdated: new Date() }
      );
      
      // Emit real-time update
      io.emit('seatUpdate', {
        seatId: booking.seatId,
        status: 'ghosted',
        zone: booking.zone,
        studentId: booking.studentId
      });
    }
    
    if (ghostedBookings.length > 0) {
      console.log(`Ghosted ${ghostedBookings.length} seats and emitted updates`);
    }
  } catch (error) {
    console.error('Error in ghosting detection:', error);
  }
});

// Routes
const seatRoutes = require('../server/routes/seats');
const bookingRoutes = require('../server/routes/bookings');
const userRoutes = require('../server/routes/users');
const testRoutes = require('../server/routes/test');

// Mount routes
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/test', testRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = (req, res) => {
  app(req, res);
};

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`Campus Desk server running on port ${PORT}`);
  });
}
