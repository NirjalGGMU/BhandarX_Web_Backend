const { body, param, query } = require('express-validator');
const { PRODUCT_STATUS } = require('../../shared/constants');

const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('supplier')
    .notEmpty()
    .withMessage('Supplier is required')
    .isMongoId()
    .withMessage('Invalid supplier ID'),

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

  body('maxStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum stock level must be a non-negative integer'),

  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(['piece', 'kg', 'liter', 'meter', 'box', 'dozen', 'pack'])
    .withMessage('Invalid unit'),

  body('status')
    .optional()
    .isIn(Object.values(PRODUCT_STATUS))
    .withMessage('Invalid status'),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format'),
];

const updateProductValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('supplier')
    .optional()
    .isMongoId()
    .withMessage('Invalid supplier ID'),

  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),

  body('sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),

  body('minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock level must be a non-negative integer'),

  body('unit')
    .optional()
    .isIn(['piece', 'kg', 'liter', 'meter', 'box', 'dozen', 'pack'])
    .withMessage('Invalid unit'),

  body('status')
    .optional()
    .isIn(Object.values(PRODUCT_STATUS))
    .withMessage('Invalid status'),
];

const productIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

const skuValidation = [
  param('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required'),
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
  createProductValidation,
  updateProductValidation,
  productIdValidation,
  skuValidation,
  searchValidation,
};
