// Step 4: Service Routes
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Service = require('../models/Service');
const verifyToken = require('../middleware/auth'); // Import our JWT checker

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
        $addFields: {
          providerName: '$providerData.name',
          providerEmail: '$providerData.email',
          providerPhoto: { $arrayElemAt: ['$profileData.profilePicture', 0] },
          providerAvailability: { $arrayElemAt: ['$profileData.availability_status', 0] }
        }
      },
      { $project: { providerData: 0, profileData: 0 } }
    ]);

    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/services - Add a new service
// We use "verifyToken" to block strangers. ONLY logged in users pass this check.
router.post('/', verifyToken, async (req, res) => {
  try {
    // Ensure ONLY a provider role can create a service
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Only providers can create services!' });
    }

    const { category, title, price, location } = req.body;

    // Create the service, pulling their unique ID straight from their confirmed JWT Token
    const newService = new Service({
      providerId: req.user._id, 
      category,
      title,
      price,
      location
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

// PUT /api/services/:id - Update a service (Admin or owning Provider)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (req.user.role === 'admin' || (req.user.role === 'provider' && service.providerId.toString() === req.user._id.toString())) {
      const { title, category, price, location } = req.body;
      const updated = await Service.findByIdAndUpdate(
        req.params.id,
        { title, category, price, location },
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

// DELETE /api/services/:id - Delete a service (Admin or owning Provider)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (req.user.role === 'admin' || (req.user.role === 'provider' && service.providerId.toString() === req.user._id.toString())) {
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
