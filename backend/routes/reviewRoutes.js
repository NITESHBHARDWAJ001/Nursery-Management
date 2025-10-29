const express = require('express');
const router = express.Router();
const {
  createReview,
  getPlantReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markHelpful,
  getAllReviews,
  updateReviewStatus
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/plant/:plantId', getPlantReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/my-reviews', protect, getUserReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, markHelpful);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllReviews);
router.put('/admin/:id/status', protect, adminOnly, updateReviewStatus);

module.exports = router;
