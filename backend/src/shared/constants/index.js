module.exports = {
  ROLES: {
    ADMIN: 'admin',
    EMPLOYEE: 'employee',
  },

  TRANSACTION_TYPES: {
    STOCK_IN: 'stock_in',
    STOCK_OUT: 'stock_out',
    ADJUSTMENT: 'adjustment',
    RETURN: 'return',
  },

  PRODUCT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DISCONTINUED: 'discontinued',
  },

  SUPPLIER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },

  VALIDATION_MESSAGES: {
    REQUIRED: '{field} is required',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PHONE: 'Invalid phone number',
    MIN_LENGTH: '{field} must be at least {min} characters',
    MAX_LENGTH: '{field} must not exceed {max} characters',
    INVALID_FORMAT: 'Invalid {field} format',
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },

  ALERT_THRESHOLDS: {
    LOW_STOCK: 10,
    CRITICAL_STOCK: 5,
  },

  PAYMENT_METHODS: {
    CASH: 'CASH',
    CARD: 'CARD',
    BANK_TRANSFER: 'BANK_TRANSFER',
    CHEQUE: 'CHEQUE',
    CREDIT: 'CREDIT',
    MOBILE_PAYMENT: 'MOBILE_PAYMENT',
    QR: 'QR',
    WALLET: 'WALLET'
  },

  PAYMENT_STATUS: {
    PAID: 'PAID',
    PARTIAL: 'PARTIAL',
    UNPAID: 'UNPAID',
  },

  SALE_STATUS: {
    DRAFT: 'DRAFT',
    COMPLETED: 'COMPLETED',
    REVERSED: 'REVERSED',
    CANCELLED: 'CANCELLED',
  },

  PURCHASE_ORDER_STATUS: {
    DRAFT: 'DRAFT',
    PENDING: 'PENDING',
    RECEIVED: 'RECEIVED',
    PARTIAL_RECEIVED: 'PARTIAL_RECEIVED',
    CANCELLED: 'CANCELLED',
  },

  CUSTOMER_TYPES: {
    RETAIL: 'RETAIL',
    WHOLESALE: 'WHOLESALE',
    CORPORATE: 'CORPORATE',
  },
};
