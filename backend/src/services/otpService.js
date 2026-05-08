// OTP Service - Handles OTP delivery via email
const nodemailer = require('nodemailer');
const { generateOTP } = require('../utils/otpGenerator');

// Email transporter configuration
// You'll need to update these with your email credentials
const createTransporter = () => {
  // For Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS  // Your app password (not regular password)
    }
  });
};

// Send OTP via email
const sendOTPEmail = async (email, otpCode, purpose = 'registration') => {
  try {
    const transporter = createTransporter();
    
    // Customize email content based on purpose
    const emailSubjects = {
      registration: 'Verify Your Account - Food Ordering System',
      login: 'Login Verification Code',
      password_reset: 'Password Reset Code',
      verify_phone: 'Phone Verification Code'
    };
    
    const emailMessages = {
      registration: `Thank you for registering with our Food Ordering System!`,
      login: `You are trying to log in to your account.`,
      password_reset: `You requested to reset your password.`,
      verify_phone: `Please verify your phone number.`
    };
    
    const subject = emailSubjects[purpose] || 'Your OTP Verification Code';
    const customMessage = emailMessages[purpose] || 'Please use this code to complete your action.';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 500px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; padding: 20px; background: white; border-radius: 10px; margin: 20px 0; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          .warning { color: #e74c3c; font-size: 12px; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🍕 Food Ordering System</h2>
          </div>
          <div class="content">
            <h3>Hello!</h3>
            <p>${customMessage}</p>
            <p>Your One-Time Password (OTP) verification code is:</p>
            <div class="otp-code">
              <strong>${otpCode}</strong>
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <div class="warning">
              ⚠️ Never share this code with anyone, including our support team.
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 Food Ordering System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"Food Ordering System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
      text: `Your OTP verification code is: ${otpCode}\nThis code will expire in 10 minutes.\nNever share this code with anyone.`
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

// For testing without email (development mode)
const sendOTPConsole = async (email, otpCode, purpose = 'registration') => {
  console.log(`\n========== OTP for ${email} ==========`);
  console.log(`Purpose: ${purpose}`);
  console.log(`OTP Code: ${otpCode}`);
  console.log(`Expires in: 10 minutes`);
  console.log(`=====================================\n`);
  return { success: true, mode: 'console' };
};

// Choose which method to use based on environment
const sendOTP = async (email, otpCode, purpose = 'registration') => {
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    console.log('📧 Development mode: OTP printed to console');
    return sendOTPConsole(email, otpCode, purpose);
  } else {
    return sendOTPEmail(email, otpCode, purpose);
  }
};

module.exports = {
  sendOTP,
  sendOTPEmail,
  sendOTPConsole
};