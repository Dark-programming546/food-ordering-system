const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// All cart routes are protected (require login)
router.get('/', protect, getCart);
router.get('/summary', protect, getCartSummary);
router.post('/add', protect, addToCart);
router.put('/update/:menuItemId', protect, updateCartItem);
router.delete('/remove/:menuItemId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router;