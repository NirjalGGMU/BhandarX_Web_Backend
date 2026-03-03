const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants');
const { param, query } = require('express-validator');
const validate = require('../middleware/validate');

/**
 * Alert Routes
 * All routes require authentication and Admin role
 */

// Validation rules
const productIdValidation = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
];

const expiryDaysValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
];

// Routes
router.get(
  '/low-stock',
  protect,
  authorize(ROLES.ADMIN),
  alertController.getLowStockAlerts
);

router.get(
  '/out-of-stock',
  protect,
  authorize(ROLES.ADMIN),
  alertController.getOutOfStockAlerts
);

router.get(
  '/expiry',
  protect,
  authorize(ROLES.ADMIN),
  expiryDaysValidation,
  validate,
  alertController.getExpiryAlerts
);

router.get(
  '/summary',
  protect,
  authorize(ROLES.ADMIN),
  expiryDaysValidation,
  validate,
  alertController.getAllAlertsSummary
);

router.get(
  '/reorder/:productId',
  protect,
  authorize(ROLES.ADMIN),
  productIdValidation,
  validate,
  alertController.checkReorderLevel
);

module.exports = router;
