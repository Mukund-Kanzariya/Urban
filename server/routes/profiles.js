const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const verifyToken = require('../middleware/auth'); // Standard auth protection
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save to server/uploads
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using timestamp and the original extension
    cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
  }
});

// Create Multer upload instance
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only accept images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'), false);
    }
  }
});

// @route   GET /api/profiles/me
// @desc    Get current user's profile and auto-populate name/email/role
// @access  Private (Any authenticated user)
router.get('/me', verifyToken, async (req, res) => {
    try {
        // Find profile by the logged-in user's ID
        let profile = await Profile.findOne({ userId: req.user._id })
            .populate('userId', 'name email role'); // Pull foundational data from User table
        
        // If they don't have a profile object yet, we automatically create a blank one for them
        if (!profile) {
            profile = new Profile({ userId: req.user._id });
            await profile.save();
            // Re-fetch to populate the user data natively
            profile = await Profile.findOne({ userId: req.user._id })
                .populate('userId', 'name email role');
        }

        res.json(profile);
    } catch (error) {
        console.error("Profile Fetch Error:", error.message);
        res.status(500).json({ message: 'Server Error fetching profile' });
    }
});

// @route   PUT /api/profiles/me
// @desc    Update current user's profile fields including profile picture
// @access  Private
router.put('/me', verifyToken, upload.single('profilePicture'), async (req, res) => {
    try {
        // Collect all possible fields
        const { 
          phone, address, city, bio,
          serviceCategory, hourlyRate, experienceYears,
          preferredContact, department
        } = req.body;
        
        // Build the update payload dynamically
        const updatePayload = {
            phone, address, city, bio,
            serviceCategory, hourlyRate, experienceYears,
            preferredContact, department
        };

        // If a file was uploaded by multer, embed the new URL path into the payload!
        if (req.file) {
            updatePayload.profilePicture = '/uploads/' + req.file.filename;
        }

        // Use findOneAndUpdate with upsert=true to elegantly handle both updating and automatic creation
        const updatedProfile = await Profile.findOneAndUpdate(
            { userId: req.user._id }, // Criteria: find this user's profile
            { 
                $set: updatePayload
            },
            { 
                new: true,   // Return the updated document
                upsert: true // Creates it if it doesn't exist
            }
        ).populate('userId', 'name email role');

        res.json(updatedProfile);
    } catch (error) {
        console.error("Profile Update Error:", error.message);
        res.status(500).json({ message: 'Server Error updating profile' });
    }
});

module.exports = router;
