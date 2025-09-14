require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { ClaudePricingAgent } = require('./ai-pricing-agent');
const { ClaudeTradesMatchingAgent } = require('./claude-matching-agent');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// API endpoint for Claude problem analysis
app.post('/api/analyze-problem', async (req, res) => {
  try {
    const { description, userLocation } = req.body;
    
    if (!description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Description is required' 
      });
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'ANTHROPIC_API_KEY is not configured. Please set your Claude API key in the .env file.',
        code: 'API_KEY_MISSING'
      });
    }

    // Initialize Claude matching agent
    const matchingAgent = new ClaudeTradesMatchingAgent(process.env.ANTHROPIC_API_KEY);
    
    // Analyze the problem using Claude
    const analysis = await matchingAgent.analyzeProblem(description, [], userLocation);
    
    res.json({
      success: true,
      analysis: analysis,
      message: 'Problem analyzed successfully'
    });
    
  } catch (error) {
    console.error('Error analyzing problem:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze problem',
      details: error.message
    });
  }
});

// Demo database - In production, this would be MongoDB
let workers = [
  {
    id: 'w1',
    name: 'Marcus Thompson',
    initials: 'MT',
    trade: 'Electrician',
    specialties: ['Residential Wiring', 'Panel Upgrades', 'Lighting Installation'],
    rating: 4.8,
    reviewCount: 167,
    distance: 1.2,
    hourlyRate: 85,
    location: { lat: 37.7749, lng: -122.4194, city: 'San Francisco' },
    availability: ['tomorrow', 'next-week'],
    certifications: ['Master Electrician License', 'OSHA Certified'],
    experience: 12,
    completedJobs: 340,
    portfolio: [
      { type: 'image', url: '/images/electrical-work-1.jpg', description: 'Panel upgrade' },
      { type: 'image', url: '/images/electrical-work-2.jpg', description: 'Kitchen lighting' }
    ]
  },
  {
    id: 'w2',
    name: 'Rick Williams',
    initials: 'RW',
    trade: 'Plumber',
    specialties: ['Pipe Repair', 'Water Heater Installation', 'Drain Cleaning'],
    rating: 4.7,
    reviewCount: 203,
    distance: 2.8,
    hourlyRate: 75,
    location: { lat: 37.7849, lng: -122.4094, city: 'San Francisco' },
    availability: ['today', 'tomorrow'],
    certifications: ['Licensed Plumber', 'Backflow Prevention'],
    experience: 8,
    completedJobs: 285,
    portfolio: [
      { type: 'image', url: '/images/plumbing-work-1.jpg', description: 'Pipe replacement' }
    ]
  },
  {
    id: 'w3',
    name: 'Jake Roberts',
    initials: 'JR',
    trade: 'Auto Mechanic',
    specialties: ['Engine Repair', 'Brake Service', 'Diagnostics'],
    rating: 4.8,
    reviewCount: 157,
    distance: 3.2,
    hourlyRate: 95,
    location: { lat: 37.7649, lng: -122.4294, city: 'San Francisco' },
    availability: ['tomorrow'],
    certifications: ['ASE Certified', 'Hybrid Vehicle Specialist'],
    experience: 15,
    completedJobs: 420,
    portfolio: []
  },
  {
    id: 'w4',
    name: 'Alex Turner',
    initials: 'AT',
    trade: 'Auto Mechanic',
    specialties: ['Oil Changes', 'Tire Service', 'Basic Maintenance'],
    rating: 4.6,
    reviewCount: 89,
    distance: 4.1,
    hourlyRate: 65,
    location: { lat: 37.7549, lng: -122.4394, city: 'San Francisco' },
    availability: ['tomorrow', 'next-week'],
    certifications: ['Basic Auto Repair'],
    experience: 5,
    completedJobs: 150,
    portfolio: []
  },
  {
    id: 'w5',
    name: 'Danny Fix',
    initials: 'DF',
    trade: 'Mobile Mechanic',
    specialties: ['On-site Repair', 'Emergency Service', 'Diagnostics'],
    rating: 4.7,
    reviewCount: 134,
    distance: 2.5,
    hourlyRate: 90,
    location: { lat: 37.7749, lng: -122.4094, city: 'San Francisco' },
    availability: ['today', 'tomorrow'],
    certifications: ['Mobile Service Certified', 'Emergency Response'],
    experience: 10,
    completedJobs: 275,
    portfolio: []
  }
];

