const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    maxlength: [300, 'Description cannot be more than 300 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide category'],
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish', 'Special']
  },
  image: {
    type: String,
    default: 'default-food.jpg'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  spicyLevel: {
    type: String,
    enum: ['Mild', 'Medium', 'Hot', 'Extra Hot'],
    default: 'Mild'
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  calories: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for restaurant + name
menuSchema.index({ restaurant: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Menu', menuSchema);