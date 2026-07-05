/**
 * BuildCost AI — Database Seed Script
 * Run: node seed.js
 * Creates demo users, contractors, and sample projects
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/construction_estimator'

// ─── Schemas (inline for seed) ──────────────────────────────────────────────
const User = require('./models/User')
const Project = require('./models/Project')
const Contractor = require('./models/Contractor')

const CONTRACTORS_DATA = [
  {
    companyName: 'Sharma Constructions Pvt Ltd',
    specialization: ['residential', 'commercial'],
    experience: 15,
    location: { city: 'Mumbai', state: 'Maharashtra' },
    contact: { phone: '+91 98765 43210', email: 'info@sharmaconstructions.com', website: 'https://sharmaconstructions.com' },
    rating: 4.7, reviewCount: 128,
    priceRange: { min: 1500, max: 2500 },
    isVerified: true, isAvailable: true,
    bio: 'Leading construction company with 15+ years in Mumbai. Specializing in premium residential villas and commercial complexes. ISO 9001 certified.',
    completedProjects: 234, licenseNumber: 'MH/C/2009/1234'
  },
  {
    companyName: 'Raj Builders & Associates',
    specialization: ['residential', 'renovation'],
    experience: 8,
    location: { city: 'Delhi', state: 'Delhi' },
    contact: { phone: '+91 98765 12345', email: 'raj@rajbuilders.in' },
    rating: 4.3, reviewCount: 67,
    priceRange: { min: 1200, max: 1900 },
    isVerified: true, isAvailable: true,
    bio: 'Quality residential construction at competitive rates across Delhi NCR. Specializing in 2-4 BHK homes and renovation projects.',
    completedProjects: 89
  },
  {
    companyName: 'Patel Infrastructure Ltd',
    specialization: ['commercial', 'industrial'],
    experience: 20,
    location: { city: 'Ahmedabad', state: 'Gujarat' },
    contact: { phone: '+91 99887 76543', email: 'contact@patelinfra.com' },
    rating: 4.9, reviewCount: 203,
    priceRange: { min: 1800, max: 3200 },
    isVerified: true, isAvailable: false,
    bio: 'Industry leader in commercial and industrial construction across Gujarat. 20 years of excellence, 400+ projects delivered.',
    completedProjects: 412, licenseNumber: 'GJ/C/2004/5678'
  },
  {
    companyName: 'Kumar & Sons Constructions',
    specialization: ['residential', 'interior'],
    experience: 12,
    location: { city: 'Bangalore', state: 'Karnataka' },
    contact: { phone: '+91 93456 78901', email: 'info@kumarandsons.co.in' },
    rating: 4.5, reviewCount: 94,
    priceRange: { min: 1600, max: 2800 },
    isVerified: true, isAvailable: true,
    bio: 'Delivering dream homes across Bangalore with premium interiors and modern architecture.',
    completedProjects: 156
  },
  {
    companyName: 'Deccan Construction Co.',
    specialization: ['residential', 'civil'],
    experience: 18,
    location: { city: 'Hyderabad', state: 'Telangana' },
    contact: { phone: '+91 94321 09876', email: 'deccan@construction.in' },
    rating: 4.6, reviewCount: 145,
    priceRange: { min: 1400, max: 2300 },
    isVerified: true, isAvailable: true,
    bio: 'Trusted name in Hyderabad construction for 18 years. Strong technical team, quality materials.',
    completedProjects: 298
  },
  {
    companyName: 'North India Build Corp',
    specialization: ['residential', 'commercial', 'civil'],
    experience: 14,
    location: { city: 'Chandigarh', state: 'Punjab' },
    contact: { phone: '+91 97654 32109', email: 'info@nibuildcorp.com' },
    rating: 4.4, reviewCount: 78,
    priceRange: { min: 1300, max: 2100 },
    isVerified: true, isAvailable: true,
    bio: 'Tricity construction specialist covering Chandigarh, Mohali, and Panchkula. Residential and commercial expertise.',
    completedProjects: 187
  },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('✅ MongoDB connected')

  // Clear existing
  await Promise.all([User.deleteMany({}), Project.deleteMany({}), Contractor.deleteMany({})])
  console.log('🧹 Cleared existing data')

  // Create admin
  const admin = await User.create({
    name: 'Admin User', email: 'admin@buildcost.ai',
    password: 'admin123', role: 'admin', isVerified: true, isPremium: true
  })

  // Create demo user
  const demo = await User.create({
    name: 'Demo User', email: 'demo@buildcost.ai',
    password: 'demo123', role: 'user', isVerified: true,
    notifications: [
      { message: 'Welcome to BuildCost AI! Create your first project to get started.', type: 'info' },
      { message: 'Tip: Use the AI chatbot for construction advice and cost-saving tips.', type: 'success' }
    ]
  })

  // Create contractor user
  const contractorUser = await User.create({
    name: 'Rajesh Sharma', email: 'contractor@buildcost.ai',
    password: 'contractor123', role: 'contractor', isVerified: true
  })

  console.log('👥 Users created')

  // Create contractors
  const contractors = await Promise.all(
    CONTRACTORS_DATA.map(c => Contractor.create({ ...c, user: contractorUser._id }))
  )
  console.log(`🏗️  ${contractors.length} contractors created`)

  // Create sample projects for demo user
  const { predictCost, estimateMaterials, estimateTimeline, generateOptimizations } = require('./services/aiService')

  const sampleProjects = [
    { name: 'My Dream Villa', plotSize: 2400, floors: 2, city: 'Mumbai', buildingType: 'residential', materialQuality: 'premium' },
    { name: 'Office Complex Phase 1', plotSize: 5000, floors: 4, city: 'Bangalore', buildingType: 'commercial', materialQuality: 'standard' },
    { name: '3BHK Apartment', plotSize: 1200, floors: 1, city: 'Pune', buildingType: 'residential', materialQuality: 'standard' },
  ]

  for (const sp of sampleProjects) {
    const params = { plotSize: sp.plotSize, floors: sp.floors, city: sp.city, buildingType: sp.buildingType, materialQuality: sp.materialQuality }
    const estimate = predictCost(params)
    const materials = estimateMaterials(params)
    const timeline = estimateTimeline(params)
    const optimizations = generateOptimizations(params)

    await Project.create({
      user: demo._id, name: sp.name, plotSize: sp.plotSize, floors: sp.floors,
      location: { city: sp.city }, buildingType: sp.buildingType, materialQuality: sp.materialQuality,
      estimate, materials, timeline, optimizations, costBreakdown: estimate.costBreakdown
    })
  }

  console.log('📁 Sample projects created')

  console.log('\n🎉 Seed complete!')
  console.log('─────────────────────────────────')
  console.log('Demo credentials:')
  console.log('  User:       demo@buildcost.ai / demo123')
  console.log('  Admin:      admin@buildcost.ai / admin123')
  console.log('  Contractor: contractor@buildcost.ai / contractor123')
  console.log('─────────────────────────────────\n')

  await mongoose.disconnect()
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
