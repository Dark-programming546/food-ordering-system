const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');

// @desc    Create Restaurant Profile
// @route   POST /api/restaurants
// @access  Private (Restaurant Owner only)
const createRestaurant = async (req, res) => {
  try {
    // Check if user already has a restaurant
    const existingRestaurant = await Restaurant.findOne({ owner: req.user.id });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'You already have a restaurant registered'
      });
    }

    // Create restaurant
    const restaurant = await Restaurant.create({
      owner: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      restaurant
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get All Restaurants (with filters)
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
  try {
    const { cuisine, city, search, minRating } = req.query;
    let filter = { isActive: true };
    
    if (cuisine) {
      filter.cuisine = { $in: [cuisine] };
    }
    
    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    const restaurants = await Restaurant.find(filter)
      .select('-__v')
      .sort({ rating: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get Single Restaurant with Menu
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .select('-__v');
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Get menu items for this restaurant
    const menu = await Menu.find({ 
      restaurant: restaurant._id,
      isAvailable: true 
    }).sort({ category: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      restaurant,
      menu,
      menuCount: menu.length
    });
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update Restaurant Profile
// @route   PUT /api/restaurants/:id
// @access  Private (Restaurant Owner only)
const updateRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Check if user owns this restaurant
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this restaurant'
      });
    }
    
    restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get My Restaurant (for logged in restaurant owner)
// @route   GET /api/restaurants/my-restaurant
// @access  Private (Restaurant Owner only)
const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'You haven\'t created a restaurant yet'
      });
    }
    
    // Get menu items
    const menu = await Menu.find({ restaurant: restaurant._id });
    
    res.status(200).json({
      success: true,
      restaurant,
      menu
    });
  } catch (error) {
    console.error('Get my restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  getMyRestaurant
};