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

// Owner-only routes
router.post('/', protect, authorize('owner'), addMenuItem);
router.put('/:id', protect, authorize('owner'), updateMenuItem);
router.delete('/:id', protect, authorize('owner'), deleteMenuItem);
router.patch('/:id/toggle', protect, authorize('owner'), toggleAvailability);

module.exports = router;