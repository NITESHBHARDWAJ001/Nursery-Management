const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestType: {
    type: String,
    enum: ['newVariety', 'onsitePlantation', 'customOrder', 'consultation'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  preferredDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'in-progress'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  location: {
    type: String
  },
  contactNumber: {
    type: String
  },
  adminNotes: {
    type: String
  },
  images: [{
    type: String
  }],
  responseDate: {
    type: Date
  },
  completionDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for queries
requestSchema.index({ user: 1, createdAt: -1 });
requestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);
