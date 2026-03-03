const activityLogService = require('./activityLog.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Activity Log Controller
 */

/**
 * Get activity logs
 */
exports.getActivityLogs = catchAsync(async (req, res) => {
  const result = await activityLogService.getActivityLogs(req.query);

  ApiResponse.paginated(
    res,
    result.logs,
    {
      page: result.page,
      pageSize: result.pageSize,
      totalItems: result.total,
      totalPages: result.totalPages,
    },
    'Activity logs retrieved successfully'
  );
});

/**
 * Get user activity summary
 */
exports.getUserActivitySummary = catchAsync(async (req, res) => {
  const userId = req.params.userId || req.user.id;
  const days = parseInt(req.query.days) || 30;

  const summary = await activityLogService.getUserActivitySummary(userId, days);

  ApiResponse.success(res, summary, 'User activity summary retrieved successfully');
});

/**
 * Get system activity statistics
 */
exports.getSystemActivityStats = catchAsync(async (req, res) => {
  const days = parseInt(req.query.days) || 30;

  const stats = await activityLogService.getSystemActivityStats(days);

  ApiResponse.success(res, stats, 'System activity statistics retrieved successfully');
});

/**
 * Get current user activity
 */
exports.getMyActivity = catchAsync(async (req, res) => {
  const result = await activityLogService.getActivityLogs({
    ...req.query,
    user: req.user.id,
  });

  ApiResponse.paginated(
    res,
    result.logs,
    {
      page: result.page,
      pageSize: result.pageSize,
      totalItems: result.total,
      totalPages: result.totalPages,
    },
    'Your activity logs retrieved successfully'
  );
});
