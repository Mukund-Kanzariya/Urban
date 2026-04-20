const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Service = require('../models/Service');
const Category = require('../models/Category');
const Booking = require('../models/Booking');

// GET /api/stats — public endpoint, no auth needed
router.get('/', async (req, res) => {
  try {
    const [customers, providers, services, categories, bookings] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider' }),
      Service.countDocuments(),
      Category.countDocuments(),
      Booking.countDocuments()
    ]);

    res.json({ customers, providers, services, categories, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
