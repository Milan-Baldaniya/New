/**
 * Simple logger module for Socket.io server
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Default configuration
let config = {
  level: process.env.SOCKET_LOG_LEVEL || 'INFO',
  enableColors: true,
  timestamps: true
};

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Map log levels to colors
const levelColors = {
  ERROR: colors.red,
  WARN: colors.yellow,
  INFO: colors.green,
  DEBUG: colors.cyan
};

// Icons for log levels
const levelIcons = {
  ERROR: '❌',
  WARN: '⚠️',
  INFO: 'ℹ️',
  DEBUG: '🔍'
};

/**
 * Format a log message with timestamp, level, and color
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message) {
  let formattedMessage = '';
  
  // Add timestamp if enabled
  if (config.timestamps) {
    const timestamp = new Date().toISOString();
    formattedMessage += `[${timestamp}] `;
  }
  
  // Add level
  formattedMessage += `${levelIcons[level]} [${level}] `;
  
  // Add socket.io prefix
  formattedMessage += `[Socket.io] `;
  
  // Add message
  formattedMessage += message;
  
  // Add color if enabled
  if (config.enableColors) {
    return `${levelColors[level]}${formattedMessage}${colors.reset}`;
  }
  
  return formattedMessage;
}

/**
 * Log a message at a specific level
 * @param {string} level - Log level
 * @param {string} message - Log message
 */
function log(level, message) {
  // Check if this level should be logged
  const configLevel = LOG_LEVELS[config.level] || LOG_LEVELS.INFO;
  
  if (LOG_LEVELS[level] <= configLevel) {
    console.log(formatLogMessage(level, message));
  }
}

// Logger methods
const logger = {
  /**
   * Configure the logger
   * @param {Object} options - Configuration options
   */
  configure: (options = {}) => {
    config = { ...config, ...options };
    
    // Validate log level
    if (config.level && !LOG_LEVELS.hasOwnProperty(config.level)) {
      console.warn(`Invalid log level: ${config.level}. Using INFO instead.`);
      config.level = 'INFO';
    }
    
    logger.debug(`Logger configured: level=${config.level}, colors=${config.enableColors}`);
  },
  
  /**
   * Get current logger configuration
   * @returns {Object} Current configuration
   */
  getConfig: () => ({ ...config }),
  
  /**
   * Log an error message
   * @param {string} message - Error message
   */
  error: (message) => log('ERROR', message),
  
  /**
   * Log a warning message
   * @param {string} message - Warning message
   */
  warn: (message) => log('WARN', message),
  
  /**
   * Log an info message
   * @param {string} message - Info message
   */
  info: (message) => log('INFO', message),
  
  /**
   * Log a debug message
   * @param {string} message - Debug message
   */
  debug: (message) => log('DEBUG', message)
};

module.exports = logger; 