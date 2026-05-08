const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  changePassword,
  verifyEmailWithOTP,
  resendVerificationOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmailWithOTP);
router.post('/resend-verification', resendVerificationOTP);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);
router.put('/change-password', protect, changePassword);

module.exports = router;