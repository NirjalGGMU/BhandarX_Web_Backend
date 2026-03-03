const { body, param, query } = require('express-validator');
const { TRANSACTION_TYPES } = require('../../shared/constants');

const createTransactionValidation = [
  body('product')
    .notEmpty()
    .withMessage('Product is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(Object.values(TRANSACTION_TYPES))
    .withMessage('Invalid transaction type'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('unitPrice')
    .notEmpty()
    .withMessage('Unit price is required')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),

  body('reference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference cannot exceed 100 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),

  body('transactionDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid transaction date format'),
];

const transactionIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid transaction ID'),
];

const productIdValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

const dateRangeValidation = [
  query('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),

  query('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format'),
];

module.exports = {
  createTransactionValidation,
  transactionIdValidation,
  productIdValidation,
  dateRangeValidation,
};
