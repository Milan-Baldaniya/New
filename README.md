# Socket.io Testing Tools

A collection of tools for testing Socket.io connections and real-time functionality.

## Overview

This package provides several tools to help test and debug Socket.io connections:

1. **Socket Test Server** - A standalone Socket.io server with extensive logging and room support
2. **Command-line Test Client** - A Node.js CLI client for connecting to Socket.io servers
3. **Browser Test Client** - An HTML/JS client for browser-based testing

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

## Usage

### Starting the Test Server

```bash
npm run start:server
```

This will start a Socket.io server on port 5001 with the following features:
- Connection tracking
- Room management
- Detailed logging
- HTTP endpoints for server status

#### Server Endpoints

- `http://localhost:5001/` - Server status
- `http://localhost:5001/stats` - Detailed server statistics

### Using the Command-line Client

```bash
npm run start:client
```

The CLI client provides an interactive interface with commands like:
- `connect [url]` - Connect to a Socket.io server
- `send <message>` - Send a test message
- `status` - Check connection status
- `help` - View all available commands

### Using the Browser Client

Open `Frontend/src/pages/socketTest.html` in your web browser.

The browser client provides:
- Connection status monitoring
- Test message sending
- Event logging

## Supported Events

### Server Events

- `connection` - When a client connects
- `disconnect` - When a client disconnects
- `testMessage` - When a client sends a test message
- `joinRoom` - When a client joins a room
- `roomMessage` - When a client sends a message to a room

### Client Events

- `testResponse` - Response to a test message
- `serverBroadcast` - Broadcast from the server
- `roomUpdate` - Room participant updates
- `roomMessage` - Message received in a room

## Examples

### Joining a room

```javascript
// From the CLI client
socket-test> connect
socket-test> send {"action":"joinRoom","roomId":"test-room"}

// From code
socket.emit('joinRoom', 'test-room', (response) => {
  console.log('Join response:', response);
});
```

### Sending a room message

```javascript
// From the CLI client
socket-test> send {"action":"roomMessage","roomId":"test-room","message":"Hello room!"}

// From code
socket.emit('roomMessage', {
  roomId: 'test-room',
  message: 'Hello room!'
});
```

## License

MIT 