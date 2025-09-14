const Anthropic = require('@anthropic-ai/sdk');

// Claude model constant
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

class ClaudePricingAgent {
  constructor(apiKey = null) {
    // In production, use environment variable: process.env.ANTHROPIC_API_KEY
    this.anthropic = apiKey ? new Anthropic({ apiKey }) : null;
  }

  async calculatePrice(worker, problem, estimatedHours = 2, marketData = {}) {
    if (!this.anthropic) {
      throw new Error('Claude AI is required for pricing analysis. Please configure ANTHROPIC_API_KEY.');
    }

    try {
      const prompt = this.buildPricingPrompt(worker, problem, estimatedHours, marketData);
      
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const result = this.parsePricingResponse(response.content[0].text);
      return result;
    } catch (error) {
      console.error('Claude pricing error:', error);
      throw new Error(`Pricing analysis failed: ${error.message}. Claude AI is required for intelligent pricing.`);
    }
  }

  buildPricingPrompt(worker, problem, estimatedHours, marketData) {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    return `You are an expert pricing analyst for PowerUs, a trades matching platform. Your job is to determine fair, competitive pricing for skilled trade services.

CONTEXT:
- Current Date/Time: ${currentDate} ${currentTime}
- Platform: PowerUs AI (connects customers with skilled tradespeople)
- Goal: Fair pricing that benefits both customers and workers

WORKER PROFILE:
- Name: ${worker.name}
- Trade: ${worker.trade}
- Specialties: ${worker.specialties.join(', ')}
- Experience: ${worker.experience} years
- Rating: ${worker.rating}/5.0 (${worker.reviewCount} reviews)
- Base Hourly Rate: $${worker.hourlyRate}/hour
- Distance from Customer: ${worker.distance} miles
- Certifications: ${worker.certifications.join(', ')}
- Completed Jobs: ${worker.completedJobs}
- Availability: ${worker.availability.join(', ')}

CUSTOMER REQUEST:
- Problem Description: "${problem.description}"
- Urgency Level: ${problem.urgency}
- Identified Trade Needs: ${problem.trades.map(t => `${t.trade} (${Math.round(t.confidence * 100)}% confidence)`).join(', ')}
- Estimated Duration: ${estimatedHours} hours

MARKET CONDITIONS:
- Season: ${this.getCurrentSeason()}
- Day of Week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
- Time of Day: ${this.getTimeOfDay()}
- Local Demand: ${marketData.localDemand || 'Normal'}
- Weather Impact: ${marketData.weatherImpact || 'None'}

PRICING CONSIDERATIONS:
1. **Base Rate**: Worker's established hourly rate
2. **Experience Premium**: More experienced workers command higher rates
3. **Rating Premium**: Higher-rated workers deserve premium pricing
4. **Urgency Surcharge**: Emergency/urgent jobs cost more
5. **Distance Factor**: Travel time and costs for distant jobs
6. **Market Demand**: High demand periods increase pricing
7. **Complexity**: Job difficulty affects pricing
8. **Seasonal Factors**: Weather, holidays, peak seasons
9. **Competition**: Other available workers in the area
10. **Value Delivered**: Specialized skills, certifications

PRICING GUIDELINES:
- Emergency jobs (flooding, electrical hazards): 25-50% premium
- Same-day/urgent requests: 15-25% premium  
- Highly rated workers (4.5+): 10-20% premium
- Extensive experience (10+ years): 10-15% premium
- Specialized certifications: 5-15% premium
- Travel >10 miles: Add $20-40 travel fee
- Peak demand times: 10-20% premium
- Complex/risky jobs: 15-30% premium

RESPONSE FORMAT:
Provide your pricing analysis in this exact JSON format:

{
  "total": [final price in dollars, integer],
  "reasoning": "[2-3 sentences explaining your pricing logic]",
  "breakdown": {
    "baseRate": [worker hourly rate],
    "hours": [estimated hours],
    "subtotal": [base rate × hours],
    "adjustments": [
      {
        "factor": "[adjustment reason]",
        "amount": [dollar amount, can be negative],
        "percentage": [percentage change],
        "rationale": "[why this adjustment]"
      }
    ],
    "travelFee": [travel fee if applicable],
    "finalTotal": [total after all adjustments]
  },
  "confidence": [0.0-1.0, how confident you are in this pricing],
  "alternatives": {
    "budget": [lower price option],
    "premium": [higher price option]
  }
}

Think through the pricing step by step, considering all factors. Be fair to both customer and worker. Provide transparent reasoning for your decisions.`;
  }

  parsePricingResponse(responseText) {
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const pricingData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!pricingData.total || !pricingData.breakdown) {
        throw new Error('Invalid pricing response format');
      }

      return {
        total: Math.round(pricingData.total),
        reasoning: pricingData.reasoning || 'AI-generated pricing',
        breakdown: pricingData.breakdown || {},
        confidence: pricingData.confidence || 0.8,
        alternatives: pricingData.alternatives || {},
        source: 'claude-ai'
      };

    } catch (error) {
      console.error('Error parsing Claude response:', error);
      throw error;
    }
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  }

  async calculatePriceWithContext(worker, problem, estimatedHours = 2, additionalContext = {}) {
    const enhancedPrompt = `${this.buildPricingPrompt(worker, problem, estimatedHours)}

ADDITIONAL CONTEXT:
${additionalContext.marketConditions ? `- Market Conditions: ${additionalContext.marketConditions}` : ''}
${additionalContext.seasonalFactors ? `- Seasonal Factors: ${additionalContext.seasonalFactors}` : ''}
${additionalContext.competitorPricing ? `- Competitor Pricing: ${additionalContext.competitorPricing}` : ''}

Consider these additional factors in your pricing decision. Adjust accordingly for maximum fairness and market competitiveness.`;

    if (!this.anthropic) {
      throw new Error('Claude AI is required for pricing analysis. Please configure ANTHROPIC_API_KEY.');
    }

    try {
      const response = await this.anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1200,
        temperature: 0.2,
        messages: [{
          role: 'user',
          content: enhancedPrompt
        }]
      });

      return this.parsePricingResponse(response.content[0].text);
    } catch (error) {
      console.error('Claude enhanced pricing error:', error);
      throw new Error(`Enhanced pricing analysis failed: ${error.message}. Claude AI is required for intelligent pricing.`);
    }
  }
}

module.exports = { ClaudePricingAgent };
