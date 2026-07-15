const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'worker', 'verifier', 'admin'], 
    default: 'citizen' 
  },
  points: { type: Number, default: 0 },
  badges: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
