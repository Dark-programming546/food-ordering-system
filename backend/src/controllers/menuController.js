const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');

// @desc    Add Menu Item
// @route   POST /api/menu
// @access  Private (Restaurant Owner only)
const addMenuItem = async (req, res) => {
  try {
    const { restaurantId, ...menuData } = req.body;
    
    // Check if restaurant exists and user owns it
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Verify ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add menu items to this restaurant'
      });
    }
    
    // Check if item with same name exists
    const existingItem = await Menu.findOne({ restaurant: restaurantId, name: menuData.name });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Menu item with this name already exists'
      });
    }
    
    const menuItem = await Menu.create({
      restaurant: restaurantId,
      ...menuData
    });
    
    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      menuItem
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get All Menu Items for a Restaurant
// @route   GET /api/menu/restaurant/:restaurantId
// @access  Public
const getMenuByRestaurant = async (req, res) => {
  try {
    const menuItems = await Menu.find({ 
      restaurant: req.params.restaurantId,
      isAvailable: true 
    }).sort({ category: 1 });
    
    // Group by category
    const groupedMenu = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      count: menuItems.length,
      menu: groupedMenu,
      allItems: menuItems
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update Menu Item
// @route   PUT /api/menu/:id
// @access  Private (Restaurant Owner only)
const updateMenuItem = async (req, res) => {
  try {
    let menuItem = await Menu.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    // Check if user owns the restaurant
    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this menu item'
      });
    }
    
    menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete Menu Item
// @route   DELETE /api/menu/:id
// @access  Private (Restaurant Owner only)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    // Check if user owns the restaurant
    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this menu item'
      });
    }
    
    await menuItem.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Toggle Menu Item Availability
// @route   PATCH /api/menu/:id/toggle
// @access  Private (Restaurant Owner only)
const toggleAvailability = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();
    
    res.status(200).json({
      success: true,
      message: `Menu item is now ${menuItem.isAvailable ? 'available' : 'unavailable'}`,
      isAvailable: menuItem.isAvailable
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  addMenuItem,
  getMenuByRestaurant,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
};