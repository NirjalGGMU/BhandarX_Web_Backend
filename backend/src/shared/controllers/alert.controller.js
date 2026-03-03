const alertService = require('../../shared/services/alert.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Alert Controller
 * Handles HTTP requests for inventory alerts
 */
class AlertController {
  /**
   * Get low stock alerts
   * @route GET /api/v1/alerts/low-stock
   */
  getLowStockAlerts = catchAsync(async (req, res) => {
    const alerts = await alertService.getLowStockAlerts();

    ApiResponse.success(res, alerts, 'Low stock alerts retrieved successfully');
  });

  /**
   * Get out of stock alerts
   * @route GET /api/v1/alerts/out-of-stock
   */
  getOutOfStockAlerts = catchAsync(async (req, res) => {
    const alerts = await alertService.getOutOfStockAlerts();

    ApiResponse.success(res, alerts, 'Out of stock alerts retrieved successfully');
  });

  /**
   * Get expiry alerts
   * @route GET /api/v1/alerts/expiry
   */
  getExpiryAlerts = catchAsync(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const alerts = await alertService.getExpiryAlerts(days);

    ApiResponse.success(res, alerts, 'Expiry alerts retrieved successfully');
  });

  /**
   * Get all alerts summary
   * @route GET /api/v1/alerts/summary
   */
  getAllAlertsSummary = catchAsync(async (req, res) => {
    const expiryDays = parseInt(req.query.expiryDays) || 30;
    const summary = await alertService.getAllAlertsSummary(expiryDays);

    ApiResponse.success(res, summary, 'Alerts summary retrieved successfully');
  });

  /**
   * Check reorder level for a product
   * @route GET /api/v1/alerts/reorder/:productId
   */
  checkReorderLevel = catchAsync(async (req, res) => {
    const reorderInfo = await alertService.checkReorderLevel(req.params.productId);

    ApiResponse.success(res, reorderInfo, 'Reorder level checked successfully');
  });
}

module.exports = new AlertController();
