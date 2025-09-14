const Anthropic = require('@anthropic-ai/sdk');

// Claude model constant
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

class ClaudeTradesMatchingAgent {
  constructor(apiKey = null) {
    this.anthropic = apiKey ? new Anthropic({ apiKey }) : null;
  }

  async analyzeProblem(description, images = [], userLocation = null) {
    if (!this.anthropic) {
      throw new Error('Claude AI is required for problem analysis. Please configure ANTHROPIC_API_KEY.');
    }

    try {
      const prompt = this.buildAnalysisPrompt(description, images, userLocation);
      
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const result = this.parseAnalysisResponse(response.content[0].text);
      return result;

    } catch (error) {
      console.error('Claude analysis error:', error);
      throw new Error(`Problem analysis failed: ${error.message}. Claude AI is required for intelligent problem analysis.`);
    }
  }

  buildAnalysisPrompt(description, images, userLocation) {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    return `You are an expert trades analysis AI for PowerUs, a platform connecting customers with skilled tradespeople. Your job is to analyze customer problems and determine the best trade professionals needed.

CONTEXT:
- Current Date/Time: ${currentDate} ${currentTime}
- Platform: PowerUs AI (trades matching platform)
- Goal: Accurate problem analysis and trade identification

CUSTOMER REQUEST:
- Problem Description: "${description}"
- User Location: ${userLocation || 'Not specified'}
- Images Provided: ${images.length > 0 ? `${images.length} image(s)` : 'None'}
${images.length > 0 ? `- Image Analysis: ${images.map(img => img.analysis || 'Image uploaded').join(', ')}` : ''}

ANALYSIS REQUIREMENTS:

1. TRADE IDENTIFICATION:
   - Primary trade needed (electrician, plumber, HVAC, carpenter, mechanic, etc.)
   - Secondary trades if multi-trade job
   - Confidence level for each trade (0.0-1.0)
   - Specific specialties within the trade

2. URGENCY ASSESSMENT:
   - emergency: Safety hazard, flooding, no power, etc.
   - soon: Needs attention within 24-48 hours
   - flexible: Can wait days/weeks
   - Consider safety, functionality, and customer language

3. PROBLEM DETAILS EXTRACTION:
   - Specific components involved (pipes, wires, appliances, etc.)
   - Damage assessment from description/images
   - Tools or materials likely needed
   - Complexity level (simple, moderate, complex)

4. LOCATION REQUIREMENTS:
   - Extract any location info from description
   - Determine if on-site work required
   - Assess accessibility concerns

5. CONFIDENCE ASSESSMENT:
   - Overall confidence in problem identification (0.0-1.0)
   - If confidence > 0.7 and no safety issues, proceed to matching
   - Only ask follow-ups for safety issues or very low confidence (<0.6)

TRADE CATEGORIES:
- Electrician: Wiring, outlets, panels, lighting, electrical safety
- Plumber: Pipes, leaks, drains, water heaters, fixtures
- HVAC: Heating, cooling, ventilation, air conditioning
- Carpenter: Wood work, doors, windows, cabinets, framing
- Mechanic: Vehicle repair, engine work, automotive systems
- Handyman: General repairs, assembly, minor fixes
- Appliance Repair: Washers, dryers, refrigerators, ovens
- Locksmith: Locks, keys, security systems
- Painter: Interior/exterior painting, drywall
- Roofer: Roof repair, gutters, weatherproofing

URGENCY INDICATORS:
- Emergency: "sparking", "flooding", "gas leak", "no heat", "emergency", "urgent", "asap"
- Soon: "today", "tomorrow", "soon", "quickly", "not working"
- Flexible: "when convenient", "sometime", "planning", "upgrade"

RESPONSE FORMAT:
Provide your analysis in this exact JSON format:

{
  "trades": [
    {
      "trade": "[trade name]",
      "confidence": [0.0-1.0],
      "specialties": ["[specific skills needed]"],
      "reasoning": "[why this trade is needed]"
    }
  ],
  "urgency": "[emergency/soon/flexible]",
  "urgencyReasoning": "[why this urgency level]",
  "problemDetails": {
    "category": "[electrical/plumbing/mechanical/etc]",
    "complexity": "[simple/moderate/complex]",
    "location": "[where the problem is]",
    "symptoms": ["[list of symptoms]"],
    "possibleCauses": ["[likely causes]"],
    "materialEstimate": "[materials that might be needed]",
    "timeEstimate": "[estimated duration]"
  },
  "location": {
    "extracted": "[any location info from description]",
    "needed": [true/false if more location info needed]
  },
  "missingInfo": ["[what additional info would help]"],
  "followUpQuestions": ["[specific questions ONLY for safety issues or very unclear problems]"],
  "needsMoreInfo": [true/false - ONLY true for safety issues or confidence < 0.6],
  "safetyIssues": ["[any immediate safety concerns]"],
  "summary": "[brief summary for customer]",
  "confidence": [0.0-1.0]
}

Think through this step-by-step:
1. What trade skills are needed for this problem?
2. How urgent is this based on safety and functionality?
3. What specific details can I extract?
4. What information is missing that would help?
5. What questions should I ask the customer?
6. What is my confidence level in the analysis?
7. Are there safety issues that require clarification?
8. Can I proceed to matching or do I need critical information?

IMPORTANT FOLLOW-UP RULES:
- ASK follow-up questions for:
  1. Safety issues (gas leaks, electrical sparking, flooding)
  2. Unclear problems (confidence < 0.8)
  3. Insufficient details for accurate pricing (leak severity, accessibility, materials needed)
  4. Problems requiring diagnostic information (intermittent issues, multiple symptoms)
- DO NOT ask about:
  1. Location (inferred from user profile)
  2. Timing/scheduling (handled in worker selection)
- If confidence >= 0.9 AND sufficient pricing details available, set needsMoreInfo to false
- If you generate followUpQuestions, you MUST set needsMoreInfo to true
- For pricing accuracy, ask about: problem severity, accessibility, previous attempts, visible damage

Be thorough but practical in your analysis.`;
  }

  parseAnalysisResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!analysisData.trades || !analysisData.urgency) {
        throw new Error('Invalid analysis response format');
      }

      return {
        trades: analysisData.trades || [],
        urgency: analysisData.urgency || 'flexible',
        urgencyReasoning: analysisData.urgencyReasoning,
        problemDetails: analysisData.problemDetails || {},
        location: analysisData.location || {},
        missingInfo: analysisData.missingInfo || [],
        followUpQuestions: analysisData.followUpQuestions || [],
        needsMoreInfo: analysisData.needsMoreInfo,
        safetyIssues: analysisData.safetyIssues || [],
        summary: analysisData.summary,
        confidence: analysisData.confidence || 0.5,
        source: 'claude-analysis'
      };

    } catch (error) {
      console.error('Error parsing Claude analysis:', error);
      throw error;
    }
  }

  async findWorkers(problem, workers, location = null, preferences = {}) {
    if (!this.anthropic) {
      throw new Error('Claude AI is required for worker matching. Please configure ANTHROPIC_API_KEY.');
    }

    try {
      const prompt = this.buildMatchingPrompt(problem, workers, location, preferences);
      
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.2,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const result = this.parseMatchingResponse(response.content[0].text, workers);
      return result;
    } catch (error) {
      console.error('Claude matching error:', error);
      throw new Error(`Worker matching failed: ${error.message}. Claude AI is required for intelligent worker matching.`);
    }
  }

  buildMatchingPrompt(problem, workers, location, preferences) {
    return `You are an expert worker matching AI for PowerUs. Your job is to find the best tradespeople for customer needs.

CUSTOMER PROBLEM:
${JSON.stringify(problem, null, 2)}

AVAILABLE WORKERS:
${workers.map(worker => `
Worker ID: ${worker.id}
Name: ${worker.name}
Trade: ${worker.trade}
Specialties: ${worker.specialties.join(', ')}
Rating: ${worker.rating}/5.0 (${worker.reviewCount} reviews)
Experience: ${worker.experience} years
Distance: ${worker.distance} miles
Hourly Rate: $${worker.hourlyRate}
Availability: ${worker.availability.join(', ')}
Certifications: ${worker.certifications.join(', ')}
Completed Jobs: ${worker.completedJobs}
`).join('\n---')}

CUSTOMER PREFERENCES:
- Budget Range: ${preferences.budgetRange || 'Not specified'}
- Timeline: ${preferences.timeline || 'Not specified'}
- Quality Priority: ${preferences.qualityPriority || 'Balanced'}

MATCHING CRITERIA:
1. Trade Match: Does worker's trade match the problem?
2. Specialty Match: Do worker's specialties align with specific needs?
3. Experience Level: Is experience appropriate for complexity?
4. Availability: Can worker meet timeline requirements?
5. Location: Is worker within reasonable distance?
6. Certifications: Does worker have required licenses/certs?
7. Rating/Reviews: Quality and reliability indicators
8. Similar Work: Has worker done similar jobs before?

RESPONSE FORMAT:
Return the top 3-4 best matches in this JSON format:

{
  "matches": [
    {
      "workerId": "[worker ID]",
      "matchScore": [0.0-1.0],
      "reasoning": "[why this worker is a good match]",
      "strengths": ["key strengths for this job"],
      "concerns": ["any potential concerns"],
      "estimatedArrival": "[time estimate]",
      "recommendationLevel": "[excellent/good/fair]"
    }
  ],
  "summary": "[overall matching summary]",
  "alternatives": "[suggestions if no perfect matches]"
}

Rank workers by overall suitability, considering all factors. Provide honest assessments.`;
  }

  parseMatchingResponse(responseText, workers) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in matching response');
      }

      const matchingData = JSON.parse(jsonMatch[0]);
      
      // Combine matching data with worker details
      const matches = matchingData.matches.map(match => {
        const worker = workers.find(w => w.id === match.workerId);
        return {
          ...worker,
          matchScore: match.matchScore,
          reasoning: match.reasoning,
          strengths: match.strengths,
          concerns: match.concerns,
          estimatedArrival: match.estimatedArrival,
          recommendationLevel: match.recommendationLevel
        };
      }).filter(match => match.id); // Remove any matches where worker wasn't found

      return {
        matches: matches,
        summary: matchingData.summary,
        alternatives: matchingData.alternatives,
        source: 'claude-ai'
      };

    } catch (error) {
      console.error('Error parsing Claude matching:', error);
      throw error;
    }
  }

  async analyzeImage(imageData, problemContext = '') {
    if (!this.anthropic) {
      throw new Error('Claude AI is required for image analysis. Please configure ANTHROPIC_API_KEY.');
    }

    try {
      const response = await this.anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image in the context of a trades/repair problem.

Problem Context: "${problemContext}"

Provide a detailed analysis in JSON format:
{
  "analysis": "[detailed description of what you see]",
  "suggestedTrades": [
    {
      "trade": "[trade name]",
      "confidence": [0.0-1.0],
      "reasoning": "[why this trade is needed]"
    }
  ],
  "urgency": "[emergency/soon/flexible]",
  "urgencyReasoning": "[why this urgency level]",
  "materialEstimate": "[materials that might be needed]",
  "complexityLevel": "[simple/moderate/complex]",
  "timeEstimate": "[estimated hours/days]",
  "safetyIssues": ["[list any safety concerns]"],
  "followUpQuestions": ["[questions to ask customer for more details]"],
  "confidence": [0.0-1.0]
}`
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageData
              }
            }
          ]
        }]
      });

      const result = this.parseImageAnalysisResponse(response.content[0].text);
      return result;

    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error(`Image analysis failed: ${error.message}. Claude AI is required for image analysis.`);
    }
  }

  parseImageAnalysisResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in image analysis response');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      return {
        analysis: analysisData.analysis,
        suggestedTrades: analysisData.suggestedTrades || [],
        urgency: analysisData.urgency || 'flexible',
        urgencyReasoning: analysisData.urgencyReasoning,
        materialEstimate: analysisData.materialEstimate,
        complexityLevel: analysisData.complexityLevel || 'moderate',
        timeEstimate: analysisData.timeEstimate,
        safetyIssues: analysisData.safetyIssues || [],
        followUpQuestions: analysisData.followUpQuestions || [],
        confidence: analysisData.confidence || 0.7,
        source: 'claude-vision'
      };

    } catch (error) {
      console.error('Error parsing image analysis:', error);
      throw error;
    }
  }

  async generateClarificationQuestions(userMessage) {
    if (!this.anthropic) {
      throw new Error('Claude AI is required for generating clarification questions. Please configure ANTHROPIC_API_KEY.');
    }

    try {
      const response = await this.anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: `A customer sent this message about a home repair/maintenance issue: "${userMessage}"

The message is too vague to properly identify the problem and match them with the right tradesperson. Generate a helpful response that:

1. Acknowledges their situation empathetically
2. Asks 2-3 specific clarifying questions to better understand:
   - What exactly is broken/not working
   - Where the problem is located
   - When it started or how urgent it is
   - Any visible symptoms or signs

Make the response conversational and helpful, not robotic. Focus on gathering the most important information to identify the right trade professional.

Respond in plain text format, not JSON.`
        }]
      });

      return {
        response: response.content[0].text.trim(),
        source: 'claude-generated'
      };

    } catch (error) {
      console.error('Error generating clarification questions:', error);
      throw error;
    }
  }

  async generateNoMatchResponse(problem) {
    if (!this.anthropic) {
      throw new Error('Claude AI is required for generating no match response. Please configure ANTHROPIC_API_KEY.');
    }

    try {
      const response = await this.anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 400,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: `A customer has a ${problem.trades.length > 0 ? problem.trades[0].trade : 'home repair'} problem but no suitable workers were found in their area.

Problem summary: ${problem.summary || 'Home repair issue'}
Identified trades needed: ${problem.trades.map(t => t.trade).join(', ') || 'Unknown'}
Urgency: ${problem.urgency}

Generate a helpful response that:
1. Acknowledges the situation
2. Explains why no matches were found (could be location, availability, or need more specific details)
3. Suggests next steps (expanding search area, providing more details, or alternative solutions)
4. Maintains a helpful and solution-oriented tone

Respond in plain text format, not JSON.`
        }]
      });

      return {
        response: response.content[0].text.trim(),
        source: 'claude-generated'
      };

    } catch (error) {
      console.error('Error generating no match response:', error);
      throw error;
    }
  }

  async generateImageAnalysisFallback(problemContext) {
    if (!this.anthropic) {
      throw new Error('Claude AI is required for generating image analysis fallback. Please configure ANTHROPIC_API_KEY.');
    }

    try {
      const response = await this.anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 400,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: `A customer uploaded an image for a home repair issue but the image analysis failed. 
          
Problem context: "${problemContext || 'No additional context provided'}"

Generate a response that:
1. Acknowledges the image was received
2. Explains that manual review is needed
3. Asks 2-3 specific questions about what the image shows to help with matching

Return response in JSON format:
{
  "analysis": "[acknowledgment message]",
  "followUpQuestions": ["[question 1]", "[question 2]", "[question 3]"]
}`
        }]
      });

      const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in fallback response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error('Error generating image analysis fallback:', error);
      throw error;
    }
  }
}

module.exports = { ClaudeTradesMatchingAgent };
