# PowerUs AI - Intelligent Trades Matching Platform

PowerUs AI is a modern web platform that connects customers with skilled tradespeople using advanced AI-powered problem analysis and worker matching.

## 🚀 Features

- **AI-Powered Chat Interface** - Conversational problem diagnosis with Claude AI
- **Smart Worker Matching** - Intelligent matching based on skills, location, and availability
- **Dynamic Pricing** - Real-time cost estimation with transparent breakdowns
- **Image Analysis** - Computer vision for visual problem assessment
- **Modern UI/UX** - Clean, responsive design with intuitive booking flow
- **Real-time Matching** - Instant worker recommendations with confidence scoring

## 🛠 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js with Express.js
- **AI Integration**: Anthropic Claude API for problem analysis and matching
- **Image Processing**: Claude Vision API for visual problem assessment
- **File Upload**: Multer for image handling
- **Styling**: Modern CSS with custom design system

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/OswegoFTC/PowerUs-AI.git
cd PowerUs-AI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

4. Start the development server:
```bash
npm start
```

5. Open http://localhost:3000 in your browser

## 🔧 Configuration

Create a `.env` file with the following variables:

```env
ANTHROPIC_API_KEY=your_claude_api_key_here
PORT=3000
```

## 🏗 Architecture

### Core Components

- **ClaudeTradesMatchingAgent** - AI-powered problem analysis and worker matching
- **ClaudePricingAgent** - Dynamic pricing calculations
- **Chat Interface** - Real-time conversational UI
- **Booking System** - Multi-step booking flow with progress tracking
- **Worker Database** - Comprehensive tradesperson profiles

### AI Features

- **Problem Classification** - Automatic trade identification from descriptions
- **Urgency Assessment** - Safety-first prioritization system
- **Confidence Scoring** - Smart follow-up question logic
- **Image Analysis** - Visual problem assessment with Claude Vision
- **Worker Matching** - Multi-factor matching algorithm

## 🎯 Usage

1. **Describe Your Problem** - Use the chat interface to describe what needs fixing
2. **AI Analysis** - Claude AI analyzes your problem and identifies required trades
3. **Worker Matching** - Get matched with qualified professionals in your area
4. **Book Service** - Complete the booking with scheduling and pricing
5. **Get Help** - Connect with your chosen tradesperson

## 🔄 Development

The application uses a modular architecture:

- `/public/` - Frontend assets (HTML, CSS, JS)
- `/claude-matching-agent.js` - AI matching logic
- `/ai-pricing-agent.js` - Pricing calculations
- `/server.js` - Express server and API routes

## 📝 API Endpoints

- `POST /api/analyze` - Problem analysis with Claude AI
- `POST /api/upload-image` - Image upload and analysis
- `GET /api/workers` - Get available workers
- `POST /api/book` - Create booking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue on GitHub or contact the development team.
