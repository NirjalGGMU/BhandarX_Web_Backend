const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'LOGIN_FAILED',
        'CREATE',
        'UPDATE',
        'DELETE',
        'STOCK_ADJUSTMENT',
        'ROLE_CHANGE',
        'SALE_COMPLETED',
        'SALE_REVERSED',
        'PURCHASE_CREATED',
        'PURCHASE_RECEIVED',
        'PASSWORD_CHANGED',
        'SETTINGS_UPDATED',
        'BULK_IMPORT',
        'BULK_EXPORT',
      ],
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      enum: [
        'USER',
        'PRODUCT',
        'CATEGORY',
        'CUSTOMER',
        'SUPPLIER',
        'SALE',
        'PURCHASE',
        'TRANSACTION',
        'VARIANT',
        'AUTH',
        'SETTINGS',
      ],
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    changes: {
      before: {
        type: mongoose.Schema.Types.Mixed,
      },
      after: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      location: String,
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
      default: 'INFO',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ resourceType: 1, resourceId: 1 });
activityLogSchema.index({ createdAt: -1 });

// TTL index to auto-delete logs after 365 days (optional)
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
