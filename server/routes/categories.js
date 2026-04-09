const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');

// Middleware to verify Admin/Super Admin
const isAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Auth failed' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role === 'admin' || decoded.role === 'super_admin') {
      next();
    } else {
      res.status(403).json({ error: 'Admin access required' });
    }
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new category (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update category (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE category (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
