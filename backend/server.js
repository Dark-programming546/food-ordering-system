const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Import routes
const testRoutes = require('./src/routes/testRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Online Food Ordering API is running!' });
});

// Use routes (BEFORE the 404 handler)
app.use('/api', testRoutes);

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
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Please check your MONGODB_URI in .env file');
    process.exit(1);
  }
};

startServer();
