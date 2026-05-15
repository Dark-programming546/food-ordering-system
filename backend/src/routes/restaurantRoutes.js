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

// Owner-only routes (restaurant manager)
router.post('/', protect, authorize('owner'), createRestaurant);
router.put('/:id', protect, authorize('owner'), updateRestaurant);
router.get('/my-restaurant/profile', protect, authorize('owner'), getMyRestaurant);

module.exports = router;