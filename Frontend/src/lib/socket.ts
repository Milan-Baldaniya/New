import { io, Socket } from 'socket.io-client';

// Debug mode for enhanced logging
const DEBUG_MODE = true;

// Socket instance
let socket: Socket | null = null;
let connectionAttempts = 0;
let socketUrl = null;

// User information
let currentUserId: string | null = null;
let currentAuctionId: string | null = null;

/**
 * Get the WebSocket server URL based on environment
 * @returns {string} WebSocket server URL
 */
export function getSocketUrl(): string {
  if (socketUrl) return socketUrl;
  
  // Get from environment variable or use default
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  socketUrl = apiUrl;
  return socketUrl;
}

/**
 * Create and configure a Socket.io client instance
 * @returns {Socket} Socket.io client instance
 */
export function createSocket(forceNew = false): Socket {
  // Close existing socket if requested
  if (socket && forceNew) {
    try {
      socket.disconnect();
      socket = null;
    } catch (e) {
      console.error("Error closing existing socket:", e);
    }
  }
  
  // Use singleton pattern
  if (socket) return socket;
  
  // Get socket URL
  const url = getSocketUrl();
  
  // Create the socket with better reconnection options
  try {
    socket = io(url, {
      reconnection: true,
      reconnectionAttempts: 10, 
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      // Try polling first if websocket fails
      transports: ['polling', 'websocket']
    });
    
    // Track connection attempts
    connectionAttempts = 0;
    
    // Add global event listeners
    socket.on('connect', () => {
      console.log(`Socket connected: ${socket.id}`);
      connectionAttempts = 0;
      
      // Dispatch global event for components to react
      window.dispatchEvent(new CustomEvent('socket:connected', {
        detail: { socketId: socket.id }
      }));
    });
    
    socket.on('connect_error', (error) => {
      connectionAttempts++;
      console.error(`Socket connection error (attempt ${connectionAttempts}):`, error.message);
      
      // Dispatch global event for components to react
      window.dispatchEvent(new CustomEvent('socket:error', {
        detail: { error: error.message, attempts: connectionAttempts }
      }));
      
      // If too many failed attempts, force a new socket instance next time
      if (connectionAttempts >= 5) {
        console.warn("Too many failed connection attempts, will create new instance on next getSocket");
        socket = null;
      }
    });
    
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      
      // Dispatch global event for components to react
      window.dispatchEvent(new CustomEvent('socket:disconnected', {
        detail: { reason }
      }));
      
      // If server disconnected us, try to reconnect manually
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });
    
    // Listen for auction-specific events
    socket.on('auction:bid', (data) => {
      console.log("Received auction:bid event:", data);
      
      // Broadcast this data globally so any component can react
      window.dispatchEvent(new CustomEvent('auction:bid', {
        detail: { ...data }
      }));
    });
    
    socket.on('auction:update', (data) => {
      console.log("Received auction:update event:", data);
      
      // Broadcast globally
      window.dispatchEvent(new CustomEvent('auction:update', {
        detail: { ...data }
      }));
    });
    
    return socket;
  } catch (error) {
    console.error("Error creating socket:", error);
    return null;
  }
}

/**
 * Get the socket instance, creating it if necessary
 * @returns {Socket} Socket.io client instance
 */
export function getSocket(): Socket {
  if (!socket) {
    console.log("Creating new socket instance");
    socket = createSocket();
  }
  return socket;
}

/**
 * Close the socket connection
 */
export function closeSocket(): boolean {
  if (socket) {
    try {
      socket.disconnect();
      socket = null;
      console.log("Socket disconnected and instance cleared");
      return true;
    } catch (e) {
      console.error("Error closing socket:", e);
      return false;
    }
  }
  return true;
}

/**
 * Set current user ID for socket events
 * @param {string} userId - User ID
 */
export function setCurrentUser(userId: string): void {
  currentUserId = userId;
  if (DEBUG_MODE) console.log(`[Socket] Current user set to: ${userId}`);
}

/**
 * Join an auction room
 * @param {string} auctionId - Auction ID to join
 * @returns {Promise<object>} Promise resolving to join response
 */
export function joinAuction(auctionId: string): Promise<any> {
  const socket = getSocket();
  
  if (!socket.connected) {
    socket.connect();
  }
  
  return new Promise((resolve) => {
    // Try both formats for backwards compatibility
    socket.emit('auction:join', { auctionId }, (response) => {
      if (response && response.success) {
        handleSuccessResponse(response);
      } else {
        // Try direct ID format
        socket.emit('auction:join', auctionId, (directResponse) => {
          handleSuccessResponse(directResponse || { success: false });
        });
      }
    });
  });
}

/**
 * Leave an auction room
 * @param {string} auctionId - Auction ID to leave
 * @returns {Promise<object>} Promise resolving to leave response
 */
export function leaveAuction(auctionId: string): Promise<any> {
  const socket = getSocket();
  
  if (!socket.connected) return;
  
  // Try both formats
  socket.emit('auction:leave', { auctionId });
  socket.emit('auction:leave', auctionId);
}

/**
 * Place a bid on an auction
 * @param {string} auctionId - Auction ID
 * @param {number} amount - Bid amount
 * @param {string} userId - User ID (optional, will use currentUserId if not provided)
 * @returns {Promise<object>} Promise resolving to bid response
 */
export function placeBid(auctionId: string, amount: number, userId?: string): Promise<any> {
  const socket = getSocket();
  
  if (!socket.connected) {
    console.log("Socket not connected for bid, connecting...");
    socket.connect();
    
    // Wait for connection
    return new Promise((resolve, reject) => {
      const checkConnection = setInterval(() => {
        if (socket.connected) {
          clearInterval(checkConnection);
          placeBidDirectly(auctionId, amount, userId);
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkConnection);
        reject(new Error("Socket connection timed out"));
      }, 5000);
    });
  }
  
  return placeBidDirectly(auctionId, amount, userId);
}

