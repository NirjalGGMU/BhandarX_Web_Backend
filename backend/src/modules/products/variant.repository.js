const ProductVariant = require('./ProductVariant.model');

/**
 * Product Variant Repository
 * Handles database operations for product variants
 */
class VariantRepository {
  /**
   * Create a new variant
   */
  async create(variantData) {
    return await ProductVariant.create(variantData);
  }

  /**
   * Find all variants with filters
   */
  async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;
    return await ProductVariant.find(filter)
      .populate('product', 'name sku')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  /**
   * Count variants
   */
  async count(filter = {}) {
    return await ProductVariant.countDocuments(filter);
  }

  /**
   * Find variant by ID
   */
  async findById(variantId) {
    return await ProductVariant.findById(variantId).populate('product', 'name sku category supplier');
  }

  /**
   * Find variant by SKU
   */
  async findBySku(sku) {
    return await ProductVariant.findOne({ sku: sku.toUpperCase() }).populate('product');
  }

  /**
   * Find variants by product ID
   */
  async findByProduct(productId, options = {}) {
    const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;
    return await ProductVariant.find({ product: productId })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  /**
   * Update variant
   */
  async update(variantId, updateData) {
    return await ProductVariant.findByIdAndUpdate(variantId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete variant
   */
  async delete(variantId) {
    return await ProductVariant.findByIdAndDelete(variantId);
  }

  /**
   * Update variant quantity
   */
  async updateQuantity(variantId, newQuantity) {
    return await ProductVariant.findByIdAndUpdate(
      variantId,
      { quantity: newQuantity },
      { new: true }
    );
  }

  /**
   * Increment variant quantity
   */
  async incrementQuantity(variantId, amount) {
    return await ProductVariant.findByIdAndUpdate(
      variantId,
      { $inc: { quantity: amount } },
      { new: true }
    );
  }

  /**
   * Check if SKU exists
   */
  async checkSkuExists(sku, excludeId = null) {
    const filter = { sku: sku.toUpperCase() };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const variant = await ProductVariant.findOne(filter);
    return !!variant;
  }

  /**
   * Check if barcode exists
   */
  async checkBarcodeExists(barcode, excludeId = null) {
    const filter = { barcode };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const variant = await ProductVariant.findOne(filter);
    return !!variant;
  }

  /**
   * Find low stock variants
   */
  async findLowStock() {
    return await ProductVariant.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
      isActive: true,
    })
      .populate('product', 'name sku')
      .sort({ quantity: 1 });
  }

  /**
   * Find out of stock variants
   */
  async findOutOfStock() {
    return await ProductVariant.find({ quantity: 0, isActive: true })
      .populate('product', 'name sku')
      .sort({ updatedAt: -1 });
  }

  /**
   * Find expiring variants
   */
  async findExpiringSoon(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await ProductVariant.find({
      expiryDate: {
        $gte: new Date(),
        $lte: futureDate,
      },
      isActive: true,
    })
      .populate('product', 'name sku')
      .sort({ expiryDate: 1 });
  }

  /**
   * Find expired variants
   */
  async findExpired() {
    return await ProductVariant.find({
      expiryDate: { $lt: new Date() },
      isActive: true,
    })
      .populate('product', 'name sku')
      .sort({ expiryDate: -1 });
  }

  /**
   * Get total quantity for a product (sum of all variants)
   */
  async getTotalProductQuantity(productId) {
    const result = await ProductVariant.aggregate([
      { $match: { product: productId, isActive: true } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
    ]);
    return result[0]?.totalQuantity || 0;
  }
}

module.exports = new VariantRepository();
