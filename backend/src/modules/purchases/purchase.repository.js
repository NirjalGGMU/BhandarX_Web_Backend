const PurchaseOrder = require('./PurchaseOrder.model');

/**
 * Purchase Order Repository
 * Data access layer for PurchaseOrder model
 */
class PurchaseOrderRepository {
  /**
   * Create a new purchase order
   */
  async create(poData) {
    const purchaseOrder = new PurchaseOrder(poData);
    return await purchaseOrder.save();
  }

  /**
   * Find all purchase orders with filters
   */
  async findAll(filter = {}, options = {}) {
    return await PurchaseOrder.find(filter)
      .populate('supplier', 'name code email phone')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name email')
      .sort(options.sort || { orderDate: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Count purchase orders
   */
  async count(filter = {}) {
    return await PurchaseOrder.countDocuments(filter);
  }

  /**
   * Find purchase order by ID
   */
  async findById(id) {
    return await PurchaseOrder.findById(id)
      .populate('supplier', 'name code email phone address contactPerson')
      .populate('items.product', 'name sku category')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
  }

  /**
   * Find purchase order by PO number
   */
  async findByPONumber(poNumber) {
    return await PurchaseOrder.findOne({ poNumber })
      .populate('supplier', 'name code email phone')
      .populate('items.product', 'name sku');
  }

  /**
   * Update purchase order by ID
   */
  async updateById(id, updateData) {
    return await PurchaseOrder.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete purchase order by ID
   */
  async deleteById(id) {
    return await PurchaseOrder.findByIdAndDelete(id);
  }

  /**
   * Find purchase orders by supplier
   */
  async findBySupplier(supplierId, options = {}) {
    return await PurchaseOrder.find({ supplier: supplierId })
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name email')
      .sort(options.sort || { orderDate: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Find purchase orders by product
   */
  async findByProduct(productId, options = {}) {
    return await PurchaseOrder.find({ 'items.product': productId })
      .populate('supplier', 'name code email phone')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name email')
      .sort(options.sort || { orderDate: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Get purchase orders by date range
   */
  async findByDateRange(startDate, endDate, options = {}) {
    const filter = {
      orderDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    return await PurchaseOrder.find(filter)
      .populate('supplier', 'name code email')
      .populate('items.product', 'name')
      .sort(options.sort || { orderDate: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Get purchase orders summary
   */
  async getPurchasesSummary(startDate, endDate) {
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return await PurchaseOrder.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalOutstanding: { $sum: '$balanceAmount' },
        },
      },
    ]);
  }

  /**
   * Get purchase orders by status
   */
  async findByStatus(status, options = {}) {
    return await PurchaseOrder.find({ status })
      .populate('supplier', 'name code email phone')
      .populate('createdBy', 'name email')
      .sort(options.sort || { orderDate: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Get pending deliveries
   */
  async findPendingDeliveries() {
    return await PurchaseOrder.find({
      status: { $in: ['PENDING', 'PARTIAL_RECEIVED'] },
    })
      .populate('supplier', 'name code email phone')
      .sort({ expectedDeliveryDate: 1 });
  }

  /**
   * Get overdue deliveries
   */
  async findOverdueDeliveries() {
    return await PurchaseOrder.find({
      expectedDeliveryDate: { $lt: new Date() },
      status: { $in: ['PENDING', 'PARTIAL_RECEIVED'] },
    })
      .populate('supplier', 'name code email phone')
      .sort({ expectedDeliveryDate: 1 });
  }

  /**
   * Get supplier purchase history
   */
  async getSupplierPurchaseHistory(supplierId) {
    return await PurchaseOrder.aggregate([
      { $match: { supplier: supplierId } },
      {
        $group: {
          _id: '$supplier',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalOutstanding: { $sum: '$balanceAmount' },
          lastOrderDate: { $max: '$orderDate' },
        },
      },
    ]);
  }

  /**
   * Get most purchased products
   */
  async getMostPurchasedProducts(limit = 10, startDate, endDate) {
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return await PurchaseOrder.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          sku: { $first: '$items.sku' },
          totalQuantity: { $sum: '$items.quantity' },
          totalReceived: { $sum: '$items.receivedQuantity' },
          totalCost: { $sum: '$items.lineTotal' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);
  }

  /**
   * Get daily purchase report
   */
  async getDailyPurchaseReport(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await PurchaseOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$orderDate' },
          },
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}

module.exports = new PurchaseOrderRepository();
