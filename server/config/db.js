const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using the connection string from environment variables.
 * Prints connection status or details of any error that occurs.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1); // Exit server process if connection fails
  }
};

module.exports = connectDB;
