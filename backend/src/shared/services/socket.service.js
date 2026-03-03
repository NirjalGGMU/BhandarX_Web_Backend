const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const User = require('../../modules/auth/User.model');
const { ROLES } = require('../constants');
const logger = require('../../config/logger');

/**
 * Socket.io Service for Real-Time Updates
 * Handles WebSocket connections and real-time data broadcasting
 */
class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId mapping
  }

  /**
   * Initialize Socket.io server
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: config.corsOrigin || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await User.findById(decoded.id).select('-password');

        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        socket.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Connection event
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.user.name} (${socket.user.id})`);

      // Store user connection
      this.connectedUsers.set(socket.user.id.toString(), socket.id);

      // Join user to their personal room
      socket.join(`user:${socket.user.id}`);

      // Join user to role-based rooms
      socket.join(`role:${socket.user.role}`);

      // Send connection confirmation
      socket.emit('connected', {
        message: 'Successfully connected to real-time server',
        userId: socket.user.id,
        timestamp: new Date(),
      });

      // Subscribe to dashboard updates
      socket.on('subscribe:dashboard', () => {
        socket.join('dashboard');
        logger.info(`User ${socket.user.name} subscribed to dashboard updates`);
      });

      // Unsubscribe from dashboard updates
      socket.on('unsubscribe:dashboard', () => {
        socket.leave('dashboard');
        logger.info(`User ${socket.user.name} unsubscribed from dashboard updates`);
      });

      // Subscribe to inventory updates
      socket.on('subscribe:inventory', () => {
        socket.join('inventory');
        logger.info(`User ${socket.user.name} subscribed to inventory updates`);
      });

      // Unsubscribe from inventory updates
      socket.on('unsubscribe:inventory', () => {
        socket.leave('inventory');
        logger.info(`User ${socket.user.name} unsubscribed from inventory updates`);
      });

      // Subscribe to transaction updates
      socket.on('subscribe:transactions', () => {
        socket.join('transactions');
        logger.info(`User ${socket.user.name} subscribed to transaction updates`);
      });

      // Unsubscribe from transaction updates
      socket.on('unsubscribe:transactions', () => {
        socket.leave('transactions');
        logger.info(`User ${socket.user.name} unsubscribed from transaction updates`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.user.name}`);
        this.connectedUsers.delete(socket.user.id.toString());
      });
    });

    logger.info('Socket.io server initialized');
  }

  /**
   * Emit event to specific user
   */
  emitToUser(userId, event, data) {
    if (!this.io) return;

    const socketId = this.connectedUsers.get(userId.toString());
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  /**
   * Emit event to specific room
   */
  emitToRoom(room, event, data) {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
  }

  /**
   * Emit event to all users with specific role
   */
  emitToRole(role, event, data) {
    if (!this.io) return;
    this.io.to(`role:${role}`).emit(event, data);
  }

  /**
   * Broadcast event to all connected users
   */
  broadcast(event, data) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  /**
   * Emit stock update event
   */
  emitStockUpdate(product) {
    this.emitToRoom('inventory', 'stock:updated', {
      type: 'STOCK_UPDATE',
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        reorderPoint: product.reorderPoint,
        isLowStock: product.quantity <= product.reorderPoint,
        isOutOfStock: product.quantity === 0,
      },
      timestamp: new Date(),
    });
  }

  /**
   * Emit low stock alert
   */
  emitLowStockAlert(product) {
    // Send to admins
    this.emitToRole(ROLES.ADMIN, 'stock:low-stock-alert', {
      type: 'LOW_STOCK_ALERT',
      severity: product.quantity === 0 ? 'CRITICAL' : 'WARNING',
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        reorderPoint: product.reorderPoint,
      },
      timestamp: new Date(),
    });
  }

  /**
   * Emit sale created event
   */
  emitSaleCreated(sale) {
    this.emitToRoom('transactions', 'sale:created', {
      type: 'SALE_CREATED',
      sale: {
        id: sale._id,
        invoiceNumber: sale.invoiceNumber,
        customer: sale.customer,
        totalAmount: sale.totalAmount,
        status: sale.status,
        paymentStatus: sale.paymentStatus,
        createdAt: sale.createdAt,
      },
      timestamp: new Date(),
    });

    // Update dashboard
    this.emitToRoom('dashboard', 'dashboard:sale-created', {
      type: 'DASHBOARD_UPDATE',
      action: 'SALE_CREATED',
      timestamp: new Date(),
    });
  }

  /**
   * Emit purchase created event
   */
  emitPurchaseCreated(purchase) {
    this.emitToRoom('transactions', 'purchase:created', {
      type: 'PURCHASE_CREATED',
      purchase: {
        id: purchase._id,
        poNumber: purchase.poNumber,
        supplier: purchase.supplier,
        totalAmount: purchase.totalAmount,
        status: purchase.status,
        createdAt: purchase.createdAt,
      },
      timestamp: new Date(),
    });

    // Update dashboard
    this.emitToRoom('dashboard', 'dashboard:purchase-created', {
      type: 'DASHBOARD_UPDATE',
      action: 'PURCHASE_CREATED',
      timestamp: new Date(),
    });
  }

  /**
   * Emit purchase received event
   */
  emitPurchaseReceived(purchase) {
    this.emitToRoom('transactions', 'purchase:received', {
      type: 'PURCHASE_RECEIVED',
      purchase: {
        id: purchase._id,
        poNumber: purchase.poNumber,
        status: purchase.status,
        receivedAt: new Date(),
      },
      timestamp: new Date(),
    });
  }

  /**
   * Emit notification event to specific user
   */
  emitNotification(userId, notification) {
    this.emitToUser(userId, 'notification:new', {
      type: 'NEW_NOTIFICATION',
      notification: {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        createdAt: notification.createdAt,
      },
      timestamp: new Date(),
    });
  }

  /**
   * Emit dashboard data update
   */
  emitDashboardUpdate() {
    this.emitToRoom('dashboard', 'dashboard:update', {
      type: 'DASHBOARD_UPDATE',
      timestamp: new Date(),
    });
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId) {
    return this.connectedUsers.has(userId.toString());
  }
}

module.exports = new SocketService();
