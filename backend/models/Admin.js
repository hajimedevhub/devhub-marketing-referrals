const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  secretCode: {
    type: String,
    required: true
  },
  recoveryKeyHash: {
    type: String,
    required: true
  },
  recoveryKeyUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

adminSchema.pre('save', async function () {
  if (this.isModified('secretCode')) {
    this.secretCode = await bcrypt.hash(this.secretCode, 10);
  }
  if (this.isModified('recoveryKeyHash') && !this.recoveryKeyHash.startsWith('$2')) {
    this.recoveryKeyHash = await bcrypt.hash(this.recoveryKeyHash, 10);
  }
});

adminSchema.methods.compareSecret = function (candidate) {
  return bcrypt.compare(candidate, this.secretCode);
};

adminSchema.methods.compareRecoveryKey = function (candidate) {
  return bcrypt.compare(candidate, this.recoveryKeyHash);
};

module.exports = mongoose.model('Admin', adminSchema);

