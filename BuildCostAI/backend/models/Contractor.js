const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyName: { type: String, required: true },
  specialization: [{
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'renovation', 'interior', 'civil', 'electrical', 'plumbing']
  }],
  experience: { type: Number, default: 0 }, // years
  location: {
    city: { type: String, required: true },
    state: String,
    address: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  priceRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' }
  },
  portfolio: [{ image: String, title: String, description: String }],
  isVerified: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  bio: String,
  licenseNumber: String,
  completedProjects: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Contractor', contractorSchema);
