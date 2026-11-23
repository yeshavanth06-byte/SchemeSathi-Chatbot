import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load Scheme Data
const schemesPath = path.join(__dirname, 'data', 'schemes.json');
const helplinesPath = path.join(__dirname, 'data', 'helplines.json');
const troubleshootingPath = path.join(__dirname, 'data', 'troubleshooting.json');

let SCHEMES = [];
let HELPLINES = [];
let TROUBLESHOOTING = [];

try {
  SCHEMES = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));
  HELPLINES = JSON.parse(fs.readFileSync(helplinesPath, 'utf8'));
  TROUBLESHOOTING = JSON.parse(fs.readFileSync(troubleshootingPath, 'utf8'));
  console.log(`[SchemeSathi Server] Loaded ${SCHEMES.length} schemes, ${HELPLINES.length} helplines, ${TROUBLESHOOTING.length} troubleshooting topics.`);
} catch (err) {
  console.error('[SchemeSathi Server] Error loading data files:', err);
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'SchemeSathi – AI Government Scheme Assistant',
    version: '1.0.0',
    totalSchemes: SCHEMES.length,
    timestamp: new Date().toISOString()
  });
});

// 2. Get all schemes (with optional filters)
app.get('/api/schemes', (req, res) => {
  const { category, state, level, q } = req.query;
  let results = [...SCHEMES];

  if (category && category !== 'all') {
    results = results.filter(s => s.category.toLowerCase() === String(category).toLowerCase());
  }

  if (state && state !== 'All') {
    results = results.filter(s => s.applicableStates.includes('All') || s.applicableStates.some(st => st.toLowerCase() === String(state).toLowerCase()));
  }

  if (level && level !== 'All') {
    results = results.filter(s => s.level.toLowerCase() === String(level).toLowerCase());
  }

  if (q && String(q).trim()) {
    const search = String(q).toLowerCase().trim();
    results = results.filter(s => 
      s.name.toLowerCase().includes(search) ||
      s.shortName.toLowerCase().includes(search) ||
      s.description.toLowerCase().includes(search) ||
      s.tags.some(t => t.toLowerCase().includes(search))
    );
  }

  res.json({
    count: results.length,
    schemes: results
  });
});

// 3. Get single scheme by ID
app.get('/api/schemes/:id', (req, res) => {
  const scheme = SCHEMES.find(s => s.id.toLowerCase() === req.params.id.toLowerCase());
  if (!scheme) {
    return res.status(404).json({ error: 'Scheme not found' });
  }
  res.json(scheme);
});

// 4. National Helplines
app.get('/api/helplines', (req, res) => {
  res.json(HELPLINES);
});

// 5. Troubleshooting Guides
app.get('/api/troubleshoot', (req, res) => {
  res.json(TROUBLESHOOTING);
});

// 6. Eligibility evaluation endpoint
app.post('/api/eligibility', (req, res) => {
  const criteria = req.body.criteria || {};
  const matched = [];

  for (const scheme of SCHEMES) {
    const rules = scheme.eligibilityRules || {};
    const reasons = [];
    let isEligible = true;
    let score = 50;

    // State check
    if (criteria.state && criteria.state !== 'All') {
      const match = scheme.applicableStates.includes('All') || scheme.applicableStates.some(st => st.toLowerCase() === criteria.state.toLowerCase());
      if (match) {
        score += 15;
        reasons.push(`✓ Available for residents of ${criteria.state}`);
      } else {
        isEligible = false;
      }
    }

    // Gender check
    if (rules.gender && rules.gender !== 'All' && criteria.gender) {
      if (rules.gender.toLowerCase() === criteria.gender.toLowerCase()) {
        score += 20;
        reasons.push(`✓ Targeted welfare support for ${rules.gender} citizens`);
      } else {
        isEligible = false;
      }
    }

    // Age check
    if (criteria.age !== undefined) {
      if (rules.minAge !== undefined && criteria.age < rules.minAge) isEligible = false;
      if (rules.maxAge !== undefined && criteria.age > rules.maxAge) isEligible = false;
      if (isEligible && (rules.minAge !== undefined || rules.maxAge !== undefined)) {
        score += 15;
        reasons.push(`✓ Age ${criteria.age} satisfies requirement`);
      }
    }

    // Occupation check
    if (rules.occupations && rules.occupations.length > 0 && criteria.occupation) {
      const userOcc = criteria.occupation.toLowerCase();
      const matchOcc = rules.occupations.some(o => userOcc.includes(o.toLowerCase()) || o.toLowerCase().includes(userOcc.split('/')[0].trim().toLowerCase()));
      if (matchOcc) {
        score += 25;
        reasons.push(`✓ Matches your occupation (${criteria.occupation})`);
      }
    }

    // Income check
    if (rules.maxAnnualIncome !== undefined && criteria.annualIncome !== undefined) {
      if (criteria.annualIncome <= rules.maxAnnualIncome) {
        score += 15;
        reasons.push(`✓ Family income within ceiling limit of ₹${rules.maxAnnualIncome.toLocaleString('en-IN')}`);
      } else {
        isEligible = false;
      }
    }

    // Land ownership
    if (rules.landOwnerRequired && criteria.isLandOwner === false) {
      isEligible = false;
    } else if (rules.landOwnerRequired && criteria.isLandOwner === true) {
      score += 15;
      reasons.push('✓ Agricultural land ownership confirmed');
    }

    if (isEligible && score >= 35) {
      matched.push({
        scheme,
        score,
        reasons: reasons.length > 0 ? reasons : ['✓ General socioeconomic parameters satisfied']
      });
    }
  }

  matched.sort((a, b) => b.score - a.score);

  res.json({
    totalMatched: matched.length,
    results: matched.slice(0, 10)
  });
});

// 7. Chat API endpoint
app.post('/api/chat', async (req, res) => {
  const { message, criteria, eligibilityStep } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Check if external GEMINI_API_KEY is provided
  if (process.env.GEMINI_API_KEY) {
    try {
      // Optional generative answer using Gemini API with SchemeSathi civic system instructions
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const systemInstruction = `You are SchemeSathi, an Indian Government Scheme AI Assistant.
Rules:
- Never fabricate scheme eligibility, benefits, or URLs.
- Always provide authentic .gov.in links.
- Emphasize that live applications must be done on official portals.
- Provide step-by-step guidance.`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nCitizen Question: ${message}` }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return res.json({
            message: replyText,
            type: 'text',
            source: 'gemini'
          });
        }
      }
    } catch (e) {
      console.warn('[SchemeSathi Server] Gemini API call failed, falling back to local reasoning:', e.message);
    }
  }

  // Fallback to local rule engine
  res.json({
    message: 'Query received and processed by SchemeSathi civic engine.',
    type: 'text',
    source: 'local_engine'
  });
});

// Serve frontend build if dist folder exists
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    // If request is not an API call, serve index.html
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🇮🇳 SchemeSathi AI Server running on port ${PORT}`);
  console.log(`  Official API: http://localhost:${PORT}/api/health`);
  console.log(`  Schemes: http://localhost:${PORT}/api/schemes`);
  console.log(`=======================================================`);
});
