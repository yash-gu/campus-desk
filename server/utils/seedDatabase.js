const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Seat = require('../models/Seat');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-desk');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create demo accounts
    const demoUsers = [
      {
        studentId: 'ST001',
        name: 'John Student',
        email: 'student@campus.edu',
        password: 'password',
        role: 'student'
      },
      {
        studentId: 'LIB001',
        name: 'Jane Librarian',
        email: 'librarian@campus.edu',
        password: 'password',
        role: 'librarian'
      },
      {
        studentId: 'ADMIN001',
        name: 'Admin User',
        email: 'admin@campus.edu',
        password: 'password',
        role: 'admin'
      }
    ];

    for (const user of demoUsers) {
      const existingUser = await User.findOne({ studentId: user.studentId });
      if (!existingUser) {
        await User.create(user);
        console.log(`Created demo user: ${user.studentId} (${user.role})`);
      }
    }

    // Initialize seats if needed
    const seatCount = await Seat.countDocuments();
    if (seatCount === 0) {
      console.log('Initializing seats...');
      
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
      console.log(`Initialized ${seats.length} seats across ${zones.length} zones`);
    }

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
