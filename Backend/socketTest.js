const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Set up Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Create Socket.io server with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
});

// Track connected users and room participation
const connectedUsers = new Map();
const rooms = new Map();

// Utility for colored console logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

// Handle socket connections
io.on('connection', (socket) => {
  // Store user information
  connectedUsers.set(socket.id, {
    id: socket.id,
    joinedAt: new Date(),
    rooms: []
  });
  
  const totalConnections = connectedUsers.size;
  
  log(`📡 New client connected: ${socket.id}`, 'green');
  log(`👥 Total active connections: ${totalConnections}`, 'cyan');
  
  // Send welcome message to new client
  socket.emit('testResponse', { 
    message: 'Welcome to the Socket.io test server!',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
  
  // Broadcast new connection to all other clients
  socket.broadcast.emit('serverBroadcast', {
    type: 'newConnection',
    socketId: socket.id,
    totalConnections,
    timestamp: new Date().toISOString()
  });
  
  // Handle test messages
  socket.on('testMessage', (data, callback) => {
    log(`📩 Message from ${socket.id}: ${JSON.stringify(data)}`, 'blue');
    
    // Send acknowledgment back if callback function provided
    if (typeof callback === 'function') {
      callback({
        status: 'received',
        timestamp: new Date().toISOString()
      });
    }
    
    // Echo the message back to sender
    socket.emit('testResponse', {
      type: 'echo',
      originalMessage: data,
      timestamp: new Date().toISOString()
    });
    
    // Broadcast to everyone else
    socket.broadcast.emit('serverBroadcast', {
      type: 'message',
      fromSocketId: socket.id,
      content: data,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle room joining
  socket.on('joinRoom', (roomId, callback) => {
    log(`👋 Socket ${socket.id} joining room: ${roomId}`, 'magenta');
    
    // Add user to room
    socket.join(roomId);
    
    // Track room membership
    const user = connectedUsers.get(socket.id);
    if (user && !user.rooms.includes(roomId)) {
      user.rooms.push(roomId);
    }
    
    // Track room participants
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
    
    const roomSize = rooms.get(roomId).size;
    
    // Send acknowledgment
    if (typeof callback === 'function') {
      callback({
        status: 'joined',
        room: roomId,
        participantCount: roomSize,
        timestamp: new Date().toISOString()
      });
    }
    
    // Notify room members
    io.to(roomId).emit('roomUpdate', {
      room: roomId,
      participantCount: roomSize,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle room messages
  socket.on('roomMessage', ({ roomId, message }) => {
    log(`💬 Room message from ${socket.id} to room ${roomId}: ${JSON.stringify(message)}`, 'yellow');
    
    // Broadcast to room members
    io.to(roomId).emit('roomMessage', {
      room: roomId,
      fromSocketId: socket.id,
      message,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    log(`👋 Client disconnected: ${socket.id} (${reason})`, 'red');
    
    // Get user's rooms before removing
    const user = connectedUsers.get(socket.id);
    const userRooms = user ? [...user.rooms] : [];
    
    // Remove from tracking
    connectedUsers.delete(socket.id);
    
    // Update room participation
    userRooms.forEach(roomId => {
      const roomParticipants = rooms.get(roomId);
      if (roomParticipants) {
        roomParticipants.delete(socket.id);
        
        // If room is empty, remove it
        if (roomParticipants.size === 0) {
          rooms.delete(roomId);
          log(`🚫 Room ${roomId} closed (no participants)`, 'yellow');
        } else {
          // Notify remaining participants
          io.to(roomId).emit('roomUpdate', {
            room: roomId,
            participantCount: roomParticipants.size,
            timestamp: new Date().toISOString()
          });
        }
      }
    });
    
    // Broadcast disconnect to all clients
    io.emit('serverBroadcast', {
      type: 'disconnection',
      socketId: socket.id,
      totalConnections: connectedUsers.size,
      timestamp: new Date().toISOString()
    });
  });
});

// Status endpoint
app.get('/', (req, res) => {
  res.send({
    status: 'Socket.io Test Server is running',
    connections: connectedUsers.size,
    rooms: Array.from(rooms.keys()),
    uptime: process.uptime()
  });
});

// Server stats endpoint
app.get('/stats', (req, res) => {
  const stats = {
    connections: {
      total: connectedUsers.size,
      clients: Array.from(connectedUsers.entries()).map(([id, data]) => ({
        id, 
        joinedAt: data.joinedAt,
        rooms: data.rooms
      }))
    },
    rooms: Array.from(rooms.entries()).map(([roomId, participants]) => ({
      id: roomId,
      participants: Array.from(participants),
      count: participants.size
    })),
    server: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  };
  
  res.json(stats);
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  log(`🚀 Socket.io Test Server running on http://localhost:${PORT}`, 'green');
  log(`📊 Server stats available at http://localhost:${PORT}/stats`, 'cyan');
  log(`💻 Connect with your socket client to test!`, 'yellow');
}); 