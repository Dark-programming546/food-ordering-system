const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One restaurant per owner
  },
  name: {
    type: String,
    required: [true, 'Please provide restaurant name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  cuisine: {
    type: [String], // Array of cuisine types (e.g., ['Italian', 'Pizza'])
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: String
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  images: {
    logo: { type: String, default: 'default-logo.png' },
    cover: { type: String, default: 'default-cover.jpg' },
    gallery: [String]
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumOrder: {
    type: Number,
    default: 0,
    min: 0
  },
  estimatedDeliveryTime: {
    type: Number, // in minutes
    default: 30
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
restaurantSchema.index({ name: 'text', cuisine: 'text', 'address.city': 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);