const { body, query, param } = require('express-validator');

/**
 * Validation rules for creating a customer
 */
const createCustomerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+\-() ]{7,20}$/)
    .withMessage('Please provide a valid phone number'),

  body('alternatePhone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-() ]{7,20}$/)
    .withMessage('Please provide a valid alternate phone number'),

  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),

  body('customerType')
    .optional()
    .isIn(['RETAIL', 'WHOLESALE', 'CORPORATE'])
    .withMessage('Customer type must be one of: RETAIL, WHOLESALE, CORPORATE'),

  body('taxId')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Tax ID cannot exceed 50 characters'),

  body('creditLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Credit limit must be a positive number'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/**
 * Validation rules for updating a customer
 */
const updateCustomerValidation = [
  param('id').isMongoId().withMessage('Invalid customer ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-() ]{7,20}$/)
    .withMessage('Please provide a valid phone number'),

  body('alternatePhone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-() ]{7,20}$/)
    .withMessage('Please provide a valid alternate phone number'),

  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),

  body('customerType')
    .optional()
    .isIn(['RETAIL', 'WHOLESALE', 'CORPORATE'])
    .withMessage('Customer type must be one of: RETAIL, WHOLESALE, CORPORATE'),

  body('taxId')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Tax ID cannot exceed 50 characters'),

  body('creditLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Credit limit must be a positive number'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/**
 * Validation rules for customer ID parameter
 */
const customerIdValidation = [
  param('id').isMongoId().withMessage('Invalid customer ID'),
];

/**
 * Validation rules for customer type parameter
 */
const customerTypeValidation = [
  param('type')
    .isIn(['RETAIL', 'WHOLESALE', 'CORPORATE'])
    .withMessage('Customer type must be one of: RETAIL, WHOLESALE, CORPORATE'),
];

/**
 * Validation rules for customer filters
 */
const customerFilterValidation = [
  query('search')
    .optional({ checkFalsy: true })
    .trim(),

  query('customerType')
    .optional()
    .isIn(['RETAIL', 'WHOLESALE', 'CORPORATE'])
    .withMessage('Customer type must be one of: RETAIL, WHOLESALE, CORPORATE'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'phone', 'customerType', 'createdAt', 'outstandingBalance'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

module.exports = {
  createCustomerValidation,
  updateCustomerValidation,
  customerIdValidation,
  customerTypeValidation,
  customerFilterValidation,
};
