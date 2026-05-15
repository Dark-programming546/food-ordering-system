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

// Admin-only routes (owner manages the restaurant)
router.post('/', protect, authorize('admin'), createRestaurant);
router.put('/:id', protect, authorize('admin'), updateRestaurant);
router.get('/my-restaurant/profile', protect, authorize('admin'), getMyRestaurant);

module.exports = router;