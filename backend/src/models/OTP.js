const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['registration', 'login', 'password_reset', 'verify_phone'],
    default: 'registration'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Auto-delete after 10 minutes (600 seconds)
  }
});

// Index for faster lookups
otpSchema.index({ email: 1, code: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  await this.save();
  return this.attempts;
};

module.exports = mongoose.model('OTP', otpSchema);