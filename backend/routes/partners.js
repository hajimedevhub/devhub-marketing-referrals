const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const crypto = require('crypto');
const Partner = require('../models/Partner');
const Client = require('../models/Client');
const authMiddleware = require('../middleware/auth');

// Generate a readable password like "BlueTiger-4821"
function generatePassword() {
  const words = ['Blue', 'Tiger', 'Sun', 'River', 'Moon', 'Fox', 'Sky', 'Wolf', 'Oak', 'Fire'];
  const w = words[Math.floor(Math.random() * words.length)];
  const w2 = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${w}${w2}-${num}`;
}

// GET all partners (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    const partnersWithCounts = await Promise.all(
      partners.map(async (p) => {
        const clientCount = await Client.countDocuments({ partner: p._id });
        return { ...p.toObject(), password: undefined, clientCount };
      })
    );
    res.json(partnersWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE partner (admin) — returns plain password ONCE
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, company, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existing = await Partner.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Partner with this email already exists' });
    }

    const plainPassword = generatePassword();
    const referralCode = nanoid(10);

    const partner = new Partner({
      name, email, company, phone,
      password: plainPassword,
      referralCode
    });

    await partner.save();

    // ⚠️ Return plain password ONLY on creation — admin must copy & share it
    res.status(201).json({
      partner: { ...partner.toObject(), password: undefined },
      credentials: { email, password: plainPassword }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE partner (admin) — optionally reset password
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, company, phone, status, resetPassword } = req.body;

    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    if (name !== undefined) partner.name = name;
    if (email !== undefined) partner.email = email;
    if (company !== undefined) partner.company = company;
    if (phone !== undefined) partner.phone = phone;
    if (status !== undefined) partner.status = status;

    let newPassword = null;
    if (resetPassword) {
      newPassword = generatePassword();
      partner.password = newPassword;
    }

    await partner.save();

    res.json({
      partner: { ...partner.toObject(), password: undefined },
      credentials: newPassword ? { email: partner.email, password: newPassword } : undefined
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE partner (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUBLIC — get partner info by referral code
router.get('/referral/:code', async (req, res) => {
  try {
    const partner = await Partner.findOne({ referralCode: req.params.code, status: 'active' });
    if (!partner) return res.status(404).json({ message: 'Invalid or inactive referral link' });
    res.json({
      name: partner.name,
      company: partner.company,
      referralCode: partner.referralCode,
      partnerId: partner._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;