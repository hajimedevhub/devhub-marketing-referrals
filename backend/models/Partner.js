const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  company: { type: String, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true },   // NEW
  referralCode: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// Hash password on create/update
partnerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

partnerSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Partner', partnerSchema);