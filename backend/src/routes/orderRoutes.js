const express = require('express');
const router = express.Router();
const {
  createOrder,
  getCustomerOrders,
  getRestaurantOrders,
  getDeliveryOrders,
  getAvailableOrders,
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

// Protected routes - Customer
router.post('/create', protect, authorize('customer'), createOrder);
router.get('/customer', protect, authorize('customer'), getCustomerOrders);
router.put('/:id/cancel', protect, authorize('customer'), cancelOrder);

// Protected routes - Owner (restaurant manager)
router.get('/restaurant', protect, authorize('owner'), getRestaurantOrders);
router.put('/:id/status', protect, authorize('owner'), updateOrderStatus);
router.put('/:id/assign-delivery', protect, authorize('owner'), assignDeliveryPerson);

// Protected routes - Delivery
router.get('/delivery', protect, authorize('delivery'), getDeliveryOrders);
router.get('/available', protect, authorize('delivery'), getAvailableOrders);
router.put('/:id/delivery-status', protect, authorize('delivery'), updateDeliveryStatus);

// Protected routes - All roles
router.get('/:id', protect, getOrderById);

// Error handler for this router
router.use((err, req, res, next) => {
  console.error('Order route error:', err);
  res.status(500).json({ success: false, message: err.message || 'Route error' });
});

module.exports = router;