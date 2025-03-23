const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const { initializeSocket } = require('./socket');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io with the HTTP server
const socket = initializeSocket(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8082', 'http://127.0.0.1:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:8082'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// Make socket.io available to routes through the app object
app.set('socket', socket);

// Attach socket API routes to Express
socket.attachRoutesToExpress(app);

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8082', 'http://127.0.0.1:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:8082'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Root route
app.get('/', (req, res) => {
  res.send({
    status: 'FarmChain API is running',
    socketStatus: 'Socket.io server active',
    timestamp: new Date().toISOString()
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Error handler middleware
app.use(errorHandler);

// 404 route - must be after all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server active with enhanced features`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Export for testing purposes
module.exports = { app, server }; 