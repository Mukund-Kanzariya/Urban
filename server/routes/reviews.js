const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Profile = require('../models/Profile');
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

        // 4. Removed the single-review restriction for a booking to allow unlimited customer reviews!

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
        // Fetch recent reviews (no rating filter)
        const reviews = await Review.find()
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
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Only admins can fetch all reviews' });
        }

        const reviews = await Review.find()
            .populate('customerId', 'name email')
            .populate({
                path: 'bookingId',
                select: 'serviceId providerId',
                populate: [
                    { path: 'serviceId', select: 'title' },
                    { path: 'providerId', select: 'name' }
                ] 
            })
            .sort({ _id: -1 });

        // Since we can't easily deep populate Profiles from here without more complex setup,
        // we'll fetch the profiles separately and map them for the admin view.
        const customerIds = reviews.map(r => r.customerId?._id);
        const profiles = await Profile.find({ userId: { $in: customerIds } }, 'userId profilePicture');
        
        const reviewsWithPhotos = reviews.map(r => {
            const profile = profiles.find(p => p.userId.toString() === r.customerId?._id?.toString());
            const plainReview = r.toObject();
            if (plainReview.customerId) {
                plainReview.customerId.profilePicture = profile ? profile.profilePicture : '';
            }
            return plainReview;
        });

        res.json(reviewsWithPhotos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review's rating and comment
// @access  Private/Admin
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Only admins can update reviews' });
        }
        const { rating, comment } = req.body;
        const updated = await Review.findByIdAndUpdate(
            req.params.id,
            { rating, comment },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ message: 'Review not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a specific review
// @access  Private/Admin
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
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
