const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const partnerAuth = require('../middleware/partnerAuth');

// Get my clients
router.get('/', partnerAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { partner: req.partner.partnerId };

    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one client detail (must belong to me)
router.get('/:id', partnerAuth, async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      partner: req.partner.partnerId
    });

    if (!client) return res.status(404).json({ message: 'Client not found' });

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update client status (must belong to me)
router.put('/:id/status', partnerAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'contacted', 'converted', 'lost'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, partner: req.partner.partnerId },
      { status },
      { new: true }
    );

    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;