// ...existing code...
const express = require('express');
const router = express.Router();
const {
  updateStock,
  getStockTransactions,
  getPlantStockHistory,
  generatePurchaseOrder,
  exportPurchaseOrder,
  recordShopSale,
  getShopSales,
  exportShopSales
} = require('../controllers/stockController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin only routes
router.post('/update', protect, adminOnly, updateStock);
router.get('/transactions', protect, adminOnly, getStockTransactions);
router.get('/history/:plantId', protect, adminOnly, getPlantStockHistory);
router.post('/purchase-order', protect, adminOnly, generatePurchaseOrder);
router.post('/export-purchase-order', protect, adminOnly, exportPurchaseOrder);

// Shop Sale endpoints
router.post('/shop-sale', protect, adminOnly, recordShopSale);
router.get('/shop-sale', protect, adminOnly, getShopSales);

// Export shop sales data
router.get('/export-shop-sales', protect, adminOnly, exportShopSales);

module.exports = router;
