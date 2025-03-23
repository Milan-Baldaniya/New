const { io } = require('socket.io-client');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default server URL
let serverUrl = 'http://localhost:5001';
let socket = null;
let connected = false;

// Print colored text
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Format timestamp
function getTimestamp() {
  return new Date().toLocaleTimeString();
}

// Log with timestamp
function log(message, color = 'reset') {
  colorLog(`[${getTimestamp()}] ${message}`, color);
}

// Connect to socket server
function connect(url) {
  if (connected) {
    log('Already connected. Disconnect first.', 'yellow');
    return;
  }

  log(`Attempting to connect to ${url}...`, 'cyan');
  
  try {
    socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      timeout: 10000
    });

    // Connection events
    socket.on('connect', () => {
      connected = true;
      log(`Connected successfully! Socket ID: ${socket.id}`, 'green');
      showPrompt();
    });

    socket.on('connect_error', (error) => {
      log(`Connection error: ${error.message}`, 'red');
      showPrompt();
    });

    socket.on('disconnect', (reason) => {
      connected = false;
      log(`Disconnected: ${reason}`, 'yellow');
      showPrompt();
    });

    // Test response events
    socket.on('testResponse', (data) => {
      log(`Received response: ${JSON.stringify(data)}`, 'blue');
    });

    socket.on('serverBroadcast', (data) => {
      log(`Broadcast received: ${JSON.stringify(data)}`, 'magenta');
    });

    // Custom event listeners can be added here
    
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
  }
}

// Disconnect from server
function disconnect() {
  if (!socket) {
    log('Not connected to any server.', 'yellow');
    return;
  }

  socket.disconnect();
  socket = null;
  connected = false;
  log('Manually disconnected', 'yellow');
}

// Send test message
function sendMessage(message) {
  if (!socket || !connected) {
    log('Not connected to server', 'red');
    return;
  }

  const payload = { 
    text: message, 
    timestamp: new Date().toISOString() 
  };
  
  log(`Sending message: ${message}`, 'cyan');
  socket.emit('testMessage', payload, (acknowledgement) => {
    if (acknowledgement) {
      log(`Server acknowledged: ${JSON.stringify(acknowledgement)}`, 'green');
    }
  });
}

// Show available commands
function showHelp() {
  console.log('\nAvailable commands:');
  console.log('  connect [url]        - Connect to socket server (default: http://localhost:5001)');
  console.log('  disconnect           - Disconnect from server');
  console.log('  send <message>       - Send a test message');
  console.log('  url [new-url]        - Show or change the server URL');
  console.log('  status               - Show connection status');
  console.log('  help                 - Show this help message');
  console.log('  exit                 - Exit the application\n');
}

// Show connection status
function showStatus() {
  const status = connected ? 'Connected' : 'Disconnected';
  const color = connected ? 'green' : 'red';
  
  log(`Status: ${status}`, color);
  if (connected) {
    log(`Server URL: ${serverUrl}`, 'cyan');
    log(`Socket ID: ${socket.id}`, 'cyan');
  } else {
    log(`Server URL: ${serverUrl}`, 'cyan');
  }
}

// Show prompt
function showPrompt() {
  rl.question('socket-test> ', (input) => {
    processCommand(input.trim());
  });
}

// Process user commands
function processCommand(input) {
  if (!input) {
    showPrompt();
    return;
  }

  const args = input.split(' ');
  const command = args[0].toLowerCase();

  switch (command) {
    case 'connect':
      const url = args[1] || serverUrl;
      serverUrl = url; // Update server URL
      connect(url);
      break;
      
    case 'disconnect':
      disconnect();
      showPrompt();
      break;
      
    case 'send':
      const message = args.slice(1).join(' ');
      if (!message) {
        log('Please provide a message to send', 'yellow');
      } else {
        sendMessage(message);
      }
      showPrompt();
      break;
      
    case 'url':
      if (args[1]) {
        serverUrl = args[1];
        log(`Server URL updated to: ${serverUrl}`, 'cyan');
      } else {
        log(`Current server URL: ${serverUrl}`, 'cyan');
      }
      showPrompt();
      break;
      
    case 'status':
      showStatus();
      showPrompt();
      break;
      
    case 'help':
      showHelp();
      showPrompt();
      break;
      
    case 'exit':
      if (socket) {
        disconnect();
      }
      log('Exiting application...', 'yellow');
      setTimeout(() => {
        rl.close();
        process.exit(0);
      }, 500);
      break;
      
    default:
      log(`Unknown command: ${command}. Type 'help' for available commands.`, 'red');
      showPrompt();
  }
}

// Initialize
console.log('\n=== Socket.io Test Client ===');
console.log('Type "help" for available commands');
console.log(`Default server URL: ${serverUrl}\n`);
showPrompt();

// Handle program exit
process.on('SIGINT', () => {
  log('\nReceived SIGINT. Closing connection and exiting...', 'yellow');
  if (socket) {
    disconnect();
  }
  rl.close();
  process.exit(0);
}); 