const mongoose = require('mongoose');

const purchaseOrderLineItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
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
  receivedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Received quantity cannot be negative'],
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

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    items: [purchaseOrderLineItemSchema],
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
      enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT'],
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PARTIAL', 'UNPAID'],
      default: 'UNPAID',
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'RECEIVED', 'PARTIAL_RECEIVED', 'CANCELLED'],
      default: 'PENDING',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
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
purchaseOrderSchema.index({ supplier: 1, orderDate: -1 });
purchaseOrderSchema.index({ orderDate: -1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ paymentStatus: 1 });
purchaseOrderSchema.index({ createdBy: 1 });

// Virtual for is fully received
purchaseOrderSchema.virtual('isFullyReceived').get(function () {
  return this.items.every(item => item.receivedQuantity >= item.quantity);
});

// Virtual for is partially received
purchaseOrderSchema.virtual('isPartiallyReceived').get(function () {
  return this.items.some(item => item.receivedQuantity > 0 && item.receivedQuantity < item.quantity);
});

// Pre-save middleware to calculate totals
purchaseOrderSchema.pre('save', function (next) {
  // Calculate line totals
  this.items.forEach(item => {
    const discountAmount = (item.unitPrice * item.quantity * item.discount) / 100;
    const afterDiscount = (item.unitPrice * item.quantity) - discountAmount;
    const taxAmount = (afterDiscount * item.tax) / 100;
    item.lineTotal = afterDiscount + taxAmount;
  });

  // Calculate purchase totals
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

  // Update delivery status
  if (this.isFullyReceived) {
    this.status = 'RECEIVED';
  } else if (this.isPartiallyReceived) {
    this.status = 'PARTIAL_RECEIVED';
  }

  next();
});

// Static method to generate PO number
purchaseOrderSchema.statics.generatePONumber = async function () {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `PO-${year}${month}-`;

  const lastPO = await this.findOne({
    poNumber: { $regex: `^${prefix}` },
  }).sort({ poNumber: -1 });

  let nextNumber = 1;
  if (lastPO) {
    const lastNumber = parseInt(lastPO.poNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

// Post-save hook to send purchase received notifications
purchaseOrderSchema.post('save', async function (doc) {
  try {
    const notificationService = require('../notifications/notification.service');
    const activityLogService = require('../activityLogs/activityLog.service');
    
    // Check if purchase was received (fully or partially)
    if ((doc.status === 'RECEIVED' || doc.status === 'PARTIAL_RECEIVED') && doc.createdBy) {
      // Send purchase received notification
      await notificationService.sendPurchaseReceivedNotification(doc, doc.createdBy);
      
      // Log activity
      await activityLogService.log({
        user: doc.createdBy,
        action: 'PURCHASE_RECEIVED',
        resourceType: 'PURCHASE',
        resourceId: doc._id,
        description: `Purchase ${doc.poNumber} ${doc.status === 'RECEIVED' ? 'fully' : 'partially'} received`,
        changes: {
          after: {
            poNumber: doc.poNumber,
            status: doc.status,
            totalAmount: doc.totalAmount,
          },
        },
        status: 'SUCCESS',
        severity: 'INFO',
      });
    }
  } catch (error) {
    console.error('Failed to send purchase notification:', error);
    // Don't throw error to prevent disrupting the save operation
  }
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
