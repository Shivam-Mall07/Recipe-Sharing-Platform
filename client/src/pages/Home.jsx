import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import RecipeCard from '../components/RecipeCard';
import './Home.css';

/**
 * Home page displaying hero, search, category filters, and recipe listings.
 */
const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Categories list as specified
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks'];

  // Load recipes on component mount or category change
  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError('');
    try {
      // API call to load recipes. If category is selected, it passes filter query.
      const data = await apiService.getAllRecipes(selectedCategory);
      setRecipes(data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Could not load recipes. Please check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  // Handle live search or search form submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchRecipes();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await apiService.searchRecipes(searchQuery);
      setRecipes(data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset search and load all recipes
  const handleClearSearch = () => {
    setSearchQuery('');
    fetchRecipes();
  };

  // Filter category selection
  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      // Toggle off if clicked again
      setSelectedCategory('');
    } else {
      setSelectedCategory(category);
    }
  };

  // Prepare recipe lists
  const latestRecipes = [...recipes]; // Backend already returns them sorted by date desc
  const topRatedRecipes = [...recipes]
    .filter(r => r.averageRating > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 3); // Display top 3 highest-rated recipes

  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content container">
          <span className="hero-badge">🍽️ Share Your Culinary Masterpiece</span>
          <h1>Find & Share The Best <span className="accent">Recipes</span></h1>
          <p>
            Your ultimate digital recipe book. Discover new tastes, save your favorite meals, and show off your cooking creations with friends.
          </p>
          
          {/* Search bar inside Hero */}
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by recipe name, ingredient, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button type="button" className="clear-search-btn" onClick={handleClearSearch}>
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-secondary search-btn">
              Search
            </button>
          </form>
        </div>
      </header>

      {/* Main Categories Section */}
      <section className="categories-section container">
        <h2 className="section-title">Browse by Category</h2>
        <div className="categories-grid">
          <button
            className={`category-chip ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            All Recipes
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Recipes Listing Sections */}
      <main className="recipes-container container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tasty recipes for you...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="alert alert-error">{error}</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🍳</span>
            <h3>No recipes found</h3>
            <p>We couldn't find any recipes matching your criteria. Try adjusting your query or category filters.</p>
            <button className="btn btn-primary" onClick={handleClearSearch}>
              Show All Recipes
            </button>
          </div>
        ) : (
          <>
            {/* Top Rated Recipes Section (Only shown if we are not searching and have rated recipes) */}
            {!searchQuery && topRatedRecipes.length > 0 && (
              <section className="recipes-section">
                <div className="section-header">
                  <h2 className="section-title">⭐ Top Rated Recipes</h2>
                  <p className="section-subtitle">Highly rated dishes approved by our cooking community</p>
                </div>
                <div className="recipes-grid">
                  {topRatedRecipes.map((recipe) => (
                    <RecipeCard key={`top-${recipe._id}`} recipe={recipe} />
                  ))}
                </div>
              </section>
            )}

            {/* Latest Recipes Section */}
            <section className="recipes-section">
              <div className="section-header">
                <h2 className="section-title">
                  {searchQuery 
                    ? `🔍 Search Results (${recipes.length})` 
                    : selectedCategory 
                      ? `${selectedCategory} Creations` 
                      : '🆕 Latest Recipes'
                  }
                </h2>
                <p className="section-subtitle">
                  {searchQuery 
                    ? `Showing recipes matched for "${searchQuery}"` 
                    : 'Check out the most recently uploaded cooking guides'
                  }
                </p>
              </div>
              <div className="recipes-grid">
                {latestRecipes.map((recipe) => (
                  <RecipeCard key={`latest-${recipe._id}`} recipe={recipe} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
