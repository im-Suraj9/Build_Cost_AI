// Construction Cost AI Service
// Comprehensive mock ML logic with realistic Indian market pricing

const CITY_MULTIPLIERS = {
  'mumbai': 1.45, 'delhi': 1.35, 'bangalore': 1.30, 'chennai': 1.20,
  'hyderabad': 1.20, 'pune': 1.25, 'kolkata': 1.10, 'ahmedabad': 1.15,
  'jaipur': 1.00, 'lucknow': 0.95, 'chandigarh': 1.10, 'surat': 1.05,
  'nagpur': 0.95, 'indore': 0.98, 'bhopal': 0.92, 'default': 1.00
};

const QUALITY_MULTIPLIERS = { basic: 0.75, standard: 1.00, premium: 1.55 };
const BUILDING_TYPE_MULTIPLIERS = { residential: 1.00, commercial: 1.30, industrial: 0.90, mixed: 1.15 };

const BASE_COST_PER_SQFT = 1800; // INR, standard quality

const MATERIAL_RATIOS = {
  basic: { cement: 0.18, steel: 0.22, bricks: 0.15, sand: 0.08, tiles: 0.07, aggregate: 0.06, paint: 0.05, woodwork: 0.08, electrical: 0.06, plumbing: 0.05 },
  standard: { cement: 0.16, steel: 0.20, bricks: 0.13, sand: 0.07, tiles: 0.09, aggregate: 0.05, paint: 0.07, woodwork: 0.10, electrical: 0.07, plumbing: 0.06 },
  premium: { cement: 0.14, steel: 0.18, bricks: 0.11, sand: 0.06, tiles: 0.14, aggregate: 0.04, paint: 0.10, woodwork: 0.14, electrical: 0.09, plumbing: 0.08 }
};

const MATERIAL_UNITS = {
  cement: 'bags (50kg)', steel: 'kg', bricks: 'nos', sand: 'cubic ft',
  tiles: 'sq ft', aggregate: 'cubic ft', paint: 'liters', woodwork: 'sq ft',
  electrical: 'points', plumbing: 'points'
};

const MATERIAL_UNIT_COSTS = {
  basic:    { cement: 380, steel: 65, bricks: 8, sand: 45, tiles: 35, aggregate: 40, paint: 120, woodwork: 350, electrical: 800, plumbing: 600 },
  standard: { cement: 395, steel: 68, bricks: 9, sand: 50, tiles: 65, aggregate: 45, paint: 160, woodwork: 550, electrical: 1200, plumbing: 900 },
  premium:  { cement: 420, steel: 75, bricks: 12, sand: 55, tiles: 180, aggregate: 50, paint: 280, woodwork: 1200, electrical: 1800, plumbing: 1400 }
};

function estimateMaterialQuantities(totalArea, quality) {
  const q = quality;
  return {
    cement: Math.ceil(totalArea * 0.40),        // bags per sqft
    steel: Math.ceil(totalArea * 4.5),           // kg per sqft
    bricks: Math.ceil(totalArea * 8),            // nos per sqft
    sand: Math.ceil(totalArea * 1.2),            // cubic ft
    tiles: Math.ceil(totalArea * 1.15),          // sq ft (with wastage)
    aggregate: Math.ceil(totalArea * 0.8),       // cubic ft
    paint: Math.ceil(totalArea * 2.5),           // liters (2 coats)
    woodwork: Math.ceil(totalArea * 0.18),       // sq ft
    electrical: Math.ceil(totalArea * 0.08),     // points
    plumbing: Math.ceil(totalArea * 0.05)        // points
  };
}

