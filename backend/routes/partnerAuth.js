const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Partner = require('../models/Partner');
const partnerAuth = require('../middleware/partnerAuth');

// Partner login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const partner = await Partner.findOne({ email: email.toLowerCase().trim() });
    if (!partner) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (partner.status !== 'active') {
      return res.status(403).json({ message: 'Your account is inactive. Contact admin.' });
    }

    const isMatch = await partner.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { partnerId: partner._id, role: 'partner' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        company: partner.company,
        referralCode: partner.referralCode
      }
    });
  } catch (error) {
    console.error('❌ Partner login:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get current partner profile + stats
router.get('/me', partnerAuth, async (req, res) => {
  try {
    const partner = await Partner.findById(req.partner.partnerId).select('-password');
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    const Client = require('../models/Client');

    const total = await Client.countDocuments({ partner: partner._id });
    const newCount = await Client.countDocuments({ partner: partner._id, status: 'new' });
    const converted = await Client.countDocuments({ partner: partner._id, status: 'converted' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = await Client.countDocuments({
      partner: partner._id,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      partner,
      stats: { total, new: newCount, converted, recent }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;