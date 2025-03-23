import { io, Socket } from 'socket.io-client';

// Debug mode for enhanced logging
const DEBUG_MODE = true;

// Socket instance
let socket: Socket | null = null;

// User information
let currentUserId: string | null = null;
let currentAuctionId: string | null = null;

/**
 * Get the WebSocket server URL based on environment
 * @returns {string} WebSocket server URL
 */
export function getSocketUrl(): string {
  // Always use port 5001 for development
  const defaultUrl = 'http://localhost:5001';
  
  // Use environment variable in production, fallback to defaultUrl
  const apiUrl = import.meta.env.VITE_API_URL || defaultUrl;
  
  // Ensure we're using port 5001 if it's a localhost URL
  let finalUrl = apiUrl;
  if (apiUrl.includes('localhost:5000')) {
    finalUrl = apiUrl.replace('localhost:5000', 'localhost:5001');
    console.warn('[Socket] Corrected URL from port 5000 to 5001:', finalUrl);
  }
  
  if (DEBUG_MODE) console.log(`[Socket] Using server URL: ${finalUrl}`);
  return finalUrl;
}

/**
 * Create and configure a Socket.io client instance
 * @returns {Socket} Socket.io client instance
 */
export function createSocket(): Socket {
  // Close any existing connection
  if (socket) {
    if (socket.io.uri.includes('localhost:5000')) {
      console.warn('[Socket] Detected connection to port 5000, forcibly closing and reconnecting to port 5001');
      closeSocket();
    } else if (socket.connected) {
      if (DEBUG_MODE) console.log('[Socket] Reusing existing connected socket');
      return socket;
    } else if (!socket.connected && !socket.connecting) {
      if (DEBUG_MODE) console.log('[Socket] Socket exists but not connected or connecting, creating new connection');
      closeSocket();
    } else {
      if (DEBUG_MODE) console.log('[Socket] Socket is connecting, reusing existing socket');
      return socket;
    }
  }

  const url = getSocketUrl();
  if (DEBUG_MODE) console.log(`[Socket] Creating new socket connection to ${url}`);

  // Create socket instance with reconnection enabled
  socket = io(url, {
    transports: ['polling', 'websocket'], // Try polling first, then websocket - this avoids WebSocket connection failures
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 30000,
    forceNew: true // Force a new connection
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log(`[Socket] Connected successfully! Socket ID: ${socket.id}`);
  });

  socket.on('connect_error', (error) => {
    console.error(`[Socket] Connection error: ${error.message}`);
    console.log(`[Socket] Connection details: URL=${url}, Transport=${socket.io.engine?.transport?.name || 'unknown'}`);
    
    // If we're on websocket and it failed, try polling
    if (socket.io.engine?.transport?.name === 'websocket') {
      if (DEBUG_MODE) console.log('[Socket] WebSocket failed, switching to polling transport');
      
      // Set transports to only use polling
      socket.io.opts.transports = ['polling'];
      
      console.log('[Socket] Switched to polling transport only, reconnecting...');
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Disconnected: ${reason}`);
  });

  socket.io.on('reconnect_attempt', (attemptNumber) => {
    console.log(`[Socket] Reconnection attempt #${attemptNumber}`);
  });

  // Welcome message from server
  socket.on('connect:welcome', (data) => {
    if (DEBUG_MODE) console.log(`[Socket] Welcome message received:`, data);
  });

  return socket;
}

/**
 * Get the socket instance, creating it if necessary
 * @returns {Socket} Socket.io client instance
 */
export function getSocket(): Socket {
  return socket || createSocket();
}

/**
 * Close the socket connection
 */
export function closeSocket(): void {
  if (socket) {
    if (DEBUG_MODE) console.log('[Socket] Closing socket connection');
    socket.disconnect();
    socket = null;
  }
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
  return new Promise((resolve, reject) => {
    const socketInstance = getSocket();
    if (DEBUG_MODE) console.log(`[Socket] Joining auction: ${auctionId}`);
    
    // If socket isn't connected, reconnect first
    if (!socketInstance.connected) {
      console.log('[Socket] Socket not connected when trying to join auction. Connecting...');
      socketInstance.connect();
      
      // Wait for connection before continuing
      setTimeout(() => {
        if (!socketInstance.connected) {
          console.error('[Socket] Failed to connect socket before joining auction');
          reject(new Error('Socket connection failed'));
          return;
        }
        attemptJoin();
      }, 1000);
    } else {
      attemptJoin();
    }
    
    function attemptJoin() {
      // Leave previous auction if any
      if (currentAuctionId && currentAuctionId !== auctionId) {
        leaveAuction(currentAuctionId).catch(error => {
          console.warn(`[Socket] Error leaving previous auction: ${error.message}`);
        });
      }
      
      console.log(`[Socket] Emitting auction:join for auction ${auctionId}`);
      
      // Try to join directly with auction ID first - older server format
      socketInstance.emit('auction:join', auctionId, (response: any) => {
        if (response && response.success) {
          handleSuccessResponse(response);
        } else {
          // If direct ID failed, try with object format - newer server format
          console.log('[Socket] Direct ID join failed, trying object format...');
          socketInstance.emit('auction:join', { auctionId }, (objResponse: any) => {
            if (objResponse && objResponse.success) {
              handleSuccessResponse(objResponse);
            } else {
              const error = (response?.error || objResponse?.error || 'Failed to join auction');
              console.error(`[Socket] Error joining auction in both formats: ${error}`);
              reject(new Error(error));
            }
          });
        }
      });
    }
    
    function handleSuccessResponse(response: any) {
      currentAuctionId = auctionId;
      if (DEBUG_MODE) console.log(`[Socket] Joined auction ${auctionId} with ${response.participantCount} participants`);
      resolve(response);
    }
  });
}

/**
 * Leave an auction room
 * @param {string} auctionId - Auction ID to leave
 * @returns {Promise<object>} Promise resolving to leave response
 */
export function leaveAuction(auctionId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const socketInstance = getSocket();
    if (DEBUG_MODE) console.log(`[Socket] Leaving auction: ${auctionId}`);
    
    socketInstance.emit('auction:leave', auctionId, (response: any) => {
      if (response && response.success) {
        if (currentAuctionId === auctionId) {
          currentAuctionId = null;
        }
        if (DEBUG_MODE) console.log(`[Socket] Left auction ${auctionId}`);
        resolve(response);
      } else {
        const error = response?.error || 'Failed to leave auction';
        console.error(`[Socket] Error leaving auction: ${error}`);
        reject(new Error(error));
      }
    });
  });
}

