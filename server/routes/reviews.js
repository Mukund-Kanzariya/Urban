const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const verifyToken = require('../middleware/auth'); // Our standard auth middleware

// @route   POST /api/reviews
// @desc    Create a review for a completed booking
// @access  Private/Customer
router.post('/', verifyToken, async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;
        
        // 1. Validate the user is a customer
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Only customers can leave reviews' });
        }

        // 2. Validate the booking exists and belongs to this customer
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        if (booking.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only review your own bookings' });
        }
        
        // 3. Ensure booking is completed
        if (booking.status.toLowerCase() !== 'completed') {
            return res.status(400).json({ message: 'Service must be completed before reviewing' });
        }

        // 4. Check if they already reviewed this booking
        const existingReview = await Review.findOne({ bookingId: booking._id });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this booking' });
        }

        // 5. Create the review!
        const newReview = new Review({
            bookingId: booking._id,
            customerId: req.user._id,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/reviews
// @desc    Get top recent reviews mapped with user info (for Home Page)
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Fetch up to 6 reviews that have 4 or 5 stars, newest first
        const reviews = await Review.find({ rating: { $gte: 4 } })
            .populate('customerId', 'name') // Pulls in the customer's name!
            .populate({
                path: 'bookingId',
                select: 'serviceId',
                populate: { path: 'serviceId', select: 'title' } // Pulls in the service title they reviewed!
            })
            .sort({ _id: -1 })
            .limit(6);

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/reviews/all
// @desc    Get all reviews regardless of rating for the Admin panel
// @access  Private/Admin
router.get('/all', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can fetch all reviews' });
        }

        const reviews = await Review.find()
            .populate('customerId', 'name email') // Pulls in the customer's name!
            .populate({
                path: 'bookingId',
                select: 'serviceId providerId',
                populate: [
                    { path: 'serviceId', select: 'title' },
                    { path: 'providerId', select: 'name' }
                ] 
            })
            .sort({ _id: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a specific review
// @access  Private/Admin
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete reviews' });
        }

        const deletedReview = await Review.findByIdAndDelete(req.params.id);
        if (!deletedReview) return res.status(404).json({ message: 'Review not found' });

        res.json({ message: 'Review successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/reviews/provider
// @desc    Get all reviews strictly linked to bookings where this user is the provider
// @access  Private/Provider
router.get('/provider', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'provider') {
            return res.status(403).json({ message: 'Only providers can fetch their own reviews' });
        }

        // 1. Find every single booking this provider has ever been assigned to
        const myBookings = await Booking.find({ providerId: req.user._id }, '_id');
        const bookingIds = myBookings.map(b => b._id);

        // 2. Query the Review collection rigidly for ANY review tied to those specific bookings
        const reviews = await Review.find({ bookingId: { $in: bookingIds } })
            .populate('customerId', 'name') 
            .populate('bookingId', 'serviceId date') // Let's pull dates and service ids
            .populate({
                path: 'bookingId',
                populate: { path: 'serviceId', select: 'title' }
            })
            .sort({ _id: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
