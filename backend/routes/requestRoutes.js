const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getUserRequests,
  updateRequestStatus,
  deleteRequest
} = require('../controllers/requestController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// User routes
router.post('/', protect, upload.array('images', 3), createRequest);
router.get('/user', protect, getUserRequests);

// Admin routes
router.get('/', protect, adminOnly, getAllRequests);
router.put('/:id/status', protect, adminOnly, updateRequestStatus);
router.delete('/:id', protect, adminOnly, deleteRequest);

module.exports = router;
