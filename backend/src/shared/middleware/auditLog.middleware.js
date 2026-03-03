const activityLogService = require('../../modules/activityLogs/activityLog.service');
const logger = require('../../config/logger');

/**
 * Activity Log Middleware
 * Automatically logs certain API activities
 */
const auditLog = (options = {}) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function to capture response
    res.send = function (data) {
      // Restore original send
      res.send = originalSend;

      // Log activity if request was successful and user is authenticated
      if (req.user && res.statusCode >= 200 && res.statusCode < 400) {
        const logData = {
          user: req.user.id,
          metadata: {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
          },
          ...options,
        };

        // Don't await to prevent blocking response
        activityLogService.log(logData).catch((error) => {
          logger.error('Failed to log activity:', error);
        });
      }

      // Send response
      return originalSend.call(this, data);
    };

    next();
  };
};

module.exports = auditLog;
