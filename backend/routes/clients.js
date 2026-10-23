const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Partner = require('../models/Partner');
const authMiddleware = require('../middleware/auth');

// Submit client form (public - through referral link)
router.post('/submit/:code', async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email and phone are required' });
    }

    const partner = await Partner.findOne({ 
      referralCode: req.params.code,
      status: 'active'
    });

    if (!partner) {
      return res.status(404).json({ message: 'Invalid referral link' });
    }

    const client = new Client({
      name,
      email,
      phone,
      company,
      message,
      partner: partner._id,
      partnerName: partner.name,
      referralCode: partner.referralCode
    });

    await client.save();
    res.status(201).json({ 
      message: 'Thank you! Your information has been submitted successfully.',
      client: {
        name: client.name,
        email: client.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all clients (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { partnerId, status } = req.query;
    let query = {};
    
    if (partnerId) query.partner = partnerId;
    if (status) query.status = status;

    const clients = await Client.find(query)
      .populate('partner', 'name email company')
      .sort({ createdAt: -1 });

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get clients by partner (admin only)
router.get('/partner/:partnerId', authMiddleware, async (req, res) => {
  try {
    const clients = await Client.find({ partner: req.params.partnerId })
      .sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update client status (admin only)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'contacted', 'converted', 'lost'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('partner', 'name email company');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats (admin only)
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const totalPartners = await Partner.countDocuments();
    const newClients = await Client.countDocuments({ status: 'new' });
    const convertedClients = await Client.countDocuments({ status: 'converted' });

    // Clients per partner
    const clientsPerPartner = await Client.aggregate([
      {
        $group: {
          _id: '$partner',
          partnerName: { $first: '$partnerName' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Clients last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentClients = await Client.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      totalClients,
      totalPartners,
      newClients,
      convertedClients,
      recentClients,
      clientsPerPartner
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;