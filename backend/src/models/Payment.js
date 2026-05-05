const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['telebirr', 'cbebirr', 'cash'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Telebirr specific fields
  telebirr: {
    phoneNumber: String,
    receiptNumber: String,
    merchantId: String
  },
  // CBEBirr specific fields
  cbebirr: {
    phoneNumber: String,
    receiptNumber: String,
    merchantId: String
  },
  paymentResponse: {
    type: Object,
    default: {}
  },
  paymentDate: {
    type: Date
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique transaction ID
paymentSchema.pre('save', async function() {
  this.updatedAt = Date.now();
  if (!this.transactionId) {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.transactionId = `TXN-${timestamp}-${random}`;
  }
});

module.exports = mongoose.model('Payment', paymentSchema);