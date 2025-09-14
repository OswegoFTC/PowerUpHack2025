// PowerUs AI - Frontend Application Logic
class PowerUsApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.isDarkMode = false;
    this.isMobileMenuOpen = false;
    this.currentMatches = [];
    this.activeJobs = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadDashboard();
    this.setupDarkModeToggle();
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = item.getAttribute('data-page');
        this.switchTab(pageId);
      });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Chat input and send button handling
    this.setupChatInputListeners();

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModal();
      });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    });
  }

  setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => {
        this.toggleDarkMode();
      });
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.innerHTML = this.isDarkMode ? '☀️' : '🌙';
    }
  }

  switchTab(pageId) {
    // Update current tab
    this.currentTab = pageId;
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    // Show corresponding page
    this.showPage(pageId);
    
    // Close mobile menu if open
    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
      targetPage.classList.add('active');
    }
    
    // Load page-specific content
    switch (pageId) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'find-workers':
        this.loadFindWorkers();
        break;
      case 'book-service':
        this.loadBookService();
        break;
      case 'browse-workers':
        this.loadWorkers();
        break;
      case 'profile':
        this.loadProfile();
        break;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open', this.isMobileMenuOpen);
    }
  }

  loadDashboard() {
    console.log('Dashboard loaded');
    this.updateDashboardStats();
    this.renderActiveJobs();
    this.setupDashboardListeners();
  }

  updateDashboardStats() {
    const activeJobsCount = document.getElementById('dashboardActiveJobs');
    const sidebarActiveJobs = document.getElementById('sidebarActiveJobs');
    const totalSpent = document.getElementById('dashboardTotalSpent');
    const completed = document.getElementById('dashboardCompleted');

    if (activeJobsCount) activeJobsCount.textContent = this.activeJobs.length;
    if (sidebarActiveJobs) sidebarActiveJobs.textContent = this.activeJobs.length;
    if (totalSpent) totalSpent.textContent = `$${this.calculateTotalSpent()}`;
    if (completed) completed.textContent = this.calculateCompletedJobs();
  }

  calculateTotalSpent() {
    return this.activeJobs.reduce((total, job) => total + (job.cost || 0), 0);
  }

  calculateCompletedJobs() {
    return this.activeJobs.filter(job => job.status === 'completed').length;
  }

  renderActiveJobs() {
    const container = document.getElementById('activeJobsContainer');
    if (!container) return;

    if (this.activeJobs.length === 0) {
      container.innerHTML = `
        <div class="dashboard-empty-state">
          <p>No active jobs yet</p>
          <p class="text-sm">Start by finding workers for your projects</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.activeJobs.map(job => `
      <div class="dashboard-job-card">
        <div class="job-info">
          <h3>${job.title}</h3>
          <p>${job.worker}</p>
          <div class="job-status ${job.status}">${job.status}</div>
        </div>
        <div class="job-actions">
          <button onclick="app.cancelJob('${job.id}')" class="cancel-btn">Cancel</button>
        </div>
      </div>
    `).join('');
  }

  setupDashboardListeners() {
    // Add any dashboard-specific event listeners here
  }

  loadFindWorkers() {
    console.log('Find Workers page loaded');
    this.setupFindWorkersChat();
  }

  loadBookService() {
    console.log('Book Service page loaded');
    this.updateBookingPageContent();
    this.setupBookingListeners();
  }

  updateBookingPageContent() {
    // Update worker cards based on problem analysis
    if (this.currentProblemAnalysis) {
      const problemType = this.currentProblemAnalysis.problemType?.toLowerCase() || '';
      console.log('Problem type:', problemType);
      
      // Update subtitle based on problem type
      const subtitleElement = document.querySelector('.booking-subtitle p');
      if (subtitleElement) {
        if (problemType.includes('plumbing') || problemType.includes('sink') || problemType.includes('leak')) {
          subtitleElement.textContent = 'Choose your plumbing professional and schedule your appointment';
        } else if (problemType.includes('electrical')) {
          subtitleElement.textContent = 'Choose your electrical professional and schedule your appointment';
        } else {
          subtitleElement.textContent = 'Choose your professional and schedule your appointment';
        }
      }

      // Update worker cards with relevant professionals
      this.updateWorkerCards(problemType);
    }
  }

  updateWorkerCards(problemType) {
    const workerOptions = document.querySelector('.worker-options');
    if (!workerOptions) return;

    let workers = [];
    
    if (problemType.includes('plumbing') || problemType.includes('sink') || problemType.includes('leak')) {
      workers = [
        {
          name: 'Rick Williams',
          profession: 'Licensed Plumber',
          description: 'Best match for your plumbing needs',
          badge: '🏆 Recommended',
          badgeClass: 'recommended-badge',
          rating: '4.8 (203)',
          distance: '2.8 mi',
          time: '35 min',
          jobs: '285 jobs',
          specialties: ['Leak Repairs', 'Pipe Replacement', 'Water Heaters'],
          price: '$195',
          schedule: 'Today, 2:00 PM',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
        },
        {
          name: 'Marcus Thompson',
          profession: 'Master Plumber',
          description: 'Fastest response and earliest availability',
          badge: '⚡ Fastest',
          badgeClass: 'fastest-badge',
          rating: '4.7 (167)',
          distance: '1.2 mi',
          time: '25 min',
          jobs: '340 jobs',
          specialties: ['Emergency Repairs', 'Sink Repairs', 'Drain Cleaning'],
          price: '$225',
          schedule: 'Today, 12:00 PM',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
        },
        {
          name: 'David Chen',
          profession: 'Plumbing Technician',
          description: 'Most affordable option • Save up to $50',
          badge: '💰 Wait & Save',
          badgeClass: 'save-badge',
          rating: '4.6 (134)',
          distance: '4.1 mi',
          time: '45 min',
          jobs: '198 jobs',
          specialties: ['Basic Repairs', 'Maintenance', 'Installations'],
          price: '$145',
          schedule: 'Tomorrow, 9:00 AM',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face'
        }
      ];
    } else if (problemType.includes('electrical')) {
      workers = [
        {
          name: 'Marcus Thompson',
          profession: 'Master Electrician',
          description: 'Best match for your electrical needs',
          badge: '🏆 Recommended',
          badgeClass: 'recommended-badge',
          rating: '4.8 (167)',
          distance: '1.2 mi',
          time: '30 min',
          jobs: '340 jobs',
          specialties: ['Wiring', 'Panel Upgrades', 'Lighting'],
          price: '$255',
          schedule: 'Tomorrow, 10:00 AM',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
        },
        {
          name: 'Sarah Johnson',
          profession: 'Licensed Electrician',
          description: 'Fastest response and earliest availability',
          badge: '⚡ Fastest',
          badgeClass: 'fastest-badge',
          rating: '4.7 (198)',
          distance: '2.1 mi',
          time: '25 min',
          jobs: '276 jobs',
          specialties: ['Emergency Repairs', 'Outlets', 'Safety'],
          price: '$235',
          schedule: 'Today, 3:00 PM',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
        },
        {
          name: 'Tom Rodriguez',
          profession: 'Electrical Technician',
          description: 'Most affordable option • Save up to $60',
          badge: '💰 Wait & Save',
          badgeClass: 'save-badge',
          rating: '4.5 (145)',
          distance: '3.8 mi',
          time: '40 min',
          jobs: '189 jobs',
          specialties: ['Basic Wiring', 'Repairs', 'Maintenance'],
          price: '$175',
          schedule: 'Tomorrow, 11:00 AM',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face'
        }
      ];
    } else {
      // Default automotive workers (existing)
      workers = [
        {
          name: 'Jake Roberts',
          profession: 'Auto Mechanic',
          description: 'Best match for your specific needs',
          badge: '🏆 Recommended',
          badgeClass: 'recommended-badge',
          rating: '4.8 (167)',
          distance: '3.2 mi',
          time: '45 min',
          jobs: '98 jobs',
          specialties: ['Car Repairs', 'Diagnostics', 'Maintenance'],
          price: '$273',
          schedule: 'Tomorrow, 8:00 AM',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
        },
        {
          name: 'Danny Fix',
          profession: 'Mobile Mechanic',
          description: 'Quickest response and earliest availability',
          badge: '⚡ Fastest',
          badgeClass: 'fastest-badge',
          rating: '4.7 (134)',
          distance: '2.1 mi',
          time: '35 min',
          jobs: '76 jobs',
          specialties: ['On-site Repairs', 'Car Door Fixes', 'Emergency'],
          price: '$213',
          schedule: 'Today, 8:00 AM',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
        },
        {
          name: 'Alex Turner',
          profession: 'Automotive Technician',
          description: 'Most affordable option • Save up to $78',
          badge: '💰 Wait & Save',
          badgeClass: 'save-badge',
          rating: '4.5 (91)',
          distance: '4.1 mi',
          time: '50 min',
          jobs: '65 jobs',
          specialties: ['Engine Repair', 'Brakes', 'Electrical'],
          price: '$195',
          schedule: 'Tomorrow, 8:00 AM',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face'
        }
      ];
    }

    // Generate HTML for worker cards
    workerOptions.innerHTML = workers.map((worker, index) => `
      <div class="worker-card ${index === 0 ? 'recommended' : index === 1 ? 'fastest' : 'wait-save'}">
        <div class="worker-info">
          <div class="worker-avatar">
            <img src="${worker.image}" alt="${worker.name}" />
          </div>
          <div class="worker-details">
            <div class="worker-header">
              <h3>${worker.name}</h3>
              <span class="${worker.badgeClass}">${worker.badge}</span>
            </div>
            <p class="worker-profession">${worker.profession}</p>
            <p class="worker-description">${worker.description}</p>
            
            <div class="worker-stats">
              <div class="stat">⭐ ${worker.rating}</div>
              <div class="stat">📍 ${worker.distance}</div>
              <div class="stat">⏱️ ${worker.time}</div>
              <div class="stat">🔧 ${worker.jobs}</div>
            </div>
            
            <div class="worker-specialties">
              ${worker.specialties.map(specialty => `<span class="specialty-tag">${specialty}</span>`).join('')}
            </div>
          </div>
        </div>
        
        <div class="worker-booking">
          <div class="price-info">
            <div class="price">${worker.price}</div>
            <div class="price-label">Total cost</div>
          </div>
          <div class="schedule-info">
            <div class="schedule-time">📅 ${worker.schedule}</div>
            <button class="book-btn">Book Now →</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  setupFindWorkersChat() {
    const input = document.getElementById('findWorkersInput');
    const sendBtn = document.getElementById('findWorkersSendBtn');
    const messagesContainer = document.getElementById('findWorkersMessages');

    if (!input || !sendBtn || !messagesContainer) return;

    // Add event listeners for Find Workers chat
    sendBtn.addEventListener('click', () => this.sendFindWorkersMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendFindWorkersMessage();
      }
    });
  }

  async sendFindWorkersMessage() {
    const input = document.getElementById('findWorkersInput');
    const messagesContainer = document.getElementById('findWorkersMessages');

    if (!input || !messagesContainer) return;

    const message = input.value.trim();
    if (!message) return;

    // Clear input first
    input.value = '';

    // Handle the message with Claude agent
    await this.handleFindWorkersSubmit(message);
  }

  async handleFindWorkersSubmit(message) {
    // Add user message to chat
    this.addFindWorkersMessage(message, 'user');
    
    // Show user request in top-right
    const userRequestDisplay = document.getElementById('userRequestDisplay');
    const userRequestText = document.getElementById('userRequestText');
    if (userRequestDisplay && userRequestText) {
      userRequestText.textContent = message;
      userRequestDisplay.classList.remove('hidden');
    }

    // Clear input
    const input = document.getElementById('findWorkersInput');
    if (input) {
      input.value = '';
    }

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Send to Claude matching agent for analysis
      const response = await fetch('/api/analyze-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: message,
          userLocation: 'Current Location',
          conversationHistory: this.conversationHistory || []
        })
      });

      const data = await response.json();
      console.log('Claude Analysis Response:', data);
      
      // Hide typing indicator
      this.hideTypingIndicator();

      if (!data.success) {
        throw new Error(data.error);
      }

      const analysis = data.analysis;
      
      // Store conversation history
      if (!this.conversationHistory) {
        this.conversationHistory = [];
      }
      this.conversationHistory.push({
        role: 'user',
        message: message,
        timestamp: new Date().toISOString()
      });

      // Check if Claude needs more information
      if (analysis.needsMoreInfo && analysis.followUpQuestions && analysis.followUpQuestions.length > 0) {
        // Claude is asking follow-up questions
        const aiResponse = this.formatFollowUpResponse(analysis);
        this.addFindWorkersMessage(aiResponse, 'assistant');
        
        // Store the partial analysis
        this.currentProblemAnalysis = analysis;
        
        // Add AI response to conversation history
        this.conversationHistory.push({
          role: 'assistant',
          message: aiResponse,
          timestamp: new Date().toISOString(),
          analysis: analysis
        });
        
      } else {
        // Claude has enough information, proceed to find workers
        console.log('Claude has enough info, proceeding to worker matching...');
        await this.proceedToWorkerMatching(analysis);
      }

    } catch (error) {
      console.error('Error in Claude analysis:', error);
      this.hideTypingIndicator();
      
      // Show error - no fallback
      this.addFindWorkersMessage(`I'm having trouble connecting to our AI service. Please check that your API key is configured properly. Error: ${error.message}`, 'assistant');
    }
  }

  formatFollowUpResponse(analysis) {
    // Use Claude's generated response if available
    if (analysis.summary) {
      let response = analysis.summary;
      
      // Add follow-up questions
      if (analysis.followUpQuestions && analysis.followUpQuestions.length > 0) {
        response += '\n\n' + analysis.followUpQuestions.join('\n\n');
      }
      
      return response;
    }
    
    // Fallback if no summary provided
    let response = "I'd like to help you find the right professional for this job.";
    
    if (analysis.followUpQuestions && analysis.followUpQuestions.length > 0) {
      response += " To match you with the best worker, I need a bit more information:\n\n";
      response += analysis.followUpQuestions.join('\n\n');
    }
    
    return response;
  }

  async proceedToWorkerMatching(analysis) {
    try {
      console.log('Starting worker matching with analysis:', analysis);
      
      // Find workers using Claude matching agent
      const response = await fetch('/api/find-workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis: analysis,
          userLocation: 'Current Location',
          preferences: {}
        })
      });

      const data = await response.json();
      console.log('Worker Matching Response:', data);

      if (!data.success) {
        throw new Error(data.error);
      }

      // Show success message and transition to booking
      const successMessage = this.formatMatchingSuccessResponse(analysis, data.matches);
      this.addFindWorkersMessage(successMessage, 'assistant');
      
      // Store the matched workers and analysis
      this.currentProblemAnalysis = analysis;
      this.matchedWorkers = data.matches;
      
      // Add to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        message: successMessage,
        timestamp: new Date().toISOString(),
        analysis: analysis,
        matches: data.matches
      });

      // Transition to results page
      console.log('Scheduling page transition to results in 2 seconds...');
      setTimeout(() => {
        console.log('Executing page transition to results page');
        this.navigateToResults(data.matches, analysis);
      }, 2000);

    } catch (error) {
      console.error('Error in worker matching:', error);
      this.addFindWorkersMessage(`I found the problem but couldn't complete the worker matching. Error: ${error.message}`, 'assistant');
      
      // Still try to transition if we have the analysis
      if (analysis && analysis.trades && analysis.trades.length > 0) {
        console.log('Attempting fallback transition with analysis only...');
        setTimeout(() => {
          this.navigateToResults([], analysis);
        }, 2000);
      }
    }
  }

  navigateToResults(matches, analysis) {
    // Prepare data for results page
    const resultsData = {
      jobData: {
        analysis: analysis,
        problem: {
          description: analysis.summary || 'Service request',
          urgency: analysis.urgency,
          trades: analysis.trades,
          location: analysis.location,
          estimatedHours: analysis.estimatedHours || 2
        },
        timestamp: new Date().toISOString()
      },
      workerMatches: matches || []
    };

    // Store data in localStorage for the results page
    localStorage.setItem('powerus_job_results', JSON.stringify(resultsData));

    // Navigate to results page
    window.location.href = '/results.html';
  }

  formatMatchingSuccessResponse(analysis, matches) {
    if (!matches || matches.length === 0) {
      return "I understand your problem, but I couldn't find any available workers in your area right now. Please try expanding your search area or contact us for assistance.";
    }

    const tradeType = analysis.trades && analysis.trades.length > 0 ? analysis.trades[0].trade : 'professional';
    const urgencyText = analysis.urgency === 'emergency' ? ' immediately' : analysis.urgency === 'soon' ? ' soon' : '';
    
    return `Perfect! I found ${matches.length} excellent ${tradeType}${matches.length > 1 ? 's' : ''} who can help you${urgencyText}. Let me show you the best options available.`;
  }

  updateBookingPageWithMatches(matches, analysis) {
    // Update the booking page with matched workers
    const workerCards = document.querySelectorAll('.worker-card');
    
    if (matches && matches.length > 0) {
      matches.slice(0, 3).forEach((worker, index) => {
        const card = workerCards[index];
        if (card) {
          // Update worker name
          const nameElement = card.querySelector('.worker-name');
          if (nameElement) nameElement.textContent = worker.name;
          
          // Update worker initials
          const initialsElement = card.querySelector('.worker-initials');
          if (initialsElement) initialsElement.textContent = worker.initials || worker.name.split(' ').map(n => n[0]).join('');
          
          // Update rating
          const ratingElement = card.querySelector('.worker-rating');
          if (ratingElement) ratingElement.textContent = `${worker.rating}/5`;
          
          // Update distance
          const distanceElement = card.querySelector('.worker-distance');
          if (distanceElement) distanceElement.textContent = `${worker.distance} miles`;
          
          // Update pricing if available
          const priceElement = card.querySelector('.worker-price');
          if (priceElement && worker.pricing) {
            priceElement.textContent = `$${worker.pricing.total}`;
          }
          
          // Update specialties
          const specialtiesElement = card.querySelector('.worker-specialties');
          if (specialtiesElement && worker.specialties) {
            specialtiesElement.textContent = worker.specialties.join(', ');
          }
          
          // Update recommendation level styling
          if (worker.recommendationLevel === 'excellent') {
            card.classList.add('recommended');
          } else if (worker.recommendationLevel === 'good') {
            card.classList.add('good-match');
          }
        }
      });
    }
    
    // Update page subtitle based on problem type
    const subtitleElement = document.querySelector('.book-service-subtitle');
    if (subtitleElement && analysis && analysis.trades && analysis.trades.length > 0) {
      const tradeType = analysis.trades[0].trade;
      subtitleElement.textContent = `Choose your ${tradeType} and schedule your service`;
    }
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('findWorkersMessages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
      <div class="message-avatar">
        <div class="avatar-icon">🔍</div>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  addFindWorkersMessage(text, sender) {
    const messagesContainer = document.getElementById('findWorkersMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    messageDiv.innerHTML = `
      <div class="message-avatar">
        <div class="avatar-icon">${sender === 'user' ? '👤' : '🔍'}</div>
      </div>
      <div class="message-content">
        <div class="message-bubble">${text}</div>
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  setupBookingListeners() {
    // Add event listeners for booking buttons
    document.querySelectorAll('.book-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const workerCard = e.target.closest('.worker-card');
        if (workerCard) {
          this.bookWorker(workerCard);
        }
      });
    });
  }

  bookWorker(workerCard) {
    const workerName = workerCard.querySelector('h3').textContent;
    const price = workerCard.querySelector('.price').textContent;
    
    // Add to active jobs
    const job = {
      id: Date.now().toString(),
      title: 'Car Door Repair',
      worker: workerName,
      cost: parseInt(price.replace('$', '')),
      status: 'active'
    };
    
    this.activeJobs.push(job);
    this.updateDashboardStats();
    
    // Show confirmation and return to dashboard
    alert(`Booking confirmed with ${workerName}!`);
    this.switchTab('dashboard');
  }

  loadWorkers() {
    console.log('Browse Workers page loaded');
  }

  loadProfile() {
    console.log('Profile page loaded');
  }

  cancelJob(jobId) {
    this.activeJobs = this.activeJobs.filter(job => job.id !== jobId);
    this.updateDashboardStats();
    this.renderActiveJobs();
  }

  setupChatInputListeners() {
    // Basic chat input setup for any chat interfaces
    const chatInputs = document.querySelectorAll('.chat-input');
    chatInputs.forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const sendBtn = input.parentElement.querySelector('.chat-send-btn');
          if (sendBtn) {
            sendBtn.click();
          }
        }
      });
    });
  }

  closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PowerUsApp();
});
