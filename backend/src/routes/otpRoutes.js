const express = require('express');
const router = express.Router();
const {
  sendOTPCode,
  verifyOTP,
  resendOTP
} = require('../controllers/otpController');
const rateLimiter = require('../middleware/rateLimiter');

// Public routes with rate limiting
router.post('/send', rateLimiter(3, 60), sendOTPCode);
router.post('/verify', verifyOTP);
router.post('/resend', rateLimiter(2, 60), resendOTP);

module.exports = router;