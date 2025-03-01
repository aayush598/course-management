// User Interaction Schema - to track user behavior
const mongoose = require('mongoose');

const UserInteractionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  courseId: {
    type: String,
    required: true,
    index: true
  },
  interactionType: {
    type: String,
    enum: ['view', 'enroll', 'complete', 'favorite', 'search'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // For search interactions
  searchQuery: String,
  // For view interactions
  viewDuration: Number, // in seconds
  // For course completion
  completionPercentage: Number
});

module.exports = mongoose.model('UserInteraction', UserInteractionSchema);
