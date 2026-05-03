const express = require('express');
const router = express.Router();
const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  getMyRestaurant
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Protected routes
router.post('/', protect, authorize('restaurant'), createRestaurant);
router.put('/:id', protect, authorize('restaurant', 'admin'), updateRestaurant);
router.get('/my-restaurant/profile', protect, authorize('restaurant'), getMyRestaurant);

module.exports = router;