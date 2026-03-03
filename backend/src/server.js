require('dotenv').config();
const createApp = require('./app');
const connectDB = require('./config/database');
const config = require('./config');
const logger = require('./config/logger');
const socketService = require('./shared/services/socket.service');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error('Error:', err);
  console.error('Full error stack:', err);
  process.exit(1);
});

// Create Express app
const app = createApp();

// Connect to database
connectDB();

// Start server
const server = app.listen(config.port, () => {
  logger.info(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   🚀 BhandarX Inventory Management System API       ║
    ║                                                       ║
    ║   Environment: ${config.env.padEnd(37)}║
    ║   Port:        ${config.port.toString().padEnd(37)}║
    ║   API Version: ${config.apiVersion.padEnd(37)}║
    ║   URL:         http://localhost:${config.port.toString().padEnd(24)}║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
  `);
  logger.info(`Server is running on port ${config.port} in ${config.env} mode`);
});

// Initialize Socket.io
socketService.initialize(server);
logger.info('Socket.io server initialized for real-time updates');

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

module.exports = app;
