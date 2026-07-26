const Rating = require('../models/rating');
const Recipe = require('../models/recipe');

/**
 * Helper function to recalculate the average rating of a recipe.
 * Updates the Recipe document directly in MongoDB.
 */
const updateRecipeAverageRating = async (recipeId) => {
  try {
    const ratings = await Rating.find({ recipe: recipeId });
    
    if (ratings.length === 0) {
      await Recipe.findByIdAndUpdate(recipeId, { averageRating: 0 });
      return;
    }

    const sum = ratings.reduce((acc, current) => acc + current.rating, 0);
    const average = sum / ratings.length;

    // Save with 1 decimal place precision
    await Recipe.findByIdAndUpdate(recipeId, { 
      averageRating: Math.round(average * 10) / 10 
    });
  } catch (error) {
    console.error('Error recalculating recipe average rating:', error.message);
  }
};

/**
 * @desc    Add or update rating for a recipe
 * @route   POST /api/ratings
 * @access  Private (Logged in users only)
 */
const addOrUpdateRating = async (req, res) => {
  try {
    const { recipe, rating } = req.body;
    const userId = req.user;

    // Validate request inputs
    if (!recipe || !rating) {
      return res.status(400).json({ message: 'Recipe ID and rating value are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify recipe exists
    const recipeDoc = await Recipe.findById(recipe);
    if (!recipeDoc) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the user has already rated this recipe
    let existingRating = await Rating.findOne({ recipe, user: userId });

    if (existingRating) {
      // If rating exists, update it
      existingRating.rating = rating;
      await existingRating.save();
      await updateRecipeAverageRating(recipe);
      return res.json({ message: 'Rating updated successfully', rating: existingRating });
    } else {
      // If rating does not exist, create new rating
      const newRating = await Rating.create({
        recipe,
        user: userId,
        rating
      });
      await updateRecipeAverageRating(recipe);
      return res.status(201).json({ message: 'Rating added successfully', rating: newRating });
    }
  } catch (error) {
    console.error('Add/Update Rating Error:', error.message);
    res.status(500).json({ message: 'Server error, failed to submit rating' });
  }
};

/**
 * @desc    Update a specific rating by ID
 * @route   PUT /api/ratings/:id
 * @access  Private (Logged in rating owner only)
 */
const updateRatingById = async (req, res) => {
  try {
    const { rating } = req.body;
    const ratingId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const ratingDoc = await Rating.findById(ratingId);

    if (!ratingDoc) {
      return res.status(404).json({ message: 'Rating record not found' });
    }

    // Check if current user is the owner of the rating
    if (ratingDoc.user.toString() !== req.user) {
      return res.status(403).json({ message: 'Not authorized to update this rating' });
    }

    ratingDoc.rating = rating;
    await ratingDoc.save();

    // Recalculate average rating for the corresponding recipe
    await updateRecipeAverageRating(ratingDoc.recipe);

    res.json({ message: 'Rating updated successfully', rating: ratingDoc });
  } catch (error) {
    console.error('Update Rating ID Error:', error.message);
    res.status(500).json({ message: 'Server error, failed to update rating' });
  }
};

module.exports = {
  addOrUpdateRating,
  updateRatingById
};
