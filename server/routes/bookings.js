// Step 4: Booking Routes
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const verifyToken = require('../middleware/auth');

// POST /api/bookings - Book a service
router.post('/', verifyToken, async (req, res) => {
  try {
    // Ensure ONLY customers can book services
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can book services!' });
    }

    const { serviceId, providerId, date, time } = req.body;

    const newBooking = new Booking({
      customerId: req.user._id, // Set the customer ID strictly from their Token for security
      serviceId,
      providerId,
      date,
      time,
      status: 'pending' // Default status when created
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings - Dashboard View
// Shows a provider the jobs they need to do. Shows a customer the jobs they booked.
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = {}; // Empty query finds everything
    
    // Customize query based on who is logged in
    if (req.user.role === 'provider') {
      query.providerId = req.user._id; // Only find bookings where I am the provider
    } else if (req.user.role === 'customer') {
      query.customerId = req.user._id; // Only find bookings where I am the customer
    }

    // Populate fills in the references with actual data
    const bookings = await Booking.find(query)
      .populate('serviceId', 'title price')
      .populate('customerId', 'name error')
      .populate('providerId', 'name');

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bookings/:id/status - Update booking status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    // Only providers and admins can update the status
    if (req.user.role === 'customer') {
      return res.status(403).json({ error: 'Customers cannot update booking statuses!' });
    }

    const { status } = req.body;
    // Validate status string
    const validStatuses = ['pending', 'accepted', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // If it's a provider, they can only update their OWN jobs
    if (req.user.role === 'provider' && booking.providerId.toString() !== req.user._id.toString()) {
       return res.status(403).json({ error: 'You can only update your own bookings' });
    }

    booking.status = status;
    const updatedBooking = await booking.save();
    res.json(updatedBooking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
