const Recipe = require('../models/recipe');
const Review = require('../models/review');
const Rating = require('../models/rating');
const fs = require('fs');
const path = require('path');

/**
 * Helper function to parse incoming form fields which could be stringified JSON or plain text.
 */
const parseArray = (field) => {
  if (!field) return [];
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (e) {
      // If it's not a JSON array, split by comma or return as single item array
      return field.split(',').map(item => item.trim()).filter(item => item !== '');
    }
  }
  return field;
};

/**
 * @desc    Create a new recipe
 * @route   POST /api/recipes
 * @access  Private (Logged in users only)
 */
const createRecipe = async (req, res) => {
  try {
    const { title, description, cookingTime, category, tags } = req.body;

    // Validate textual fields
    if (!title || !description || !cookingTime || !category) {
      return res.status(400).json({ message: 'Title, description, cooking time and category are required' });
    }

    // Check if image file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Recipe image is required' });
    }

    // Parse ingredients and steps which are sent as JSON strings or arrays
    const ingredients = parseArray(req.body.ingredients);
    const steps = parseArray(req.body.steps);
    const parsedTags = parseArray(tags);

    if (ingredients.length === 0) {
      return res.status(400).json({ message: 'At least one ingredient is required' });
    }
    if (steps.length === 0) {
      return res.status(400).json({ message: 'At least one cooking step is required' });
    }

    // Create new recipe document
    const recipe = new Recipe({
      title,
      description,
      ingredients,
      steps,
      cookingTime: Number(cookingTime),
      category,
      tags: parsedTags,
      image: 'temp', // Temporary placeholder, updated below
      imageData: req.file.buffer,
      imageContentType: req.file.mimetype,
      author: req.user // Decoded from JWT auth middleware
    });

    recipe.image = `/api/recipes/${recipe._id}/image`;
    const savedRecipe = await recipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error('Create Recipe Error:', error.message);
    res.status(500).json({ message: 'Server error, failed to create recipe' });
  }
};

/**
 * @desc    Get all recipes (optionally filtered by category)
 * @route   GET /api/recipes
 * @access  Public
 */
const getAllRecipes = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    // Retrieve all recipes, populate author's name, sorted newest first
    const recipes = await Recipe.find(filter)
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    console.error('Get All Recipes Error:', error.message);
    res.status(500).json({ message: 'Server error, failed to load recipes' });
  }
};

/**
 * @desc    Get recipe by ID along with its reviews and user rating if logged in
 * @route   GET /api/recipes/:id
 * @access  Public
 */
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'name email');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Fetch related reviews, populate author details
    const reviews = await Review.find({ recipe: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ recipe, reviews });
  } catch (error) {
    console.error('Get Recipe By ID Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error, failed to load recipe details' });
  }
};

/**
 * @desc    Update a recipe
 * @route   PUT /api/recipes/:id
 * @access  Private (Only recipe author can update)
 */
const updateRecipe = async (req, res) => {
  try {
    const { title, description, cookingTime, category, tags } = req.body;
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the current user is the author of this recipe
    if (recipe.author.toString() !== req.user) {
      return res.status(403).json({ message: 'User not authorized to update this recipe' });
    }

    // If new image is uploaded, update the buffer and contentType in DB
    if (req.file) {
      recipe.imageData = req.file.buffer;
      recipe.imageContentType = req.file.mimetype;
      recipe.image = `/api/recipes/${recipe._id}/image`;
    }

    // Update recipe fields
    recipe.title = title || recipe.title;
    recipe.description = description || recipe.description;
    recipe.cookingTime = cookingTime ? Number(cookingTime) : recipe.cookingTime;
    recipe.category = category || recipe.category;

    if (req.body.ingredients) {
      recipe.ingredients = parseArray(req.body.ingredients);
    }
    if (req.body.steps) {
      recipe.steps = parseArray(req.body.steps);
    }
    if (tags) {
      recipe.tags = parseArray(tags);
    }

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
  } catch (error) {
    console.error('Update Recipe Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error, failed to update recipe' });
  }
};

/**
 * @desc    Delete a recipe
 * @route   DELETE /api/recipes/:id
 * @access  Private (Only recipe author can delete)
 */
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the current user is the author of this recipe
    if (recipe.author.toString() !== req.user) {
      return res.status(403).json({ message: 'User not authorized to delete this recipe' });
    }

    // Delete the recipe document
    await Recipe.deleteOne({ _id: req.params.id });

    // Clean up related reviews and ratings
    await Review.deleteMany({ recipe: req.params.id });
    await Rating.deleteMany({ recipe: req.params.id });

    res.json({ message: 'Recipe and associated reviews/ratings deleted successfully' });
  } catch (error) {
    console.error('Delete Recipe Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error, failed to delete recipe' });
  }
};

/**
 * @desc    Search recipes by title, category, tags, or ingredients
 * @route   GET /api/recipes/search
 * @access  Public
 */
const searchRecipes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Perform case-insensitive search across title, description, category, ingredients, and tags
    const searchFilter = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { ingredients: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    };

    const recipes = await Recipe.find(searchFilter).populate('author', 'name');
    res.json(recipes);
  } catch (error) {
    console.error('Search Recipes Error:', error.message);
    res.status(500).json({ message: 'Server error, search failed' });
  }
};

/**
 * @desc    Get recipe image from database
 * @route   GET /api/recipes/:id/image
 * @access  Public
 */
const getRecipeImage = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe || !recipe.imageData) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.set('Content-Type', recipe.imageContentType);
    res.send(recipe.imageData);
  } catch (error) {
    console.error('Get Recipe Image Error:', error.message);
    res.status(500).json({ message: 'Server error, failed to load image' });
  }
};

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
  getRecipeImage
};
