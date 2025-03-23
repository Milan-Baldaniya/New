const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); // Add HTTP module for Socket.io
const { Server } = require('socket.io'); // Add Socket.io
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

// Initialize express app
const app = express();
const server = http.createServer(app); // Create HTTP server

// Set up Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8082', 'http://127.0.0.1:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:8082'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Make io available to our route handlers through the app object
app.set('io', io);

// Set up socket connection and event handlers
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  console.log('Total connected clients:', io.engine.clientsCount);
  
  // Send welcome message to new client
  socket.emit('connect:welcome', { 
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
  
  // Handle joining an auction room
  socket.on('auction:join', (auctionId, callback) => {
    console.log(`User ${socket.id} joined auction: ${auctionId}`);
    socket.join(auctionId);
    
    // Notify room about participant count
    const roomSize = io.sockets.adapter.rooms.get(auctionId)?.size || 1;
    console.log(`Room ${auctionId} now has ${roomSize} participants`);
    
    // Send acknowledgment if callback function provided
    if (typeof callback === 'function') {
      callback({
        success: true,
        auctionId,
        participantCount: roomSize,
        socketId: socket.id
      });
    }
    
    // Notify all participants
    io.to(auctionId).emit('auction:update', { 
      auctionId,
      action: 'participant_joined',
      participantCount: roomSize,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle leaving an auction room
  socket.on('auction:leave', (auctionId, callback) => {
    console.log(`User ${socket.id} left auction: ${auctionId}`);
    socket.leave(auctionId);
    
    // Update participant count after user leaves
    setTimeout(() => {
      const roomSize = io.sockets.adapter.rooms.get(auctionId)?.size || 0;
      
      io.to(auctionId).emit('auction:update', { 
        auctionId,
        action: 'participant_left',
        participantCount: roomSize,
        timestamp: new Date().toISOString()
      });
      
      // Send acknowledgment if callback function provided
      if (typeof callback === 'function') {
        callback({
          success: true,
          auctionId
        });
      }
    }, 100);
  });
  
  // Handle new bids
  socket.on('auction:bid', async (data, callback) => {
    const { auctionId, amount, userId } = data;
    console.log(`New bid on ${auctionId}: $${amount} by user ${userId}`);
    
    try {
      // You would typically update the database here
      // For now, broadcast the bid to all clients in the auction room
      io.to(auctionId).emit('auction:bid', {
        auctionId,
        amount,
        userId,
        bidder: {
          id: userId,
          name: userId // In a real app, you would fetch the user's name
        },
        timestamp: new Date().toISOString()
      });
      
      // Send acknowledgment if callback function provided
      if (typeof callback === 'function') {
        callback({
          success: true,
          auctionId,
          amount,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error processing bid:', error);
      
      // Send error back to the client who placed the bid
      if (typeof callback === 'function') {
        callback({
          success: false,
          error: 'Failed to place bid. Please try again.'
        });
      } else {
        socket.emit('bidError', { 
          auctionId, 
          message: 'Failed to place bid. Please try again.' 
        });
      }
    }
  });
  
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Root route
app.get('/', (req, res) => {
  res.send('FarmChain API is running');
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

// Change app.listen to server.listen for Socket.io to work
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server active`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});