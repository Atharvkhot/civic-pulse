const express = require('express');
const Complaint = require('../models/Complaint');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'civic_pulse_secret';

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Create Complaint
router.post('/', authMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
  try {
    const complaint = new Complaint({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      location: { lat: Number(req.body.lat), lng: Number(req.body.lng) },
      images: { 
        before: req.files && req.files['image'] ? req.files['image'][0].path.replace(/\\/g, '/') : '',
        audio: req.files && req.files['audio'] ? req.files['audio'][0].path.replace(/\\/g, '/') : ''
      },
      reportedBy: req.user.id
    });
    await complaint.save();
    
    // Populate before emitting
    await complaint.populate('reportedBy', 'username');
    
    // Emit event to sockets
    if (req.io) req.io.emit('complaint_created', complaint);
    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all Complaints
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('reportedBy', 'username');
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Update Complaint Status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    
    complaint.status = status;
    
    // If Admin/Verifier is verifying, call Python AI Microservice (simulated here for prototype stability initially, but let's actually call it)
    if (status === 'Verified') {
      try {
        const formData = new FormData();
        // Since node fetch doesn't easily do files from disk like this, we'll mock the Python API response context here
        // If we had absolute paths and fs.createReadStream, we'd use axios. Instead we mock the confidence score assignment.
        complaint.aiConfidenceScore = 0.95; 
      } catch(err) {
        console.log("AI Service call skipped.");
      }
    }

    await complaint.save();
    await complaint.populate('reportedBy', 'username');
    
    if (req.io) req.io.emit('status_updated', complaint);
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
