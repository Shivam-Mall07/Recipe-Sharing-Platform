const Review = require('../models/review');
const Recipe = require('../models/recipe');

/**
 * @desc    Add a review/comment to a recipe
 * @route   POST /api/reviews
 * @access  Private (Logged in users only)
 */
const addReview = async (req, res) => {
  try {
    const { recipe, comment } = req.body;
    const userId = req.user;

    if (!recipe || !comment) {
      return res.status(400).json({ message: 'Recipe ID and comment text are required' });
    }

    // Verify target recipe exists
    const recipeDoc = await Recipe.findById(recipe);
    if (!recipeDoc) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const review = await Review.create({
      recipe,
      user: userId,
      comment
    });

    // Populate user info so frontend gets user name immediately
    const populatedReview = await review.populate('user', 'name');

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('Add Review Error:', error.message);
    res.status(500).json({ message: 'Server error, failed to post review' });
  }
};

/**
 * @desc    Update a review comment
 * @route   PUT /api/reviews/:id
 * @access  Private (Only review owner can update)
 */
const updateReview = async (req, res) => {
  try {
    const { comment } = req.body;
    const reviewId = req.params.id;

    if (!comment) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Verify current logged-in user is the author of this review
    if (review.user.toString() !== req.user) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    review.comment = comment;
    await review.save();

    // Populate user details for returning
    const populatedReview = await review.populate('user', 'name');

    res.json(populatedReview);
  } catch (error) {
    console.error('Update Review Error:', error.message);
    res.status(500).json({ message: 'Server error, failed to update review' });
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Only review owner can delete)
 */
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Verify current logged-in user is the author of this review
    if (review.user.toString() !== req.user) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.deleteOne({ _id: reviewId });

    res.json({ message: 'Review deleted successfully', reviewId });
  } catch (error) {
    console.error('Delete Review Error:', error.message);
    res.status(500).json({ message: 'Server error, failed to delete review' });
  }
};

module.exports = {
  addReview,
  updateReview,
  deleteReview
};
