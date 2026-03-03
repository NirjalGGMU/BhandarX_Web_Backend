const express = require('express');
const router = express.Router();
const saleController = require('./sale.controller');
const { protect, authorize } = require('../../shared/middleware/auth');
const validate = require('../../shared/middleware/validate');
const {
  createSaleValidation,
  updateSaleValidation,
  saleIdValidation,
  invoiceNumberValidation,
  reverseSaleValidation,
  saleFilterValidation,
  reportDateValidation,
} = require('./sale.validator');
const { ROLES } = require('../../shared/constants');

/**
 * Sales Routes
 * All routes require authentication
 */

/**
 * @swagger
 * /sales/summary:
 *   get:
 *     summary: Get sales summary statistics
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *     responses:
 *       200:
 *         description: Sales summary retrieved successfully
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
 *                     totalSales:
 *                       type: number
 *                       example: 150000
 *                     totalOrders:
 *                       type: integer
 *                       example: 250
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/summary',
  protect,
  authorize(ROLES.ADMIN),
  reportDateValidation,
  validate,
  saleController.getSalesSummary
);

/**
 * @swagger
 * /sales/reports/daily:
 *   get:
 *     summary: Get daily sales report
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for the report
 *     responses:
 *       200:
 *         description: Daily sales report retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/reports/daily',
  protect,
  authorize(ROLES.ADMIN),
  reportDateValidation,
  validate,
  saleController.getDailySalesReport
);

/**
 * @swagger
 * /sales/reports/top-products:
 *   get:
 *     summary: Get top selling products report
 *     tags: [Sales]
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/reports/top-products',
  protect,
  authorize(ROLES.ADMIN),
  reportDateValidation,
  validate,
  saleController.getTopSellingProducts
);

/**
 * @swagger
 * /sales/reports/payment-methods:
 *   get:
 *     summary: Get sales breakdown by payment methods
 *     tags: [Sales]
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
 *         description: Sales by payment method retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/reports/payment-methods',
  protect,
  authorize(ROLES.ADMIN),
  reportDateValidation,
  validate,
  saleController.getSalesByPaymentMethod
);

/**
 * @swagger
 * /sales/overdue:
 *   get:
 *     summary: Get overdue sales (unpaid invoices past due date)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue sales retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/overdue',
  protect,
  authorize(ROLES.ADMIN),
  saleController.getOverdueSales
);

/**
 * @swagger
 * /sales/customer/{customerId}:
 *   get:
 *     summary: Get all sales for a specific customer
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer sales retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/customer/:customerId',
  protect,
  saleController.getSalesByCustomer
);

/**
 * @swagger
 * /sales/customer/{customerId}/history:
 *   get:
 *     summary: Get customer purchase history with analytics
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer purchase history retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/customer/:customerId/history',
  protect,
  saleController.getCustomerPurchaseHistory
);

/**
 * @swagger
 * /sales/invoice/{invoiceNumber}:
 *   get:
 *     summary: Get sale by invoice number
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice number
 *         example: INV-2024-001
 *     responses:
 *       200:
 *         description: Sale retrieved successfully
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/invoice/:invoiceNumber',
  protect,
  invoiceNumberValidation,
  validate,
  saleController.getSaleByInvoiceNumber
);

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer, items, paymentMethod]
 *             properties:
 *               customer:
 *                 type: string
 *                 example: 60d5ec49f95b2a1a8c8b4567
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product, quantity, price]
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: 60d5ec49f95b2a1a8c8b4568
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     price:
 *                       type: number
 *                       example: 1500.00
 *                     discount:
 *                       type: number
 *                       example: 50.00
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, bank_transfer, credit]
 *                 example: card
 *               paymentStatus:
 *                 type: string
 *                 enum: [paid, partial, unpaid]
 *                 default: paid
 *               amountPaid:
 *                 type: number
 *                 example: 2950.00
 *               discount:
 *                 type: number
 *                 example: 100.00
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale created successfully
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
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/',
  protect,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  createSaleValidation,
  validate,
  saleController.createSale
);

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Get all sales with pagination and filtering
 *     tags: [Sales]
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
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by invoice number
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [paid, partial, unpaid]
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
 *         description: List of sales retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  protect,
  saleFilterValidation,
  validate,
  saleController.getAllSales
);

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale retrieved successfully
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  protect,
  saleIdValidation,
  validate,
  saleController.getSaleById
);

/**
 * @swagger
 * /sales/{id}/payment:
 *   patch:
 *     summary: Update payment information for a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amountPaid:
 *                 type: number
 *                 example: 1500.00
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, bank_transfer, credit]
 *               paymentStatus:
 *                 type: string
 *                 enum: [paid, partial, unpaid]
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/:id/payment',
  protect,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  updateSaleValidation,
  validate,
  saleController.updatePayment
);

/**
 * @swagger
 * /sales/{id}/reverse:
 *   post:
 *     summary: Reverse a sale (refund/return)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Customer requested refund
 *               items:
 *                 type: array
 *                 description: Specific items to reverse (optional, defaults to all)
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Sale reversed successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:id/reverse',
  protect,
  authorize(ROLES.ADMIN),
  reverseSaleValidation,
  validate,
  saleController.reverseSale
);

/**
 * @swagger
 * /sales/{id}/cancel:
 *   patch:
 *     summary: Cancel a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale cancelled successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/:id/cancel',
  protect,
  authorize(ROLES.ADMIN),
  saleIdValidation,
  validate,
  saleController.cancelSale
);

/**
 * @swagger
 * /sales/{id}:
 *   delete:
 *     summary: Delete a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:id',
  protect,
  authorize(ROLES.ADMIN),
  saleIdValidation,
  validate,
  saleController.deleteSale
);

module.exports = router;
