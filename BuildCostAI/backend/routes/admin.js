const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Contractor = require('../models/Contractor');

const router = express.Router();
router.use(auth, requireRole('admin'));

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalProjects, totalContractors, recentProjects, usersByRole, projectsByType] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Contractor.countDocuments(),
      Project.find().sort('-createdAt').limit(5).populate('user','name email'),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Project.aggregate([{ $group: { _id: '$buildingType', count: { $sum: 1 } } }])
    ]);
    const monthlyProjects = await Project.aggregate([
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 }, totalCost: { $sum: '$estimate.totalCost' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 12 }
    ]);
    res.json({ totalUsers, totalProjects, totalContractors, recentProjects, usersByRole, projectsByType, monthlyProjects });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt').limit(50);
    res.json(users);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
