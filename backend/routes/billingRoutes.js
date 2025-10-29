const express = require('express');
const router = express.Router();
const path = require('path');
const {
  generateBill,
  shareBill,
  getBillById
} = require('../controllers/billingController');
const { protect, adminOnly } = require('../middleware/auth');

// Protected routes
router.post('/generate', protect, adminOnly, generateBill);
router.post('/share', protect, adminOnly, shareBill);
router.get('/:orderId', protect, getBillById);

// Download bill route
router.get('/download/:filename', protect, (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '..', 'public', 'bills', filename);
    
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading bill'
    });
  }
});

module.exports = router;
