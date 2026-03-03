const express = require('express');
const config = require('../config');

// Import module routes
const authRoutes = require('../modules/auth/routes');
const userRoutes = require('../modules/users/routes');
const productRoutes = require('../modules/products/routes');
const categoryRoutes = require('../modules/categories/routes');
const supplierRoutes = require('../modules/suppliers/routes');
const transactionRoutes = require('../modules/transactions/routes');
const customerRoutes = require('../modules/customers/routes');
const saleRoutes = require('../modules/sales/routes');
const purchaseRoutes = require('../modules/purchases/routes');
const reportRoutes = require('../modules/reports/routes');
const notificationRoutes = require('../modules/notifications/routes');
const activityLogRoutes = require('../modules/activityLogs/routes');
const alertRoutes = require('../shared/routes/alert.routes');
const stockLedgerRoutes = require('../shared/routes/stockLedger.routes');

const router = express.Router();

// API Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BhandarX API is running',
    timestamp: new Date().toISOString(),
    version: config.apiVersion,
  });
});

// Mount module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/transactions', transactionRoutes);
router.use('/customers', customerRoutes);
router.use('/sales', saleRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/alerts', alertRoutes);
router.use('/stock-ledger', stockLedgerRoutes);

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = router;
