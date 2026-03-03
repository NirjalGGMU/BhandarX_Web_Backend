const notificationService = require('./notification.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Notification Controller
 */

/**
 * Get user notifications
 */
exports.getUserNotifications = catchAsync(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user.id, req.query);

  ApiResponse.paginated(
    res,
    result.notifications,
    {
      page: result.page,
      pageSize: result.pageSize,
      totalItems: result.total,
      totalPages: result.totalPages,
    },
    'Notifications retrieved successfully'
  );
});

/**
 * Mark notification as read
 */
exports.markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);

  ApiResponse.success(res, notification, 'Notification marked as read');
});

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);

  ApiResponse.success(res, { modifiedCount: result.modifiedCount }, 'All notifications marked as read');
});

/**
 * Delete notification
 */
exports.deleteNotification = catchAsync(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id);

  ApiResponse.success(res, null, 'Notification deleted successfully');
});

/**
 * Create custom notification (admin only)
 */
exports.createNotification = catchAsync(async (req, res) => {
  const notificationData = {
    ...req.body,
    type: 'CUSTOM',
  };

  const notification = await notificationService.createNotification(notificationData);

  ApiResponse.success(res, notification, 'Notification created successfully', HTTP_STATUS.CREATED);
});
