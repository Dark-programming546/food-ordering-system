const express = require('express');
const router = express.Router();
const {
  addMenuItem,
  getMenuByRestaurant,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/restaurant/:restaurantId', getMenuByRestaurant);

// Protected routes
router.post('/', protect, authorize('restaurant'), addMenuItem);
router.put('/:id', protect, authorize('restaurant', 'admin'), updateMenuItem);
router.delete('/:id', protect, authorize('restaurant', 'admin'), deleteMenuItem);
router.patch('/:id/toggle', protect, authorize('restaurant'), toggleAvailability);

module.exports = router;