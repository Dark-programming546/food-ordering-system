const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Import routes
const testRoutes = require('./src/routes/testRoutes');
const authRoutes = require('./src/routes/authRoutes');
const restaurantRoutes = require('./src/routes/restaurantRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes'); // 👈 ADDED FOR DAY 5

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Online Food Ordering API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      menu: '/api/menu',
      cart: '/api/cart',
      orders: '/api/orders',
      test: '/api/test'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Use routes (BEFORE the 404 handler)
app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes); // 👈 ADDED FOR DAY 5

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Cannot find ${req.originalUrl} on this server` 
  });
});

// Global error handler (MUST be last)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server AFTER DB connects
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ MongoDB Atlas Connected Successfully');
    console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 API URL: http://localhost:${PORT}`);
      console.log(`🧪 Test route: http://localhost:${PORT}/api/test`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      console.log(`\n🔐 Auth endpoints:`);
      console.log(`   POST   /api/auth/register`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   GET    /api/auth/me`);
      console.log(`   PUT    /api/auth/profile`);
      console.log(`   PUT    /api/auth/change-password`);
      console.log(`   POST   /api/auth/logout`);
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
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Please check your MONGODB_URI in .env file');
    process.exit(1);
  }
};

startServer();