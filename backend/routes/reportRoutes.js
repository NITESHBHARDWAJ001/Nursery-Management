const express = require('express');
const router = express.Router();
const {
  getMonthlyReport,
  getAllReports,
  generateReport,
  exportData,
  getForecast,
  getDashboardStats
} = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin only routes
router.get('/monthly', protect, adminOnly, getMonthlyReport);
router.get('/all', protect, adminOnly, getAllReports);
router.post('/generate', protect, adminOnly, generateReport);
router.get('/export', protect, adminOnly, exportData);
router.get('/forecast', protect, adminOnly, getForecast);
router.get('/dashboard', protect, adminOnly, getDashboardStats);

module.exports = router;
