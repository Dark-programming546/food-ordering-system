const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  password: String
});

const User = mongoose.model('User', userSchema);

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await User.updateOne(
      { email: 'admin@foodsystem.com' },
      { 
        $set: { 
          role: 'admin',
          password: hashedPassword
        } 
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('\n✅ Admin user updated successfully!');
      console.log('📧 Email: admin@foodsystem.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: admin\n');
    } else {
      console.log('⚠️ User not found');
    }
    
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateAdmin();
