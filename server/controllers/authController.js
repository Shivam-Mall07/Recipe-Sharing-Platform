const User = require('../models/user');
const Recipe = require('../models/recipe');
const Review = require('../models/review');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token containing the user's MongoDB ID.
 * Expired in 30 days.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate request inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Check if user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error, registration failed' });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Compare entered password with hashed password in database
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error, login failed' });
  }
};

/**
 * @desc    Get logged-in user profile details
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch recipes uploaded by this user, sorted newest first
    const recipes = await Recipe.find({ author: req.user }).sort({ createdAt: -1 });

    // Fetch reviews posted by this user, populate the recipe details (title and image)
    const reviews = await Review.find({ user: req.user })
      .populate('recipe', 'title image')
      .sort({ createdAt: -1 });

    res.json({
      user,
      recipes,
      reviews
    });
  } catch (error) {
    console.error('Profile Retrieval Error:', error.message);
    res.status(500).json({ message: 'Server error, profile load failed' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
