const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const Contractor = require('../models/Contractor');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { city, specialization, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (specialization) filter.specialization = specialization;
    const contractors = await Contractor.find(filter).sort('-rating').skip((page-1)*limit).limit(Number(limit)).populate('user','name avatar');
    const total = await Contractor.countDocuments(filter);
    res.json({ contractors, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id).populate('user','name avatar email');
    if (!contractor) return res.status(404).json({ message: 'Not found' });
    res.json(contractor);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const contractor = await Contractor.findById(req.params.id);
    if (!contractor) return res.status(404).json({ message: 'Not found' });
    contractor.reviews.push({ user: req.user._id, rating, comment });
    contractor.rating = contractor.reviews.reduce((s,r) => s+r.rating, 0) / contractor.reviews.length;
    contractor.reviewCount = contractor.reviews.length;
    await contractor.save();
    res.json(contractor);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', auth, requireRole('contractor','admin'), async (req, res) => {
  try {
    const contractor = new Contractor({ ...req.body, user: req.user._id });
    await contractor.save();
    res.status(201).json(contractor);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

module.exports = router;
