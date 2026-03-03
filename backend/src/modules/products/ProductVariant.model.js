const mongoose = require('mongoose');

/**
 * Product Variant Schema
 * Supports different variations of a product (size, color, etc.)
 */
const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Parent product is required'],
    },
    variantName: {
      type: String,
      required: [true, 'Variant name is required'],
      trim: true,
      maxlength: [100, 'Variant name cannot exceed 100 characters'],
    },
    sku: {
      type: String,
      required: [true, 'Variant SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    attributes: {
      type: Map,
      of: String,
      // Example: { size: 'Large', color: 'Red', material: 'Cotton' }
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: [0, 'Minimum stock level cannot be negative'],
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: {
        type: String,
        enum: ['cm', 'inch', 'meter'],
        default: 'cm',
      },
    },
    images: [{
      type: String,
    }],
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
variantSchema.index({ product: 1 });
variantSchema.index({ sku: 1 });
variantSchema.index({ barcode: 1 });
variantSchema.index({ isActive: 1 });

// Text index for search
variantSchema.index({ variantName: 'text', sku: 'text' });

// Virtual for profit margin
variantSchema.virtual('profitMargin').get(function () {
  return this.sellingPrice - this.purchasePrice;
});

// Virtual for profit percentage
variantSchema.virtual('profitPercentage').get(function () {
  if (this.purchasePrice === 0) return 0;
  return ((this.sellingPrice - this.purchasePrice) / this.purchasePrice) * 100;
});

// Virtual for low stock status
variantSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.minStockLevel;
});

// Virtual for out of stock status
variantSchema.virtual('isOutOfStock').get(function () {
  return this.quantity === 0;
});

// Virtual for expiry status
variantSchema.virtual('isExpiringSoon').get(function () {
  if (!this.expiryDate) return false;
  const daysUntilExpiry = Math.ceil((this.expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
});

// Virtual for expired status
variantSchema.virtual('isExpired').get(function () {
  if (!this.expiryDate) return false;
  return this.expiryDate < Date.now();
});

// Include virtuals in JSON output
variantSchema.set('toJSON', { virtuals: true });
variantSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ProductVariant', variantSchema);
