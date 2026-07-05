const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['draft', 'active', 'completed', 'archived'], default: 'active' },

  // Input parameters
  plotSize: { type: Number, required: true },
  floors: { type: Number, required: true, min: 1, max: 50 },
  location: {
    city: { type: String, required: true },
    state: { type: String },
    coordinates: { lat: Number, lng: Number }
  },
  buildingType: { type: String, enum: ['residential', 'commercial', 'industrial', 'mixed'], required: true },
  materialQuality: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
  buildingPlan: { type: String, default: '' }, // Cloudinary URL

  // AI Results
  estimate: {
    totalCost: { type: Number },
    minCost: { type: Number },
    maxCost: { type: Number },
    costPerSqFt: { type: Number },
    currency: { type: String, default: 'INR' }
  },
  materials: [{
    name: String,
    quantity: Number,
    unit: String,
    unitCost: Number,
    totalCost: Number
  }],
  timeline: {
    totalDays: Number,
    totalMonths: Number,
    phases: [{
      name: String,
      duration: Number,
      unit: String,
      startDay: Number,
      endDay: Number,
      description: String
    }]
  },
  optimizations: [{
    category: String,
    suggestion: String,
    potentialSaving: Number,
    savingPercent: Number
  }],
  costBreakdown: [{
    category: String,
    amount: Number,
    percentage: Number
  }],

  notes: { type: String, default: '' },
  tags: [String],
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
