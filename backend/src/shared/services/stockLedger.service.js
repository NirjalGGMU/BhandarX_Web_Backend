const transactionRepository = require('../../modules/transactions/transaction.repository');
const productRepository = require('../../modules/products/product.repository');
const AppError = require('../utils/AppError');
const { HTTP_STATUS, TRANSACTION_TYPES } = require('../constants');

/**
 * Stock Ledger Service
 * Provides detailed stock movement reports and analytics
 */
class StockLedgerService {
  /**
   * Get stock ledger for a product
   * @param {string} productId - Product ID
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Stock ledger with movements
   */
  async getProductLedger(productId, options = {}) {
    const { startDate, endDate, limit = 100 } = options;

    // Verify product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    // Build filter
    const filter = { product: productId };
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    // Get transactions
    const transactions = await transactionRepository.findAll(filter, {
      limit,
      sort: { transactionDate: -1 },
    });

    // Calculate running balance
    const ledgerEntries = transactions.map((txn) => ({
      date: txn.transactionDate,
      type: txn.type,
      reference: txn.reference,
      quantity: txn.quantity,
      unitPrice: txn.unitPrice,
      totalAmount: txn.totalAmount,
      previousBalance: txn.previousQuantity,
      newBalance: txn.newQuantity,
      movement: this.getMovementDirection(txn.type, txn.quantity),
      createdBy: txn.createdBy,
      notes: txn.notes,
    }));

    return {
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        currentStock: product.quantity,
      },
      ledger: ledgerEntries,
      summary: {
        totalTransactions: transactions.length,
        currentStock: product.quantity,
        minStockLevel: product.minStockLevel,
        maxStockLevel: product.maxStockLevel,
      },
    };
  }

  /**
   * Get stock movement summary
   * @param {Object} filter - Filter options
   * @returns {Promise<Object>} Movement summary
   */
  async getStockMovementSummary(filter = {}) {
    const { startDate, endDate, productId } = filter;

    const matchFilter = {};
    if (productId) matchFilter.product = productId;
    if (startDate || endDate) {
      matchFilter.transactionDate = {};
      if (startDate) matchFilter.transactionDate.$gte = new Date(startDate);
      if (endDate) matchFilter.transactionDate.$lte = new Date(endDate);
    }

    const summary = await transactionRepository.getTransactionSummary(matchFilter);

    // Calculate totals
    const totals = {
      stockIn: 0,
      stockOut: 0,
      adjustments: 0,
      returns: 0,
      totalValue: 0,
    };

    summary.forEach((item) => {
      switch (item.type) {
      case TRANSACTION_TYPES.STOCK_IN:
        totals.stockIn = item.totalQuantity;
        break;
      case TRANSACTION_TYPES.STOCK_OUT:
        totals.stockOut = item.totalQuantity;
        break;
      case TRANSACTION_TYPES.ADJUSTMENT:
        totals.adjustments = item.count;
        break;
      case TRANSACTION_TYPES.RETURN:
        totals.returns = item.totalQuantity;
        break;
      }
      totals.totalValue += item.totalValue;
    });

    return {
      summary,
      totals,
      netMovement: totals.stockIn + totals.returns - totals.stockOut,
    };
  }

  /**
   * Get stock valuation report
   * @returns {Promise<Object>} Stock valuation
   */
  async getStockValuation() {
    const products = await productRepository.findAll({ status: 'active' });

    const valuation = products.map((product) => ({
      id: product._id,
      name: product.name,
      sku: product.sku,
      quantity: product.quantity,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      stockValue: product.quantity * product.purchasePrice,
      potentialValue: product.quantity * product.sellingPrice,
      potentialProfit:
        product.quantity * (product.sellingPrice - product.purchasePrice),
    }));

    const total = valuation.reduce(
      (acc, item) => {
        acc.totalStockValue += item.stockValue;
        acc.totalPotentialValue += item.potentialValue;
        acc.totalPotentialProfit += item.potentialProfit;
        acc.totalQuantity += item.quantity;
        return acc;
      },
      {
        totalStockValue: 0,
        totalPotentialValue: 0,
        totalPotentialProfit: 0,
        totalQuantity: 0,
      }
    );

    return {
      items: valuation,
      summary: {
        ...total,
        totalProducts: products.length,
      },
    };
  }

  /**
   * Get stock movement analytics
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Object>} Analytics data
   */
  async getStockAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await transactionRepository.findAll(
      { transactionDate: { $gte: startDate } },
      { sort: { transactionDate: 1 } }
    );

    // Group by date
    const dailyMovements = {};
    transactions.forEach((txn) => {
      const dateKey = txn.transactionDate.toISOString().split('T')[0];
      if (!dailyMovements[dateKey]) {
        dailyMovements[dateKey] = {
          date: dateKey,
          stockIn: 0,
          stockOut: 0,
          adjustments: 0,
          returns: 0,
          totalValue: 0,
        };
      }

      const movement = dailyMovements[dateKey];
      switch (txn.type) {
      case TRANSACTION_TYPES.STOCK_IN:
        movement.stockIn += txn.quantity;
        break;
      case TRANSACTION_TYPES.STOCK_OUT:
        movement.stockOut += txn.quantity;
        break;
      case TRANSACTION_TYPES.ADJUSTMENT:
        movement.adjustments += 1;
        break;
      case TRANSACTION_TYPES.RETURN:
        movement.returns += txn.quantity;
        break;
      }
      movement.totalValue += txn.totalAmount;
    });

    return {
      period: `${days} days`,
      startDate,
      endDate: new Date(),
      dailyMovements: Object.values(dailyMovements),
      totalTransactions: transactions.length,
    };
  }

  /**
   * Get movement direction text
   * @private
   */
  getMovementDirection(type, quantity) {
    switch (type) {
    case TRANSACTION_TYPES.STOCK_IN:
      return `+${quantity} (Stock In)`;
    case TRANSACTION_TYPES.STOCK_OUT:
      return `-${quantity} (Stock Out)`;
    case TRANSACTION_TYPES.RETURN:
      return `+${quantity} (Return)`;
    case TRANSACTION_TYPES.ADJUSTMENT:
      return `Adjusted (${quantity})`;
    default:
      return quantity;
    }
  }
}

module.exports = new StockLedgerService();
