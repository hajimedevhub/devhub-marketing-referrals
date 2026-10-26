require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const partnerRoutes = require('./routes/partners');
const clientRoutes = require('./routes/clients');
const partnerAuthRoutes = require('./routes/partnerAuth');
const partnerClientRoutes = require('./routes/partnerClients');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/partner-auth', partnerAuthRoutes);
app.use('/api/partner-clients', partnerClientRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });