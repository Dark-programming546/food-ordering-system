const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register - Create user but require email verification
const register = async (req, res) => {
  console.log('📝 Register request received:', { email: req.body.email, role: req.body.role });
  
  try {
    const { name, email, password, phone, role } = req.body;

    // Only allow customer and delivery self-registration
    // admin is pre-created by developer
    // delivery staff is created by admin
    const allowedRoles = ['customer'];
    const requestedRole = role || 'customer';
    if (!allowedRoles.includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Only customer accounts can be self-registered'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user (email not verified yet)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      isEmailVerified: false  // User must verify email
    });

    // Generate token for later use (but user cannot login until verified)
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email with the OTP sent to your inbox.',
      requiresEmailVerification: true,
      token,  // Token provided but login will check verification status
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: false
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify email with OTP - Call this after registration
const verifyEmailWithOTP = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required'
      });
    }
    
    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      code: code,
      purpose: 'registration',
      isUsed: false
    });
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code'
      });
    }
    
    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await otpRecord.deleteOne();
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }
    
    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Mark email as verified
    await user.markEmailVerified();
    
    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();
    
    // Generate new token with verified status
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: true
      }
    });
    
  } catch (error) {
    console.error('❌ Verify email error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Resend verification OTP
const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    // Invalidate old OTPs
    await OTP.updateMany(
      { email: email.toLowerCase(), purpose: 'registration', isUsed: false },
      { isUsed: true }
    );
    
    // Import OTP service to send new OTP
    const { sendOTP } = require('../services/otpService');
    const { generateOTP } = require('../utils/otpGenerator');
    
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await OTP.create({
      email: email.toLowerCase(),
      code: otpCode,
      purpose: 'registration',
      expiresAt: expiresAt
    });
    
    await sendOTP(email, otpCode, 'registration');
    
    res.status(200).json({
      success: true,
      message: 'Verification OTP resent successfully',
      expiresIn: '10 minutes'
    });
    
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login - Check if email is verified
const login = async (req, res) => {
  console.log('🔐 Login request received:', req.body.email);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 👇 CHECK IF EMAIL IS VERIFIED
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address first. Check your inbox for the OTP code.',
        requiresVerification: true,
        email: user.email
      });
    }

    // 👇 CHECK IF ACCOUNT IS ACTIVE
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Logout
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  verifyEmailWithOTP,  // 👈 NEW
  resendVerificationOTP, // 👈 NEW
  login,
  getMe,
  updateProfile,
  logout,
  changePassword
};