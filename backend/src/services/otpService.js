const { generateOTP } = require('../utils/otpGenerator');

// Send OTP - In development, always print to console
const sendOTP = async (email, otpCode, purpose = 'registration') => {
  console.log('\n' + '='.repeat(50));
  console.log(`📧 OTP for ${email}`);
  console.log(`🎯 Purpose: ${purpose}`);
  console.log(`🔑 OTP Code: ${otpCode}`);
  console.log(`⏰ Expires in: 10 minutes`);
  console.log('='.repeat(50) + '\n');
  
  return { success: true, mode: 'console' };
};

module.exports = { sendOTP };