let jobs = [];
let conversations = [];

// AI Agent Classes
class TradesMatchingAgent {
  constructor() {
    this.tradeKeywords = {
      'electrician': ['light', 'electrical', 'wire', 'outlet', 'switch', 'power', 'circuit', 'panel'],
      'plumber': ['pipe', 'leak', 'water', 'drain', 'toilet', 'sink', 'faucet', 'plumbing'],
      'mechanic': ['car', 'engine', 'brake', 'oil', 'tire', 'automotive', 'vehicle', 'repair'],
      'hvac': ['heating', 'cooling', 'air', 'furnace', 'ac', 'ventilation', 'hvac'],
      'carpenter': ['wood', 'door', 'window', 'cabinet', 'furniture', 'construction']
    };
  }

  analyzeProblem(description, images = []) {
    const problem = {
      description: description.toLowerCase(),
      trades: [],
      urgency: 'flexible',
      details: {},
      confidence: 0
    };

    // Identify trade types
    for (const [trade, keywords] of Object.entries(this.tradeKeywords)) {
      const matches = keywords.filter(keyword => problem.description.includes(keyword));
      if (matches.length > 0) {
        problem.trades.push({
          trade: trade,
          confidence: matches.length / keywords.length,
          matchedKeywords: matches
        });
      }
    }

    // Assess urgency
    const urgentKeywords = ['emergency', 'urgent', 'asap', 'immediately', 'flooding', 'sparking'];
    const soonKeywords = ['today', 'tomorrow', 'soon', 'quickly'];
    
    if (urgentKeywords.some(keyword => problem.description.includes(keyword))) {
      problem.urgency = 'emergency';
    } else if (soonKeywords.some(keyword => problem.description.includes(keyword))) {
      problem.urgency = 'soon';
    }

    // Sort trades by confidence
    problem.trades.sort((a, b) => b.confidence - a.confidence);
    problem.confidence = problem.trades.length > 0 ? problem.trades[0].confidence : 0;

    return problem;
  }

  findWorkers(problem, location = null) {
    if (problem.trades.length === 0) return [];

    const primaryTrade = problem.trades[0].trade;
    let matches = workers.filter(worker => 
      worker.trade.toLowerCase().includes(primaryTrade) ||
      primaryTrade.includes(worker.trade.toLowerCase())
    );

    // Sort by rating and distance
    matches.sort((a, b) => {
      const scoreA = a.rating * 0.7 + (5 - a.distance) * 0.3;
      const scoreB = b.rating * 0.7 + (5 - b.distance) * 0.3;
      return scoreB - scoreA;
    });

    return matches.slice(0, 4);
  }

  generateFollowUpQuestions(problem) {
    const questions = [];
    
    if (problem.trades.length === 0) {
      questions.push("Could you describe the problem in more detail? What specifically needs to be fixed or worked on?");
      return questions;
    }

    const primaryTrade = problem.trades[0].trade;
    
    switch (primaryTrade) {
      case 'electrician':
        questions.push("Is this related to a specific outlet, light fixture, or your electrical panel?");
        questions.push("Are you experiencing any power outages or electrical safety concerns?");
        break;
      case 'plumber':
        questions.push("Is water currently leaking? If so, how much water and where exactly?");
        questions.push("Is this affecting your water supply or drainage?");
        break;
      case 'mechanic':
        questions.push("What make and model is your vehicle?");
        questions.push("Are you able to drive the car, or does it need to be towed?");
        break;
    }

    if (problem.urgency === 'flexible') {
      questions.push("When would you like this work completed?");
    }

    return questions;
  }
}

// Legacy PricingAgent replaced by ClaudePricingAgent

