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

// Admin-only routes
router.post('/', protect, authorize('admin'), addMenuItem);
router.put('/:id', protect, authorize('admin'), updateMenuItem);
router.delete('/:id', protect, authorize('admin'), deleteMenuItem);
router.patch('/:id/toggle', protect, authorize('admin'), toggleAvailability);

module.exports = router;