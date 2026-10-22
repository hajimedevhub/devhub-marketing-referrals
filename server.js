const express = require('express');
const cookieParser = require('cookie-parser');
const { nanoid } = require('nanoid');
const path = require('path');
const { ObjectId } = require('mongodb');
const { connectDB, getDB } = require('./db');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_KEY = process.env.ADMIN_KEY || 'devhub-admin-secret';

/* ---------- Admin auth ---------- */
function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

/* ---------- Partners ---------- */
// List all partners with counts
app.get('/api/partners', requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const partners = await db.collection('partners')
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    // Counts per partner (simple aggregation)
    const leadCounts = await db.collection('leads').aggregate([
      { $group: { _id: '$partner_id', n: { $sum: 1 } } }
    ]).toArray();
    const clickCounts = await db.collection('clicks').aggregate([
      { $group: { _id: '$partner_id', n: { $sum: 1 } } }
    ]).toArray();

    const leadMap = Object.fromEntries(leadCounts.map(x => [String(x._id), x.n]));
    const clickMap = Object.fromEntries(clickCounts.map(x => [String(x._id), x.n]));

    res.json(partners.map(p => ({
      id: p._id.toString(),
      name: p.name,
      email: p.email || null,
      company: p.company || null,
      referral_code: p.referral_code,
      commission_rate: p.commission_rate,
      status: p.status,
      created_at: p.created_at,
      lead_count: leadMap[p._id.toString()] || 0,
      click_count: clickMap[p._id.toString()] || 0,
      referral_link: `${BASE_URL}/r/${p.referral_code}`
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// One partner + all their leads
app.get('/api/partners/:id', requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const partner = await db.collection('partners').findOne({ _id: new ObjectId(req.params.id) });
    if (!partner) return res.status(404).json({ error: 'Not found' });

    const leads = await db.collection('leads')
      .find({ partner_id: partner._id.toString() })
      .sort({ created_at: -1 })
      .toArray();

    const clicks = await db.collection('clicks').countDocuments({ partner_id: partner._id.toString() });

    res.json({
      id: partner._id.toString(),
      name: partner.name,
      email: partner.email || null,
      company: partner.company || null,
      referral_code: partner.referral_code,
      commission_rate: partner.commission_rate,
      status: partner.status,
      created_at: partner.created_at,
      referral_link: `${BASE_URL}/r/${partner.referral_code}`,
      clicks,
      leads: leads.map(l => ({
        id: l._id.toString(),
        name: l.name,
        email: l.email,
        phone: l.phone || null,
        project_type: l.project_type || null,
        budget: l.budget || null,
        message: l.message || null,
        status: l.status,
        created_at: l.created_at
      }))
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create partner → generates unique referral code
app.post('/api/partners', requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { name, email, company, commission_rate } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    // Generate unique code
    let code;
    for (let i = 0; i < 5; i++) {
      code = `DEV-${nanoid(8).toUpperCase()}`;
      const exists = await db.collection('partners').findOne({ referral_code: code });
      if (!exists) break;
    }

    const doc = {
      name,
      email: email || null,
      company: company || null,
      referral_code: code,
      commission_rate: parseFloat(commission_rate) || 10,
      status: 'active',
      created_at: new Date().toISOString()
    };
    const result = await db.collection('partners').insertOne(doc);

    res.json({
      id: result.insertedId.toString(),
      ...doc,
      referral_link: `${BASE_URL}/r/${code}`
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle partner status
app.patch('/api/partners/:id/status', requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await db.collection('partners').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status } }
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- Public referral route ---------- */
app.get('/r/:code', async (req, res) => {
  try {
    const db = getDB();
    const partner = await db.collection('partners').findOne({
      referral_code: req.params.code,
      status: 'active'
    });
    if (!partner) return res.status(404).send('Invalid or inactive referral link.');

    await db.collection('clicks').insertOne({
      partner_id: partner._id.toString(),
      ip: req.ip,
      user_agent: req.get('user-agent') || '',
      clicked_at: new Date().toISOString()
    });

    res.cookie('devhub_ref', partner.referral_code, {
      maxAge: 90 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax'
    });

    res.redirect('/form.html');
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

/* ---------- Lead submission ---------- */
app.post('/api/leads', async (req, res) => {
  try {
    const db = getDB();
    const ref = req.cookies.devhub_ref;
    if (!ref) return res.status(400).json({ error: 'No referral code found. Please use your partner link.' });

    const partner = await db.collection('partners').findOne({
      referral_code: ref,
      status: 'active'
    });
    if (!partner) return res.status(400).json({ error: 'Invalid referral.' });

    const { name, email, phone, project_type, budget, message } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

    const result = await db.collection('leads').insertOne({
      partner_id: partner._id.toString(),
      name,
      email,
      phone: phone || null,
      project_type: project_type || null,
      budget: budget || null,
      message: message || null,
      status: 'new',
      created_at: new Date().toISOString()
    });

    res.json({ ok: true, lead_id: result.insertedId.toString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- Admin page ---------- */
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

/* ---------- Boot ---------- */
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`DevHub referral system running on ${BASE_URL}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });