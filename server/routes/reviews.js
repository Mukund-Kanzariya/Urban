const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private/Customer
router.post('/', protect, authorize('customer'), async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;
        
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.customer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to review this booking' });
        }
        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Service must be completed before reviewing' });
        }

        const review = await Review.create({
            booking: booking._id,
            customer: req.user._id,
            provider: booking.provider,
            rating,
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/reviews/:providerId
// @desc    Get all reviews for a provider
// @access  Public
router.get('/:providerId', async (req, res) => {
    try {
        const reviews = await Review.find({ provider: req.params.providerId })
            .populate('customer', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