// Initialize AI agents
const matchingAgent = new ClaudeTradesMatchingAgent(process.env.ANTHROPIC_API_KEY);
const pricingAgent = new ClaudePricingAgent(process.env.ANTHROPIC_API_KEY);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for problem analysis
app.post('/api/analyze-problem', async (req, res) => {
  try {
    const { description, userLocation, conversationHistory = [] } = req.body;
    
    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Problem description is required'
      });
    }

    console.log('Analyzing problem with Claude:', description);

    // Use Claude matching agent for analysis
    const analysis = await matchingAgent.analyzeProblem(description, [], userLocation);
    
    console.log('Claude analysis result:', JSON.stringify(analysis, null, 2));

    res.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error('Problem analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint for worker matching
app.post('/api/find-workers', async (req, res) => {
  try {
    const { analysis, userLocation, preferences = {} } = req.body;
    
    if (!analysis) {
      return res.status(400).json({
        success: false,
        error: 'Problem analysis is required'
      });
    }

    console.log('Finding workers with Claude matching agent');

    // Use Claude matching agent to find best workers
    const workerMatching = await matchingAgent.findWorkers(analysis, workers, userLocation, preferences);
    
    console.log('Claude matching result:', JSON.stringify(workerMatching, null, 2));

    // Calculate pricing for matched workers
    const matchesWithPricing = [];
    for (const worker of workerMatching.matches) {
      try {
        const estimatedHours = analysis.problemDetails?.timeEstimate ? 
          parseFloat(analysis.problemDetails.timeEstimate.replace(/[^\d.]/g, '')) || 2 : 2;
        
        const pricing = await pricingAgent.calculatePrice(worker, analysis, estimatedHours);
        matchesWithPricing.push({
          ...worker,
          pricing: pricing
        });
      } catch (error) {
        console.error('Pricing error for worker:', worker.id, error);
        // No fallback - throw error if pricing fails
        throw new Error(`Pricing calculation failed for worker ${worker.name}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      matches: matchesWithPricing,
      summary: workerMatching.summary,
      alternatives: workerMatching.alternatives
    });

  } catch (error) {
    console.error('Worker matching error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Legacy chat API - removed to eliminate fallback cases

// Get worker details
app.get('/api/workers/:id', (req, res) => {
  const worker = workers.find(w => w.id === req.params.id);
  if (!worker) {
    return res.status(404).json({ error: 'Worker not found' });
  }
  res.json(worker);
});

// Book a worker
app.post('/api/book', (req, res) => {
  const { workerId, date, time, problemDescription, estimatedCost } = req.body;
  
  const worker = workers.find(w => w.id === workerId);
  if (!worker) {
    return res.status(404).json({ error: 'Worker not found' });
  }

  const booking = {
    id: uuidv4(),
    workerId: workerId,
    worker: worker,
    date: date,
    time: time,
    problemDescription: problemDescription,
    estimatedCost: estimatedCost,
    status: 'confirmed',
    createdAt: new Date()
  };

  jobs.push(booking);

  res.json({
    success: true,
    booking: booking,
    message: 'Booking confirmed successfully!'
  });
});

// Get all workers (for browsing)
app.get('/api/workers', (req, res) => {
  const { trade, location } = req.query;
  
  let filteredWorkers = workers;
  
  if (trade) {
    filteredWorkers = filteredWorkers.filter(worker => 
      worker.trade.toLowerCase().includes(trade.toLowerCase())
    );
  }
  
  res.json(filteredWorkers);
});

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { problemContext = '' } = req.body;
    
    // Convert image to base64 for Claude Vision API
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    try {
      // Analyze image with Claude Vision
      const analysis = await matchingAgent.analyzeImage(base64Image, problemContext);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        analysis: analysis.analysis,
        suggestedTrades: analysis.suggestedTrades,
        urgency: analysis.urgency,
        urgencyReasoning: analysis.urgencyReasoning,
        materialEstimate: analysis.materialEstimate,
        timeEstimate: analysis.timeEstimate,
        complexityLevel: analysis.complexityLevel,
        safetyIssues: analysis.safetyIssues,
        followUpQuestions: analysis.followUpQuestions,
        confidence: analysis.confidence
      });
    } catch (analysisError) {
      console.error('Image analysis error:', analysisError);
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      // Generate AI-powered fallback questions for image analysis failure
      try {
        const fallbackResponse = await matchingAgent.generateImageAnalysisFallback(problemContext);
        res.json({
          success: true,
          analysis: fallbackResponse.analysis,
          suggestedTrades: [],
          followUpQuestions: fallbackResponse.followUpQuestions,
          confidence: 0.3
        });
      } catch (fallbackError) {
        res.json({
          success: true,
          analysis: 'Image uploaded successfully, but analysis is temporarily unavailable.',
          suggestedTrades: [],
          followUpQuestions: [],
          confidence: 0.3
        });
      }
    }
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Create uploads directory
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`PowerUs AI server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the application`);
});
