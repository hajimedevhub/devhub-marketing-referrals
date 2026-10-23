const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  secretCode: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Mongoose 7+ style — no next() callback
adminSchema.pre('save', async function () {
  if (!this.isModified('secretCode')) return;
  this.secretCode = await bcrypt.hash(this.secretCode, 10);
});

adminSchema.methods.compareSecret = async function (candidateSecret) {
  return await bcrypt.compare(candidateSecret, this.secretCode);
};

module.exports = mongoose.model('Admin', adminSchema);