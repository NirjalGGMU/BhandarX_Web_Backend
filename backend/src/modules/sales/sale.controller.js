const saleService = require('./sale.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Sale Controller
 * Handles HTTP requests for sales operations
 */

/**
 * Create a new sale
 */
exports.createSale = catchAsync(async (req, res) => {
  const saleData = {
    ...req.body,
    createdBy: req.user.id,
  };

  const sale = await saleService.createSale(saleData);

  ApiResponse.success(res, sale, 'Sale created successfully', HTTP_STATUS.CREATED);
});

/**
 * Get all sales with filters
 */
exports.getAllSales = catchAsync(async (req, res) => {
  const result = await saleService.getAllSales(req.query);

  ApiResponse.paginated(
    res,
    result.sales,
    {
      page: result.page,
      pageSize: result.pageSize,
      totalItems: result.total,
      totalPages: result.totalPages,
    },
    'Sales retrieved successfully'
  );
});

/**
 * Get sale by ID
 */
exports.getSaleById = catchAsync(async (req, res) => {
  const sale = await saleService.getSaleById(req.params.id);

  ApiResponse.success(res, sale, 'Sale retrieved successfully');
});

/**
 * Get sale by invoice number
 */
exports.getSaleByInvoiceNumber = catchAsync(async (req, res) => {
  const sale = await saleService.getSaleByInvoiceNumber(req.params.invoiceNumber);

  ApiResponse.success(res, sale, 'Sale retrieved successfully');
});

/**
 * Update sale payment
 */
exports.updatePayment = catchAsync(async (req, res) => {
  const paymentData = {
    ...req.body,
    updatedBy: req.user.id,
  };

  const sale = await saleService.updatePayment(req.params.id, paymentData);

  ApiResponse.success(res, sale, 'Payment updated successfully');
});

/**
 * Reverse a completed sale
 */
exports.reverseSale = catchAsync(async (req, res) => {
  const reversalData = {
    reversalReason: req.body.reversalReason,
    reversedBy: req.user.id,
  };

  const sale = await saleService.reverseSale(req.params.id, reversalData);

  ApiResponse.success(res, sale, 'Sale reversed successfully');
});

/**
 * Cancel a draft sale
 */
exports.cancelSale = catchAsync(async (req, res) => {
  const sale = await saleService.cancelSale(req.params.id, req.user.id);

  ApiResponse.success(res, sale, 'Sale cancelled successfully');
});

/**
 * Delete a draft sale
 */
exports.deleteSale = catchAsync(async (req, res) => {
  await saleService.deleteSale(req.params.id);

  ApiResponse.success(res, null, 'Sale deleted successfully');
});

/**
 * Get sales by customer
 */
exports.getSalesByCustomer = catchAsync(async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    pageSize: parseInt(req.query.pageSize) || 20,
  };

  const result = await saleService.getSalesByCustomer(req.params.customerId, options);

  ApiResponse.paginated(
    res,
    result.sales,
    {
      page: result.page,
      pageSize: result.pageSize,
      totalItems: result.total,
      totalPages: result.totalPages,
    },
    'Customer sales retrieved successfully'
  );
});

/**
 * Get overdue invoices
 */
exports.getOverdueSales = catchAsync(async (req, res) => {
  const sales = await saleService.getOverdueSales();

  ApiResponse.success(res, sales, 'Overdue sales retrieved successfully');
});

/**
 * Get sales summary
 */
exports.getSalesSummary = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const summary = await saleService.getSalesSummary(startDate, endDate);

  ApiResponse.success(res, summary, 'Sales summary retrieved successfully');
});

/**
 * Get daily sales report
 */
exports.getDailySalesReport = catchAsync(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const report = await saleService.getDailySalesReport(days);

  ApiResponse.success(res, report, 'Daily sales report retrieved successfully');
});

/**
 * Get top selling products
 */
exports.getTopSellingProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const { startDate, endDate } = req.query;

  const products = await saleService.getTopSellingProducts(limit, startDate, endDate);

  ApiResponse.success(res, products, 'Top selling products retrieved successfully');
});

/**
 * Get sales by payment method
 */
exports.getSalesByPaymentMethod = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const report = await saleService.getSalesByPaymentMethod(startDate, endDate);

  ApiResponse.success(res, report, 'Sales by payment method retrieved successfully');
});

/**
 * Get customer purchase history
 */
exports.getCustomerPurchaseHistory = catchAsync(async (req, res) => {
  const history = await saleService.getCustomerPurchaseHistory(req.params.customerId);

  ApiResponse.success(res, history, 'Customer purchase history retrieved successfully');
});
