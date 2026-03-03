const { body, param } = require('express-validator');

const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('Category code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Category code must be between 2 and 20 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('parentCategory')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const updateCategoryValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),

  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Category code must be between 2 and 20 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('parentCategory')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const categoryIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),
];

module.exports = {
  createCategoryValidation,
  updateCategoryValidation,
  categoryIdValidation,
};