function placeBidDirectly(auctionId: string, amount: number, userId?: string): Promise<any> {
  // Use provided userId or fall back to currentUserId
  const bidUserId = userId || currentUserId;
  
  if (!bidUserId) {
    const error = 'User ID is required to place a bid';
    console.error(`[Socket] ${error}`);
    return Promise.reject(new Error(error));
  }
  
  if (DEBUG_MODE) console.log(`[Socket] Placing bid of $${amount} on auction ${auctionId} by user ${bidUserId}`);
  
  // Create bid data
  const bidData = {
    auctionId,
    amount,
    userId: bidUserId,
    bidder: {
      id: bidUserId,
      name: "User" // Should be replaced with actual name if available
    },
    timestamp: new Date().toISOString()
  };
  
  console.log(`[Socket] Emitting auction:bid with data:`, bidData);
  
  return new Promise((resolve, reject) => {
    // Set timeout for bid response
    const timeout = setTimeout(() => {
      reject(new Error("Bid timeout - no response from server"));
    }, 10000);
    
    // Emit bid with callback
    socket.emit('auction:bid', bidData, (response) => {
      clearTimeout(timeout);
      
      if (response && response.success) {
        console.log(`[Socket] Bid placed successfully on auction ${auctionId}: $${amount}`);
        resolve(response);
      } else {
        const error = response?.error || 'Failed to place bid';
        console.error(`[Socket] Error placing bid: ${error}`);
        reject(new Error(error));
      }
    });
  });
}

/**
 * Register a handler for auction updates (participant counts, etc.)
 * @param {function} handler - Handler function for updates
 * @returns {function} Function to unregister the handler
 */
export function onAuctionUpdate(handler: (data: any) => void): () => void {
  const socketInstance = getSocket();
  
  if (DEBUG_MODE) console.log('[Socket] Registering auction:update handler');
  socketInstance.on('auction:update', handler);
  
  return () => {
    if (DEBUG_MODE) console.log('[Socket] Unregistering auction:update handler');
    socketInstance.off('auction:update', handler);
  };
}

/**
 * Register a handler for new bids
 * @param {function} handler - Handler function for new bids
 * @returns {function} Function to unregister the handler
 */
export function onBid(handler: (data: any) => void): () => void {
  const socketInstance = getSocket();
  
  if (DEBUG_MODE) console.log('[Socket] Registering auction:bid handler');
  socketInstance.on('auction:bid', handler);
  
  return () => {
    if (DEBUG_MODE) console.log('[Socket] Unregistering auction:bid handler');
    socketInstance.off('auction:bid', handler);
  };
}

/**
 * Check and fix socket connection if needed
 * @returns {boolean} True if connection is now active, false otherwise
 */
export function checkConnection(): boolean {
  if (DEBUG_MODE) console.log('[Socket] Checking connection status');
  
  // Check if socket exists and is connected
  if (!socket) return false;
  return socket.connected;
}

/**
 * Sync the state of an auction after connection issues or to ensure data consistency
 * @param {string} auctionId - The ID of the auction to sync
 * @returns {Promise<object|null>} The auction state or null if failed
 */
export function syncAuctionState(auctionId: string): Promise<any> {
  const socket = getSocket();
  
  if (!socket.connected) {
    socket.connect();
    // Wait briefly for connection
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return new Promise((resolve, reject) => {
    if (!auctionId) {
      reject(new Error('Auction ID is required'));
      return;
    }
    
    if (DEBUG_MODE) console.log(`[Socket] Syncing auction state for ${auctionId}`);
    
    // First make sure we're in the auction room
    socket.emit('auction:join', { auctionId }, () => {
      // Now request the latest state
      socket.emit('auction:getState', { auctionId }, (response: any) => {
        if (DEBUG_MODE) console.log(`[Socket] Auction state sync response for ${auctionId}:`, response);
        
        if (response && response.success) {
          resolve(response);
        } else {
          // Try direct ID format as fallback
          socket.emit('auction:getState', auctionId, (directResponse: any) => {
            if (directResponse && directResponse.success) {
              resolve(directResponse);
            } else {
              reject(new Error('Failed to sync auction state'));
            }
          });
        }
      });
    });
  });
}

/**
 * Broadcast a bid to ensure it's received by all components
 * @param {string} auctionId - Auction ID
 * @param {number} amount - Bid amount
 * @param {object} bidder - Bidder information
 * @returns {Promise<boolean>} Whether the broadcast was successful
 */
export function broadcastBid(auctionId: string, amount: number, bidder: any): Promise<boolean> {
  const socket = getSocket();
  
  // Auto-connect if not connected
  if (!socket.connected) {
    socket.connect();
    // Wait briefly for connection
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Complete bid data
  const bidData = {
    auctionId,
    amount,
    userId: bidder?.id,
    bidder,
    timestamp: new Date().toISOString()
  };
  
  try {
    // First try the socket emit with callback
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        // If no response in 3 seconds, assume it failed but don't reject
        resolve(false);
      }, 3000);
      
      socket.emit('auction:bid', bidData, (response) => {
        clearTimeout(timeout);
        resolve(response && response.success);
      });
    });
  } catch (e) {
    console.error("Error broadcasting bid:", e);
    return false;
  }
}

export default {
  getSocket,
  createSocket,
  closeSocket,
  setCurrentUser,
  joinAuction,
  leaveAuction,
  placeBid,
  onAuctionUpdate,
  onBid,
  checkConnection,
  syncAuctionState,
  broadcastBid
}; 