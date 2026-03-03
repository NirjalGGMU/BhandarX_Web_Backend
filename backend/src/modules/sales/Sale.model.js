const mongoose = require('mongoose');

const saleLineItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
  },
  productName: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative'],
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative'],
  },
  lineTotal: {
    type: Number,
    required: true,
  },
}, { _id: true });

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    items: [saleLineItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    totalTax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    balanceAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT', 'MOBILE_PAYMENT', 'QR', 'WALLET'],
      default: 'CASH',
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PARTIAL', 'UNPAID'],
      default: 'UNPAID',
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['DRAFT', 'COMPLETED', 'REVERSED', 'CANCELLED'],
      default: 'COMPLETED',
    },
    reversedAt: {
      type: Date,
    },
    reversedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reversalReason: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
saleSchema.index({ invoiceNumber: 1 });
saleSchema.index({ customer: 1, saleDate: -1 });
saleSchema.index({ saleDate: -1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ status: 1 });
saleSchema.index({ createdBy: 1 });
saleSchema.index({ 'items.product': 1 });
saleSchema.index({ 'items.variant': 1 });

// Virtual for isPaid
saleSchema.virtual('isPaid').get(function () {
  return this.paymentStatus === 'PAID';
});

// Virtual for isOverdue
saleSchema.virtual('isOverdue').get(function () {
  if (this.paymentStatus === 'PAID' || !this.dueDate) return false;
  return new Date() > this.dueDate;
});

// Virtual for days overdue
saleSchema.virtual('daysOverdue').get(function () {
  if (!this.isOverdue) return 0;
  const diffTime = Math.abs(new Date() - this.dueDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to calculate totals
saleSchema.pre('save', function (next) {
  // Calculate line totals
  this.items.forEach(item => {
    const discountAmount = (item.unitPrice * item.quantity * item.discount) / 100;
    const afterDiscount = (item.unitPrice * item.quantity) - discountAmount;
    const taxAmount = (afterDiscount * item.tax) / 100;
    item.lineTotal = afterDiscount + taxAmount;
  });

  // Calculate sale totals
  this.subtotal = this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  this.totalDiscount = this.items.reduce((sum, item) => {
    return sum + ((item.unitPrice * item.quantity * item.discount) / 100);
  }, 0);
  this.totalTax = this.items.reduce((sum, item) => {
    const afterDiscount = (item.unitPrice * item.quantity) - ((item.unitPrice * item.quantity * item.discount) / 100);
    return sum + ((afterDiscount * item.tax) / 100);
  }, 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + item.lineTotal, 0);
  this.balanceAmount = this.totalAmount - this.paidAmount;

  // Update payment status
  if (this.paidAmount === 0) {
    this.paymentStatus = 'UNPAID';
  } else if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'PAID';
  } else {
    this.paymentStatus = 'PARTIAL';
  }

  next();
});

// Static method to generate invoice number
saleSchema.statics.generateInvoiceNumber = async function () {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `INV-${year}${month}-`;

  const lastSale = await this.findOne({
    invoiceNumber: { $regex: `^${prefix}` },
  }).sort({ invoiceNumber: -1 });

  let nextNumber = 1;
  if (lastSale) {
    const lastNumber = parseInt(lastSale.invoiceNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

// Post-save hook to send sale completion notifications
saleSchema.post('save', async function (doc) {
  try {
    const notificationService = require('../notifications/notification.service');
    const activityLogService = require('../activityLogs/activityLog.service');

    // Check if this is a newly completed sale (not an update)
    if (doc.status === 'COMPLETED' && doc.createdBy) {
      // Send sale completion notification
      await notificationService.sendSaleCompletedNotification(doc, doc.createdBy);

      // Log activity
      await activityLogService.logSaleCompleted(
        doc.createdBy,
        doc._id,
        `Sale ${doc.invoiceNumber} completed for total ${doc.totalAmount}`,
        {
          invoiceNumber: doc.invoiceNumber,
          totalAmount: doc.totalAmount,
          customer: doc.customer,
        }
      );
    }

    // Check if sale was reversed
    if (doc.status === 'REVERSED' && doc.reversedBy) {
      await activityLogService.logSaleReversal(
        doc.reversedBy,
        doc._id,
        `Sale ${doc.invoiceNumber} reversed`,
        doc.reversalReason
      );
    }
  } catch (error) {
    console.error('Failed to send sale notification:', error);
    // Don't throw error to prevent disrupting the save operation
  }
});

module.exports = mongoose.model('Sale', saleSchema);
