const stockLedgerService = require('../../shared/services/stockLedger.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Stock Ledger Controller
 * Handles HTTP requests for stock ledger and reporting
 */
class StockLedgerController {
  /**
   * Get product ledger with transaction history
   * @route GET /api/v1/stock-ledger/:productId
   */
  getProductLedger = catchAsync(async (req, res) => {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      transactionType: req.query.transactionType,
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 20,
    };
    const ledger = await stockLedgerService.getProductLedger(req.params.productId, options);
    ApiResponse.success(res, ledger, 'Product ledger retrieved successfully');
  });

  /**
   * Get stock movement summary
   * @route GET /api/v1/stock-ledger/summary
   */
  getStockMovementSummary = catchAsync(async (req, res) => {
    const filter = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      productId: req.query.productId,
      transactionType: req.query.transactionType,
    };
    const summary = await stockLedgerService.getStockMovementSummary(filter);
    ApiResponse.success(res, summary, 'Stock movement summary retrieved successfully');
  });

  /**
   * Get stock valuation
   * @route GET /api/v1/stock-ledger/valuation
   */
  getStockValuation = catchAsync(async (req, res) => {
    const valuation = await stockLedgerService.getStockValuation();
    ApiResponse.success(res, valuation, 'Stock valuation retrieved successfully');
  });

  /**
   * Get stock analytics
   * @route GET /api/v1/stock-ledger/analytics
   */
  getStockAnalytics = catchAsync(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const analytics = await stockLedgerService.getStockAnalytics(days);
    ApiResponse.success(res, analytics, 'Stock analytics retrieved successfully');
  });

  /**
   * Adjust stock manually
   * @route POST /api/v1/stock-ledger/adjust
   */
  adjustStock = catchAsync(async (req, res) => {
    const transactionService = require('../../modules/transactions/transaction.service');
    const adjustment = await transactionService.createTransaction(
      {
        ...req.body,
        type: 'ADJUSTMENT'
      },
      req.user._id
    );
    ApiResponse.success(res, adjustment, 'Stock adjusted successfully', HTTP_STATUS.CREATED);
  });
}

module.exports = new StockLedgerController();