const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Road', 'Water', 'Electricity', 'Garbage', 'Other'],
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  status: {
    type: String,
    enum: ['Submitted', 'Assigned', 'In Progress', 'Completed', 'Verified'],
    default: 'Submitted'
  },
  images: {
    before: { type: String, required: true },
    after: { type: String },
    audio: { type: String }
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiConfidenceScore: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
