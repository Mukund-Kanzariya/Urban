// Step 4: Service Routes
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Service = require('../models/Service');
const verifyToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/services directory exists
const uploadDir = path.join(__dirname, '../uploads/services');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        cb(null, 'service-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'), false);
        }
    }
});

// GET /api/services - View all services (Browsing feature)
router.get('/', async (req, res) => {
  try {
    const services = await Service.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'providerId',
          foreignField: '_id',
          as: 'providerData'
        }
      },
      { $unwind: '$providerData' },
      {
        $lookup: {
          from: 'profiles',
          localField: 'providerId',
          foreignField: 'userId',
          as: 'profileData'
        }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'providerId',
          foreignField: 'providerId',
          as: 'providerBookings'
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: 'providerBookings._id',
          foreignField: 'bookingId',
          as: 'reviewsData'
        }
      },
      {
        $addFields: {
          providerName: '$providerData.name',
          providerEmail: '$providerData.email',
          providerPhoto: { $arrayElemAt: ['$profileData.profilePicture', 0] },
          providerAvailability: { $arrayElemAt: ['$profileData.availability_status', 0] },
          providerRating: { $avg: '$reviewsData.rating' },
          providerTotalReviews: { $size: '$reviewsData' }
        }
      },
      { $project: { providerData: 0, profileData: 0, reviewsData: 0, providerBookings: 0 } }
    ]);

    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/services - Add a new service
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Only providers can create services!' });
    }

    const { category, title, price, location } = req.body;
    
    const newService = new Service({
      providerId: req.user._id, 
      category,
      title,
      price,
      location,
      image: req.file ? '/uploads/services/' + req.file.filename : null
    });

    const savedService = await newService.save();
    res.status(201).json(savedService);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/services/provider - View services for a logged-in provider
router.get('/provider', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Only providers can view their services via this route' });
    }
    
    const services = await Service.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $lookup: {
          from: 'profiles',
          localField: 'providerId',
          foreignField: 'userId',
          as: 'profileData'
        }
      },
      {
        $addFields: {
          providerPhoto: { $arrayElemAt: ['$profileData.profilePicture', 0] }
        }
      },
      { $project: { profileData: 0 } }
    ]);

    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/services/:id - Update a service
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (req.user.role === 'admin' || (req.user.role === 'provider' && service.providerId.toString() === req.user._id.toString())) {
      const { title, category, price, location } = req.body;
      
      const updateData = { title, category, price, location };

      if (req.file) {
        // Delete old image if it exists
        if (service.image) {
          const oldImagePath = path.join(__dirname, '..', service.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        updateData.image = '/uploads/services/' + req.file.filename;
      }

      const updated = await Service.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      return res.json(updated);
    } else {
      return res.status(403).json({ error: 'You do not have permission to update this service' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/services/:id - Delete a service
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (req.user.role === 'admin' || (req.user.role === 'provider' && service.providerId.toString() === req.user._id.toString())) {
      
      // Delete associated image file
      if (service.image) {
        const imagePath = path.join(__dirname, '..', service.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await Service.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Service deleted successfully' });
    } else {
      return res.status(403).json({ error: 'You do not have permission to delete this service' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
