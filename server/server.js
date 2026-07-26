const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Body parser middleware (extracts JSON payloads and form variables)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure that the uploads directory exists on server startup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created local uploads directory at:', uploadsDir);
}

// Serve uploaded recipe images statically
app.use('/uploads', express.static(uploadsDir));

// Mount REST API route handlers
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/reviews', reviewRoutes);

// Base route for API status
app.get('/', (req, res) => {
  res.json({ message: 'Recipe Sharing Platform API is running...' });
});

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found on server' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'An internal server error occurred'
  });
});

// Configure server listening port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
