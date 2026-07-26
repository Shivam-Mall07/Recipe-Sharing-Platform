import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/api';
import './RecipeForm.css';

/**
 * RecipeForm handles both Create (Add) and Update (Edit) recipe operations.
 */
const RecipeForm = ({ user }) => {
  const { id } = useParams(); // Contains recipe ID if in Edit Mode
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Form State Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [category, setCategory] = useState('Breakfast');
  const [tagsInput, setTagsInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Dynamic Array Fields
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);

  // Operation States
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState('');

  // If in Edit Mode, fetch original recipe data to prepopulate form
  useEffect(() => {
    if (isEditMode) {
      loadRecipeData();
    }
  }, [id]);

  const loadRecipeData = async () => {
    setInitialLoading(true);
    setError('');
    try {
      const data = await apiService.getRecipeById(id);
      const recipe = data.recipe;

      // Authorization guard: Make sure logged-in user is the author
      if (recipe.author._id !== user?._id) {
        setError('You are not authorized to edit this recipe.');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      setTitle(recipe.title);
      setDescription(recipe.description);
      setCookingTime(recipe.cookingTime);
      setCategory(recipe.category);
      setIngredients(recipe.ingredients);
      setSteps(recipe.steps);
      setTagsInput(recipe.tags.join(', '));
      setImagePreview(`http://localhost:5000${recipe.image}`);
    } catch (err) {
      console.error('Error loading recipe details for form:', err);
      setError('Failed to load recipe details. It may not exist.');
    } finally {
      setInitialLoading(false);
    }
  };

  // --- Dynamic Array Actions ---
  
  // Ingredients change handler
  const handleIngredientChange = (index, value) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredientField = (index) => {
    if (ingredients.length === 1) return; // Must keep at least one field
    setIngredients(ingredients.filter((_, idx) => idx !== index));
  };

  // Steps change handler
  const handleStepChange = (index, value) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const addStepField = () => {
    setSteps([...steps, '']);
  };

  const removeStepField = (index) => {
    if (steps.length === 1) return; // Must keep at least one field
    setSteps(steps.filter((_, idx) => idx !== index));
  };

  // Image Upload File Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Generate object URL for image preview
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!title || !description || !cookingTime || !category) {
      setError('Please fill in all general information fields.');
      return;
    }

    const cleanIngredients = ingredients.filter(i => i.trim() !== '');
    if (cleanIngredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    const cleanSteps = steps.filter(s => s.trim() !== '');
    if (cleanSteps.length === 0) {
      setError('Please add at least one cooking step.');
      return;
    }

    if (!isEditMode && !imageFile) {
      setError('Please upload an image for the recipe.');
      return;
    }

    setLoading(true);

    try {
      // Build FormData payload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('cookingTime', cookingTime);
      formData.append('category', category);
      
      // Parse arrays into JSON strings to submit via multipart form
      formData.append('ingredients', JSON.stringify(cleanIngredients));
      formData.append('steps', JSON.stringify(cleanSteps));
      
      const parsedTags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t !== '');
      formData.append('tags', JSON.stringify(parsedTags));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEditMode) {
        await apiService.updateRecipe(id, formData);
        navigate(`/recipes/${id}`);
      } else {
        await apiService.createRecipe(formData);
        navigate('/');
      }
    } catch (err) {
      console.error('Recipe form submit error:', err);
      setError(
        err.response?.data?.message || 'Failed to submit recipe. Please check details and file types.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 20px auto' }}></div>
        <p>Loading recipe editor details...</p>
      </div>
    );
  }

  return (
    <div className="recipe-form-page container">
      <div className="form-card">
        <h2 className="form-card-title">{isEditMode ? '📝 Edit Your Recipe' : '🍳 Share Your Recipe'}</h2>
        <p className="form-card-subtitle">
          {isEditMode 
            ? 'Update your instructions, ingredients, or photos to keep it accurate' 
            : 'Fill in details below to publish your cooking guide on our platform'
          }
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Section 1: General Info */}
          <div className="form-section">
            <h3 className="section-subtitle-heading">General Info</h3>
            
            <div className="form-group">
              <label htmlFor="title">Recipe Title</label>
              <input
                type="text"
                id="title"
                className="form-control"
                placeholder="e.g. Classic Blueberry Pancakes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Short Description</label>
              <textarea
                id="description"
                className="form-control"
                placeholder="Give a short overview of the dish, how it tastes, its origins, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label htmlFor="cookingTime">Cooking Time (minutes)</label>
                <input
                  type="number"
                  id="cookingTime"
                  className="form-control"
                  placeholder="e.g. 35"
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma separated)</label>
              <input
                type="text"
                id="tags"
                className="form-control"
                placeholder="e.g. healthy, quick, glutenfree, sweet"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Ingredients */}
          <div className="form-section">
            <div className="section-header-row">
              <h3 className="section-subtitle-heading">Ingredients</h3>
              <button type="button" className="btn btn-outline btn-small" onClick={addIngredientField}>
                + Add Ingredient
              </button>
            </div>
            <p className="field-hint">Specify exact measurements (e.g. "2 cups of flour", "1 tbsp olive oil")</p>
            
            {ingredients.map((ing, idx) => (
              <div key={`ing-${idx}`} className="dynamic-input-row">
                <span className="row-number">{idx + 1}.</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 2 large eggs"
                  value={ing}
                  onChange={(e) => handleIngredientChange(idx, e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="remove-row-btn"
                  onClick={() => removeIngredientField(idx)}
                  disabled={ingredients.length === 1}
                  title="Remove ingredient"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Section 3: Steps */}
          <div className="form-section">
            <div className="section-header-row">
              <h3 className="section-subtitle-heading">Cooking Steps</h3>
              <button type="button" className="btn btn-outline btn-small" onClick={addStepField}>
                + Add Step
              </button>
            </div>
            <p className="field-hint">Describe directions in consecutive sequence steps</p>
            
            {steps.map((step, idx) => (
              <div key={`step-${idx}`} className="dynamic-input-row">
                <span className="row-number">Step {idx + 1}.</span>
                <textarea
                  className="form-control step-textarea"
                  placeholder="e.g. In a medium bowl, whisk together the flour, sugar, and baking powder."
                  value={step}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  rows="2"
                  required
                />
                <button
                  type="button"
                  className="remove-row-btn"
                  onClick={() => removeStepField(idx)}
                  disabled={steps.length === 1}
                  title="Remove step"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Section 4: Image Upload */}
          <div className="form-section last-section">
            <h3 className="section-subtitle-heading">Recipe Display Image</h3>
            
            <div className="image-upload-wrapper">
              <div className="file-input-container">
                <label className="file-upload-label">
                  📂 Choose Image File
                  <input
                    type="file"
                    className="file-hidden-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!isEditMode}
                  />
                </label>
                <p className="file-name-hint">
                  {imageFile ? imageFile.name : isEditMode ? 'Leave empty to keep existing image' : 'No file selected'}
                </p>
              </div>

              {imagePreview && (
                <div className="form-image-preview-box">
                  <p>Image Preview:</p>
                  <img src={imagePreview} alt="Recipe Preview" className="form-preview-img" />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions-row">
            <button
              type="button"
              className="btn btn-outline cancel-form-btn"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary submit-form-btn" disabled={loading}>
              {loading ? 'Submitting Recipe...' : isEditMode ? 'Save Changes' : 'Publish Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeForm;
