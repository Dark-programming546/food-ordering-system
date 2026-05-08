// OTP Generator Utility
// Generates random 6-digit OTP codes

const generateOTP = () => {
  // Generate 6-digit random number between 100000 and 999999
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

const generateNumericOTP = (length = 6) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

module.exports = {
  generateOTP,
  generateNumericOTP
};