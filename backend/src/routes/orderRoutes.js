const express = require('express');
const router = express.Router();
const {
  createOrder,
  getCustomerOrders,
  getRestaurantOrders,
  getDeliveryOrders,
  getOrderById,
  updateOrderStatus,
  assignDeliveryPerson,
  updateDeliveryStatus,
  trackOrder,
  cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// DEBUG ROUTE - Test if router is working
router.post('/test', (req, res) => {
  console.log('✅ Test route hit!');
  res.json({ success: true, message: 'Order routes are working!' });
});

// Public routes
router.get('/track/:orderNumber', trackOrder);

// Protected routes - Customer (no authorize for create to test)
router.post('/create', protect, (req, res, next) => {
  console.log('📦 Create order route hit');
  next();
}, createOrder);

router.get('/customer', protect, authorize('customer'), getCustomerOrders);
router.put('/:id/cancel', protect, authorize('customer'), cancelOrder);

// Protected routes - Restaurant
router.get('/restaurant', protect, authorize('restaurant'), getRestaurantOrders);
router.put('/:id/status', protect, authorize('restaurant'), updateOrderStatus);
router.put('/:id/assign-delivery', protect, authorize('restaurant'), assignDeliveryPerson);

// Protected routes - Delivery
router.get('/delivery', protect, authorize('delivery'), getDeliveryOrders);
router.put('/:id/delivery-status', protect, authorize('delivery'), updateDeliveryStatus);

// Protected routes - All roles
router.get('/:id', protect, getOrderById);

// Error handler for this router
router.use((err, req, res, next) => {
  console.error('Order route error:', err);
  res.status(500).json({ success: false, message: err.message || 'Route error' });
});

module.exports = router;