const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// GET /api/users - Get all users (Admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only admins can view users.' });
    }
    
    // We use aggregate to "join" with the Profile collection and get the profilePicture
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'profiles', // The name of the collection in MongoDB
          localField: '_id',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      {
        $project: {
          password: 0,
          'profile.phone': 0,
          'profile.address': 0,
          'profile.city': 0,
          'profile.bio': 0
        }
      },
      {
        $addFields: {
          profilePicture: { $arrayElemAt: ['$profile.profilePicture', 0] }
        }
      },
      {
        $project: { profile: 0 }
      }
    ]);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id - Update a user (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only admins can update users.' });
    }
    const { name, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, role },
      { new: true, runValidators: true }
    ).select('-password');
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id - Delete a user (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only admins can delete users.' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
