const OTP = require('../models/OTP');
const { sendOTP } = require('../services/otpService');
const { generateOTP } = require('../utils/otpGenerator');

// @desc    Send OTP to email
// @route   POST /api/otp/send
// @access  Public
const sendOTPCode = async (req, res) => {
  try {
    const { email, purpose = 'registration' } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }
    
    // Check if there's a recent unused OTP
    const existingOTP = await OTP.findOne({
      email: email.toLowerCase(),
      purpose: purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (existingOTP) {
      return res.status(400).json({
        success: false,
        message: 'An active OTP already exists. Please wait for it to expire or request a new one after 10 minutes.',
        expiresAt: existingOTP.expiresAt
      });
    }
    
    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Save OTP to database
    const otpRecord = await OTP.create({
      email: email.toLowerCase(),
      code: otpCode,
      purpose: purpose,
      expiresAt: expiresAt
    });
    
    // Send OTP via email
    const emailSent = await sendOTP(email, otpCode, purpose);
    
    if (!emailSent.success) {
      await otpRecord.deleteOne(); // Delete record if email failed
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
        error: emailSent.error
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: '10 minutes',
      // In development, show OTP for testing (remove in production)
      ...(process.env.NODE_ENV === 'development' && { debug_otp: otpCode })
    });
    
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/otp/verify
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, code, purpose = 'registration' } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required'
      });
    }
    
    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      code: code,
      purpose: purpose,
      isUsed: false
    });
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code'
      });
    }
    
    // Check if expired
    if (otpRecord.isExpired()) {
      await otpRecord.deleteOne();
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }
    
    // Check attempts
    if (otpRecord.attempts >= 3) {
      await otpRecord.deleteOne();
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }
    
    // Increment attempts (track failed attempts)
    await otpRecord.incrementAttempts();
    
    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      purpose: purpose
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/otp/resend
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email, purpose = 'registration' } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }
    
    // Invalidate old unused OTPs
    await OTP.updateMany(
      {
        email: email.toLowerCase(),
        purpose: purpose,
        isUsed: false
      },
      { isUsed: true }
    );
    
    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Save new OTP
    const otpRecord = await OTP.create({
      email: email.toLowerCase(),
      code: otpCode,
      purpose: purpose,
      expiresAt: expiresAt
    });
    
    // Send OTP
    const emailSent = await sendOTP(email, otpCode, purpose);
    
    if (!emailSent.success) {
      await otpRecord.deleteOne();
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      expiresIn: '10 minutes',
      ...(process.env.NODE_ENV === 'development' && { debug_otp: otpCode })
    });
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  sendOTPCode,
  verifyOTP,
  resendOTP
};