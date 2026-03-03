const Transaction = require('./Transaction.model');

class TransactionRepository {
  async create(transactionData) {
    return await Transaction.create(transactionData);
  }

  async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 10, sort = { transactionDate: -1 } } = options;

    return await Transaction.find(filter)
      .populate('product', 'name sku unit')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async findById(id) {
    return await Transaction.findById(id)
      .populate('product', 'name sku category supplier')
      .populate('createdBy', 'name email');
  }

  async findByProduct(productId, options = {}) {
    const { skip = 0, limit = 20, sort = { transactionDate: -1 } } = options;

    return await Transaction.find({ product: productId })
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(filter = {}) {
    return await Transaction.countDocuments(filter);
  }

  async getTransactionSummary(filter = {}) {
    return await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          totalTransactions: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);
  }

  async getRecentTransactions(limit = 10) {
    return await Transaction.find()
      .populate('product', 'name sku')
      .populate('createdBy', 'name')
      .sort({ transactionDate: -1 })
      .limit(limit);
  }

  async getTransactionsByDateRange(startDate, endDate, options = {}) {
    const { skip = 0, limit = 100, sort = { transactionDate: -1 } } = options;

    return await Transaction.find({
      transactionDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate('product', 'name sku')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }
}

module.exports = new TransactionRepository();
