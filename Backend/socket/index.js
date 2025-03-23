/**
 * Socket.io module for the application
 * Provides real-time bidding functionality for auctions
 */

const { createSocketServer } = require('./socketServer');
const logger = require('./socketLogger');

// Configure logger based on environment
if (process.env.NODE_ENV === 'production') {
  logger.configure({
    level: 'INFO',
    enableColors: false
  });
} else if (process.env.NODE_ENV === 'development') {
  logger.configure({
    level: 'DEBUG',
    enableColors: true
  });
}

/**
 * Initialize Socket.io with an HTTP server
 * @param {Object} httpServer - HTTP server instance to attach Socket.io to
 * @param {Object} options - Configuration options for Socket.io
 * @returns {Object} Configured Socket.io server instance
 */
function initializeSocket(httpServer, options = {}) {
  logger.info('Initializing Socket.io server');
  
  if (!httpServer) {
    logger.error('HTTP server is required to initialize Socket.io');
    throw new Error('HTTP server is required to initialize Socket.io');
  }
  
  const io = createSocketServer(httpServer, options);
  
  // Add server API routes for socket statistics
  const attachRoutesToExpress = (app) => {
    if (!app || typeof app.get !== 'function') {
      logger.warn('Invalid Express app provided, skipping route attachment');
      return;
    }
    
    // Socket server status endpoint
    app.get('/api/socket/status', (req, res) => {
      res.json({
        status: 'Socket.io server is running',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Socket server detailed statistics
    app.get('/api/socket/stats', (req, res) => {
      res.json(io.getStats());
    });
    
    logger.debug('Attached Socket.io API routes to Express');
  };
  
  // Return the socket server and helper functions
  return {
    io,
    attachRoutesToExpress,
    
    // Helper to emit to all clients in an auction room
    emitToAuction: (auctionId, event, data) => {
      const roomId = `auction:${auctionId}`;
      io.to(roomId).emit(event, {
        ...data,
        auctionId,
        timestamp: new Date().toISOString()
      });
      logger.debug(`Emitted ${event} to auction ${auctionId}`);
    },
    
    // Helper to get participant count for an auction
    getAuctionParticipantCount: (auctionId) => {
      const roomId = `auction:${auctionId}`;
      const room = io.sockets.adapter.rooms.get(roomId);
      return room ? room.size : 0;
    }
  };
}

module.exports = {
  initializeSocket,
  logger
}; 