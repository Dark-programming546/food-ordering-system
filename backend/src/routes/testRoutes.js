const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Simple test route (working)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Test route working!'
  });
});

// Health check route
router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    success: true, 
    status: 'Server is healthy',
    mongodb: {
      status: dbStatus[dbState],
      readyState: dbState,
      databaseName: mongoose.connection.db ? mongoose.connection.db.databaseName : 'Not connected'
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Environment info route
router.get('/env', (req, res) => {
  res.json({
    success: true,
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    mongodb_uri_prefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'Not set',
    jwt_configured: !!process.env.JWT_SECRET,
    admin_email: process.env.ADMIN_EMAIL
  });
});

module.exports = router;