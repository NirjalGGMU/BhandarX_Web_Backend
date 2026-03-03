const transactionRepository = require('./transaction.repository');
const productRepository = require('../products/product.repository');
const AppError = require('../../shared/utils/AppError');
const { HTTP_STATUS, TRANSACTION_TYPES } = require('../../shared/constants');
const PaginationHelper = require('../../shared/utils/PaginationHelper');
const {
  CreateTransactionDTO,
  TransactionFilterDTO,
} = require('./transaction.dto');

class TransactionService {
  async createTransaction(transactionData, userId) {
    const createDTO = new CreateTransactionDTO(transactionData);

    // Verify product exists
    const product = await productRepository.findById(createDTO.product);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    // Store previous quantity
    const previousQuantity = product.quantity;
    let newQuantity = previousQuantity;

    // Calculate new quantity based on transaction type
    switch (createDTO.type) {
    case TRANSACTION_TYPES.STOCK_IN:
    case TRANSACTION_TYPES.RETURN:
      newQuantity = previousQuantity + createDTO.quantity;
      break;
    case TRANSACTION_TYPES.STOCK_OUT:
      if (previousQuantity < createDTO.quantity) {
        throw new AppError(
          `Insufficient stock. Available: ${previousQuantity}, Requested: ${createDTO.quantity}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      newQuantity = previousQuantity - createDTO.quantity;
      break;
    case TRANSACTION_TYPES.ADJUSTMENT:
      newQuantity = createDTO.quantity; // Direct quantity update
      break;
    default:
      throw new AppError('Invalid transaction type', HTTP_STATUS.BAD_REQUEST);
    }

    // Prepare transaction data
    const transaction = {
      ...createDTO,
      previousQuantity,
      newQuantity,
      createdBy: userId,
    };

    // Create transaction and update product quantity in a single operation
    const createdTransaction = await transactionRepository.create(transaction);
    await productRepository.updateQuantity(createDTO.product, newQuantity);

    return await transactionRepository.findById(createdTransaction._id);
  }

  async getAllTransactions(query) {
    const filterDTO = new TransactionFilterDTO(query);
    const { page, pageSize, skip } = PaginationHelper.getPaginationParams(query);

    // Build filter
    const filter = {};

    if (filterDTO.product) {
      filter.product = filterDTO.product;
    }

    if (filterDTO.type) {
      filter.type = filterDTO.type;
    }

    if (filterDTO.startDate || filterDTO.endDate) {
      filter.transactionDate = {};
      if (filterDTO.startDate) {
        filter.transactionDate.$gte = new Date(filterDTO.startDate);
      }
      if (filterDTO.endDate) {
        filter.transactionDate.$lte = new Date(filterDTO.endDate);
      }
    }

    // Build sort
    const sort = {};
    sort[filterDTO.sortBy] = filterDTO.sortOrder === 'asc' ? 1 : -1;

    // Get transactions and total count
    const [transactions, totalItems] = await Promise.all([
      transactionRepository.findAll(filter, { skip, limit: pageSize, sort }),
      transactionRepository.count(filter),
    ]);

    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalItems);

    return { transactions, pagination };
  }

  async getTransactionById(id) {
    const transaction = await transactionRepository.findById(id);

    if (!transaction) {
      throw new AppError('Transaction not found', HTTP_STATUS.NOT_FOUND);
    }

    return transaction;
  }

  async getProductTransactions(productId, query) {
    const { page, pageSize, skip } = PaginationHelper.getPaginationParams(query);

    // Verify product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    const sort = { transactionDate: -1 };

    // Get transactions and total count
    const [transactions, totalItems] = await Promise.all([
      transactionRepository.findByProduct(productId, { skip, limit: pageSize, sort }),
      transactionRepository.count({ product: productId }),
    ]);

    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalItems);

    return { transactions, pagination };
  }

  async getTransactionSummary(query) {
    const filter = {};

    if (query.startDate || query.endDate) {
      filter.transactionDate = {};
      if (query.startDate) {
        filter.transactionDate.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.transactionDate.$lte = new Date(query.endDate);
      }
    }

    const summary = await transactionRepository.getTransactionSummary(filter);

    return summary;
  }

  async getRecentTransactions(limit = 10) {
    return await transactionRepository.getRecentTransactions(limit);
  }

  async getTransactionsByDateRange(startDate, endDate, query) {
    const { page, pageSize, skip } = PaginationHelper.getPaginationParams(query);

    const sort = { transactionDate: -1 };

    const [transactions, totalItems] = await Promise.all([
      transactionRepository.getTransactionsByDateRange(startDate, endDate, {
        skip,
        limit: pageSize,
        sort,
      }),
      transactionRepository.count({
        transactionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }),
    ]);

    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalItems);

    return { transactions, pagination };
  }
}

module.exports = new TransactionService();
