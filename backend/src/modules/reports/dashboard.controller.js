const dashboardService = require('./dashboard.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Dashboard Controller
 */

/**
 * Get dashboard summary
 */
exports.getDashboardSummary = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const summary = await dashboardService.getDashboardSummary(startDate, endDate);

  ApiResponse.success(res, summary, 'Dashboard summary retrieved successfully');
});

/**
 * Get inventory valuation
 */
exports.getInventoryValuation = catchAsync(async (req, res) => {
  const valuation = await dashboardService.getInventoryValuation();

  ApiResponse.success(res, valuation, 'Inventory valuation retrieved successfully');
});

/**
 * Get low stock products
 */
exports.getLowStockProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const products = await dashboardService.getLowStockProducts(limit);

  ApiResponse.success(res, products, 'Low stock products retrieved successfully');
});

/**
 * Get top selling products
 */
exports.getTopSellingProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const { startDate, endDate } = req.query;
  const products = await dashboardService.getTopSellingProducts(limit, startDate, endDate);

  ApiResponse.success(res, products, 'Top selling products retrieved successfully');
});

/**
 * Get sales trends
 */
exports.getSalesTrends = catchAsync(async (req, res) => {
  const period = req.query.period || 'daily';
  const days = parseInt(req.query.days) || 30;
  const trends = await dashboardService.getSalesTrends(period, days);

  ApiResponse.success(res, trends, 'Sales trends retrieved successfully');
});

/**
 * Get payment method distribution
 */
exports.getPaymentMethodDistribution = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const distribution = await dashboardService.getPaymentMethodDistribution(startDate, endDate);

  ApiResponse.success(res, distribution, 'Payment method distribution retrieved successfully');
});

/**
 * Get customer analytics
 */
exports.getCustomerAnalytics = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const analytics = await dashboardService.getCustomerAnalytics(limit);

  ApiResponse.success(res, analytics, 'Customer analytics retrieved successfully');
});

/**
 * Get category-wise sales
 */
exports.getCategoryWiseSales = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const sales = await dashboardService.getCategoryWiseSales(startDate, endDate);

  ApiResponse.success(res, sales, 'Category-wise sales retrieved successfully');
});
