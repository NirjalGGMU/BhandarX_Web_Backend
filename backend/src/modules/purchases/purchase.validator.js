const { body, param, query } = require('express-validator');
const { PAYMENT_METHODS, PAYMENT_STATUS, PURCHASE_ORDER_STATUS } = require('../../shared/constants');

/**
 * Purchase Order Validators
 */

const purchaseLineItemValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product')
    .notEmpty()
    .withMessage('Product is required')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('items.*.discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a positive number'),
  body('items.*.tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax must be a positive number'),
];

const createPurchaseOrderValidation = [
  body('supplier')
    .notEmpty()
    .withMessage('Supplier is required')
    .isMongoId()
    .withMessage('Valid supplier ID is required'),
  ...purchaseLineItemValidation,
  body('paidAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Paid amount must be a positive number'),
  body('paymentMethod')
    .optional()
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage(`Payment method must be one of: ${Object.values(PAYMENT_METHODS).join(', ')}`),
  body('orderDate')
    .optional()
    .isISO8601()
    .withMessage('Order date must be a valid date'),
  body('expectedDeliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Expected delivery date must be a valid date'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(Object.values(PURCHASE_ORDER_STATUS))
    .withMessage(`Status must be one of: ${Object.values(PURCHASE_ORDER_STATUS).join(', ')}`),
];

const updatePurchaseOrderValidation = [
  param('id').isMongoId().withMessage('Valid purchase order ID is required'),
  body('supplier')
    .optional()
    .isMongoId()
    .withMessage('Valid supplier ID is required'),
  body('paidAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Paid amount must be a positive number'),
  body('paymentMethod')
    .optional()
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage(`Payment method must be one of: ${Object.values(PAYMENT_METHODS).join(', ')}`),
  body('expectedDeliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Expected delivery date must be a valid date'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

const purchaseOrderIdValidation = [
  param('id').isMongoId().withMessage('Valid purchase order ID is required'),
];

const poNumberValidation = [
  param('poNumber')
    .notEmpty()
    .withMessage('PO number is required')
    .isLength({ max: 50 })
    .withMessage('PO number cannot exceed 50 characters'),
];

const receiveItemsValidation = [
  param('id').isMongoId().withMessage('Valid purchase order ID is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.itemId')
    .notEmpty()
    .withMessage('Item ID is required')
    .isMongoId()
    .withMessage('Valid item ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('actualDeliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Actual delivery date must be a valid date'),
];

const purchaseOrderFilterValidation = [
  query('supplier')
    .optional()
    .isMongoId()
    .withMessage('Valid supplier ID is required'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('paymentStatus')
    .optional()
    .isIn(Object.values(PAYMENT_STATUS))
    .withMessage(`Payment status must be one of: ${Object.values(PAYMENT_STATUS).join(', ')}`),
  query('status')
    .optional()
    .isIn(Object.values(PURCHASE_ORDER_STATUS))
    .withMessage(`Status must be one of: ${Object.values(PURCHASE_ORDER_STATUS).join(', ')}`),
  query('search')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Search term must not be empty'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['orderDate', 'totalAmount', 'paymentStatus', 'status', 'poNumber', 'expectedDeliveryDate', 'createdAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

const reportDateValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  createPurchaseOrderValidation,
  updatePurchaseOrderValidation,
  purchaseOrderIdValidation,
  poNumberValidation,
  receiveItemsValidation,
  purchaseOrderFilterValidation,
  reportDateValidation,
};
