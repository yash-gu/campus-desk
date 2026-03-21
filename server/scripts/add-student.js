const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function addTestStudent() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/campus-desk', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if test student already exists
    const existingStudent = await User.findOne({ studentId: 'ST001' });

    if (existingStudent) {
      console.log('Test student ST001 already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('PASS@123', salt);

    // Create test student
    const testStudent = new User({
      studentId: 'ST001',
      name: 'Test Student',
      email: 'student@test.com',
      password: hashedPassword,
      role: 'student'
    });

    await testStudent.save();
    console.log('✅ Test student created successfully!');
    console.log('📋 Student ID: ST001');
    console.log('🔑 Password: PASS@123');
    console.log('👤 Name: Test Student');

  } catch (error) {
    console.error('❌ Error creating test student:', error);
  } finally {
    await mongoose.connection.close();
  }
}

addTestStudent();
