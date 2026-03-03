const express = require('express');
const router = express.Router();
const activityLogController = require('./activityLog.controller');
const { protect, authorize } = require('../../shared/middleware/auth');
const { ROLES } = require('../../shared/constants');

/**
 * Activity Log Routes
 * All routes require authentication
 */

/**
 * @swagger
 * /activity-logs/my-activity:
 *   get:
 *     summary: Get activity logs for the current user
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, update, delete, login, logout]
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: User activity logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       action:
 *                         type: string
 *                         example: create
 *                       module:
 *                         type: string
 *                         example: products
 *                       description:
 *                         type: string
 *                         example: Created new product
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/my-activity',
  protect,
  activityLogController.getMyActivity
);

/**
 * @swagger
 * /activity-logs/system-stats:
 *   get:
 *     summary: Get system-wide activity statistics (admin/manager only)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: System activity statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalActivities:
 *                       type: integer
 *                       example: 5000
 *                     byAction:
 *                       type: object
 *                       properties:
 *                         create:
 *                           type: integer
 *                           example: 1500
 *                         update:
 *                           type: integer
 *                           example: 2000
 *                         delete:
 *                           type: integer
 *                           example: 500
 *                     byModule:
 *                       type: object
 *                     activeUsers:
 *                       type: integer
 *                       example: 25
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/system-stats',
  protect,
  authorize(ROLES.ADMIN),
  activityLogController.getSystemActivityStats
);

/**
 * @swagger
 * /activity-logs/users/{userId}/summary:
 *   get:
 *     summary: Get activity summary for a specific user (admin/manager only)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: User activity summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     totalActivities:
 *                       type: integer
 *                       example: 150
 *                     byAction:
 *                       type: object
 *                     lastActivity:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/users/:userId/summary',
  protect,
  authorize(ROLES.ADMIN),
  activityLogController.getUserActivitySummary
);

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     summary: Get all activity logs (admin/manager only)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, update, delete, login, logout]
 *         description: Filter by action type
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         description: Filter by module (e.g., products, sales, customers)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/',
  protect,
  authorize(ROLES.ADMIN),
  activityLogController.getActivityLogs
);

module.exports = router;