function predictCost(params) {
  const { plotSize, floors, city, buildingType, materialQuality } = params;
  const totalArea = plotSize * floors;
  const cityKey = city.toLowerCase().trim();
  const cityMultiplier = CITY_MULTIPLIERS[cityKey] || CITY_MULTIPLIERS['default'];
  const qualityMultiplier = QUALITY_MULTIPLIERS[materialQuality] || 1;
  const typeMultiplier = BUILDING_TYPE_MULTIPLIERS[buildingType] || 1;

  const baseCost = totalArea * BASE_COST_PER_SQFT * cityMultiplier * qualityMultiplier * typeMultiplier;

  // Add foundation cost for multiple floors
  const foundationExtra = floors > 2 ? baseCost * 0.05 * (floors - 2) : 0;
  const totalCost = baseCost + foundationExtra;

  const variance = materialQuality === 'premium' ? 0.12 : materialQuality === 'basic' ? 0.08 : 0.10;
  const costPerSqFt = Math.round(totalCost / totalArea);

  // Cost breakdown by category
  const breakdownRatios = {
    'Foundation & Structure': 0.30,
    'Walls & Masonry': 0.18,
    'Roofing': 0.10,
    'Flooring & Tiles': 0.10,
    'Doors & Windows': 0.08,
    'Electrical Work': 0.07,
    'Plumbing & Sanitation': 0.06,
    'Painting & Finishing': 0.06,
    'Miscellaneous': 0.05
  };

  const costBreakdown = Object.entries(breakdownRatios).map(([category, ratio]) => ({
    category,
    amount: Math.round(totalCost * ratio),
    percentage: Math.round(ratio * 100)
  }));

  return {
    totalCost: Math.round(totalCost),
    minCost: Math.round(totalCost * (1 - variance)),
    maxCost: Math.round(totalCost * (1 + variance)),
    costPerSqFt,
    totalArea,
    currency: 'INR',
    costBreakdown
  };
}

function estimateMaterials(params) {
  const { plotSize, floors, materialQuality } = params;
  const totalArea = plotSize * floors;
  const quantities = estimateMaterialQuantities(totalArea, materialQuality);
  const unitCosts = MATERIAL_UNIT_COSTS[materialQuality];

  return Object.entries(quantities).map(([name, quantity]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    quantity,
    unit: MATERIAL_UNITS[name],
    unitCost: unitCosts[name],
    totalCost: Math.round(quantity * unitCosts[name])
  }));
}

function estimateTimeline(params) {
  const { plotSize, floors, buildingType, materialQuality } = params;
  const totalArea = plotSize * floors;

  // Base days per 1000 sqft
  const baseDaysPerK = buildingType === 'commercial' ? 180 : 150;
  const qualityDays = materialQuality === 'premium' ? 1.25 : materialQuality === 'basic' ? 0.85 : 1;
  const floorExtra = floors > 3 ? (floors - 3) * 20 : 0;

  const totalDays = Math.ceil((totalArea / 1000) * baseDaysPerK * qualityDays) + floorExtra;
  const totalMonths = Math.ceil(totalDays / 30);

  const phases = [
    { name: 'Site Preparation & Foundation', ratio: 0.18, description: 'Soil testing, excavation, foundation laying, waterproofing' },
    { name: 'Structural Framework', ratio: 0.25, description: 'Column casting, beam work, slab casting for all floors' },
    { name: 'Walls & Masonry', ratio: 0.15, description: 'Brick laying, partition walls, external walls' },
    { name: 'Roof & External Works', ratio: 0.10, description: 'Roofing slab, staircase, external plaster' },
    { name: 'Internal Plaster & MEP', ratio: 0.15, description: 'Internal plastering, electrical, plumbing rough-in' },
    { name: 'Flooring & Tiling', ratio: 0.08, description: 'Floor tiles, bathroom tiles, granite countertops' },
    { name: 'Doors, Windows & Fixtures', ratio: 0.05, description: 'Door/window frames, hardware, sanitary fixtures' },
    { name: 'Painting & Finishing', ratio: 0.04, description: 'Primer, paint, polishing, final touches' }
  ];

  let currentDay = 1;
  const phasesWithDates = phases.map(phase => {
    const duration = Math.ceil(totalDays * phase.ratio);
    const result = {
      name: phase.name,
      duration,
      unit: 'days',
      startDay: currentDay,
      endDay: currentDay + duration - 1,
      description: phase.description
    };
    currentDay += duration;
    return result;
  });

  return { totalDays, totalMonths, phases: phasesWithDates };
}

