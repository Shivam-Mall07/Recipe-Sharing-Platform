const mongoose = require('mongoose');

// Define Recipe Schema for MongoDB
const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Recipe description is required']
  },
  ingredients: {
    type: [String], // Array of strings (e.g. ["2 eggs", "1 cup milk"])
    required: [true, 'Ingredients are required']
  },
  steps: {
    type: [String], // Array of strings representing cooking steps in order
    required: [true, 'Cooking steps are required']
  },
  cookingTime: {
    type: Number, // In minutes
    required: [true, 'Cooking time (in minutes) is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks']
  },
  image: {
    type: String, // Path of image endpoint, e.g. /api/recipes/:id/image
    required: [true, 'Recipe image is required']
  },
  imageData: {
    type: Buffer,
    required: [true, 'Binary image data is required']
  },
  imageContentType: {
    type: String,
    required: [true, 'Image Content-Type is required']
  },
  tags: {
    type: [String], // Descriptive tags (e.g. ["healthy", "quick", "spicy"])
    default: []
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  averageRating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);
