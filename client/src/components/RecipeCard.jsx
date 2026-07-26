import React from 'react';
import { Link } from 'react-router-dom';
import './RecipeCard.css';

/**
 * RecipeCard component displays a summary of a single recipe.
 */
const RecipeCard = ({ recipe }) => {
  // Build the complete server URL for local uploads
  const imageUrl = `http://localhost:5000${recipe.image}`;

  return (
    <div className="recipe-card">
      {/* Recipe Image container with badge */}
      <div className="card-image-wrapper">
        <img src={imageUrl} alt={recipe.title} className="card-image" loading="lazy" />
        <span className="card-category-badge">{recipe.category}</span>
      </div>

      {/* Card Content Details */}
      <div className="card-body">
        <h3 className="card-title">
          <Link to={`/recipes/${recipe._id}`}>{recipe.title}</Link>
        </h3>
        
        <p className="card-desc">
          {recipe.description.length > 80
            ? `${recipe.description.substring(0, 80)}...`
            : recipe.description}
        </p>

        <div className="card-meta">
          <div className="meta-item cooking-time">
            <span className="meta-icon">⏱️</span>
            <span>{recipe.cookingTime} mins</span>
          </div>

          <div className="meta-item rating">
            <span className="meta-icon star">⭐</span>
            <span className="rating-value">{recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : 'No ratings'}</span>
          </div>
        </div>
      </div>

      {/* Card Footer linking to detail */}
      <div className="card-footer">
        <span className="card-author">By {recipe.author?.name || 'Anonymous'}</span>
        <Link to={`/recipes/${recipe._id}`} className="view-btn">
          View Recipe →
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;
