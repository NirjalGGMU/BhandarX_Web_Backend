const { body, param, query } = require('express-validator');
const { PAYMENT_METHODS, PAYMENT_STATUS, SALE_STATUS } = require('../../shared/constants');

/**
 * Sale Validators
 */

const saleLineItemValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
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
  body('items.*.productName')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),
  body('items.*.sku')
    .optional()
    .isLength({ max: 50 })
    .withMessage('SKU cannot exceed 50 characters'),
];

const createSaleValidation = [
  body('customer')
    .optional()
    .isMongoId()
    .withMessage('Valid customer ID is required'),
  ...saleLineItemValidation,
  body('paidAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Paid amount must be a positive number'),
  body('paymentMethod')
    .optional()
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage(`Payment method must be one of: ${Object.values(PAYMENT_METHODS).join(', ')}`),
  body('saleDate')
    .optional()
    .isISO8601()
    .withMessage('Sale date must be a valid date'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(Object.values(SALE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(SALE_STATUS).join(', ')}`),
];

const updateSaleValidation = [
  param('id').isMongoId().withMessage('Valid sale ID is required'),
  body('customer')
    .optional()
    .isMongoId()
    .withMessage('Valid customer ID is required'),
  body('paidAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Paid amount must be a positive number'),
  body('paymentMethod')
    .optional()
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage(`Payment method must be one of: ${Object.values(PAYMENT_METHODS).join(', ')}`),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(Object.values(SALE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(SALE_STATUS).join(', ')}`),
];

const saleIdValidation = [
  param('id').isMongoId().withMessage('Valid sale ID is required'),
];

const invoiceNumberValidation = [
  param('invoiceNumber')
    .notEmpty()
    .withMessage('Invoice number is required')
    .isLength({ max: 50 })
    .withMessage('Invoice number cannot exceed 50 characters'),
];

const reverseSaleValidation = [
  param('id').isMongoId().withMessage('Valid sale ID is required'),
  body('reversalReason')
    .notEmpty()
    .withMessage('Reversal reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reversal reason must be between 10 and 500 characters'),
];

const saleFilterValidation = [
  query('customer')
    .optional()
    .isMongoId()
    .withMessage('Valid customer ID is required'),
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
  query('paymentMethod')
    .optional()
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage(`Payment method must be one of: ${Object.values(PAYMENT_METHODS).join(', ')}`),
  query('status')
    .optional()
    .isIn(Object.values(SALE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(SALE_STATUS).join(', ')}`),
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
    .isIn(['saleDate', 'totalAmount', 'paymentStatus', 'status', 'invoiceNumber', 'createdAt'])
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
  createSaleValidation,
  updateSaleValidation,
  saleIdValidation,
  invoiceNumberValidation,
  reverseSaleValidation,
  saleFilterValidation,
  reportDateValidation,
};
