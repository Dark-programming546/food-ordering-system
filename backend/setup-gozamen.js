/**
 * Seed script: Creates Gozamen Restaurant + Admin user
 * Run: node setup-gozamen.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gozamen.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // 1. Create or update admin user
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.create({
      name: 'Gozamen Owner',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      phone: '0911000000',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });
    console.log(`✅ Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${admin.email}`);
  }

  // 2. Create Gozamen Restaurant if not exists
  let restaurant = await Restaurant.findOne();
  if (!restaurant) {
    restaurant = await Restaurant.create({
      owner: admin._id,
      name: 'Gozamen Restaurant',
      description: 'Authentic Ethiopian cuisine in the heart of Addis Ababa. Experience the rich flavors of traditional injera, tibs, and more.',
      cuisine: ['Ethiopian', 'Traditional', 'Vegetarian'],
      address: {
        street: 'Bole Road, Near Edna Mall',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        zipCode: '1000',
        coordinates: { lat: 9.0192, lng: 38.7525 }
      },
      contact: {
        phone: '0911000000',
        email: ADMIN_EMAIL,
        website: ''
      },
      images: {
        logo: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&auto=format',
        cover: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&auto=format',
        gallery: []
      },
      isOpen: true,
      deliveryFee: 30,
      minimumOrder: 100,
      estimatedDeliveryTime: 35,
      rating: 4.8,
      isActive: true,
      isApproved: true,
      approvedBy: admin._id,
      approvedAt: new Date()
    });
    console.log(`✅ Gozamen Restaurant created: ${restaurant._id}`);
  } else {
    // Update name to Gozamen if it's something else
    if (restaurant.name !== 'Gozamen Restaurant') {
      restaurant.name = 'Gozamen Restaurant';
      restaurant.owner = admin._id;
      await restaurant.save();
      console.log(`✅ Restaurant renamed to Gozamen Restaurant`);
    } else {
      console.log(`ℹ️  Gozamen Restaurant already exists`);
    }
  }

  console.log('\n🎉 Setup complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👑 Admin Login:`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`🏪 Restaurant: Gozamen Restaurant (ID: ${restaurant._id})`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
