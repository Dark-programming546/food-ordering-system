const Cart = require('../models/Cart');
const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity, specialInstructions } = req.body;
    
    // Validate quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    // Get menu item details
    const menuItem = await Menu.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    // Check if menu item is available
    if (!menuItem.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `${menuItem.name} is currently not available`
      });
    }
    
    // Get restaurant details
    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Check if restaurant is open and active
    if (!restaurant.isOpen || !restaurant.isActive) {
      return res.status(400).json({
        success: false,
        message: `${restaurant.name} is currently closed`
      });
    }
    
    // Find or create user's cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
    
    // Check if trying to add from different restaurant
    if (cart.items.length > 0) {
      const existingRestaurantId = cart.items[0].restaurant.toString();
      const newRestaurantId = menuItem.restaurant.toString();
      
      if (existingRestaurantId !== newRestaurantId) {
        return res.status(400).json({
          success: false,
          message: 'You can only order from one restaurant at a time. Clear your cart or checkout first.',
          currentRestaurant: existingRestaurantId,
          newRestaurant: newRestaurantId
        });
      }
    }
    
    // Prepare cart item
    const cartItem = {
      menuItem: menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: quantity,
      restaurant: menuItem.restaurant,
      restaurantName: restaurant.name,
      specialInstructions: specialInstructions || ''
    };
    
    // Add item to cart (using the method we defined)
    await cart.addItem(cartItem);
    
    // Populate menu item details for response
    await cart.populate('items.menuItem', 'name price image isAvailable');
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.menuItem', 'name price image isAvailable')
      .populate('items.restaurant', 'name isOpen isActive');

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { items: [], totalItems: 0, totalPrice: 0 }
      });
    }

    // Calculate totals
    let totalItems = 0;
    let totalPrice = 0;
    cart.items.forEach(item => {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
    });

    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:menuItemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Populate for response
    await cart.populate('items.menuItem', 'name price image isAvailable');

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:menuItemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    // Populate for response
    await cart.populate('items.menuItem', 'name price image isAvailable');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
const getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        summary: {
          totalItems: 0,
          totalPrice: 0,
          items: []
        }
      });
    }

    let totalItems = 0;
    let totalPrice = 0;
    const items = cart.items.map(item => {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
      return {
        menuItem: item.menuItem,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      };
    });

    res.status(200).json({
      success: true,
      summary: {
        totalItems,
        totalPrice,
        items
      }
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
};