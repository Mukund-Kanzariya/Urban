// Step 4: Booking Routes
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Profile = require('../models/Profile');
const Payment = require('../models/Payment');
const verifyToken = require('../middleware/auth');

// POST /api/bookings - Book a service
router.post('/', verifyToken, async (req, res) => {
  try {
    // Ensure ONLY customers can book services
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can book services!' });
    }

    const { serviceId, providerId, date, time, service_address, price, paymentMethod } = req.body;

    const commission = parseFloat((price * 0.20).toFixed(2));
    const provider_earns = parseFloat((price * 0.80).toFixed(2));

    const newBooking = new Booking({
      customerId: req.user._id, // Set the customer ID strictly from their Token for security
      serviceId,
      providerId,
      date,
      time,
      service_address,
      price,
      commission,
      provider_earns,
      status: 'pending' // Default status when created
    });

    const savedBooking = await newBooking.save();

    // Create tracking Payment log
    const newPayment = new Payment({
      bookingId: savedBooking._id,
      customerId: req.user._id,
      providerId: providerId,
      amount: price,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending' // Initial status
    });
    await newPayment.save();

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
      .populate('customerId', 'name email')
      .populate('providerId', 'name');

    // Fetch profiles for the customers involved
    const customerIds = bookings.map(b => b.customerId?._id);
    const profiles = await Profile.find({ userId: { $in: customerIds } }, 'userId profilePicture');

    // Fetch payments for the bookings
    const bookingIds = bookings.map(b => b._id);
    const payments = await Payment.find({ bookingId: { $in: bookingIds } });

    const bookingsWithPhotos = bookings.map(b => {
      const profile = profiles.find(p => p.userId.toString() === b.customerId?._id.toString());
      const payment = payments.find(p => p.bookingId.toString() === b._id.toString());
      
      const plainBooking = b.toObject();
      if (plainBooking.customerId) {
        plainBooking.customerId.profilePicture = profile ? profile.profilePicture : '';
      }
      plainBooking.payment = payment ? payment.toObject() : null;
      
      return plainBooking;
    });

    res.json(bookingsWithPhotos);
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

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true } // Return the strictly updated document without validating unspecified fields
    );

    // If marked completed, clear the payment queue securely
    if (status === 'completed') {
       await Payment.findOneAndUpdate(
         { bookingId: updatedBooking._id },
         { paymentStatus: 'completed' },
         { new: true }
       );
    }

    res.json(updatedBooking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
