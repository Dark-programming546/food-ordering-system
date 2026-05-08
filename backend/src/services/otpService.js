const { generateOTP } = require('../utils/otpGenerator');
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP via email
const sendOTPEmail = async (email, otpCode, purpose = 'registration') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Food Ordering System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Verification Code',
      html: `
        <h2>Food Ordering System</h2>
        <p>Your OTP verification code is:</p>
        <h1 style="color: #667eea;">${otpCode}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>Never share this code with anyone.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return { success: true, mode: 'email' };
    
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send OTP - tries email first, falls back to console
const sendOTP = async (email, otpCode, purpose = 'registration') => {
  // Try to send email if credentials exist
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const result = await sendOTPEmail(email, otpCode, purpose);
    if (result.success) {
      return result;
    }
  }
  
  // Fallback to console mode
  console.log('\n' + '='.repeat(50));
  console.log(`📧 OTP for ${email}`);
  console.log(`🎯 Purpose: ${purpose}`);
  console.log(`🔑 OTP Code: ${otpCode}`);
  console.log(`⏰ Expires in: 10 minutes`);
  console.log('='.repeat(50) + '\n');
  
  return { success: true, mode: 'console', debug_otp: otpCode };
};

module.exports = { sendOTP };