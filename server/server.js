// Step 2: Backend setup - Node.js + Express.js
// Importing required Node modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load variables from the .env file

// Initialize express app (creating our server instance)
const app = express();

// --- Middlewares ---
// Allows our API to read JSON data from Requests (req.body)
app.use(express.json());
// Allows our React frontend to securely make API requests to this backend
app.use(cors());

// Expose the 'uploads' directory directly so the React frontend can grab the profile pictures
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Import Route Files ---
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contacts');

// --- Mount Routes ---
// This tells Express to send any request starting with "/api/..." to the correct file
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/reviews', require('./routes/reviews'));

// --- Basic Route ---
// A simple REST API endpoint to check if the server is healthy
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Local Service Provider API!' });
});

// --- MongoDB Connection ---
// Connects to local MongoDB using URL from .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch((err) => console.log('MongoDB connection error:', err));

// --- Start the server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running beautifully on http://localhost:${PORT}`);
});
