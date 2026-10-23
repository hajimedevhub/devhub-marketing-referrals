const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Setup admin (only works if no admin exists)
router.post('/setup', async (req, res) => {
  try {
    const { secretCode } = req.body;
    
    if (!secretCode || secretCode.length < 6) {
      return res.status(400).json({ message: 'Secret code must be at least 6 characters' });
    }

    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists. Use login.' });
    }

    const admin = new Admin({ secretCode });
    await admin.save();

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({ token, message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if admin exists
router.get('/check', async (req, res) => {
  try {
    const admin = await Admin.findOne();
    res.json({ exists: !!admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login with secret code
router.post('/login', async (req, res) => {
  try {
    const { secretCode } = req.body;
    
    if (!secretCode) {
      return res.status(400).json({ message: 'Secret code is required' });
    }

    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ message: 'No admin found. Please setup first.' });
    }

    const isMatch = await admin.compareSecret(secretCode);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid secret code' });
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;