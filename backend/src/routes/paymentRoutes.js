const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  telebirrWebhook
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Public webhook (no auth - but should verify signature in production)
router.post('/webhook/telebirr', telebirrWebhook);

// Protected routes
router.post('/initiate', protect, initiatePayment);
router.get('/verify/:paymentId', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/:paymentId', protect, getPaymentDetails);

module.exports = router;