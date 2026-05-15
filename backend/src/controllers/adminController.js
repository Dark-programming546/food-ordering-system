const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalRestaurants = await User.countDocuments({ role: 'restaurant' });
    const totalDelivery = await User.countDocuments({ role: 'delivery' });
    
    const totalRestaurantProfiles = await Restaurant.countDocuments();
    const approvedRestaurants = await Restaurant.countDocuments({ isApproved: true });
    const pendingRestaurants = await Restaurant.countDocuments({ isApproved: false });
    
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    
    // Get revenue
    const payments = await Payment.find({ paymentStatus: 'completed' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'name email')
      .populate('restaurant', 'name');
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-password');
    
    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          restaurants: totalRestaurants,
          delivery: totalDelivery
        },
        restaurants: {
          total: totalRestaurantProfiles,
          approved: approvedRestaurants,
          pending: pendingRestaurants
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders
        },
        revenue: {
          total: totalRevenue,
          currency: 'ETB'
        }
      },
      recentOrders,
      recentUsers
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users (with filters)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's orders if customer
    let orders = [];
    if (user.role === 'customer') {
      orders = await Order.find({ customer: user._id }).limit(10);
    }
    
    // Get restaurant if user is restaurant owner
    let restaurant = null;
    if (user.role === 'restaurant') {
      restaurant = await Restaurant.findOne({ owner: user._id });
    }
    
    res.status(200).json({
      success: true,
      user,
      orders,
      restaurant
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['customer', 'delivery', 'owner', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed: ${validRoles.join(', ')}`
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't allow deleting admin accounts
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin accounts'
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all restaurants (with filters)
// @route   GET /api/admin/restaurants
// @access  Private (Admin only)
const getAllRestaurants = async (req, res) => {
  try {
    const { isApproved, isActive, search, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const restaurants = await Restaurant.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Restaurant.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      restaurants
    });
  } catch (error) {
    console.error('Get all restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Approve restaurant
// @route   PUT /api/admin/restaurants/:id/approve
// @access  Private (Admin only)
const approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await Restaurant.findById(id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    restaurant.isApproved = true;
    restaurant.approvedBy = req.user.id;
    restaurant.approvedAt = new Date();
    await restaurant.save();
    
    // Also update the user's role if needed
    await User.findByIdAndUpdate(restaurant.owner, { isActive: true });
    
    res.status(200).json({
      success: true,
      message: 'Restaurant approved successfully',
      restaurant
    });
  } catch (error) {
    console.error('Approve restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Block/Unblock restaurant
// @route   PUT /api/admin/restaurants/:id/block
// @access  Private (Admin only)
const blockRestaurant = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Restaurant ${isActive ? 'unblocked' : 'blocked'} successfully`,
      restaurant
    });
  } catch (error) {
    console.error('Block restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Private (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (status) filter.orderStatus = status;
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name')
      .populate('deliveryPerson', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get sales report
// @route   GET /api/admin/reports/sales
// @access  Private (Admin only)
const getSalesReport = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    const orders = await Order.find(dateFilter);
    const payments = await Payment.find({ ...dateFilter, paymentStatus: 'completed' });
    
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOrders = orders.length;
    
    // Group by day/week/month
    const salesByDate = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { date, count: 0, amount: 0 };
      }
      salesByDate[date].count++;
      salesByDate[date].amount += order.totalAmount;
    });
    
    res.status(200).json({
      success: true,
      report: {
        period,
        totalSales,
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
        salesByDate: Object.values(salesByDate),
        orders,
        payments
      }
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create delivery staff (admin only)
// @route   POST /api/admin/delivery-staff
// @access  Private (Admin only)
const createDeliveryStaff = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const staff = await User.create({
      name, email, password, phone,
      role: 'delivery',
      isEmailVerified: true,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Delivery staff created successfully',
      user: { id: staff._id, name: staff.name, email: staff.email, phone: staff.phone, role: staff.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all delivery staff
// @route   GET /api/admin/delivery-staff
// @access  Private (Admin only)
const getDeliveryStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'delivery' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: staff.length, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get restaurant settings (the single restaurant)
// @route   GET /api/admin/restaurant-settings
// @access  Private (Admin only)
const getRestaurantSettings = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne();
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update restaurant settings
// @route   PUT /api/admin/restaurant-settings
// @access  Private (Admin only)
const updateRestaurantSettings = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.status(200).json({ success: true, message: 'Settings updated', restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAllRestaurants,
  approveRestaurant,
  blockRestaurant,
  getAllOrders,
  getSalesReport,
  createDeliveryStaff,
  getDeliveryStaff,
  getRestaurantSettings,
  updateRestaurantSettings
};