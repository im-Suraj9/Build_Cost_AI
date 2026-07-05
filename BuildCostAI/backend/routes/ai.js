const express = require('express');
const { auth } = require('../middleware/auth');
const { predictCost, estimateMaterials, estimateTimeline, generateOptimizations, chatbotResponse } = require('../services/aiService');

const router = express.Router();

// Full AI prediction
router.post('/predict', auth, async (req, res) => {
  try {
    const { plotSize, floors, city, buildingType, materialQuality } = req.body;

    if (!plotSize || !floors || !city || !buildingType || !materialQuality) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const params = { plotSize: Number(plotSize), floors: Number(floors), city, buildingType, materialQuality };

    const [estimate, materials, timeline, optimizations] = await Promise.all([
      predictCost(params),
      estimateMaterials(params),
      estimateTimeline(params),
      generateOptimizations(params)
    ]);

    res.json({ estimate, materials, timeline, optimizations });
  } catch (err) {
    console.error('AI prediction error:', err);
    res.status(500).json({ message: 'AI prediction failed', error: err.message });
  }
});

// Quick estimate (no auth)
router.post('/quick-estimate', async (req, res) => {
  try {
    const { plotSize, floors, city, buildingType, materialQuality } = req.body;
    const params = {
      plotSize: Number(plotSize) || 1000,
      floors: Number(floors) || 1,
      city: city || 'default',
      buildingType: buildingType || 'residential',
      materialQuality: materialQuality || 'standard'
    };
    const estimate = predictCost(params);
    res.json({ estimate });
  } catch (err) {
    res.status(500).json({ message: 'Error generating estimate' });
  }
});

module.exports = router;
