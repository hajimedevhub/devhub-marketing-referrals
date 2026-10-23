const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const Partner = require('../models/Partner');
const Client = require('../models/Client');
const authMiddleware = require('../middleware/auth');

// Get all partners (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    
    // Get client counts for each partner
    const partnersWithCounts = await Promise.all(
      partners.map(async (partner) => {
        const clientCount = await Client.countDocuments({ partner: partner._id });
        return { ...partner.toObject(), clientCount };
      })
    );
    
    res.json(partnersWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new partner (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, company, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ message: 'Partner with this email already exists' });
    }

    const referralCode = nanoid(10);

    const partner = new Partner({
      name,
      email,
      company,
      phone,
      referralCode
    });

    await partner.save();
    res.status(201).json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update partner (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, company, phone, status } = req.body;
    
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { name, email, company, phone, status },
      { new: true, runValidators: true }
    );

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete partner (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get partner by referral code (public - for referral form)
router.get('/referral/:code', async (req, res) => {
  try {
    const partner = await Partner.findOne({ 
      referralCode: req.params.code,
      status: 'active'
    });

    if (!partner) {
      return res.status(404).json({ message: 'Invalid or inactive referral link' });
    }

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