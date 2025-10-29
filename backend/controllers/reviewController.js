const Review = require('../models/Review');
const Plant = require('../models/Plant');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { plantId, rating, title, comment, orderId } = req.body;

    // Validation
    if (!plantId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if plant exists
    const plant = await Plant.findById(plantId);
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    // Check if user already reviewed this plant
    const existingReview = await Review.findOne({
      plant: plantId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this plant'
      });
    }

    // Check if verified purchase
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
        status: 'delivered'
      });

      if (order) {
        const plantInOrder = order.items.some(
          item => item.plant.toString() === plantId
        );
        if (plantInOrder) {
          isVerifiedPurchase = true;
        }
      }
    }

    // Create review
    const review = await Review.create({
      plant: plantId,
      user: req.user._id,
      order: orderId || null,
      rating,
      title,
      comment,
      isVerifiedPurchase
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('plant', 'name imageUrl');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this plant'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// @desc    Get reviews for a plant
// @route   GET /api/reviews/plant/:plantId
// @access  Public
exports.getPlantReviews = async (req, res) => {
  try {
    const { plantId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      plant: plantId,
      status: 'approved'
    })
      .populate('user', 'name')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    const total = await Review.countDocuments({
      plant: plantId,
      status: 'approved'
    });

    // Get rating distribution
    const ratingStats = await Review.aggregate([
      {
        $match: { plant: new mongoose.Types.ObjectId(plantId), status: 'approved' }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    ratingStats.forEach(stat => {
      distribution[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      ratingDistribution: distribution
    });
  } catch (error) {
    console.error('Get plant reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user: req.user._id })
      .populate('plant', 'name imageUrl price')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip);

    const total = await Review.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('plant', 'name imageUrl');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership or admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const plantId = review.plant;
    await review.remove();

    // Recalculate plant rating
    await Review.calculateAverageRating(plantId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked as helpful
    const alreadyMarked = review.helpfulBy.includes(req.user._id);

    if (alreadyMarked) {
      // Remove helpful mark
      review.helpfulBy = review.helpfulBy.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add helpful mark
      review.helpfulBy.push(req.user._id);
      review.helpfulCount += 1;
    }

    await review.save();

    res.json({
      success: true,
      message: alreadyMarked ? 'Helpful mark removed' : 'Marked as helpful',
      data: {
        helpfulCount: review.helpfulCount,
        isHelpful: !alreadyMarked
      }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking review as helpful',
      error: error.message
    });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      rating,
      search
    } = req.query;

    const skip = (page - 1) * limit;
    let query = {};

    if (status) query.status = status;
    if (rating) query.rating = Number(rating);
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('plant', 'name imageUrl')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip);

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Update review status (Admin)
// @route   PUT /api/reviews/admin/:id/status
// @access  Private/Admin
exports.updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (status) review.status = status;

    if (adminResponse) {
      review.adminResponse = {
        comment: adminResponse,
        respondedAt: new Date(),
        respondedBy: req.user._id
      };
    }

    await review.save();

    // Recalculate rating if status changed
    if (status) {
      await Review.calculateAverageRating(review.plant);
    }

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('plant', 'name imageUrl')
      .populate('adminResponse.respondedBy', 'name');

    res.json({
      success: true,
      message: 'Review status updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review status',
      error: error.message
    });
  }
};
