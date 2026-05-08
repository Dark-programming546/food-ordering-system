const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Import Socket Manager
const SocketManager = require('./src/socket/socketManager');
const socketManager = new SocketManager(io);

// Initialize Socket Manager
socketManager.initialize();

// Import Order Controller to set socket manager
const orderController = require('./src/controllers/orderController');
orderController.setSocketManager(socketManager);

console.log('✅ Socket manager connected to order controller');

// Make sure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('📁 Created public directory for WebSocket dashboard');
}

// Serve static files from public directory
app.use(express.static(publicDir));

// Import routes
const testRoutes = require('./src/routes/testRoutes');
const authRoutes = require('./src/routes/authRoutes');
const restaurantRoutes = require('./src/routes/restaurantRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const otpRoutes = require('./src/routes/otpRoutes');
const adminRoutes = require('./src/routes/adminRoutes'); // 👈 ADDED FOR ADMIN PANEL

// Make socket manager available to routes
app.set('socketManager', socketManager);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dashboard route
app.get('/dashboard', (req, res) => {
  const dashboardPath = path.join(publicDir, 'dashboard.html');
  if (fs.existsSync(dashboardPath)) {
    res.sendFile(dashboardPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Dashboard</title></head>
      <body>
        <h1>Dashboard not found</h1>
        <p>Please create public/dashboard.html file</p>
      </body>
      </html>
    `);
  }
});

// API root route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Online Food Ordering API is running!',
    version: '1.0.0',
    websocket: 'Socket.io enabled',
    dashboard: 'http://localhost:5000/dashboard',
    endpoints: {
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      menu: '/api/menu',
      cart: '/api/cart',
      orders: '/api/orders',
      payments: '/api/payments',
      otp: '/api/otp',
      admin: '/api/admin',
      test: '/api/test'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    websocket: 'active'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/admin', adminRoutes); // 👈 ADDED FOR ADMIN PANEL
app.use('/api/test', testRoutes);

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Cannot find ${req.originalUrl} on this server` 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas Connected Successfully');
    console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);

    const PORT = process.env.PORT || 5000;
    
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📝 API URL: http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket URL: ws://localhost:${PORT}`);
      console.log(`🎮 WebSocket Dashboard: http://localhost:${PORT}/dashboard`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      
      console.log(`\n🔐 Auth endpoints:`);
      console.log(`   POST   /api/auth/register`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   GET    /api/auth/me`);
      console.log(`   PUT    /api/auth/profile`);
      console.log(`   PUT    /api/auth/change-password`);
      console.log(`   POST   /api/auth/logout`);
      console.log(`   POST   /api/auth/verify-email`);
      console.log(`   POST   /api/auth/resend-verification`);
      
      console.log(`\n🏪 Restaurant endpoints:`);
      console.log(`   GET    /api/restaurants`);
      console.log(`   GET    /api/restaurants/:id`);
      console.log(`   POST   /api/restaurants (Restaurant only)`);
      console.log(`   PUT    /api/restaurants/:id (Restaurant/Admin)`);
      console.log(`   GET    /api/restaurants/my-restaurant/profile (Restaurant only)`);
      
      console.log(`\n🍔 Menu endpoints:`);
      console.log(`   GET    /api/menu/restaurant/:restaurantId`);
      console.log(`   POST   /api/menu (Restaurant only)`);
      console.log(`   PUT    /api/menu/:id (Restaurant/Admin)`);
      console.log(`   DELETE /api/menu/:id (Restaurant/Admin)`);
      console.log(`   PATCH  /api/menu/:id/toggle (Restaurant only)`);
      
      console.log(`\n🛒 Cart endpoints:`);
      console.log(`   GET    /api/cart`);
      console.log(`   POST   /api/cart/add`);
      console.log(`   PUT    /api/cart/update/:menuItemId`);
      console.log(`   DELETE /api/cart/remove/:menuItemId`);
      console.log(`   DELETE /api/cart/clear`);
      console.log(`   GET    /api/cart/summary`);
      
      console.log(`\n📦 Order endpoints:`);
      console.log(`   POST   /api/orders/create (Customer)`);
      console.log(`   GET    /api/orders/customer (Customer)`);
      console.log(`   GET    /api/orders/restaurant (Restaurant)`);
      console.log(`   GET    /api/orders/delivery (Delivery)`);
      console.log(`   GET    /api/orders/:id (All roles)`);
      console.log(`   PUT    /api/orders/:id/status (Restaurant)`);
      console.log(`   PUT    /api/orders/:id/assign-delivery (Restaurant)`);
      console.log(`   PUT    /api/orders/:id/delivery-status (Delivery)`);
      console.log(`   PUT    /api/orders/:id/cancel (Customer)`);
      console.log(`   GET    /api/orders/track/:orderNumber (Public)`);
      
      console.log(`\n💳 Payment endpoints:`);
      console.log(`   POST   /api/payments/initiate`);
      console.log(`   GET    /api/payments/history`);
      console.log(`   GET    /api/payments/verify/:paymentId`);
      console.log(`   GET    /api/payments/:paymentId`);
      console.log(`   POST   /api/payments/webhook/telebirr`);
      
      console.log(`\n📧 OTP endpoints:`);
      console.log(`   POST   /api/otp/send - Send OTP to email`);
      console.log(`   POST   /api/otp/verify - Verify OTP code`);
      console.log(`   POST   /api/otp/resend - Resend OTP`);
      
      console.log(`\n👑 Admin endpoints:`);
      console.log(`   GET    /api/admin/dashboard - Dashboard stats`);
      console.log(`   GET    /api/admin/users - Get all users`);
      console.log(`   GET    /api/admin/users/:id - Get user details`);
      console.log(`   PUT    /api/admin/users/:id/role - Update user role`);
      console.log(`   PUT    /api/admin/users/:id/status - Activate/deactivate user`);
      console.log(`   DELETE /api/admin/users/:id - Delete user`);
      console.log(`   GET    /api/admin/restaurants - Get all restaurants`);
      console.log(`   PUT    /api/admin/restaurants/:id/approve - Approve restaurant`);
      console.log(`   PUT    /api/admin/restaurants/:id/block - Block restaurant`);
      console.log(`   GET    /api/admin/orders - Get all orders`);
      console.log(`   GET    /api/admin/reports/sales - Sales report`);
      
      console.log(`\n🔌 WebSocket Events:`);
      console.log(`   join_customer_room - Connect customer to real-time updates`);
      console.log(`   join_restaurant_room - Connect restaurant to receive orders`);
      console.log(`   join_delivery_room - Connect delivery person`);
      console.log(`   new_order - Real-time order notification for restaurant`);
      console.log(`   order_status_updated - Live status updates for customer`);
      console.log(`   delivery_assigned - Delivery person assignment notification`);
      console.log(`   payment_success - Payment confirmation in real-time`);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Please check your MONGODB_URI in .env file');
    process.exit(1);
  }
};

startServer();

// Export socket manager for use in controllers
module.exports = { app, io, socketManager };