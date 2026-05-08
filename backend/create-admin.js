const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  phone: String,
  isEmailVerified: Boolean,
  isActive: Boolean
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@foodsystem.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists!');
      console.log('Email: admin@foodsystem.com');
      process.exit();
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin
    const admin = new User({
      name: 'System Admin',
      email: 'admin@foodsystem.com',
      password: hashedPassword,
      role: 'admin',
      phone: '0912345678',
      isEmailVerified: true,
      isActive: true
    });
    
    await admin.save();
    console.log('\n✅ Admin user created successfully!');
    console.log('📧 Email: admin@foodsystem.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: admin\n');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
