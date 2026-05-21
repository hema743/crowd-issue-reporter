const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// ─── REGISTER ───────────────────────────────
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check all fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all fields',
      });
    }

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user
    const user = await User.create({ name, email, password });
    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ─── LOGIN ──────────────────────────────────
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter email and password',
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    const token = signToken(user.id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ─── GET CURRENT USER ───────────────────────
// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// ─── UPDATE PROFILE ─────────────────────────
// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await req.user.update({ name, phone });
    res.json({
      success: true,
      message: 'Profile updated!',
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;