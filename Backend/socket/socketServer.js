const { Server } = require('socket.io');
const logger = require('./socketLogger');

// Add DB models import
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
// Add auctionService import
const auctionService = require('../services/auctionService');

/**
 * Configures and initializes a Socket.io server
 * @param {Object} httpServer - HTTP server instance to attach Socket.io to
 * @param {Object} options - Configuration options
 * @returns {Object} Configured Socket.io server instance
 */
function createSocketServer(httpServer, options = {}) {
  // Default options
  const config = {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    ...options
  };

  // Create Socket.io server
  const io = new Server(httpServer, config);
  
  // Data stores for tracking connections and auction rooms
  const connectedUsers = new Map();
  const auctionRooms = new Map();
  
  // Store for auction data (bids, product state) - Used as a cache for fast responses
  const auctionData = new Map();
  
  // Set up connection handler
  io.on('connection', (socket) => {
    const socketId = socket.id;
    
    // Store user information
    connectedUsers.set(socketId, {
      id: socketId,
      joinedAt: new Date(),
      rooms: []
    });
    
    logger.info(`Client connected: ${socketId}`);
    logger.debug(`Total connections: ${connectedUsers.size}`);
    
    // Send welcome message
    socket.emit('connect:welcome', { 
      socketId,
      timestamp: new Date().toISOString()
    });
    
    // Handle joining auction room
    socket.on('auction:join', async (auctionId, callback) => {
      const roomId = `auction:${auctionId}`;
      logger.info(`Client ${socketId} joining auction: ${auctionId}`);
      
      // Join the room
      socket.join(roomId);
      
      // Track user in room
      const user = connectedUsers.get(socketId);
      if (user && !user.rooms.includes(roomId)) {
        user.rooms.push(roomId);
      }
      
      // Track room participants
      if (!auctionRooms.has(auctionId)) {
        auctionRooms.set(auctionId, new Set());
      }
      
      auctionRooms.get(auctionId).add(socketId);
      const participantCount = auctionRooms.get(auctionId).size;
      
      try {
        // Check if auction exists or needs migration from Product
        await auctionService.migrateProductToAuction(auctionId)
          .catch(error => {
            // If migration fails, it's likely not an auction product
            logger.warn(`Failed to migrate product to auction: ${error.message}`);
          });
        
        // Update participant count in database
        await Auction.findByIdAndUpdate(auctionId, {
          $set: { participants: participantCount }
        }).catch(error => {
          logger.warn(`Failed to update participant count: ${error.message}`);
        });
        
        // Update in-memory cache
        if (!auctionData.has(auctionId)) {
          // Get auction data
          const { auction, bids } = await auctionService.getAuctionWithBids(auctionId)
            .catch(() => ({ auction: null, bids: [] }));
          
          if (auction) {
            auctionData.set(auctionId, {
              currentBid: auction.currentBid || null,
              bidder: auction.currentBidder || null,
              lastUpdated: auction.lastBidTime || null,
              bidHistory: bids.map(bid => ({
                amount: bid.amount,
                bidder: bid.bidderName || 'Anonymous',
                timestamp: bid.timestamp
              }))
            });
          }
        }
      } catch (error) {
        logger.error(`Error initializing auction data: ${error.message}`);
      }
      
      // Notify all room participants
      io.to(roomId).emit('auction:update', {
        auctionId,
        action: 'participant_joined',
        participantCount,
        timestamp: new Date().toISOString()
      });
      
      // Send acknowledgment
      if (typeof callback === 'function') {
        callback({
          success: true,
          auctionId,
          participantCount,
          socketId
        });
      }
    });
    
    // Handle leaving auction room
    socket.on('auction:leave', async (auctionId, callback) => {
      const roomId = `auction:${auctionId}`;
      logger.info(`Client ${socketId} leaving auction: ${auctionId}`);
      
      socket.leave(roomId);
      
      // Update tracking
      const user = connectedUsers.get(socketId);
      if (user) {
        user.rooms = user.rooms.filter(r => r !== roomId);
      }
      
      if (auctionRooms.has(auctionId)) {
        auctionRooms.get(auctionId).delete(socketId);
        
        const participantCount = auctionRooms.get(auctionId).size;
        
        // Update participant count in database
        try {
          await Auction.findByIdAndUpdate(auctionId, {
            $set: { participants: participantCount }
          }).catch(error => {
            logger.warn(`Failed to update participant count: ${error.message}`);
          });
        } catch (error) {
          logger.error(`Error updating participant count: ${error.message}`);
        }
        
        // Clean up empty rooms
        if (participantCount === 0) {
          auctionRooms.delete(auctionId);
          // Keep auction data for a while in case participants rejoin
          logger.debug(`Auction room ${auctionId} closed (no participants)`);
        } else {
          // Notify remaining participants
          io.to(roomId).emit('auction:update', {
            auctionId,
            action: 'participant_left',
            participantCount,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      if (typeof callback === 'function') {
        callback({
          success: true,
          auctionId
        });
      }
    });
    
    // Handle auction status check
    socket.on('auction:status', async (data, callback) => {
      const { auctionId } = data;
      logger.info(`Checking auction status: ${auctionId} by client ${socketId}`);
      
      try {
        // Get auction and check if it has ended
        const { auction } = await auctionService.getAuctionWithBids(auctionId);
        const isEnded = auction ? auction.hasEnded() : false;
        
        if (typeof callback === 'function') {
          callback({
            success: true,
            auctionId,
            isEnded,
            status: auction ? auction.status : 'unknown',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        logger.error(`Error checking auction status: ${error.message}`);
        
        if (typeof callback === 'function') {
          callback({
            success: false,
            error: 'Failed to check auction status',
            auctionId
          });
        }
      }
    });
    
    // Handle getting auction state
    socket.on('auction:getState', async (data, callback) => {
      const { auctionId } = data;
      logger.info(`Getting auction state: ${auctionId} by client ${socketId}`);
      
      try {
        // Get auction with bids from service
        const { auction, bids } = await auctionService.getAuctionWithBids(auctionId);
        
        // Format bid history for client
        const bidHistory = bids.map(bid => ({
          amount: bid.amount,
          bidder: bid.bidderName || 'Anonymous',
          timestamp: bid.timestamp
        }));
        
        // Update in-memory cache
        auctionData.set(auctionId, {
          currentBid: auction.currentBid || null,
          bidder: auction.currentBidder || null,
          lastUpdated: auction.lastBidTime || null,
          bidHistory
        });
        
        if (typeof callback === 'function') {
          callback({
            success: true,
            auctionId,
            product: {
              id: auction._id,
              name: auction.name,
              currentBid: auction.currentBid,
              bidder: auction.currentBidder,
              startingBid: auction.startingBid,
              endBidTime: auction.endBidTime,
              status: auction.status
            },
            bidHistory,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        logger.error(`Error getting auction state from database: ${error.message}`);
        
        // Fall back to in-memory data if database query fails
        const state = auctionData.get(auctionId) || {
          currentBid: null,
          bidder: null,
          lastUpdated: null,
          bidHistory: []
        };
        
        if (typeof callback === 'function') {
          callback({
            success: true,
            auctionId,
            product: {
              id: auctionId,
              currentBid: state.currentBid,
              bidder: state.bidder
            },
            bidHistory: state.bidHistory,
            timestamp: new Date().toISOString()
          });
        }
      }
    });
    
    // Handle getting latest bid
    socket.on('auction:getLatestBid', async (data, callback) => {
      const { auctionId } = data;
      logger.info(`Getting latest bid: ${auctionId} by client ${socketId}`);
      
      try {
        // Get latest bid from service
        const latestBid = await auctionService.getLatestBid(auctionId);
        
        let bidData = null;
        
        if (latestBid) {
          bidData = {
            auctionId,
            amount: latestBid.amount,
            bidder: latestBid.bidderName || 'Anonymous',
            userId: latestBid.bidder,
            timestamp: latestBid.timestamp
          };
        } else {
          // Fall back to in-memory data if no bids in database
          const state = auctionData.get(auctionId);
          if (state && state.currentBid !== null) {
            bidData = {
              auctionId,
              amount: state.currentBid,
              bidder: state.bidder,
              timestamp: state.lastUpdated
            };
          }
        }
        
        if (typeof callback === 'function') {
          callback({
            success: true,
            auctionId,
            bid: bidData,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        logger.error(`Error getting latest bid from database: ${error.message}`);
        
        // Fall back to in-memory data
        const state = auctionData.get(auctionId);
        let latestBid = null;
        
        if (state && state.currentBid !== null) {
          latestBid = {
            auctionId,
            amount: state.currentBid,
            bidder: state.bidder,
            timestamp: state.lastUpdated
          };
        }
        
        if (typeof callback === 'function') {
          callback({
            success: true,
            auctionId,
            bid: latestBid,
            timestamp: new Date().toISOString()
          });
        }
      }
    });
    
    // Handle bid placement
    socket.on('auction:bid', async (data, callback) => {
      const { auctionId, amount, userId, bidder, timestamp } = data;
      
      if (!auctionId || !amount || !userId) {
        logger.warn(`Invalid bid data from ${socketId}: ${JSON.stringify(data)}`);
        if (typeof callback === 'function') {
          callback({
            success: false,
            error: 'Invalid bid data'
          });
        }
        return;
      }
      
      logger.info(`New bid: ${auctionId}, $${amount} by user ${userId}`);
      
      try {
        // Use service to place bid
        const bidderName = typeof bidder === 'object' ? bidder.name : 'Anonymous';
        const { bid, auction } = await auctionService.placeBid(auctionId, amount, userId, bidderName);
        
        // Create response data
        const bidData = {
          auctionId,
          amount,
          userId,
          bidder: bidder || userId,
          timestamp: timestamp || new Date().toISOString()
        };
        
        // Update in-memory cache
        if (!auctionData.has(auctionId)) {
          auctionData.set(auctionId, {
            currentBid: amount,
            bidder: bidder || userId,
            lastUpdated: timestamp || new Date().toISOString(),
            bidHistory: []
          });
        } else {
          const auctionCache = auctionData.get(auctionId);
          
          // Update with new bid
          auctionCache.currentBid = amount;
          auctionCache.bidder = bidder || userId;
          auctionCache.lastUpdated = timestamp || new Date().toISOString();
          
          // Add to bid history
          auctionCache.bidHistory.unshift({
            amount,
            bidder: bidderName,
            timestamp: timestamp || new Date().toISOString()
          });
          
          // Keep history manageable
          if (auctionCache.bidHistory.length > 50) {
            auctionCache.bidHistory = auctionCache.bidHistory.slice(0, 50);
          }
        }
        
        // Broadcast bid to auction room
        const roomId = `auction:${auctionId}`;
        io.to(roomId).emit('auction:bid', bidData);
        
        if (typeof callback === 'function') {
          callback({
            success: true,
            ...bidData
          });
        }
      } catch (error) {
        logger.error(`Error saving bid to database: ${error.message}`);
        
        if (typeof callback === 'function') {
          callback({
            success: false,
            error: error.message || 'Failed to save bid'
          });
        }
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socketId} (${reason})`);
      
      // Get user's rooms before removing
      const user = connectedUsers.get(socketId);
      const userRooms = user ? [...user.rooms] : [];
      
      // Remove from tracking
      connectedUsers.delete(socketId);
      
      // Update room participation
      userRooms.forEach(roomId => {
        // Extract auction ID from room ID (format: "auction:123")
        const auctionId = roomId.split(':')[1];
        
        if (auctionRooms.has(auctionId)) {
          auctionRooms.get(auctionId).delete(socketId);
          const participantCount = auctionRooms.get(auctionId).size;
          
          // Update participant count in database
          Auction.findByIdAndUpdate(auctionId, {
            $set: { participants: participantCount }
          }).catch(error => {
            logger.warn(`Failed to update participant count: ${error.message}`);
          });
          
          if (participantCount === 0) {
            auctionRooms.delete(auctionId);
            logger.debug(`Auction room ${auctionId} closed (no participants)`);
          } else {
            // Notify remaining participants
            io.to(roomId).emit('auction:update', {
              auctionId,
              action: 'participant_left',
              participantCount,
              timestamp: new Date().toISOString()
            });
          }
        }
      });
    });
  });
  
  // Set up periodic task to close ended auctions
  const auctionCleanupInterval = setInterval(async () => {
    try {
      const closedCount = await auctionService.closeEndedAuctions();
      if (closedCount > 0) {
        logger.info(`Closed ${closedCount} ended auctions`);
      }
    } catch (error) {
      logger.error(`Error in auction cleanup: ${error.message}`);
    }
  }, 60000); // Check every minute
  
  // Add helper methods for server management/stats
  io.getStats = () => {
    return {
      connections: {
        total: connectedUsers.size,
        clients: Array.from(connectedUsers.entries()).map(([id, data]) => ({
          id, 
          joinedAt: data.joinedAt,
          rooms: data.rooms
        }))
      },
      auctions: Array.from(auctionRooms.entries()).map(([auctionId, participants]) => ({
        id: auctionId,
        participants: Array.from(participants),
        count: participants.size,
        latestBid: auctionData.get(auctionId)?.currentBid || null
      })),
      server: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    };
  };
  
  logger.info('Socket.io server initialized');
  
  // Clean up on server shutdown
  const cleanup = () => {
    clearInterval(auctionCleanupInterval);
    logger.info('Socket server shutting down, cleanup completed');
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  return io;
}

module.exports = { createSocketServer }; 