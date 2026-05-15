const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAllOrders,
  getSalesReport,
  createDeliveryStaff,
  getDeliveryStaff,
  getRestaurantSettings,
  updateRestaurantSettings
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Delivery staff management (owner adds/removes delivery people)
router.get('/delivery-staff', getDeliveryStaff);
router.post('/delivery-staff', createDeliveryStaff);
router.put('/delivery-staff/:id/status', toggleUserStatus);
router.delete('/delivery-staff/:id', deleteUser);

// Restaurant settings (the single Gozamen restaurant)
router.get('/restaurant-settings', getRestaurantSettings);
router.put('/restaurant-settings', updateRestaurantSettings);

// Order management
router.get('/orders', getAllOrders);

// Reports
router.get('/reports/sales', getSalesReport);

module.exports = router;
