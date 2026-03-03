const { body, param, query } = require('express-validator');
const { SUPPLIER_STATUS } = require('../../shared/constants');

const createSupplierValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Supplier name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Supplier name must be between 2 and 200 characters'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('Supplier code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Supplier code must be between 2 and 20 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^[0-9+\-() ]{7,20}$/)
    .withMessage('Invalid phone number'),

  body('address')
    .optional()
    .trim(),

  body('city')
    .optional()
    .trim(),

  body('state')
    .optional()
    .trim(),

  body('country')
    .optional()
    .trim(),

  body('postalCode')
    .optional()
    .trim(),

  body('contactPerson')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact person name cannot exceed 100 characters'),

  body('taxId')
    .optional()
    .trim(),

  body('paymentTerms')
    .optional()
    .trim(),

  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),

  body('status')
    .optional()
    .isIn(Object.values(SUPPLIER_STATUS))
    .withMessage('Invalid status'),
];

const updateSupplierValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid supplier ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Supplier name must be between 2 and 200 characters'),

  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Supplier code must be between 2 and 20 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-() ]{7,20}$/)
    .withMessage('Invalid phone number'),

  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),

  body('status')
    .optional()
    .isIn(Object.values(SUPPLIER_STATUS))
    .withMessage('Invalid status'),
];

const supplierIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid supplier ID'),
];

const searchValidation = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
];

module.exports = {
  createSupplierValidation,
  updateSupplierValidation,
  supplierIdValidation,
  searchValidation,
};
