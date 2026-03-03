const purchaseService = require('./purchase.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Purchase Order Controller
 * Handles HTTP requests for purchase order operations
 */

/**
 * Create a new purchase order
 */
exports.createPurchaseOrder = catchAsync(async (req, res) => {
  const poData = {
    ...req.body,
    createdBy: req.user.id,
  };

  const purchaseOrder = await purchaseService.createPurchaseOrder(poData);

  ApiResponse.success(res, purchaseOrder, 'Purchase order created successfully', HTTP_STATUS.CREATED);
});

/**
 * Get all purchase orders with filters
 */
exports.getAllPurchaseOrders = catchAsync(async (req, res) => {
  const result = await purchaseService.getAllPurchaseOrders(req.query);

  ApiResponse.paginated(
    res,
    result.purchaseOrders,
    {
      page: result.page,
      pageSize: result.pageSize,
      totalItems: result.total,
      totalPages: result.totalPages,
    },
    'Purchase orders retrieved successfully'
  );
});

/**
 * Get purchase order by ID
 */
exports.getPurchaseOrderById = catchAsync(async (req, res) => {
  const purchaseOrder = await purchaseService.getPurchaseOrderById(req.params.id);

  ApiResponse.success(res, purchaseOrder, 'Purchase order retrieved successfully');
});

/**
 * Get purchase order by PO number
 */
exports.getPurchaseOrderByPONumber = catchAsync(async (req, res) => {
  const purchaseOrder = await purchaseService.getPurchaseOrderByPONumber(req.params.poNumber);

  ApiResponse.success(res, purchaseOrder, 'Purchase order retrieved successfully');
});

/**
 * Update purchase order
 */
exports.updatePurchaseOrder = catchAsync(async (req, res) => {
  const updateData = {
    ...req.body,
    updatedBy: req.user.id,
  };

  const purchaseOrder = await purchaseService.updatePurchaseOrder(req.params.id, updateData);

  ApiResponse.success(res, purchaseOrder, 'Purchase order updated successfully');
});

/**
 * Receive items from purchase order
 */
exports.receiveItems = catchAsync(async (req, res) => {
  const receiveData = {
    ...req.body,
    updatedBy: req.user.id,
  };

  const purchaseOrder = await purchaseService.receiveItems(req.params.id, receiveData);

  ApiResponse.success(res, purchaseOrder, 'Items received successfully');
});

/**
 * Update payment
 */
exports.updatePayment = catchAsync(async (req, res) => {
  const paymentData = {
    ...req.body,
    updatedBy: req.user.id,
  };

  const purchaseOrder = await purchaseService.updatePayment(req.params.id, paymentData);

  ApiResponse.success(res, purchaseOrder, 'Payment updated successfully');
});

/**
 * Cancel a purchase order
 */
exports.cancelPurchaseOrder = catchAsync(async (req, res) => {
  const purchaseOrder = await purchaseService.cancelPurchaseOrder(req.params.id, req.user.id);

  ApiResponse.success(res, purchaseOrder, 'Purchase order cancelled successfully');
});

/**
 * Delete a draft purchase order
 */
exports.deletePurchaseOrder = catchAsync(async (req, res) => {
  await purchaseService.deletePurchaseOrder(req.params.id);

  ApiResponse.success(res, null, 'Purchase order deleted successfully');
});

/**
 * Get purchase orders by supplier
 */
exports.getPurchaseOrdersBySupplier = catchAsync(async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    pageSize: parseInt(req.query.pageSize) || 20,
  };

  const result = await purchaseService.getPurchaseOrdersBySupplier(req.params.supplierId, options);

  ApiResponse.paginated(
    res,
    result.purchaseOrders,
    {
      page: result.page,
      pageSize: result.pageSize,
      totalItems: result.total,
      totalPages: result.totalPages,
    },
    'Supplier purchase orders retrieved successfully'
  );
});

/**
 * Get pending deliveries
 */
exports.getPendingDeliveries = catchAsync(async (req, res) => {
  const purchaseOrders = await purchaseService.getPendingDeliveries();

  ApiResponse.success(res, purchaseOrders, 'Pending deliveries retrieved successfully');
});

/**
 * Get overdue deliveries
 */
exports.getOverdueDeliveries = catchAsync(async (req, res) => {
  const purchaseOrders = await purchaseService.getOverdueDeliveries();

  ApiResponse.success(res, purchaseOrders, 'Overdue deliveries retrieved successfully');
});

/**
 * Get purchases summary
 */
exports.getPurchasesSummary = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const summary = await purchaseService.getPurchasesSummary(startDate, endDate);

  ApiResponse.success(res, summary, 'Purchases summary retrieved successfully');
});

/**
 * Get supplier purchase history
 */
exports.getSupplierPurchaseHistory = catchAsync(async (req, res) => {
  const history = await purchaseService.getSupplierPurchaseHistory(req.params.supplierId);

  ApiResponse.success(res, history, 'Supplier purchase history retrieved successfully');
});

/**
 * Get most purchased products
 */
exports.getMostPurchasedProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const { startDate, endDate } = req.query;

  const products = await purchaseService.getMostPurchasedProducts(limit, startDate, endDate);

  ApiResponse.success(res, products, 'Most purchased products retrieved successfully');
});

/**
 * Get daily purchase report
 */
exports.getDailyPurchaseReport = catchAsync(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const report = await purchaseService.getDailyPurchaseReport(days);

  ApiResponse.success(res, report, 'Daily purchase report retrieved successfully');
});
