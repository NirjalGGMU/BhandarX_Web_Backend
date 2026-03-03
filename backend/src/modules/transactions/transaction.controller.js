const transactionService = require('./transaction.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

class TransactionController {
  createTransaction = catchAsync(async (req, res) => {
    const transaction = await transactionService.createTransaction(req.body, req.user._id);

    ApiResponse.success(
      res,
      transaction,
      'Transaction created successfully',
      HTTP_STATUS.CREATED
    );
  });

  getAllTransactions = catchAsync(async (req, res) => {
    const result = await transactionService.getAllTransactions(req.query);

    ApiResponse.paginated(
      res,
      result.transactions,
      result.pagination,
      'Transactions retrieved successfully'
    );
  });

  getTransactionById = catchAsync(async (req, res) => {
    const transaction = await transactionService.getTransactionById(req.params.id);

    ApiResponse.success(res, transaction, 'Transaction retrieved successfully');
  });

  getProductTransactions = catchAsync(async (req, res) => {
    const result = await transactionService.getProductTransactions(
      req.params.productId,
      req.query
    );

    ApiResponse.paginated(
      res,
      result.transactions,
      result.pagination,
      'Product transactions retrieved successfully'
    );
  });

  getTransactionSummary = catchAsync(async (req, res) => {
    const summary = await transactionService.getTransactionSummary(req.query);

    ApiResponse.success(res, summary, 'Transaction summary retrieved successfully');
  });

  getRecentTransactions = catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const transactions = await transactionService.getRecentTransactions(limit);

    ApiResponse.success(res, transactions, 'Recent transactions retrieved successfully');
  });

  getTransactionsByDateRange = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const result = await transactionService.getTransactionsByDateRange(
      startDate,
      endDate,
      req.query
    );

    ApiResponse.paginated(
      res,
      result.transactions,
      result.pagination,
      'Transactions retrieved successfully'
    );
  });
}

module.exports = new TransactionController();
