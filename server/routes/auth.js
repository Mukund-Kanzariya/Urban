// Step 4: Auth Routes (Signup & Login)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Needed to hide passwords securely
const jwt = require('jsonwebtoken'); // Needed to create digital ID cards
const User = require('../models/User');

// POST /api/auth/register - Sign up a new user
router.post('/register', async (req, res) => {
  try {
    // Extract info from what the user typed in the form
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists!' });

    // 2. Hash the password for safety
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create a new user with the safe hashed password and new status fields
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'active'
    });

    await newUser.save(); // Save to database!
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login - Log into account
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found!' });

    // 2. Compare the password they typed with the database hash
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Incorrect password!' });

    // 3. Create a JWT Token (This is their digital passport)
    // We store their unique ID and their role safely inside the token
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Update Last Login Timestamp
    user.last_login = new Date();
    await user.save();

    // Send the token back to React
    res.json({ token, user: { _id: user._id, name: user.name, role: user.role, status: user.status } });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/auth/check-email
// @desc    Verify if a user exists by email
router.post('/check-email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'No account found with this email.' });
        res.json({ success: true, name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/auth/reset-password-simple
// @desc    Update password based on verified email
router.post('/reset-password-simple', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ success: true, message: 'Password updated successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
