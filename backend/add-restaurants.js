const mongoose = require('mongoose');
require('dotenv').config();

const restaurantSchema = new mongoose.Schema({
  name: String,
  description: String,
  cuisine: [String],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  contact: {
    phone: String,
    email: String
  },
  images: {
    cover: String,
    logo: String
  },
  isOpen: Boolean,
  deliveryFee: Number,
  minimumOrder: Number,
  estimatedDeliveryTime: Number,
  rating: Number,
  totalReviews: Number,
  isActive: Boolean,
  isApproved: Boolean
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

const restaurants = [
  {
    name: "Pizza Palace",
    description: "Best pizza in town! Authentic Italian pizza made with fresh ingredients.",
    cuisine: ["Italian", "Pizza"],
    address: { street: "123 Main St", city: "Addis Ababa", state: "Ethiopia", zipCode: "1000" },
    contact: { phone: "0912345678", email: "info@pizzapalace.com" },
    images: { cover: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500" },
    isOpen: true,
    deliveryFee: 3.99,
    minimumOrder: 10,
    estimatedDeliveryTime: 35,
    rating: 4.8,
    totalReviews: 120,
    isActive: true,
    isApproved: true
  },
  {
    name: "Burger House",
    description: "Juicy gourmet burgers made with 100% fresh beef.",
    cuisine: ["American", "Burgers"],
    address: { street: "456 Bole Rd", city: "Addis Ababa", state: "Ethiopia", zipCode: "1000" },
    contact: { phone: "0923456789", email: "info@burgerhouse.com" },
    images: { cover: "https://images.unsplash.com/photo-1586816001966-79b736744398?w=500" },
    isOpen: true,
    deliveryFee: 2.99,
    minimumOrder: 8,
    estimatedDeliveryTime: 25,
    rating: 4.7,
    totalReviews: 89,
    isActive: true,
    isApproved: true
  },
  {
    name: "Sushi Master",
    description: "Authentic Japanese sushi and sashimi.",
    cuisine: ["Japanese", "Sushi"],
    address: { street: "789 Namibia St", city: "Addis Ababa", state: "Ethiopia", zipCode: "1000" },
    contact: { phone: "0934567890", email: "info@sushimaster.com" },
    images: { cover: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500" },
    isOpen: true,
    deliveryFee: 4.99,
    minimumOrder: 15,
    estimatedDeliveryTime: 45,
    rating: 4.9,
    totalReviews: 210,
    isActive: true,
    isApproved: true
  },
  {
    name: "Pasta Paradise",
    description: "Authentic Italian pasta and pizza made fresh daily.",
    cuisine: ["Italian", "Pasta"],
    address: { street: "101 Mexico Rd", city: "Addis Ababa", state: "Ethiopia", zipCode: "1000" },
    contact: { phone: "0945678901", email: "info@pastaparadise.com" },
    images: { cover: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500" },
    isOpen: true,
    deliveryFee: 2.49,
    minimumOrder: 10,
    estimatedDeliveryTime: 30,
    rating: 4.6,
    totalReviews: 156,
    isActive: true,
    isApproved: true
  },
  {
    name: "Spice Garden",
    description: "Traditional Ethiopian and Indian cuisine with rich spices.",
    cuisine: ["Ethiopian", "Indian"],
    address: { street: "202 Gambia St", city: "Addis Ababa", state: "Ethiopia", zipCode: "1000" },
    contact: { phone: "0956789012", email: "info@spicegarden.com" },
    images: { cover: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500" },
    isOpen: true,
    deliveryFee: 1.99,
    minimumOrder: 12,
    estimatedDeliveryTime: 50,
    rating: 4.5,
    totalReviews: 98,
    isActive: true,
    isApproved: true
  },
  {
    name: "Wok & Roll",
    description: "Quick and tasty Chinese stir-fry and noodles.",
    cuisine: ["Chinese", "Asian"],
    address: { street: "303 Senegal Ave", city: "Addis Ababa", state: "Ethiopia", zipCode: "1000" },
    contact: { phone: "0967890123", email: "info@wokandroll.com" },
    images: { cover: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500" },
    isOpen: true,
    deliveryFee: 2.49,
    minimumOrder: 9,
    estimatedDeliveryTime: 35,
    rating: 4.4,
    totalReviews: 167,
    isActive: true,
    isApproved: true
  },
  {
    name: "Taco Fiesta",
    description: "Authentic Mexican street food - tacos, burritos, and more.",
    cuisine: ["Mexican", "Tacos"],
    address: { street: "404 Liberia St", city: "Addis Ababa", state: "Ethiopia", zipCode: "1000" },
    contact: { phone: "0978901234", email: "info@tacofiesta.com" },
    images: { cover: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500" },
    isOpen: true,
    deliveryFee: 2.99,
    minimumOrder: 10,
    estimatedDeliveryTime: 35,
    rating: 4.3,
    totalReviews: 145,
    isActive: true,
    isApproved: true
  }
];

const addRestaurants = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing
    await Restaurant.deleteMany({});
    console.log('🗑️ Cleared existing restaurants');
    
    // Add new restaurants
    const result = await Restaurant.insertMany(restaurants);
    console.log(`\n✅ Added ${result.length} restaurants with unique images!\n`);
    
    result.forEach(r => console.log(`   🍽️ ${r.name}`));
    
    console.log('\n🎉 Done! Refresh your frontend to see them.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

addRestaurants();
