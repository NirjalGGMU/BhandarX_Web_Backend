const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      sparse: true, // Allow multiple null emails
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9+\-() ]{7,20}$/, 'Please enter a valid phone number'],
    },
    alternatePhone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-() ]{7,20}$/, 'Please enter a valid phone number'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    customerType: {
      type: String,
      enum: ['RETAIL', 'WHOLESALE', 'CORPORATE'],
      default: 'RETAIL',
    },
    taxId: {
      type: String,
      trim: true,
      maxlength: [50, 'Tax ID cannot exceed 50 characters'],
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: [0, 'Credit limit cannot be negative'],
    },
    outstandingBalance: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
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
customerSchema.index({ name: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ customerType: 1 });
customerSchema.index({ isActive: 1 });
customerSchema.index({ createdAt: -1 });

// Text index for search
customerSchema.index({ name: 'text', email: 'text', phone: 'text' });

// Virtual for full address
customerSchema.virtual('fullAddress').get(function () {
  return this.address || '';
});

// Virtual for available credit
customerSchema.virtual('availableCredit').get(function () {
  return this.creditLimit - this.outstandingBalance;
});

// Virtual for credit utilization percentage
customerSchema.virtual('creditUtilization').get(function () {
  if (this.creditLimit === 0) return 0;
  return (this.outstandingBalance / this.creditLimit) * 100;
});

module.exports = mongoose.model('Customer', customerSchema);
