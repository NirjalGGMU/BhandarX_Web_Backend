const { body, query, param } = require('express-validator');
const { ROLES } = require('../../shared/constants');

/**
 * Validation rules for creating a user
 */
const createUserValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),

  body('phone')
    .optional()
    .matches(/^[0-9+\-() ]{7,20}$/)
    .withMessage('Please provide a valid phone number'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

/**
 * Validation rules for updating a user (admin)
 */
const updateUserValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email').optional().trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),

  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),

  body('phone')
    .optional()
    .matches(/^[0-9+\-() ]{7,20}$/)
    .withMessage('Please provide a valid phone number'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

/**
 * Validation rules for updating own profile
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .optional()
    .matches(/^[0-9+\-() ]{7,20}$/)
    .withMessage('Please provide a valid phone number'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),

  body('notificationPreferences')
    .optional()
    .isObject()
    .withMessage('notificationPreferences must be an object'),
];

/**
 * Validation rules for user ID parameter
 */
const userIdValidation = [param('id').isMongoId().withMessage('Invalid user ID')];

/**
 * Validation rules for user filters
 */
const userFilterValidation = [
  query('search').optional().trim(),

  query('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),

  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100'),
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  updateProfileValidation,
  userIdValidation,
  userFilterValidation,
};
