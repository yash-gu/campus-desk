const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-desk', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Admin user data
const adminUser = {
  studentId: 'ADMIN',
  name: 'System Administrator',
  email: 'admin@campusdesk.com',
  password: 'PASS@123',
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Function to create/update admin user
async function createOrUpdateAdminUser() {
  try {
    // Check if admin user already exists
    const User = require('../models/User');
    const existingAdmin = await User.findOne({ studentId: 'ADMIN' });
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating password...');
      // Update existing admin user with new password
      const hashedPassword = await bcrypt.hash('PASS@123', 10);
      await User.updateOne(
        { studentId: 'ADMIN' },
        { 
          password: hashedPassword,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          updatedAt: new Date()
        }
      );
      console.log('Admin user password updated successfully');
    } else {
      console.log('Creating new admin user...');
      // Create new admin user
      const hashedPassword = await bcrypt.hash('PASS@123', 10);
      const newAdmin = new User({
        ...adminUser,
        password: hashedPassword
      });
      
      await newAdmin.save();
      console.log('Admin user created successfully');
    }
    
    console.log('Admin setup completed!');
    console.log('Credentials: ADMIN / PASS@123');
    
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
}

// Run the function
createOrUpdateAdminUser();