/**
 * Place a bid on an auction
 * @param {string} auctionId - Auction ID
 * @param {number} amount - Bid amount
 * @param {string} userId - User ID (optional, will use currentUserId if not provided)
 * @returns {Promise<object>} Promise resolving to bid response
 */
export function placeBid(auctionId: string, amount: number, userId?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Use provided userId or fall back to currentUserId
    const bidUserId = userId || currentUserId;
    
    if (!bidUserId) {
      const error = 'User ID is required to place a bid';
      console.error(`[Socket] ${error}`);
      reject(new Error(error));
      return;
    }
    
    const socketInstance = getSocket();
    if (DEBUG_MODE) console.log(`[Socket] Placing bid of $${amount} on auction ${auctionId} by user ${bidUserId}`);
    
    // Ensure socket is connected before attempting to place bid
    if (!socketInstance.connected) {
      console.error(`[Socket] Cannot place bid - socket is not connected`);
      // Try to reconnect
      socketInstance.connect();
      
      // Wait briefly for connection to establish
      setTimeout(() => {
        if (!socketInstance.connected) {
          reject(new Error('Socket is not connected. Please try again.'));
          return;
        } else {
          // Now that we're connected, place the bid directly
          placeBidDirectly();
        }
      }, 1000);
    } else {
      // Socket is already connected, place bid directly
      placeBidDirectly();
    }
    
    function placeBidDirectly() {
      // Create bid data
      const bidData = {
        auctionId,
        amount,
        userId: bidUserId,
        timestamp: new Date()
      };
      
      console.log(`[Socket] Emitting auction:bid with data:`, bidData);
      
      // Skip status check and emit bid directly
      socketInstance.emit('auction:bid', bidData, (bidResponse: any) => {
        console.log(`[Socket] Bid response received:`, bidResponse);
        
        if (bidResponse && bidResponse.success) {
          console.log(`[Socket] Bid placed successfully on auction ${auctionId}: $${amount}`);
          resolve(bidResponse);
        } else {
          const error = bidResponse?.error || 'Failed to place bid';
          console.error(`[Socket] Error placing bid: ${error}`);
          reject(new Error(error));
        }
      });
    }
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
  
  // If no socket exists, create one
  if (!socket) {
    if (DEBUG_MODE) console.log('[Socket] No socket instance found, creating new socket');
    createSocket();
    return socket?.connected || false;
  }
  
  // Check if socket is connected to the wrong port
  if (socket.io.uri.includes('localhost:5000')) {
    console.warn('[Socket] Connection to wrong port detected, recreating socket');
    closeSocket();
    createSocket();
    return socket?.connected || false;
  }
  
  // If socket exists but is not connected, try reconnecting
  if (!socket.connected) {
    if (DEBUG_MODE) console.log('[Socket] Socket exists but not connected, attempting to connect');
    
    // If socket is already attempting to reconnect, don't interfere
    if (socket.io.reconnecting) {
      if (DEBUG_MODE) console.log('[Socket] Reconnection already in progress');
      return false;
    }
    
    // Check if we've exceeded maximum reconnection attempts
    if (socket.io._reconnectionAttempts > 3) {
      if (DEBUG_MODE) console.log('[Socket] Too many reconnection attempts, creating new socket with polling transport');
      closeSocket(); // Close the current socket
      
      // Create a new socket with polling transport only
      const url = getSocketUrl();
      socket = io(url, {
        transports: ['polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 30000,
        forceNew: true
      });
      
      return socket?.connected || false;
    }
    
    // Force reconnection
    try {
      if (DEBUG_MODE) console.log('[Socket] Forcing socket to reconnect');
      socket.connect();
      return socket.connected;
    } catch (error) {
      console.error('[Socket] Error while reconnecting:', error);
      
      // If reconnection fails, try creating a new socket
      if (DEBUG_MODE) console.log('[Socket] Reconnection failed, creating new socket');
      closeSocket();
      createSocket();
      return socket?.connected || false;
    }
  }
  
  // Socket exists and is connected
  if (DEBUG_MODE) console.log('[Socket] Socket connection is active');
  return true;
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
  checkConnection
}; 