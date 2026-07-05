const express = require('express');
const { auth } = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');
const { predictCost, estimateMaterials, estimateTimeline, generateOptimizations } = require('../services/aiService');
const PDFDocument = require('pdfkit');

const router = express.Router();

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Project.countDocuments(filter);
    res.json({ projects, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project with AI prediction
router.post('/', auth, async (req, res) => {
  try {
    const { name, plotSize, floors, location, buildingType, materialQuality, buildingPlan, notes } = req.body;

    const params = {
      plotSize: Number(plotSize),
      floors: Number(floors),
      city: location.city,
      buildingType,
      materialQuality
    };

    const [estimate, materials, timeline, optimizations] = await Promise.all([
      predictCost(params),
      estimateMaterials(params),
      estimateTimeline(params),
      generateOptimizations(params)
    ]);

    const project = new Project({
      user: req.user._id,
      name,
      plotSize: Number(plotSize),
      floors: Number(floors),
      location,
      buildingType,
      materialQuality,
      buildingPlan: buildingPlan || '',
      notes: notes || '',
      estimate,
      materials,
      timeline,
      optimizations,
      costBreakdown: estimate.costBreakdown
    });

    await project.save();

    // Notify user via socket
    const io = req.app.get('io');
    io.to(req.user._id.toString()).emit('project-created', { projectId: project._id, name });

    // Add notification to user
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        notifications: {
          message: `Project "${name}" created successfully! Estimated cost: ₹${(estimate.totalCost / 100000).toFixed(1)}L`,
          type: 'success'
        }
      }
    });

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create project', error: err.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Download PDF report
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${project.name}-report.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#f97316').text('BuildCost AI', 50, 50);
    doc.fontSize(16).fillColor('#1f2937').text('Construction Cost Estimation Report', 50, 80);
    doc.moveTo(50, 110).lineTo(560, 110).strokeColor('#e5e7eb').stroke();

    // Project info
    doc.fontSize(18).fillColor('#111827').text(project.name, 50, 130);
    doc.fontSize(11).fillColor('#6b7280')
      .text(`Location: ${project.location.city}  |  Type: ${project.buildingType}  |  Quality: ${project.materialQuality}`, 50, 155)
      .text(`Plot: ${project.plotSize} sqft  |  Floors: ${project.floors}  |  Total Area: ${project.plotSize * project.floors} sqft`, 50, 170);

    // Cost estimate
    doc.fontSize(14).fillColor('#f97316').text('COST ESTIMATE', 50, 200);
    doc.fontSize(22).fillColor('#111827').text(`₹${(project.estimate.totalCost / 100000).toFixed(2)} Lakhs`, 50, 220);
    doc.fontSize(11).fillColor('#6b7280')
      .text(`Range: ₹${(project.estimate.minCost / 100000).toFixed(1)}L — ₹${(project.estimate.maxCost / 100000).toFixed(1)}L`, 50, 250)
      .text(`Cost per sqft: ₹${project.estimate.costPerSqFt}`, 50, 265);

    // Cost breakdown
    doc.fontSize(14).fillColor('#f97316').text('COST BREAKDOWN', 50, 295);
    let y = 315;
    project.costBreakdown?.forEach(item => {
      doc.fontSize(10).fillColor('#374151')
        .text(`${item.category}`, 50, y)
        .text(`₹${(item.amount / 100000).toFixed(2)}L (${item.percentage}%)`, 350, y);
      y += 18;
    });

    // Materials
    y += 15;
    doc.fontSize(14).fillColor('#f97316').text('MATERIAL ESTIMATE', 50, y);
    y += 20;
    project.materials?.slice(0, 8).forEach(mat => {
      doc.fontSize(10).fillColor('#374151')
        .text(`${mat.name}`, 50, y)
        .text(`${mat.quantity} ${mat.unit}`, 250, y)
        .text(`₹${(mat.totalCost / 1000).toFixed(0)}K`, 430, y);
      y += 18;
    });

    // Timeline
    y += 15;
    doc.fontSize(14).fillColor('#f97316').text('CONSTRUCTION TIMELINE', 50, y);
    y += 20;
    doc.fontSize(11).fillColor('#374151').text(`Total Duration: ${project.timeline?.totalMonths} months (${project.timeline?.totalDays} days)`, 50, y);
    y += 15;
    project.timeline?.phases?.forEach(phase => {
      doc.fontSize(10).fillColor('#374151')
        .text(`${phase.name}: ${phase.duration} days (Day ${phase.startDay}-${phase.endDay})`, 50, y);
      y += 18;
    });

    // Footer
    doc.fontSize(9).fillColor('#9ca3af')
      .text(`Generated by BuildCost AI on ${new Date().toLocaleDateString()}`, 50, 750)
      .text('This is an estimate. Actual costs may vary based on site conditions and market rates.', 50, 762);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'PDF generation failed' });
  }
});

module.exports = router;
