const productRepository = require('../../modules/products/product.repository');
const variantRepository = require('../../modules/products/variant.repository');
const logger = require('../../config/logger');

/**
 * Alert Service
 * Handles low-stock and expiry alerts for products and variants
 */
class AlertService {
  /**
   * Get all low stock products
   * @returns {Promise<Object>} Low stock products and variants
   */
  async getLowStockAlerts() {
    const [products, variants] = await Promise.all([
      productRepository.findLowStock(),
      variantRepository.findLowStock(),
    ]);

    return {
      products: products.map((p) => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        currentStock: p.quantity,
        minStockLevel: p.minStockLevel,
        difference: p.minStockLevel - p.quantity,
        category: p.category,
        supplier: p.supplier,
      })),
      variants: variants.map((v) => ({
        id: v._id,
        productName: v.product?.name,
        variantName: v.variantName,
        sku: v.sku,
        currentStock: v.quantity,
        minStockLevel: v.minStockLevel,
        difference: v.minStockLevel - v.quantity,
        attributes: v.attributes,
      })),
      totalAlerts: products.length + variants.length,
    };
  }

  /**
   * Get out of stock products
   * @returns {Promise<Object>} Out of stock products and variants
   */
  async getOutOfStockAlerts() {
    const [products, variants] = await Promise.all([
      productRepository.findOutOfStock(),
      variantRepository.findOutOfStock(),
    ]);

    return {
      products: products.map((p) => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        supplier: p.supplier,
        lastUpdated: p.updatedAt,
      })),
      variants: variants.map((v) => ({
        id: v._id,
        productName: v.product?.name,
        variantName: v.variantName,
        sku: v.sku,
        attributes: v.attributes,
        lastUpdated: v.updatedAt,
      })),
      totalAlerts: products.length + variants.length,
    };
  }

  /**
   * Get expiry alerts
   * @param {number} days - Number of days to look ahead (default: 30)
   * @returns {Promise<Object>} Expiring and expired items
   */
  async getExpiryAlerts(days = 30) {
    // Get products with expiry dates
    const productsExpiringSoon = await productRepository.findAll({
      expiryDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
      status: 'active',
    });

    const productsExpired = await productRepository.findAll({
      expiryDate: { $lt: new Date() },
      status: 'active',
    });

    // Get variants with expiry dates
    const [variantsExpiringSoon, variantsExpired] = await Promise.all([
      variantRepository.findExpiringSoon(days),
      variantRepository.findExpired(),
    ]);

    return {
      expiringSoon: {
        products: productsExpiringSoon.map((p) => ({
          id: p._id,
          name: p.name,
          sku: p.sku,
          expiryDate: p.expiryDate,
          daysUntilExpiry: Math.ceil(
            (p.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)
          ),
          quantity: p.quantity,
          category: p.category,
        })),
        variants: variantsExpiringSoon.map((v) => ({
          id: v._id,
          productName: v.product?.name,
          variantName: v.variantName,
          sku: v.sku,
          expiryDate: v.expiryDate,
          daysUntilExpiry: Math.ceil(
            (v.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)
          ),
          quantity: v.quantity,
          attributes: v.attributes,
        })),
      },
      expired: {
        products: productsExpired.map((p) => ({
          id: p._id,
          name: p.name,
          sku: p.sku,
          expiryDate: p.expiryDate,
          daysExpired: Math.ceil(
            (Date.now() - p.expiryDate) / (1000 * 60 * 60 * 24)
          ),
          quantity: p.quantity,
          category: p.category,
        })),
        variants: variantsExpired.map((v) => ({
          id: v._id,
          productName: v.product?.name,
          variantName: v.variantName,
          sku: v.sku,
          expiryDate: v.expiryDate,
          daysExpired: Math.ceil(
            (Date.now() - v.expiryDate) / (1000 * 60 * 60 * 24)
          ),
          quantity: v.quantity,
          attributes: v.attributes,
        })),
      },
      totalExpiringSoon:
        productsExpiringSoon.length + variantsExpiringSoon.length,
      totalExpired: productsExpired.length + variantsExpired.length,
    };
  }

  /**
   * Get all alerts summary
   * @returns {Promise<Object>} Summary of all alerts
   */
  async getAllAlertsSummary() {
    const [lowStock, outOfStock, expiry] = await Promise.all([
      this.getLowStockAlerts(),
      this.getOutOfStockAlerts(),
      this.getExpiryAlerts(30),
    ]);

    return {
      lowStock: {
        count: lowStock.totalAlerts,
        products: lowStock.products.length,
        variants: lowStock.variants.length,
      },
      outOfStock: {
        count: outOfStock.totalAlerts,
        products: outOfStock.products.length,
        variants: outOfStock.variants.length,
      },
      expiry: {
        expiringSoon: expiry.totalExpiringSoon,
        expired: expiry.totalExpired,
        total: expiry.totalExpiringSoon + expiry.totalExpired,
      },
      totalAlerts:
        lowStock.totalAlerts +
        outOfStock.totalAlerts +
        expiry.totalExpiringSoon +
        expiry.totalExpired,
    };
  }

  /**
   * Check if product needs reorder
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Reorder information
   */
  async checkReorderLevel(productId) {
    const product = await productRepository.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const needsReorder = product.quantity <= product.minStockLevel;
    const reorderQuantity = needsReorder
      ? (product.maxStockLevel || product.minStockLevel * 3) - product.quantity
      : 0;

    return {
      productId: product._id,
      name: product.name,
      sku: product.sku,
      currentStock: product.quantity,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      needsReorder,
      reorderQuantity,
      supplier: product.supplier,
    };
  }

  /**
   * Log alert (for logging purposes)
   * @param {string} type - Alert type
   * @param {Object} data - Alert data
   */
  logAlert(type, data) {
    logger.warn(`[ALERT] ${type}:`, data);
  }
}

module.exports = new AlertService();
