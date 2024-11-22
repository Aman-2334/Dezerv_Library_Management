require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');

// Environment variables
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.db;

// Middleware
app.use(express.json());

// Mongoose connection
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Successfully connected to MongoDB using Mongoose!");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit if database connection fails
    });

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/books', bookRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
