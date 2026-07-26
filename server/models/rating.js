const mongoose = require('mongoose');

// Define Rating Schema for MongoDB
const ratingSchema = new mongoose.Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating value is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  }
}, {
  timestamps: true
});

// Prevent a user from rating the same recipe multiple times, force unique combinations
ratingSchema.index({ recipe: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
