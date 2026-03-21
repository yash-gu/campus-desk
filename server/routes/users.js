const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { studentId, name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ studentId }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this student ID or email already exists' 
      });
    }
    
    // Prevent multiple admin users
    if (role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount > 0) {
        return res.status(400).json({ 
          message: 'Admin user already exists. Only one admin account is allowed.' 
        });
      }
    }
    
    // Create new user
    const user = new User({
      studentId,
      name,
      email,
      password,
      role: role || 'student'
    });
    
    await user.save();
    
    // Generate JWT token with role
    const token = jwt.sign(
      { studentId: user.studentId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { studentId, password, role } = req.body;
    
    console.log('Login request received:', { studentId, password, role });
    
    // Find user by student ID
    const user = await User.findOne({ studentId });
    if (!user) {
      console.log('User not found for studentId:', studentId);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', studentId);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found and password matches:', { studentId: user.studentId, role: user.role });
    
    // Generate JWT token
    const token = jwt.sign(
      { studentId: user.studentId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Generated token for user:', { studentId: user.studentId, role: user.role });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Test endpoint without authentication
router.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Test endpoint working', timestamp: new Date() });
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ studentId: decoded.studentId }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

module.exports = router;
