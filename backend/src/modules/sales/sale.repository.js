const Sale = require('./Sale.model');

/**
 * Sale Repository
 * Data access layer for Sale model
 */
class SaleRepository {
  /**
   * Create a new sale
   */
  async create(saleData) {
    const sale = new Sale(saleData);
    return await sale.save();
  }

  /**
   * Find all sales with filters
   */
  async findAll(filter = {}, options = {}) {
    return await Sale.find(filter)
      .populate('customer', 'name email phone customerType')
      .populate('items.product', 'name sku')
      .populate('items.variant', 'variantName sku')
      .populate('createdBy', 'name email')
      .populate('reversedBy', 'name email')
      .sort(options.sort || { saleDate: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Count sales
   */
  async count(filter = {}) {
    return await Sale.countDocuments(filter);
  }

  /**
   * Find sale by ID
   */
  async findById(id) {
    return await Sale.findById(id)
      .populate('customer', 'name email phone customerType address')
      .populate('items.product', 'name sku category')
      .populate('items.variant', 'variantName sku attributes')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('reversedBy', 'name email');
  }

  /**
   * Find sale by invoice number
   */
  async findByInvoiceNumber(invoiceNumber) {
    return await Sale.findOne({ invoiceNumber })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name sku')
      .populate('items.variant', 'variantName sku');
  }

  /**
   * Update sale by ID
   */
  async updateById(id, updateData) {
    return await Sale.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete sale by ID
   */
  async deleteById(id) {
    return await Sale.findByIdAndDelete(id);
  }

  /**
   * Find sales by customer
   */
  async findByCustomer(customerId, options = {}) {
    return await Sale.find({ customer: customerId })
      .populate('items.product', 'name sku')
      .populate('items.variant', 'variantName sku')
      .populate('createdBy', 'name email')
      .sort(options.sort || { saleDate: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Find sales by product
   */
  async findByProduct(productId, options = {}) {
    return await Sale.find({ 'items.product': productId })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name email')
      .sort(options.sort || { saleDate: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Get sales by date range
   */
  async findByDateRange(startDate, endDate, options = {}) {
    const filter = {
      saleDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    return await Sale.find(filter)
      .populate('customer', 'name email')
      .populate('items.product', 'name')
      .sort(options.sort || { saleDate: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Get sales summary by date range
   */
  async getSalesSummary(startDate, endDate) {
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalDiscount: { $sum: '$totalDiscount' },
          totalTax: { $sum: '$totalTax' },
          totalPaid: { $sum: '$paidAmount' },
          totalOutstanding: { $sum: '$balanceAmount' },
        },
      },
    ]);
  }

  /**
   * Get sales by payment status
   */
  async findByPaymentStatus(paymentStatus, options = {}) {
    return await Sale.find({ paymentStatus })
      .populate('customer', 'name email phone')
      .populate('createdBy', 'name email')
      .sort(options.sort || { saleDate: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Get overdue invoices
   */
  async findOverdue() {
    return await Sale.find({
      dueDate: { $lt: new Date() },
      paymentStatus: { $in: ['UNPAID', 'PARTIAL'] },
      status: 'COMPLETED',
    })
      .populate('customer', 'name email phone')
      .sort({ dueDate: 1 });
  }

  /**
   * Get daily sales report
   */
  async getDailySalesReport(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate },
          status: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$saleDate' },
          },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalDiscount: { $sum: '$totalDiscount' },
          totalTax: { $sum: '$totalTax' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Get top selling products
   */
  async getTopSellingProducts(limit = 10, startDate, endDate) {
    const matchStage = { status: 'COMPLETED' };
    if (startDate && endDate) {
      matchStage.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return await Sale.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          sku: { $first: '$items.sku' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.lineTotal' },
          salesCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);
  }

  /**
   * Get customer purchase history
   */
  async getCustomerPurchaseHistory(customerId) {
    return await Sale.aggregate([
      { $match: { customer: customerId, status: 'COMPLETED' } },
      {
        $group: {
          _id: '$customer',
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalOutstanding: { $sum: '$balanceAmount' },
          lastPurchaseDate: { $max: '$saleDate' },
        },
      },
    ]);
  }

  /**
   * Get sales by payment method
   */
  async getSalesByPaymentMethod(startDate, endDate) {
    const matchStage = { status: 'COMPLETED' };
    if (startDate && endDate) {
      matchStage.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);
  }
}

module.exports = new SaleRepository();
