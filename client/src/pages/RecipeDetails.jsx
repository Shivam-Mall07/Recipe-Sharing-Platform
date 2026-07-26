import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './RecipeDetails.css';

/**
 * RecipeDetails component displays details of a recipe, ratings, and reviews.
 */
const RecipeDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ratings Interactive State
  const [ratingHover, setRatingHover] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [ratingSuccess, setRatingSuccess] = useState('');

  // Reviews Inputs
  const [newComment, setNewComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    loadRecipeDetails();
  }, [id]);

  const loadRecipeDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getRecipeById(id);
      setRecipe(data.recipe);
      setReviews(data.reviews);
    } catch (err) {
      console.error('Error loading recipe details:', err);
      setError('Recipe details could not be loaded. It may have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  // Recipe Delete Action
  const handleDeleteRecipe = async () => {
    if (window.confirm('Are you absolutely sure you want to delete this recipe? This action cannot be undone.')) {
      try {
        await apiService.deleteRecipe(id);
        navigate('/');
      } catch (err) {
        console.error('Error deleting recipe:', err);
        setError('Failed to delete the recipe. Please try again.');
      }
    }
  };

  // Rating Submit Action
  const handleRatingSubmit = async (score) => {
    if (!user) {
      alert('Please log in to rate this recipe.');
      return;
    }
    setRatingSuccess('');
    try {
      await apiService.rateRecipe({ recipe: id, rating: score });
      setUserRating(score);
      setRatingSuccess('Thank you for rating!');
      
      // Reload recipe details to update average rating dynamically
      const data = await apiService.getRecipeById(id);
      setRecipe(data.recipe);
    } catch (err) {
      console.error('Rating submission error:', err);
      alert('Could not submit rating. Try again.');
    }
  };

  // --- Review Actions ---

  // Add Comment
  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (!newComment.trim()) {
      setReviewError('Please write a comment before posting.');
      return;
    }

    try {
      const savedReview = await apiService.addReview({ recipe: id, comment: newComment });
      setReviews([savedReview, ...reviews]); // Add to top of list
      setNewComment('');
    } catch (err) {
      console.error('Add review error:', err);
      setReviewError('Failed to post review. Try again.');
    }
  };

  // Toggle Edit Comment Mode
  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditingCommentText(review.comment);
  };

  // Cancel Edit Comment
  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditingCommentText('');
  };

  // Update Comment
  const handleUpdateReview = async (reviewId) => {
    if (!editingCommentText.trim()) {
      alert('Comment text cannot be empty.');
      return;
    }

    try {
      const updatedReview = await apiService.updateReview(reviewId, { comment: editingCommentText });
      
      // Update local state arrays
      setReviews(
        reviews.map(rev => (rev._id === reviewId ? updatedReview : rev))
      );
      cancelEditReview();
    } catch (err) {
      console.error('Update review error:', err);
      alert('Failed to update review.');
    }
  };

  // Delete Comment
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await apiService.deleteReview(reviewId);
        setReviews(reviews.filter(rev => rev._id !== reviewId));
      } catch (err) {
        console.error('Delete review error:', err);
        alert('Failed to delete review.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 20px auto' }}></div>
        <p>Loading recipe culinary details...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container" style={{ padding: '80px 0' }}>
        <div className="alert alert-error">{error || 'Recipe not found'}</div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const isAuthor = user?._id === recipe.author?._id;
  const recipeImgUrl = `http://localhost:5000${recipe.image}`;

  return (
    <div className="recipe-details-page container">
      {/* Top Banner and Navigation Bar */}
      <div className="details-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> &gt; <span>{recipe.category}</span> &gt; <span className="active">{recipe.title}</span>
        </div>
        
        {/* Author Edit / Delete panel */}
        {isAuthor && (
          <div className="author-actions">
            <Link to={`/recipes/${recipe._id}/edit`} className="btn btn-outline btn-small edit-action-btn">
              ✏️ Edit Recipe
            </Link>
            <button className="btn btn-danger btn-small delete-action-btn" onClick={handleDeleteRecipe}>
              🗑️ Delete Recipe
            </button>
          </div>
        )}
      </div>

      {/* Main Recipe Detail Area */}
      <div className="recipe-main-grid">
        {/* Left Column: Image, Info & Ratings */}
        <div className="recipe-info-col">
          <div className="recipe-image-box">
            <img src={recipeImgUrl} alt={recipe.title} className="details-recipe-img" />
            <span className="details-category-badge">{recipe.category}</span>
          </div>

          <div className="recipe-meta-details-card">
            <h1>{recipe.title}</h1>
            <p className="details-author-date">
              Published by <strong>{recipe.author?.name || 'Anonymous'}</strong> on {new Date(recipe.createdAt).toLocaleDateString()}
            </p>
            
            <p className="details-description">{recipe.description}</p>

            {/* Tags display */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="tags-container">
                {recipe.tags.map((tag, idx) => (
                  <span key={`tag-${idx}`} className="recipe-tag">#{tag}</span>
                ))}
              </div>
            )}

            {/* Stats block */}
            <div className="recipe-stats-row">
              <div className="stat-box">
                <span className="stat-icon">⏱️</span>
                <div className="stat-text">
                  <span className="stat-label">Cooking Time</span>
                  <span className="stat-value">{recipe.cookingTime} mins</span>
                </div>
              </div>

              <div className="stat-box">
                <span className="stat-icon">⭐</span>
                <div className="stat-text">
                  <span className="stat-label">Average Rating</span>
                  <span className="stat-value">{recipe.averageRating > 0 ? `${recipe.averageRating.toFixed(1)} / 5.0` : 'No ratings yet'}</span>
                </div>
              </div>
            </div>

            {/* User Rating Submissions */}
            <div className="rating-submission-container">
              <h4>Rate this recipe:</h4>
              <div className="star-rating-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`star-${star}`}
                    type="button"
                    className={`star-btn ${star <= (ratingHover || userRating) ? 'filled' : ''}`}
                    onClick={() => handleRatingSubmit(star)}
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                    title={`Rate ${star} Stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {ratingSuccess && <p className="rating-success-message">{ratingSuccess}</p>}
              {!user && <p className="rating-signin-hint">Please <Link to="/login">login</Link> to submit your rating.</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Checkable Ingredients & Steps */}
        <div className="recipe-guide-col">
          {/* Ingredients Section */}
          <div className="recipe-guide-card">
            <h3>🛒 Ingredients Checklist</h3>
            <p className="guide-hint">Tick ingredients as you gather them in your kitchen:</p>
            <ul className="ingredients-checklist">
              {recipe.ingredients.map((ing, idx) => (
                <li key={`ing-${idx}`} className="checklist-item">
                  <label className="checkbox-container">
                    <input type="checkbox" />
                    <span className="checkbox-checkmark"></span>
                    <span className="checklist-text">{ing}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Cooking Steps Section */}
          <div className="recipe-guide-card steps-card">
            <h3>👨‍🍳 Preparation Steps</h3>
            <ol className="cooking-steps-list">
              {recipe.steps.map((step, idx) => (
                <li key={`step-${idx}`} className="step-list-item">
                  <div className="step-header">
                    <span className="step-badge">Step {idx + 1}</span>
                  </div>
                  <p className="step-body-text">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Reviews Comments Area */}
      <section className="reviews-section">
        <h2 className="reviews-title">💬 Customer Reviews ({reviews.length})</h2>

        {/* Review input form for logged in users */}
        {user ? (
          <form className="add-review-form" onSubmit={handleAddReview}>
            <h4>Write a Review</h4>
            {reviewError && <p className="alert alert-error">{reviewError}</p>}
            <div className="form-group">
              <textarea
                className="form-control"
                placeholder="Share your experience cooking this dish! How did it turn out? Any changes made?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="3"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Post Review</button>
          </form>
        ) : (
          <div className="reviews-login-prompt">
            <p>Would you like to share your review? <Link to="/login">Log in here</Link> to post comments.</p>
          </div>
        )}

        {/* Reviews list */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="no-reviews-hint">No comments or reviews posted yet. Be the first to share your thoughts!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="review-item">
                <div className="review-header">
                  <div className="review-author-info">
                    <span className="author-avatar">🧑‍🍳</span>
                    <div>
                      <h5 className="review-author">{rev.user?.name || 'Anonymous'}</h5>
                      <span className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Edit/Delete controls for review owner */}
                  {user?._id === rev.user?._id && editingReviewId !== rev._id && (
                    <div className="review-controls">
                      <button className="review-control-btn edit" onClick={() => startEditReview(rev)}>
                        Edit
                      </button>
                      <button className="review-control-btn delete" onClick={() => handleDeleteReview(rev._id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="review-body">
                  {editingReviewId === rev._id ? (
                    <div className="review-edit-box">
                      <textarea
                        className="form-control"
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        rows="2"
                        required
                      />
                      <div className="review-edit-actions">
                        <button className="btn btn-outline btn-small" onClick={cancelEditReview}>
                          Cancel
                        </button>
                        <button className="btn btn-primary btn-small" onClick={() => handleUpdateReview(rev._id)}>
                          Save Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="review-comment-text">{rev.comment}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default RecipeDetails;
