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

// ─── OWNER ROUTES (Restaurant Manager) ───────────────────────────
// Dashboard & reports
router.get('/dashboard', authorize('owner', 'admin'), getDashboardStats);
router.get('/reports/sales', authorize('owner', 'admin'), getSalesReport);

// Delivery staff management
router.get('/delivery-staff', authorize('owner'), getDeliveryStaff);
router.post('/delivery-staff', authorize('owner'), createDeliveryStaff);
router.put('/delivery-staff/:id/status', authorize('owner'), toggleUserStatus);
router.delete('/delivery-staff/:id', authorize('owner'), deleteUser);

// Restaurant settings
router.get('/restaurant-settings', authorize('owner'), getRestaurantSettings);
router.put('/restaurant-settings', authorize('owner'), updateRestaurantSettings);

// Orders (read — owner also uses /api/orders/restaurant for full management)
router.get('/orders', authorize('owner'), getAllOrders);

// Customers (read-only for owner)
router.get('/customers', authorize('owner'), (req, res, next) => {
  req.query.role = 'customer';
  next();
}, getAllUsers);

// ─── ADMIN ROUTES (IT Person) ────────────────────────────────────
// Full user management
router.get('/users', authorize('admin'), getAllUsers);
router.get('/users/:id', authorize('admin'), getUserById);
router.put('/users/:id/role', authorize('admin'), updateUserRole);
router.put('/users/:id/status', authorize('admin'), toggleUserStatus);
router.delete('/users/:id', authorize('admin'), deleteUser);

// Admin can also view all orders (read-only oversight)
router.get('/all-orders', authorize('admin'), getAllOrders);

module.exports = router;
