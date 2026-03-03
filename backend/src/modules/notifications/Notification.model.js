const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'LOW_STOCK',
        'OUT_OF_STOCK',
        'SALE_COMPLETED',
        'PURCHASE_RECEIVED',
        'PAYMENT_DUE',
        'PAYMENT_OVERDUE',
        'USER_LOGIN',
        'ROLE_CHANGED',
        'SYSTEM_ALERT',
        'CUSTOM',
      ],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: 1000,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    channels: {
      push: {
        sent: { type: Boolean, default: false },
        sentAt: { type: Date },
        error: { type: String },
      },
      email: {
        sent: { type: Boolean, default: false },
        sentAt: { type: Date },
        error: { type: String },
      },
      inApp: {
        sent: { type: Boolean, default: true },
        sentAt: { type: Date, default: Date.now },
      },
    },
    actionUrl: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for isExpired
notificationSchema.virtual('isExpired').get(function () {
  return this.expiresAt && this.expiresAt < new Date();
});

// Mark notification as read
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
