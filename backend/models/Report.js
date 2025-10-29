const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  totalExpenses: {
    type: Number,
    default: 0
  },
  profit: {
    type: Number,
    default: 0
  },
  forecastedDemand: [{
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant'
    },
    plantName: String,
    predictedQuantity: Number
  }],
  topSellingPlants: [{
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant'
    },
    plantName: String,
    quantitySold: Number,
    revenue: Number
  }],
  lowStockItems: [{
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant'
    },
    plantName: String,
    currentStock: Number
  }],
  newCustomers: {
    type: Number,
    default: 0
  },
  reportFileUrl: {
    type: String
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Unique index for month-year combination
reportSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
