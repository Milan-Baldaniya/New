# Cross-Device Bidding Testing Instructions

This guide will help you test the bidding functionality across multiple devices. We've improved the socket-based communication to ensure bids are properly synchronized across devices and persistently stored in the database.

## Prerequisites

- Node.js v14+ (v22.14.0 recommended)
- Two different devices or browsers (for simulating multiple users)
- Network connection (both devices must be able to reach the backend server)
- MongoDB connection (for data persistence)

## Setup Instructions

### 1. Starting the Backend Server

1. Open a terminal and navigate to the Backend directory:
   ```
   cd Backend
   ```

2. Install dependencies if not already installed:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

   This will start both the main API server (port 5000) and the Socket.io server (port 5001).
   
4. Verify the servers are running:
   - API server should be available at http://localhost:5000
   - Socket.io server should be available at http://localhost:5001

### 2. Starting the Frontend Application

1. Open a new terminal and navigate to the Frontend directory:
   ```
   cd Frontend
   ```

2. Install dependencies if not already installed:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. The application should start at http://localhost:3000 or another available port

### 3. Network Configuration for Cross-Device Testing

For testing across physical devices (not just different browsers on the same machine), you need to ensure your devices can connect to your development machine:

1. Find your development machine's local IP address:
   - On Windows: Open Command Prompt and type `ipconfig`
   - On macOS/Linux: Open Terminal and type `ifconfig` or `ip addr`

2. Update the `.env` file in the Frontend directory to use your local IP:
   ```
   VITE_API_URL=http://YOUR_LOCAL_IP:5000
   ```

3. Restart the frontend development server after changing the environment variables

## Testing the Bidding Functionality

### Test Case 1: Basic Bidding Functionality

1. **On Device 1**:
   - Log in as User A
   - Navigate to the Marketplace
   - Create a new product with bidding enabled or select an existing auction
   - Open the LiveBidding page for that product

2. **On Device 2**:
   - Log in as User B
   - Navigate to the Marketplace
   - Find the same auction product
   - Open the LiveBidding page for that product

3. **Testing Process**:
   - On Device 2 (User B), place a bid
   - Verify that the bid appears on Device 1 (User A) without refreshing
   - On Device 1 (User A), place a higher bid
   - Verify that the bid appears on Device 2 (User B) without refreshing

### Test Case 2: Connection Recovery

1. **Setup both devices** as in Test Case 1

2. **Testing Process**:
   - On Device 2, temporarily disconnect from the network (turn off Wi-Fi)
   - Wait 10-15 seconds
   - Reconnect to the network
   - Place a bid
   - Verify that the bid appears on Device 1
   - Check both devices to ensure the bid history is synchronized

### Test Case 3: Multiple Rapid Bids

1. **Setup both devices** as in Test Case 1

2. **Testing Process**:
   - On Device 1, place a bid
   - Immediately on Device 2, place a higher bid (within 1-2 seconds)
   - Immediately on Device 1, place an even higher bid
   - Verify that all bids appear in the correct order on both devices
   - Check that the final product price reflects the highest bid

## Debugging

If you encounter issues with the bidding functionality, check the following:

1. **Console Logs**: 
   - Both frontend and backend have detailed logging enabled
   - Open the browser console (F12 or Right-click > Inspect > Console) to view frontend logs
   - Check the terminal running the backend server for backend logs

2. **Socket Connection**:
   - Verify the socket connection status in the browser console
   - Look for log messages like `[Socket] Connected successfully!`
   - Check for any connection errors

3. **Network Connectivity**:
   - Ensure both devices can reach the backend server
   - Test by accessing the API server URL from both devices' browsers

4. **Common Issues**:
   - Socket connection failing: Check firewall settings or network restrictions
   - Bids not appearing: Check if the auction ID matches on both devices
   - Delayed updates: Check network latency or verify that both devices have synchronized clocks

## Recent Improvements

We have implemented several key improvements to ensure reliable cross-device bidding functionality:

1. **Enhanced Data Synchronization**
   - All bids are now properly saved to the MongoDB database
   - Real-time bidding updates are broadcasted to all connected clients
   - New state update mechanism ensures all clients receive the latest auction data

2. **Improved Recovery Mechanisms**
   - Added automatic state synchronization when a page becomes visible after being hidden
   - Implemented a manual refresh button to force state updates from the server
   - Added periodic background checks to ensure bid history stays in sync

3. **Better Error Handling**
   - Improved error messages and notifications
   - Added more detailed logging for debugging purposes
   - Enhanced data validation to prevent inconsistent states

4. **User Experience Enhancements**
   - Toast notifications for new bids and state updates
   - Loading indicators during refresh operations
   - Clear indication of connection status

## Testing Tools

In addition to these instructions, we've provided a detailed testing script in `TEST-BIDDING-SCRIPT.md` that outlines specific test cases to verify the bidding functionality. Use this script to methodically test all aspects of the bidding system.

### Database Persistence

All auction data is now persistently stored in MongoDB, ensuring that:

1. **Bid History**: All bids are stored and can be retrieved even after server restarts
2. **Auction State**: The current auction state is maintained in the database
3. **Participant Tracking**: Number of participants in an auction is tracked
4. **Auto Migration**: Existing auction products are automatically migrated to the new data model

This ensures that your auction data is never lost, even if there are connection issues or server restarts.

## Verification Steps

To verify that data is properly saved in the database:

1. Place some test bids on an auction
2. Restart the backend server: 
   ```
   Ctrl+C to stop the server
   npm start to restart it
   ```
3. Refresh the auction page and verify that:
   - The highest bid is still displayed correctly
   - The bid history shows all previous bids
   - New bids continue to work properly

If you still encounter issues after following these instructions, please report them with detailed steps to reproduce and any relevant console logs. 