const mongoose = require('mongoose');
const { PRODUCT_STATUS } = require('../../shared/constants');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
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
    maxStockLevel: {
      type: Number,
      min: [0, 'Maximum stock level cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['piece', 'kg', 'liter', 'meter', 'box', 'dozen', 'pack'],
      default: 'piece',
    },
    images: [{
      type: String,
      trim: true,
    }],
    trackInventory: {
      type: Boolean,
      default: true,
    },
    reorderPoint: {
      type: Number,
      default: 5,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.ACTIVE,
    },
    expiryDate: {
      type: Date,
    },
    tags: [{
      type: String,
      trim: true,
    }],
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

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', sku: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ quantity: 1 });

// Virtual for price (mapped to sellingPrice for frontend consistency)
productSchema.virtual('price').get(function () {
  return this.sellingPrice;
});

// Virtual for costPrice (mapped to purchasePrice for frontend consistency)
productSchema.virtual('costPrice').get(function () {
  return this.purchasePrice;
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function () {
  return this.sellingPrice - this.purchasePrice;
});

// Virtual for profit percentage
productSchema.virtual('profitPercentage').get(function () {
  if (!this.purchasePrice || this.purchasePrice === 0) return '0.00';
  return ((this.sellingPrice - this.purchasePrice) / this.purchasePrice * 100).toFixed(2);
});

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.minStockLevel;
});

// Virtual for out of stock status
productSchema.virtual('isOutOfStock').get(function () {
  return this.quantity === 0;
});

// Include virtuals in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Post-save hook to check for low stock and send notifications
productSchema.post('save', async function (doc) {
  try {
    // Only check for low stock if the product tracks inventory
    if (doc.trackInventory) {
      const notificationService = require('../notifications/notification.service');

      // Check if stock is at or below reorder point
      if (doc.quantity <= doc.reorderPoint) {
        await notificationService.sendLowStockAlert(doc);
      }
    }
  } catch (error) {
    console.error('Failed to send low stock notification:', error);
    // Don't throw error to prevent disrupting the save operation
  }
});

module.exports = mongoose.model('Product', productSchema);