function generateOptimizations(params) {
  const { materialQuality, buildingType, floors } = params;

  const suggestions = [
    {
      category: 'Material Substitution',
      suggestion: materialQuality === 'premium'
        ? 'Use vitrified tiles instead of imported marble in non-primary areas — saves up to 40% on flooring costs'
        : 'Use AAC blocks instead of red bricks — reduces wall weight and cement usage by 30%',
      potentialSaving: materialQuality === 'premium' ? 180000 : 85000,
      savingPercent: materialQuality === 'premium' ? 4 : 3
    },
    {
      category: 'Structural Optimization',
      suggestion: floors > 2
        ? 'Optimize column spacing using structural software analysis — can reduce steel usage by 8-12%'
        : 'Use pre-engineered roof trusses instead of RCC slab for spans > 20ft — saves 15-20%',
      potentialSaving: floors > 2 ? 220000 : 95000,
      savingPercent: floors > 2 ? 5 : 3
    },
    {
      category: 'Procurement Strategy',
      suggestion: 'Bulk purchase cement and steel at construction start — prices typically rise 10-15% during project. Pre-book 80% of requirement.',
      potentialSaving: 150000,
      savingPercent: 3
    },
    {
      category: 'Energy Efficiency',
      suggestion: 'Install solar panels during construction (avoid retrofit costs). 3kW system offsets long-term energy costs by ₹12,000/month.',
      potentialSaving: 200000,
      savingPercent: 4
    },
    {
      category: 'Labour Optimization',
      suggestion: 'Use modular formwork systems — reduces shuttering time by 30% and labour costs significantly for multi-floor structures.',
      potentialSaving: 120000,
      savingPercent: 2.5
    },
    {
      category: 'Waste Reduction',
      suggestion: 'Use ready-mix concrete (RMC) from certified plants — reduces material wastage by 12% and improves quality consistency.',
      potentialSaving: 75000,
      savingPercent: 1.5
    }
  ];

  return suggestions.slice(0, 4);
}

function chatbotResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('reduce cost') || msg.includes('save money') || msg.includes('cheaper')) {
    return {
      response: `## Ways to Reduce Construction Costs 💡

**1. Smart Material Choices**
- Use AAC/fly-ash bricks instead of red bricks (saves 20-25%)
- Vitrified tiles over marble for most areas
- UPVC windows over aluminum

**2. Design Optimization**
- Simple rectangular plan reduces construction cost by 10-15%
- Avoid curved walls and complex rooflines
- Optimize room sizes to minimize waste

**3. Procurement Tips**
- Buy cement & steel in bulk at project start
- Source directly from manufacturers when possible
- Compare 3+ contractor quotes

**4. Construction Methods**
- Use RMC (Ready Mix Concrete) for slabs
- Modular kitchen/bathroom fittings
- Pre-engineered steel for large spans

**5. Timing**
- Start construction in dry season (Oct-Feb in India)
- Avoids monsoon delays and material price spikes

💰 These strategies can save 15-25% of total project cost!`,
      suggestions: ['What materials should I use?', 'How long will construction take?', 'Best contractors near me?']
    };
  }

  if (msg.includes('material') || msg.includes('cement') || msg.includes('steel') || msg.includes('brick')) {
    return {
      response: `## Best Construction Materials Guide 🏗️

**Cement**
- OPC 53 Grade for structural work (RCC, columns, beams)
- PPC for plastering and brickwork
- Top brands: Ultratech, ACC, Ambuja, Wonder

**Steel/TMT Bars**
- Fe 500D for earthquake-resistant construction
- Top brands: TATA Tiscon, JSW Neosteel, SAIL
- Typical consumption: 4-5 kg per sqft

**Bricks/Blocks**
- AAC blocks: Lightweight, thermal insulation, faster construction
- Fly-ash bricks: Eco-friendly, better strength
- Red bricks: Traditional, good load bearing

**Sand & Aggregate**
- M-Sand (Manufactured Sand) is preferred over river sand
- 20mm aggregate for concrete, 40mm for foundation

**Tiles & Flooring**
- Living room: Vitrified tiles (600x600mm)
- Bathrooms: Anti-skid ceramic
- External: Parking tiles or IPS flooring

Need specific recommendations for your project quality level?`,
      suggestions: ['How to reduce construction cost?', 'What is construction timeline?', 'Best waterproofing materials?']
    };
  }

  if (msg.includes('timeline') || msg.includes('time') || msg.includes('how long') || msg.includes('duration')) {
    return {
      response: `## Construction Timeline Guide ⏱️

**Typical Phases (2000 sqft, 2 floors)**

| Phase | Duration |
|-------|----------|
| Site prep & Foundation | 30-45 days |
| Ground floor structure | 45-60 days |
| First floor structure | 35-50 days |
| Brick work & Plaster | 40-50 days |
| MEP (Electrical, Plumbing) | 20-30 days |
| Flooring & Tiling | 20-25 days |
| Painting & Finishing | 15-20 days |
| **Total** | **~8-10 months** |

**Factors That Affect Timeline:**
- ⛈️ Monsoon season adds 15-20% to duration
- 🔧 Premium finishes require more time for installation
- 📋 Approval delays can add 1-2 months
- 👷 Contractor availability and crew size

**Pro Tips:**
- Start foundation work in October-November
- Book contractors 3 months in advance
- Keep 15-20% buffer for unforeseen delays`,
      suggestions: ['How to speed up construction?', 'What are construction phases?', 'Best time to start building?']
    };
  }

  if (msg.includes('foundation') || msg.includes('structure') || msg.includes('structural')) {
    return {
      response: `## Foundation & Structural Guide 🏛️

**Types of Foundations**
- **Isolated Footing**: Most common for residential, cost-effective
- **Raft Foundation**: For weak soil or high-rise buildings
- **Pile Foundation**: For very weak/expansive soil

**When to choose what?**
- SBC > 15 T/sqm: Isolated footings work well
- SBC 10-15 T/sqm: Consider raft foundation
- SBC < 10 T/sqm: Pile foundation recommended

**Structural System Options**
1. **RCC Frame**: Most popular, suitable for 1-10 floors
2. **Load Bearing**: Only for single floor, low cost
3. **Steel Frame**: Fast construction, high cost, best for commercial

**Key Quality Points**
- Get soil test done before design (costs ₹5,000-15,000)
- Use M25 grade concrete for columns/beams minimum
- Ensure proper cover to reinforcement (clear cover 40mm)
- Waterproof foundation with crystalline compound

**Cost**: Foundation typically = 20-25% of total construction cost`,
      suggestions: ['What type of foundation should I use?', 'How to waterproof basement?', 'Soil testing importance']
    };
  }

  if (msg.includes('waterproof') || msg.includes('leakage') || msg.includes('seepage')) {
    return {
      response: `## Waterproofing Guide 💧

**Critical Areas to Waterproof:**
1. **Terrace/Roof** - Most important! 
2. **Bathrooms & Toilets**
3. **External Walls**
4. **Basement (if any)**
5. **Water tanks**

**Best Products:**
- Dr. Fixit, Fosroc, BASF MasterSeal (premium)
- Pidilite Dr. Fixit (standard, widely available)

**Methods:**
- Terrace: SBR membrane + brick-bat coba (traditional) OR polymer coating (modern)
- Bathrooms: 2 coats crystalline + tile adhesive
- External walls: Silicone-based weather coat paint

**Cost:**
- Basic: ₹40-60/sqft
- Standard: ₹80-120/sqft  
- Premium: ₹150-250/sqft

**Pro Tip:** Never compromise on waterproofing — fixing leakage post-construction costs 3-5x more! Budget 3-5% of total cost for waterproofing.`,
      suggestions: ['Best terrace waterproofing method?', 'How to fix bathroom leakage?', 'Waterproofing cost estimate']
    };
  }

  // Default response
  return {
    response: `I'm your AI construction consultant! 🏗️ I can help you with:

- **💰 Cost Reduction** — Tips to save 15-25% on construction
- **🧱 Material Selection** — Best materials for quality & budget
- **⏱️ Timeline Planning** — Phase-wise construction schedule
- **🏛️ Foundation & Structure** — Technical guidance
- **💧 Waterproofing** — Protect your investment
- **📋 Contractor Selection** — How to choose and negotiate
- **🌱 Eco-friendly Options** — Green building solutions

What would you like to know about your construction project?`,
    suggestions: ['How to reduce construction cost?', 'Best materials to use?', 'How long will construction take?']
  };
}

module.exports = { predictCost, estimateMaterials, estimateTimeline, generateOptimizations, chatbotResponse };
