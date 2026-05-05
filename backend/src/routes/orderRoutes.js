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

// Public routes
router.get('/track/:orderNumber', trackOrder);

// Protected routes - Customer
router.post('/create', protect, createOrder);
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

module.exports = router;