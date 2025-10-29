const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    type: String
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  adminResponse: {
    comment: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reviews
reviewSchema.index({ plant: 1, user: 1 }, { unique: true });

// Index for queries
reviewSchema.index({ plant: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(plantId) {
  const stats = await this.aggregate([
    {
      $match: { plant: plantId, status: 'approved' }
    },
    {
      $group: {
        _id: '$plant',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Plant').findByIdAndUpdate(plantId, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount
    });
  } else {
    await mongoose.model('Plant').findByIdAndUpdate(plantId, {
      rating: 0,
      reviewCount: 0
    });
  }
};

// Update plant rating after save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.plant);
});

// Update plant rating after remove
reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.plant);
});

module.exports = mongoose.model('Review', reviewSchema);
