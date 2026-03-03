const ActivityLog = require('./ActivityLog.model');
const AppError = require('../../shared/utils/AppError');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Activity Log Service
 * Tracks user actions and system events for audit trail
 */
class ActivityLogService {
  /**
   * Create activity log entry
   */
  async log(logData) {
    try {
      const log = await ActivityLog.create(logData);
      return log;
    } catch (error) {
      console.error('Failed to create activity log:', error);
      // Don't throw error to prevent disrupting main operations
      return null;
    }
  }

  /**
   * Log user login
   */
  async logLogin(userId, ipAddress, userAgent, status = 'SUCCESS') {
    return await this.log({
      user: userId,
      action: status === 'SUCCESS' ? 'LOGIN' : 'LOGIN_FAILED',
      resourceType: 'AUTH',
      description: status === 'SUCCESS' ? 'User logged in successfully' : 'Login attempt failed',
      status,
      severity: status === 'SUCCESS' ? 'INFO' : 'WARNING',
      metadata: {
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Log user logout
   */
  async logLogout(userId, ipAddress, userAgent) {
    return await this.log({
      user: userId,
      action: 'LOGOUT',
      resourceType: 'AUTH',
      description: 'User logged out',
      status: 'SUCCESS',
      severity: 'INFO',
      metadata: {
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Log resource creation
   */
  async logCreate(userId, resourceType, resourceId, description, data) {
    return await this.log({
      user: userId,
      action: 'CREATE',
      resourceType,
      resourceId,
      description,
      changes: {
        after: data,
      },
      status: 'SUCCESS',
      severity: 'INFO',
    });
  }

  /**
   * Log resource update
   */
  async logUpdate(userId, resourceType, resourceId, description, before, after) {
    return await this.log({
      user: userId,
      action: 'UPDATE',
      resourceType,
      resourceId,
      description,
      changes: {
        before,
        after,
      },
      status: 'SUCCESS',
      severity: 'INFO',
    });
  }

  /**
   * Log resource deletion
   */
  async logDelete(userId, resourceType, resourceId, description, data) {
    return await this.log({
      user: userId,
      action: 'DELETE',
      resourceType,
      resourceId,
      description,
      changes: {
        before: data,
      },
      status: 'SUCCESS',
      severity: 'WARNING',
    });
  }

  /**
   * Log stock adjustment
   */
  async logStockAdjustment(userId, productId, description, before, after) {
    return await this.log({
      user: userId,
      action: 'STOCK_ADJUSTMENT',
      resourceType: 'PRODUCT',
      resourceId: productId,
      description,
      changes: {
        before,
        after,
      },
      status: 'SUCCESS',
      severity: 'INFO',
    });
  }

  /**
   * Log role change
   */
  async logRoleChange(userId, targetUserId, description, oldRole, newRole) {
    return await this.log({
      user: userId,
      action: 'ROLE_CHANGE',
      resourceType: 'USER',
      resourceId: targetUserId,
      description,
      changes: {
        before: { role: oldRole },
        after: { role: newRole },
      },
      status: 'SUCCESS',
      severity: 'WARNING',
    });
  }

  /**
   * Log sale completion
   */
  async logSaleCompleted(userId, saleId, description, saleData) {
    return await this.log({
      user: userId,
      action: 'SALE_COMPLETED',
      resourceType: 'SALE',
      resourceId: saleId,
      description,
      changes: {
        after: saleData,
      },
      status: 'SUCCESS',
      severity: 'INFO',
    });
  }

  /**
   * Log sale reversal
   */
  async logSaleReversal(userId, saleId, description, reason) {
    return await this.log({
      user: userId,
      action: 'SALE_REVERSED',
      resourceType: 'SALE',
      resourceId: saleId,
      description,
      changes: {
        after: { reversalReason: reason },
      },
      status: 'SUCCESS',
      severity: 'WARNING',
    });
  }

  /**
   * Get activity logs with filters
   */
  async getActivityLogs(filters = {}) {
    const query = {};

    if (filters.user) {
      query.user = filters.user;
    }

    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.resourceType) {
      query.resourceType = filters.resourceType;
    }

    if (filters.resourceId) {
      query.resourceId = filters.resourceId;
    }

    if (filters.severity) {
      query.severity = filters.severity;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const page = parseInt(filters.page) || 1;
    const pageSize = parseInt(filters.pageSize) || 50;
    const skip = (page - 1) * pageSize;

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      ActivityLog.countDocuments(query),
    ]);

    return {
      logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const summary = await ActivityLog.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalActivities = await ActivityLog.countDocuments({
      user: userId,
      createdAt: { $gte: startDate },
    });

    return {
      summary,
      totalActivities,
      period: `Last ${days} days`,
    };
  }

  /**
   * Get system activity statistics
   */
  async getSystemActivityStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [actionStats, userStats, severityStats, dailyStats] = await Promise.all([
      // Actions breakdown
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Most active users
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$user',
            activityCount: { $sum: 1 },
          },
        },
        { $sort: { activityCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $project: {
            userName: { $arrayElemAt: ['$userDetails.name', 0] },
            userEmail: { $arrayElemAt: ['$userDetails.email', 0] },
            activityCount: 1,
          },
        },
      ]),

      // Severity breakdown
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 },
          },
        },
      ]),

      // Daily activity trend
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      actionStats,
      userStats,
      severityStats,
      dailyStats,
      period: `Last ${days} days`,
    };
  }
}

module.exports = new ActivityLogService();
