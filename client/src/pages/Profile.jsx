import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import RecipeCard from '../components/RecipeCard';
import './Profile.css';

/**
 * Profile component for user dashboard.
 * Displays uploaded recipes and posted reviews with management actions.
 */
const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('recipes');

  // Inline edit state for reviews
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getProfile();
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profile details:', err);
      setError('Could not load profile dashboard. Server may be offline.');
    } finally {
      setLoading(false);
    }
  };

  // Recipe Delete Action from profile page
  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('Delete this recipe permanentely?')) {
      try {
        await apiService.deleteRecipe(recipeId);
        // Refresh local dashboard state
        setProfileData({
          ...profileData,
          recipes: profileData.recipes.filter(r => r._id !== recipeId)
        });
      } catch (err) {
        console.error('Error deleting recipe from profile:', err);
        alert('Could not delete recipe. Please try again.');
      }
    }
  };

  // --- Inline Review Actions ---
  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditingText(review.comment);
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditingText('');
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editingText.trim()) {
      alert('Review text cannot be empty.');
      return;
    }

    try {
      const updatedReview = await apiService.updateReview(reviewId, { comment: editingText });
      
      // Update local state reviews array
      setProfileData({
        ...profileData,
        reviews: profileData.reviews.map(r => (r._id === reviewId ? { ...r, comment: updatedReview.comment } : r))
      });
      cancelEditReview();
    } catch (err) {
      console.error('Error updating review from profile:', err);
      alert('Could not save updates.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Delete this review comment?')) {
      try {
        await apiService.deleteReview(reviewId);
        setProfileData({
          ...profileData,
          reviews: profileData.reviews.filter(r => r._id !== reviewId)
        });
      } catch (err) {
        console.error('Error deleting review from profile:', err);
        alert('Could not delete review.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 20px auto' }}></div>
        <p>Loading your kitchen dashboard...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="container" style={{ padding: '80px 0' }}>
        <div className="alert alert-error">{error || 'Failed to load user profile'}</div>
      </div>
    );
  }

  const { user, recipes, reviews } = profileData;

  return (
    <div className="profile-page container">
      {/* Profile Header User Details */}
      <header className="profile-header-card">
        <div className="profile-avatar-large">👨‍🍳</div>
        <div className="profile-user-details">
          <h2>{user.name}</h2>
          <p className="profile-email">📧 {user.email}</p>
          <p className="profile-date">📅 Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="profile-counters">
          <div className="counter-box">
            <span className="counter-num">{recipes.length}</span>
            <span className="counter-label">Recipes Uploaded</span>
          </div>
          <div className="counter-box">
            <span className="counter-num">{reviews.length}</span>
            <span className="counter-label">Reviews Posted</span>
          </div>
        </div>
      </header>

      {/* Tabs navigation panel */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'recipes' ? 'active' : ''}`}
          onClick={() => setActiveTab('recipes')}
        >
          🍳 My Recipes ({recipes.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          💬 My Reviews ({reviews.length})
        </button>
      </div>

      {/* Tabs Content */}
      <main className="tab-content-area">
        {activeTab === 'recipes' ? (
          recipes.length === 0 ? (
            <div className="profile-empty-tab">
              <h3>You haven't uploaded any recipes yet!</h3>
              <p>Ready to show off your cooking skills? Share your first recipe with the world.</p>
              <Link to="/add-recipe" className="btn btn-primary">
                Add New Recipe
              </Link>
            </div>
          ) : (
            <div className="profile-recipes-grid">
              {recipes.map((recipe) => (
                <div key={recipe._id} className="profile-recipe-wrapper">
                  <RecipeCard recipe={recipe} />
                  <div className="profile-recipe-actions">
                    <Link to={`/recipes/${recipe._id}/edit`} className="btn btn-outline btn-small profile-edit-btn">
                      ✏️ Edit
                    </Link>
                    <button className="btn btn-danger btn-small" onClick={() => handleDeleteRecipe(recipe._id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          reviews.length === 0 ? (
            <div className="profile-empty-tab">
              <h3>You haven't written any reviews yet!</h3>
              <p>Explore recipes on the home page and rate them to leave your comments.</p>
              <Link to="/" className="btn btn-primary">
                Browse Recipes
              </Link>
            </div>
          ) : (
            <div className="profile-reviews-list">
              {reviews.map((rev) => {
                // Safely extract recipe image URL
                const recipeImageUrl = rev.recipe
                  ? `http://localhost:5000${rev.recipe.image}`
                  : '';
                
                return (
                  <div key={rev._id} className="profile-review-card">
                    {/* Related Recipe preview box */}
                    {rev.recipe ? (
                      <div className="profile-review-recipe-info">
                        <img src={recipeImageUrl} alt={rev.recipe.title} className="profile-review-img" />
                        <Link to={`/recipes/${rev.recipe._id}`} className="profile-review-recipe-title">
                          {rev.recipe.title}
                        </Link>
                      </div>
                    ) : (
                      <p className="deleted-recipe-hint">Deleted Recipe</p>
                    )}

                    {/* Review text and edit boxes */}
                    <div className="profile-review-comment-section">
                      <span className="profile-review-date">Reviewed on {new Date(rev.createdAt).toLocaleDateString()}</span>
                      
                      {editingReviewId === rev._id ? (
                        <div className="profile-review-edit-box">
                          <textarea
                            className="form-control"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            rows="2"
                            required
                          />
                          <div className="profile-review-edit-actions">
                            <button className="btn btn-outline btn-small" onClick={cancelEditReview}>
                              Cancel
                            </button>
                            <button className="btn btn-primary btn-small" onClick={() => handleUpdateReview(rev._id)}>
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="profile-review-text">"{rev.comment}"</p>
                      )}
                    </div>

                    {/* Controls */}
                    {editingReviewId !== rev._id && (
                      <div className="profile-review-controls">
                        <button className="review-control-btn edit" onClick={() => startEditReview(rev)}>
                          Edit
                        </button>
                        <button className="review-control-btn delete" onClick={() => handleDeleteReview(rev._id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default Profile;
