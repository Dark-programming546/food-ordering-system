const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  restaurantName: {
    type: String,
    required: true
  },
  specialInstructions: {
    type: String,
    maxlength: 200
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalItems: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps and calculate totals before saving
cartSchema.pre('save', async function() {
  this.updatedAt = Date.now();
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Method to add item to cart
cartSchema.methods.addItem = function(itemData) {
  // Check if item already exists in cart
  const existingItemIndex = this.items.findIndex(
    item => item.menuItem.toString() === itemData.menuItem
  );
  
  if (existingItemIndex > -1) {
    // Update quantity if item exists
    this.items[existingItemIndex].quantity += itemData.quantity;
  } else {
    // Add new item
    this.items.push(itemData);
  }
  
  return this.save(); // Return the save promise
};

// Method to update item quantity
cartSchema.methods.updateQuantity = function(menuItemId, quantity) {
  const item = this.items.find(item => item.menuItem.toString() === menuItemId);
  
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    this.items = this.items.filter(item => item.menuItem.toString() !== menuItemId);
  } else {
    item.quantity = quantity;
  }
  
  return this.save();
};

// Method to remove item
cartSchema.methods.removeItem = function(menuItemId) {
  this.items = this.items.filter(item => item.menuItem.toString() !== menuItemId);
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);

module.exports = mongoose.model('Cart', cartSchema);