const express = require('express');
const router = express.Router();
const customerController = require('./customer.controller');
const { protect, authorize } = require('../../shared/middleware/auth');
const validate = require('../../shared/middleware/validate');
const { ROLES } = require('../../shared/constants');
const {
  createCustomerValidation,
  updateCustomerValidation,
  customerIdValidation,
  customerTypeValidation,
  customerFilterValidation,
} = require('./customer.validator');

/**
 * Customer Routes
 * All routes require authentication
 */

/**
 * @swagger
 * /customers/search:
 *   get:
 *     summary: Search customers by keyword
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/search',
  protect,
  customerController.searchCustomers
);

/**
 * @swagger
 * /customers/outstanding:
 *   get:
 *     summary: Get customers with outstanding balances
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers with outstanding balances retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/outstanding',
  protect,
  authorize(ROLES.ADMIN),
  customerController.getCustomersWithOutstanding
);

/**
 * @swagger
 * /customers/statistics:
 *   get:
 *     summary: Get customer statistics
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer statistics retrieved successfully
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/statistics',
  protect,
  authorize(ROLES.ADMIN),
  customerController.getCustomerStats
);

/**
 * @swagger
 * /customers/type/{type}:
 *   get:
 *     summary: Get customers by type
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [retail, wholesale, corporate]
 *         description: Customer type
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/type/:type',
  protect,
  customerTypeValidation,
  validate,
  customerController.getCustomersByType
);

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers with pagination and filtering
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name or email
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [retail, wholesale, corporate]
 *         description: Filter by customer type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of customers retrieved successfully
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
router
  .route('/')
  .get(
    protect,
    customerFilterValidation,
    validate,
    customerController.getAllCustomers
  )
  /**
   * @swagger
   * /customers:
   *   post:
   *     summary: Create a new customer
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, email, phone]
   *             properties:
   *               name:
   *                 type: string
   *                 example: John Doe
   *               email:
   *                 type: string
   *                 format: email
   *                 example: john.doe@example.com
   *               phone:
   *                 type: string
   *                 example: "+1234567890"
   *               address:
   *                 type: string
   *                 example: 123 Main St, City
   *               type:
   *                 type: string
   *                 enum: [retail, wholesale, corporate]
   *                 default: retail
   *               taxId:
   *                 type: string
   *               creditLimit:
   *                 type: number
   *                 example: 5000
   *               status:
   *                 type: string
   *                 enum: [active, inactive]
   *                 default: active
   *     responses:
   *       201:
   *         description: Customer created successfully
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
  .post(
    protect,
    authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
    createCustomerValidation,
    validate,
    customerController.createCustomer
  );

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
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
router
  .route('/:id')
  .get(
    protect,
    customerIdValidation,
    validate,
    customerController.getCustomerById
  )
  /**
   * @swagger
   * /customers/{id}:
   *   put:
   *     summary: Update an existing customer
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Customer ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               phone:
   *                 type: string
   *               address:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [retail, wholesale, corporate]
   *               status:
   *                 type: string
   *                 enum: [active, inactive]
   *     responses:
   *       200:
   *         description: Customer updated successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       403:
   *         $ref: '#/components/responses/ForbiddenError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  .put(
    protect,
    authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
    updateCustomerValidation,
    validate,
    customerController.updateCustomer
  )
  /**
   * @swagger
   * /customers/{id}:
   *   delete:
   *     summary: Delete a customer
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Customer ID
   *     responses:
   *       200:
   *         description: Customer deleted successfully
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       403:
   *         $ref: '#/components/responses/ForbiddenError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  .delete(
    protect,
    authorize(ROLES.ADMIN),
    customerIdValidation,
    validate,
    customerController.deleteCustomer
  );

/**
 * @swagger
 * /customers/{id}/toggle-status:
 *   patch:
 *     summary: Toggle customer status (active/inactive)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer status toggled successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/:id/toggle-status',
  protect,
  authorize(ROLES.ADMIN),
  customerIdValidation,
  validate,
  customerController.toggleCustomerStatus
);

module.exports = router;
