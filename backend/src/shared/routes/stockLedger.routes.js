const express = require('express');
const router = express.Router();
const stockLedgerController = require('../controllers/stockLedger.controller');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants');
const { param, query } = require('express-validator');
const validate = require('../middleware/validate');

/**
 * Stock Ledger Routes
 * All routes require authentication and Admin role
 */

// Validation rules
const productIdValidation = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
];

const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
];

const analyticsValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
];

// Routes (specific routes before parameterized routes)
router.get(
  '/summary',
  protect,
  authorize(ROLES.ADMIN),
  dateRangeValidation,
  validate,
  stockLedgerController.getStockMovementSummary
);

router.get(
  '/valuation',
  protect,
  authorize(ROLES.ADMIN),
  stockLedgerController.getStockValuation
);

router.post(
  '/adjust',
  protect,
  authorize(ROLES.ADMIN),
  validate,
  stockLedgerController.adjustStock
);

router.get(
  '/analytics',
  protect,
  authorize(ROLES.ADMIN),
  analyticsValidation,
  validate,
  stockLedgerController.getStockAnalytics
);

router.get(
  '/:productId',
  protect,
  authorize(ROLES.ADMIN),
  productIdValidation,
  dateRangeValidation,
  validate,
  stockLedgerController.getProductLedger
);

module.exports = router;
