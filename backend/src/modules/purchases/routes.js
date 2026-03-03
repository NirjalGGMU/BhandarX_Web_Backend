const express = require('express');
const router = express.Router();
const purchaseController = require('./purchase.controller');
const { protect, authorize } = require('../../shared/middleware/auth');
const validate = require('../../shared/middleware/validate');
const {
  createPurchaseOrderValidation,
  updatePurchaseOrderValidation,
  purchaseOrderIdValidation,
  poNumberValidation,
  receiveItemsValidation,
  purchaseOrderFilterValidation,
  reportDateValidation,
} = require('./purchase.validator');
const { ROLES } = require('../../shared/constants');

/**
 * Purchase Order Routes
 * All routes require authentication
 */

/**
 * @swagger
 * /purchases/summary:
 *   get:
 *     summary: Get purchase order summary statistics
 *     tags: [Purchases]
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
 *         description: Purchase summary retrieved successfully
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
 *                     totalPurchases:
 *                       type: number
 *                       example: 75000
 *                     totalOrders:
 *                       type: integer
 *                       example: 50
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
  purchaseController.getPurchasesSummary
);

/**
 * @swagger
 * /purchases/reports/daily:
 *   get:
 *     summary: Get daily purchase report
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Daily purchase report retrieved successfully
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
  purchaseController.getDailyPurchaseReport
);

/**
 * @swagger
 * /purchases/reports/most-purchased:
 *   get:
 *     summary: Get most purchased products report
 *     tags: [Purchases]
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
 *         description: Most purchased products retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/reports/most-purchased',
  protect,
  authorize(ROLES.ADMIN),
  reportDateValidation,
  validate,
  purchaseController.getMostPurchasedProducts
);

/**
 * @swagger
 * /purchases/pending:
 *   get:
 *     summary: Get pending deliveries (purchase orders not fully received)
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending deliveries retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/pending',
  protect,
  authorize(ROLES.ADMIN),
  purchaseController.getPendingDeliveries
);

/**
 * @swagger
 * /purchases/overdue:
 *   get:
 *     summary: Get overdue deliveries (past expected delivery date)
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue deliveries retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/overdue',
  protect,
  authorize(ROLES.ADMIN),
  purchaseController.getOverdueDeliveries
);

/**
 * @swagger
 * /purchases/supplier/{supplierId}:
 *   get:
 *     summary: Get all purchase orders for a specific supplier
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier purchase orders retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/supplier/:supplierId',
  protect,
  purchaseController.getPurchaseOrdersBySupplier
);

/**
 * @swagger
 * /purchases/supplier/{supplierId}/history:
 *   get:
 *     summary: Get supplier purchase history with analytics
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier purchase history retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/supplier/:supplierId/history',
  protect,
  purchaseController.getSupplierPurchaseHistory
);

/**
 * @swagger
 * /purchases/po/{poNumber}:
 *   get:
 *     summary: Get purchase order by PO number
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order number
 *         example: PO-2024-001
 *     responses:
 *       200:
 *         description: Purchase order retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/po/:poNumber',
  protect,
  poNumberValidation,
  validate,
  purchaseController.getPurchaseOrderByPONumber
);

/**
 * @swagger
 * /purchases:
 *   post:
 *     summary: Create a new purchase order
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [supplier, items]
 *             properties:
 *               supplier:
 *                 type: string
 *                 example: 60d5ec49f95b2a1a8c8b4567
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product, quantity, unitPrice]
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: 60d5ec49f95b2a1a8c8b4568
 *                     quantity:
 *                       type: integer
 *                       example: 100
 *                     unitPrice:
 *                       type: number
 *                       example: 50.00
 *               expectedDeliveryDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-01"
 *               paymentTerms:
 *                 type: string
 *                 example: Net 30
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Purchase order created successfully
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
  authorize(ROLES.ADMIN),
  createPurchaseOrderValidation,
  validate,
  purchaseController.createPurchaseOrder
);

/**
 * @swagger
 * /purchases:
 *   get:
 *     summary: Get all purchase orders with pagination and filtering
 *     tags: [Purchases]
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
 *         description: Search by PO number
 *       - in: query
 *         name: supplier
 *         schema:
 *           type: string
 *         description: Filter by supplier ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, partial, received, cancelled]
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
 *         description: List of purchase orders retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  protect,
  purchaseOrderFilterValidation,
  validate,
  purchaseController.getAllPurchaseOrders
);

/**
 * @swagger
 * /purchases/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order retrieved successfully
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
  purchaseOrderIdValidation,
  validate,
  purchaseController.getPurchaseOrderById
);

/**
 * @swagger
 * /purchases/{id}:
 *   put:
 *     summary: Update an existing purchase order
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               expectedDeliveryDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Purchase order updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/:id',
  protect,
  authorize(ROLES.ADMIN),
  updatePurchaseOrderValidation,
  validate,
  purchaseController.updatePurchaseOrder
);

/**
 * @swagger
 * /purchases/{id}/receive:
 *   post:
 *     summary: Receive items from a purchase order
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product, quantityReceived]
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: 60d5ec49f95b2a1a8c8b4568
 *                     quantityReceived:
 *                       type: integer
 *                       example: 50
 *               receivedDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Items received successfully
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
  '/:id/receive',
  protect,
  authorize(ROLES.ADMIN),
  receiveItemsValidation,
  validate,
  purchaseController.receiveItems
);

/**
 * @swagger
 * /purchases/{id}/payment:
 *   patch:
 *     summary: Update payment information for a purchase order
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amountPaid:
 *                 type: number
 *                 example: 5000.00
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
  authorize(ROLES.ADMIN),
  updatePurchaseOrderValidation,
  validate,
  purchaseController.updatePayment
);

/**
 * @swagger
 * /purchases/{id}/cancel:
 *   patch:
 *     summary: Cancel a purchase order
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order cancelled successfully
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
  purchaseOrderIdValidation,
  validate,
  purchaseController.cancelPurchaseOrder
);

/**
 * @swagger
 * /purchases/{id}:
 *   delete:
 *     summary: Delete a purchase order
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order deleted successfully
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
  purchaseOrderIdValidation,
  validate,
  purchaseController.deletePurchaseOrder
);

module.exports = router;
