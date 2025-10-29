const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plant name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['flowering', 'indoor', 'outdoor', 'bonsai', 'succulent', 'herb', 'tree', 'shrub', 'pot', 'fertilizer', 'tool'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  quantityAvailable: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0,
    default: 0
  },
  imageUrl: {
    type: String,
    default: '/images/plants/default-plant.jpg'
  },
  images: [{
    type: String
  }],
  dateAdded: {
    type: Date,
    default: Date.now
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  growthTime: {
    type: String,
    trim: true
  },
  plantType: {
    type: String,
    enum: ['annual', 'perennial', 'biennial', 'evergreen', 'deciduous'],
    default: 'perennial'
  },
  careLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  sunlight: {
    type: String,
    enum: ['full-sun', 'partial-sun', 'shade'],
    default: 'partial-sun'
  },
  wateringFrequency: {
    type: String,
    trim: true
  },
  height: {
    type: String,
    trim: true
  },
  features: [{
    type: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  soldCount: {
    type: Number,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

// Index for search
plantSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for stock status
plantSchema.virtual('stockStatus').get(function() {
  if (this.quantityAvailable === 0) return 'out-of-stock';
  if (this.quantityAvailable <= this.lowStockThreshold) return 'low-stock';
  return 'in-stock';
});

// Ensure virtuals are included in JSON
plantSchema.set('toJSON', { virtuals: true });
plantSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Plant', plantSchema);
