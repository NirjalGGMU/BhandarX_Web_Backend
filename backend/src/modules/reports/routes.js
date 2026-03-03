const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { protect, authorize } = require('../../shared/middleware/auth');
const { ROLES } = require('../../shared/constants');

/**
 * Reports & Dashboard Routes
 * All routes require authentication
 */

/**
 * @swagger
 * /reports/dashboard/summary:
 *   get:
 *     summary: Get comprehensive dashboard summary with key metrics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
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
 *                     sales:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 150000
 *                         count:
 *                           type: integer
 *                           example: 250
 *                     inventory:
 *                       type: object
 *                       properties:
 *                         totalProducts:
 *                           type: integer
 *                           example: 500
 *                         lowStockItems:
 *                           type: integer
 *                           example: 15
 *                     customers:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 150
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/dashboard/summary',
  protect,
  dashboardController.getDashboardSummary
);

/**
 * @swagger
 * /reports/inventory/valuation:
 *   get:
 *     summary: Get total inventory valuation report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory valuation retrieved successfully
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
 *                     totalValue:
 *                       type: number
 *                       example: 500000
 *                     totalCost:
 *                       type: number
 *                       example: 400000
 *                     totalProducts:
 *                       type: integer
 *                       example: 500
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/inventory/valuation',
  protect,
  authorize(ROLES.ADMIN),
  dashboardController.getInventoryValuation
);

/**
 * @swagger
 * /reports/inventory/low-stock:
 *   get:
 *     summary: Get products with low stock levels
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock products retrieved successfully
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/inventory/low-stock',
  protect,
  dashboardController.getLowStockProducts
);

/**
 * @swagger
 * /reports/sales/top-products:
 *   get:
 *     summary: Get top selling products report
 *     tags: [Reports]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top selling products retrieved successfully
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/sales/top-products',
  protect,
  dashboardController.getTopSellingProducts
);

/**
 * @swagger
 * /reports/sales/trends:
 *   get:
 *     summary: Get sales trends over time
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
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
 *         description: Sales trends retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/sales/trends',
  protect,
  authorize(ROLES.ADMIN),
  dashboardController.getSalesTrends
);

/**
 * @swagger
 * /reports/sales/payment-methods:
 *   get:
 *     summary: Get sales distribution by payment methods
 *     tags: [Reports]
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
 *         description: Payment method distribution retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/sales/payment-methods',
  protect,
  authorize(ROLES.ADMIN),
  dashboardController.getPaymentMethodDistribution
);

/**
 * @swagger
 * /reports/sales/category-wise:
 *   get:
 *     summary: Get category-wise sales report
 *     tags: [Reports]
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
 *         description: Category-wise sales retrieved successfully
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/sales/category-wise',
  protect,
  authorize(ROLES.ADMIN),
  dashboardController.getCategoryWiseSales
);

/**
 * @swagger
 * /reports/customers/analytics:
 *   get:
 *     summary: Get customer analytics and insights
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer analytics retrieved successfully
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
 *                     totalCustomers:
 *                       type: integer
 *                       example: 150
 *                     activeCustomers:
 *                       type: integer
 *                       example: 120
 *                     topCustomers:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/customers/analytics',
  protect,
  authorize(ROLES.ADMIN),
  dashboardController.getCustomerAnalytics
);

module.exports = router;
