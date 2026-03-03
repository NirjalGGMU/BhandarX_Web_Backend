const express = require('express');
const router = express.Router();
const transactionController = require('./transaction.controller');
const { protect, authorize } = require('../../shared/middleware/auth');
const validate = require('../../shared/middleware/validate');
const { ROLES } = require('../../shared/constants');
const {
  createTransactionValidation,
  transactionIdValidation,
  productIdValidation,
  dateRangeValidation,
} = require('./transaction.validator');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions with pagination
 *     tags: [Transactions]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [stock_in, stock_out, adjustment]
 *         description: Filter by transaction type
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *         description: Filter by product ID
 *     responses:
 *       200:
 *         description: List of transactions retrieved successfully
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
router.get('/', transactionController.getAllTransactions);

/**
 * @swagger
 * /transactions/recent:
 *   get:
 *     summary: Get recent transactions (last 50)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent transactions retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/recent', transactionController.getRecentTransactions);

/**
 * @swagger
 * /transactions/summary:
 *   get:
 *     summary: Get transaction summary statistics
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction summary retrieved successfully
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
 *                     totalStockIn:
 *                       type: integer
 *                       example: 500
 *                     totalStockOut:
 *                       type: integer
 *                       example: 300
 *                     totalAdjustments:
 *                       type: integer
 *                       example: 20
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/summary', transactionController.getTransactionSummary);

/**
 * @swagger
 * /transactions/date-range:
 *   get:
 *     summary: Get transactions within a date range
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/date-range', dateRangeValidation, validate, transactionController.getTransactionsByDateRange);

/**
 * @swagger
 * /transactions/product/{productId}:
 *   get:
 *     summary: Get all transactions for a specific product
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product transactions retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/product/:productId', productIdValidation, validate, transactionController.getProductTransactions);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
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
router.get('/:id', transactionIdValidation, validate, transactionController.getTransactionById);

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction (stock in/out/adjustment)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product, type, quantity]
 *             properties:
 *               product:
 *                 type: string
 *                 example: 60d5ec49f95b2a1a8c8b4568
 *               type:
 *                 type: string
 *                 enum: [stock_in, stock_out, adjustment]
 *                 example: stock_in
 *               quantity:
 *                 type: integer
 *                 example: 100
 *               reason:
 *                 type: string
 *                 example: Stock replenishment from supplier
 *               reference:
 *                 type: string
 *                 example: PO-2024-001
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
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
  authorize(ROLES.ADMIN),
  createTransactionValidation,
  validate,
  transactionController.createTransaction
);

module.exports = router;
