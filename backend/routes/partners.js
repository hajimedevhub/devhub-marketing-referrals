const express = require('express');
const router = express.Router();
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

// Generate a URL-safe referral code (replaces nanoid — no dependency issues)
function generateReferralCode() {
  return crypto.randomBytes(6).toString('hex').slice(0, 10);
}

// Build a safe partner payload (strip password) — no spread on Mongoose docs
function toSafePartner(partner, extra = {}) {
  const obj = partner.toObject({ getters: false, virtuals: false });
  delete obj.password;
  return { ...obj, ...extra };
}

// GET all partners (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    const result = await Promise.all(
      partners.map(async (p) => {
        const clientCount = await Client.countDocuments({ partner: p._id });
        return toSafePartner(p, { clientCount });
      })
    );
    res.json(result);
  } catch (error) {
    console.error('❌ GET partners:', error);
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

    const existing = await Partner.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'Partner with this email already exists' });
    }

    const plainPassword = generatePassword();
    const referralCode = generateReferralCode();

    const partner = new Partner({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      company: company?.trim() || '',
      phone: phone?.trim() || '',
      password: plainPassword,
      referralCode
    });

    await partner.save();

    // Use safe builder — no spread on Mongoose doc, no undefined fields
    res.status(201).json({
      partner: toSafePartner(partner),
      credentials: { email: partner.email, password: plainPassword }
    });
  } catch (error) {
    console.error('❌ CREATE partner:', error);
    res.status(500).json({ message: error.message || 'Failed to create partner' });
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
      partner: toSafePartner(partner),
      credentials: newPassword ? { email: partner.email, password: newPassword } : null
    });
  } catch (error) {
    console.error('❌ UPDATE partner:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE partner (admin) — permanent removal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Count affected clients BEFORE deletion
    const clientCount = await Client.countDocuments({ partner: partner._id });

    // Detach clients from partner (keep their data + partnerName for history)
    if (clientCount > 0) {
      await Client.updateMany(
        { partner: partner._id },
        {
          $set: {
            partner: null,
            partnerName: `${partner.name} (deleted)`,
            status: 'lost'  // optional: mark orphaned clients as 'lost'
          }
        }
      );
    }

    // Delete the partner
    await Partner.findByIdAndDelete(partner._id);

    res.json({
      message: 'Partner deleted successfully',
      deletedPartner: { name: partner.name, email: partner.email },
      orphanedClients: clientCount
    });
  } catch (error) {
    console.error('❌ DELETE partner:', error);
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
    console.error('❌ GET referral:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;