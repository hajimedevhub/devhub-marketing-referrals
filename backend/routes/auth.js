const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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

    // Generate one-time recovery key
    const recoveryKey = crypto.randomBytes(16).toString('hex'); // 32-char hex

    const admin = new Admin({ 
      secretCode, 
      recoveryKeyHash: recoveryKey 
    });
    await admin.save();

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // ⚠️ Return recovery key ONCE — never stored in plaintext
    res.status(201).json({ 
      token, 
      message: 'Admin created. SAVE YOUR RECOVERY KEY — it is shown only once.',
      recoveryKey 
    });
  } catch (error) {
    console.error('❌ Setup failed:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/recover', async (req, res) => {
  try {
    const { recoveryKey, newSecretCode } = req.body;

    if (!recoveryKey || !newSecretCode || newSecretCode.length < 6) {
      return res.status(400).json({ 
        message: 'Recovery key and new secret code (min 6 chars) required' 
      });
    }

    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ message: 'No admin found' });
    }

    if (admin.recoveryKeyUsed) {
      return res.status(400).json({ 
        message: 'Recovery key already used. Use CLI reset instead.' 
      });
    }

    const isValid = await admin.compareRecoveryKey(recoveryKey);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid recovery key' });
    }

    // Update secret code, invalidate recovery key
    admin.secretCode = newSecretCode;
    admin.recoveryKeyUsed = true;
    await admin.save();

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token, message: 'Secret code reset successfully' });
  } catch (error) {
    console.error('❌ Recover failed:', error);
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