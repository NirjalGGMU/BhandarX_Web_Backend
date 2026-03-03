const { body, query, param } = require('express-validator');

/**
 * Validation rules for creating a variant
 */
const createVariantValidation = [
  body('product')
    .notEmpty()
    .withMessage('Parent product is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('variantName')
    .trim()
    .notEmpty()
    .withMessage('Variant name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Variant name must be between 2 and 100 characters'),

  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),

  body('barcode')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Barcode must be between 2 and 100 characters'),

  body('attributes')
    .optional()
    .isObject()
    .withMessage('Attributes must be an object'),

  body('purchasePrice')
    .notEmpty()
    .withMessage('Purchase price is required')
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),

  body('sellingPrice')
    .notEmpty()
    .withMessage('Selling price is required')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),

  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),

  body('minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock level must be a non-negative integer'),

  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),

  body('dimensions')
    .optional()
    .isObject()
    .withMessage('Dimensions must be an object'),

  body('dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Dimension length must be a positive number'),

  body('dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Dimension width must be a positive number'),

  body('dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Dimension height must be a positive number'),

  body('dimensions.unit')
    .optional()
    .isIn(['cm', 'inch', 'meter'])
    .withMessage('Dimension unit must be one of: cm, inch, meter'),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/**
 * Validation rules for updating a variant
 */
const updateVariantValidation = [
  param('id').isMongoId().withMessage('Invalid variant ID'),

  body('variantName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Variant name must be between 2 and 100 characters'),

  body('sku')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),

  body('barcode')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Barcode must be between 2 and 100 characters'),

  body('attributes')
    .optional()
    .isObject()
    .withMessage('Attributes must be an object'),

  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),

  body('sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),

  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),

  body('minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock level must be a non-negative integer'),

  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),

  body('dimensions')
    .optional()
    .isObject()
    .withMessage('Dimensions must be an object'),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/**
 * Validation rules for variant ID parameter
 */
const variantIdValidation = [
  param('id').isMongoId().withMessage('Invalid variant ID'),
];

/**
 * Validation rules for product ID parameter
 */
const productIdValidation = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
];

/**
 * Validation rules for variant filters
 */
const variantFilterValidation = [
  query('product')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query cannot be empty'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  query('lowStock')
    .optional()
    .isBoolean()
    .withMessage('lowStock must be a boolean'),

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
    .isIn(['variantName', 'sku', 'quantity', 'sellingPrice', 'createdAt'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

module.exports = {
  createVariantValidation,
  updateVariantValidation,
  variantIdValidation,
  productIdValidation,
  variantFilterValidation,
};
