const Notification = require('./Notification.model');
const User = require('../auth/User.model');
const { ROLES } = require('../../shared/constants');
const emailService = require('./email.service');
const AppError = require('../../shared/utils/AppError');
const { HTTP_STATUS } = require('../../shared/constants');
const socketService = require('../../shared/services/socket.service');

/**
 * Notification Service
 * Handles creation and delivery of notifications
 */
class NotificationService {
  /**
   * Create and send notification
   */
  async createNotification(notificationData) {
    const notification = await Notification.create(notificationData);

    // Send through enabled channels
    await this.sendNotification(notification);

    return notification;
  }

  /**
   * Send notification through various channels
   */
  async sendNotification(notification) {
    const user = await User.findById(notification.recipient).select('email name fcmToken notificationPreferences');

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check user preferences
    const preferences = user.notificationPreferences || {
      email: true,
      push: true,
      inApp: true,
    };

    // Send email notification
    if (preferences.email && !notification.channels.email.sent) {
      try {
        await emailService.sendNotificationEmail(user.email, {
          name: user.name,
          title: notification.title,
          message: notification.message,
          actionUrl: notification.actionUrl,
        });

        notification.channels.email.sent = true;
        notification.channels.email.sentAt = new Date();
      } catch (error) {
        notification.channels.email.error = error.message;
      }
    }

    // Send push notification (FCM-ready structure)
    if (preferences.push && user.fcmToken && !notification.channels.push.sent) {
      try {
        await this.sendPushNotification(user.fcmToken, notification);
        notification.channels.push.sent = true;
        notification.channels.push.sentAt = new Date();
      } catch (error) {
        notification.channels.push.error = error.message;
      }
    }

    // In-app notification via Socket.io
    if (!notification.channels.inApp.sent) {
      notification.channels.inApp.sent = true;
      notification.channels.inApp.sentAt = new Date();

      // Emit real-time notification via Socket.io
      socketService.emitNotification(notification.recipient, notification);
    }

    await notification.save();
    return notification;
  }

  /**
   * Send push notification (FCM-ready)
   */
  async sendPushNotification(fcmToken, notification) {
    // FCM implementation placeholder
    // This will be implemented when Firebase Admin SDK is configured

    const payload = {
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: {
        type: notification.type,
        notificationId: notification._id.toString(),
        ...notification.data,
      },
      token: fcmToken,
    };

    // TODO: Implement FCM send
    // await admin.messaging().send(payload);

    console.log('Push notification payload:', payload);
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, filters = {}) {
    const query = { recipient: userId };

    if (filters.isRead !== undefined) {
      query.isRead = filters.isRead;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    const page = parseInt(filters.page) || 1;
    const pageSize = parseInt(filters.pageSize) || 20;
    const skip = (page - 1) * pageSize;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
    }

    return await notification.markAsRead();
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return result;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
    }

    return notification;
  }

  /**
   * Send low stock alert to managers and admins
   */
  async sendLowStockAlert(product) {
    const managers = await User.find({
      role: ROLES.ADMIN,
      isActive: true,
    });

    const notifications = managers.map((manager) => ({
      recipient: manager._id,
      type: 'LOW_STOCK',
      priority: product.quantity === 0 ? 'CRITICAL' : 'HIGH',
      title: product.quantity === 0 ? 'Product Out of Stock' : 'Low Stock Alert',
      message: `${product.name} (SKU: ${product.sku}) has ${product.quantity} units remaining. Reorder point: ${product.reorderPoint}`,
      data: {
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: product.quantity,
        reorderPoint: product.reorderPoint,
      },
      actionUrl: `/products/${product._id}`,
    }));

    return await Promise.all(
      notifications.map((notif) => this.createNotification(notif))
    );
  }

  /**
   * Send sale completed notification
   */
  async sendSaleCompletedNotification(sale, userId) {
    return await this.createNotification({
      recipient: userId,
      type: 'SALE_COMPLETED',
      priority: 'MEDIUM',
      title: 'Sale Completed',
      message: `Sale invoice ${sale.invoiceNumber} completed. Total: ₹${sale.totalAmount}`,
      data: {
        saleId: sale._id,
        invoiceNumber: sale.invoiceNumber,
        totalAmount: sale.totalAmount,
      },
      actionUrl: `/sales/${sale._id}`,
    });
  }

  /**
   * Send purchase received notification
   */
  async sendPurchaseReceivedNotification(purchase, userId) {
    return await this.createNotification({
      recipient: userId,
      type: 'PURCHASE_RECEIVED',
      priority: 'MEDIUM',
      title: 'Purchase Order Received',
      message: `Purchase order ${purchase.poNumber} has been received.`,
      data: {
        purchaseId: purchase._id,
        poNumber: purchase.poNumber,
        totalAmount: purchase.totalAmount,
      },
      actionUrl: `/purchases/${purchase._id}`,
    });
  }

  /**
   * Send payment overdue notification
   */
  async sendPaymentOverdueNotification(sale) {
    const managers = await User.find({
      role: ROLES.ADMIN,
      isActive: true,
    });

    const notifications = managers.map((manager) => ({
      recipient: manager._id,
      type: 'PAYMENT_OVERDUE',
      priority: 'HIGH',
      title: 'Payment Overdue',
      message: `Invoice ${sale.invoiceNumber} is overdue. Balance: ₹${sale.balanceAmount}`,
      data: {
        saleId: sale._id,
        invoiceNumber: sale.invoiceNumber,
        balanceAmount: sale.balanceAmount,
        dueDate: sale.dueDate,
      },
      actionUrl: `/sales/${sale._id}`,
    }));

    return await Promise.all(
      notifications.map((notif) => this.createNotification(notif))
    );
  }

  /**
   * Send role changed notification
   */
  async sendRoleChangedNotification(userId, oldRole, newRole, changedBy) {
    return await this.createNotification({
      recipient: userId,
      type: 'ROLE_CHANGED',
      priority: 'HIGH',
      title: 'Role Changed',
      message: `Your role has been changed from ${oldRole} to ${newRole}`,
      data: {
        oldRole,
        newRole,
        changedBy,
      },
    });
  }
}

module.exports = new NotificationService();
