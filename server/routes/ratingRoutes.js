const express = require('express');
const router = express.Router();
const { addOrUpdateRating, updateRatingById } = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

// Protected rating operations
router.post('/', protect, addOrUpdateRating);
router.put('/:id', protect, updateRatingById);

module.exports = router;
