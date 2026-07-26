const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes for user onboarding
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private route for loaded profile data
router.get('/profile', protect, getUserProfile);

module.exports = router;
