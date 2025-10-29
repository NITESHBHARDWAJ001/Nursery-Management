const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  type: {
    type: String,
    enum: ['sold', 'purchased', 'adjustment', 'damaged', 'returned'],
    required: true
  },
  quantityChanged: {
    type: Number,
    required: true
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  costPerUnit: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
}, {
  timestamps: true
});

// Index for queries
stockTransactionSchema.index({ plant: 1, date: -1 });
stockTransactionSchema.index({ type: 1, date: -1 });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
