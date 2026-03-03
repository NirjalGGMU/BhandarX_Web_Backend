const Sale = require('../sales/Sale.model');
const PurchaseOrder = require('../purchases/PurchaseOrder.model');
const Product = require('../products/Product.model');
const Customer = require('../customers/Customer.model');
const User = require('../auth/User.model');
const Transaction = require('../transactions/Transaction.model');

/**
 * Dashboard Service
 * Provides summary statistics and dashboard data
 */
class DashboardService {
  /**
   * Get dashboard summary statistics
   */
  async getDashboardSummary(startDate, endDate) {
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get counts
    const [
      totalProducts,
      totalCustomers,
      totalUsers,
      lowStockProducts,
      salesStats,
      purchaseStats,
      recentSales,
      recentPurchases,
      inventoryValuation,
      salesTrends,
      categorySales,
      recentProducts,
      lowStockProductsList,
      todayAdjustments,
    ] = await Promise.all([
      Product.countDocuments({ status: 'active' }),
      Customer.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Product.countDocuments({
        status: 'active',
        $expr: { $lte: ['$quantity', '$minStockLevel'] },
      }),
      this.getSalesSummary(startDate, endDate),
      this.getPurchasesSummary(startDate, endDate),
      Sale.find({ status: 'COMPLETED' })
        .populate('customer', 'name email')
        .sort({ saleDate: -1 })
        .limit(5)
        .select('invoiceNumber totalAmount saleDate paymentStatus'),
      PurchaseOrder.find()
        .populate('supplier', 'name code')
        .sort({ orderDate: -1 })
        .limit(5)
        .select('poNumber totalAmount orderDate status'),
      this.getInventoryValuation(),
      this.getSalesTrends('daily', 30),
      this.getCategoryWiseSales(startDate, endDate),
      Product.find({ status: 'active' })
        .sort({ updatedAt: -1 })
        .limit(8),
      this.getLowStockProducts(5),
      this.getTodayAdjustments(),
    ]);

    return {
      overview: {
        totalProducts,
        totalCustomers,
        totalUsers,
        lowStockProducts,
        inventoryValue: inventoryValuation.totalValue || 0,
        lowStockProductsList: lowStockProductsList,
        todayAdjustments: todayAdjustments,
      },
      sales: salesStats,
      purchases: purchaseStats,
      recentActivity: {
        sales: recentSales,
        purchases: recentPurchases,
        products: recentProducts,
      },
      trends: salesTrends,
      categoryDistribution: categorySales,
    };
  }

  /**
   * Get count of stock adjustments made today
   */
  async getTodayAdjustments() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return await Transaction.countDocuments({
      type: 'ADJUSTMENT',
      transactionDate: { $gte: startOfDay }
    });
  }

  /**
   * Get sales summary
   */
  async getSalesSummary(startDate, endDate) {
    const matchStage = { status: 'COMPLETED' };
    if (startDate && endDate) {
      matchStage.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const result = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit: { $sum: { $subtract: ['$totalAmount', '$totalDiscount'] } },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);

    return result.length > 0 ? result[0] : {
      totalSales: 0,
      totalRevenue: 0,
      totalProfit: 0,
      averageOrderValue: 0,
    };
  }

  /**
   * Get purchases summary
   */
  async getPurchasesSummary(startDate, endDate) {
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const result = await PurchaseOrder.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);

    return result.length > 0 ? result[0] : {
      totalPurchases: 0,
      totalAmount: 0,
      averageOrderValue: 0,
    };
  }

  /**
   * Get inventory valuation
   */
  async getInventoryValuation() {
    const result = await Product.aggregate([
      {
        $match: {
          status: 'active',
        },
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
          totalCost: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } },
        },
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          totalQuantity: 1,
          totalValue: 1,
          totalCost: 1,
          potentialProfit: { $subtract: ['$totalValue', '$totalCost'] },
        },
      },
    ]);

    return result.length > 0 ? result[0] : {
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0,
      totalCost: 0,
      potentialProfit: 0,
    };
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(limit = 20) {
    return await Product.find({
      status: 'active',
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
    })
      .select('name sku quantity minStockLevel category')
      .populate('category', 'name')
      .sort({ quantity: 1 })
      .limit(limit);
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
          averagePrice: { $avg: '$items.unitPrice' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $project: {
          productName: 1,
          sku: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          salesCount: 1,
          averagePrice: 1,
          currentStock: { $arrayElemAt: ['$productDetails.quantity', 0] },
        },
      },
    ]);
  }

  /**
   * Get sales trends (daily/monthly)
   */
  async getSalesTrends(period = 'daily', days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const groupByFormat = period === 'monthly'
      ? '%Y-%m'
      : '%Y-%m-%d';

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
            $dateToString: { format: groupByFormat, date: '$saleDate' },
          },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalDiscount: { $sum: '$totalDiscount' },
          totalTax: { $sum: '$totalTax' },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Get payment method distribution
   */
  async getPaymentMethodDistribution(startDate, endDate) {
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
          percentage: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(limit = 10) {
    return await Sale.aggregate([
      { $match: { status: 'COMPLETED', customer: { $ne: null } } },
      {
        $group: {
          _id: '$customer',
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalOutstanding: { $sum: '$balanceAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          lastPurchaseDate: { $max: '$saleDate' },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {
        $project: {
          customerName: { $arrayElemAt: ['$customerDetails.name', 0] },
          customerEmail: { $arrayElemAt: ['$customerDetails.email', 0] },
          customerType: { $arrayElemAt: ['$customerDetails.customerType', 0] },
          totalPurchases: 1,
          totalSpent: 1,
          totalPaid: 1,
          totalOutstanding: 1,
          averageOrderValue: 1,
          lastPurchaseDate: 1,
        },
      },
    ]);
  }

  /**
   * Get category-wise sales
   */
  async getCategoryWiseSales(startDate, endDate) {
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
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.lineTotal' },
          salesCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $project: {
          categoryName: { $arrayElemAt: ['$categoryInfo.name', 0] },
          totalQuantity: 1,
          totalRevenue: 1,
          salesCount: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);
  }
}

module.exports = new DashboardService();
