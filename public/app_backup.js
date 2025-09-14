// PowerUs AI - Frontend Application Logic
class PowerUsApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.isDarkMode = false;
    this.isMobileMenuOpen = false;
    this.currentMatches = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadDashboard();
    this.setupDarkModeToggle();
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = item.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Chat form
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }

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

  switchTab(tabId) {
    // Update current tab
    this.currentTab = tabId;
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Show corresponding page
    this.showPage(tabId);
    
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
    const targetPage = document.getElementById(`${pageId}Page`);
    if (targetPage) {
      targetPage.classList.add('active');
    }
    
    // Load page-specific content
    switch (pageId) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'chat':
        this.loadChat();
        break;
      case 'workers':
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
    // Dashboard is static, no dynamic loading needed
    console.log('Dashboard loaded');
  }

  loadChat() {
    console.log('Chat loaded');
  }

  loadWorkers() {
    console.log('Workers page loaded');
  }

  loadProfile() {
    console.log('Profile page loaded');
  }

  async sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    this.addMessage('user', message);
    
    // Clear input
    messageInput.value = '';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      // Simulate AI processing
      await this.processMessage(message);
    } catch (error) {
      console.error('Error processing message:', error);
      this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
  }

  async processMessage(message) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Hide typing indicator
    this.hideTypingIndicator();
    
    // Simple response logic
    let response = '';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('plumber') || lowerMessage.includes('plumbing')) {
      response = "I found several qualified plumbers in your area. Let me show you the best matches based on your needs.";
      this.findWorkers('plumber');
    } else if (lowerMessage.includes('electrician') || lowerMessage.includes('electrical')) {
      response = "I can help you find skilled electricians. Here are some top-rated professionals near you.";
      this.findWorkers('electrician');
    } else if (lowerMessage.includes('handyman') || lowerMessage.includes('repair')) {
      response = "I'll find experienced handymen who can help with your repair needs.";
      this.findWorkers('handyman');
    } else {
      response = "I understand you need help with a service. Could you please specify what type of work you need done? For example: plumbing, electrical work, or general repairs.";
    }
    
    this.addMessage('assistant', response);
  }

  async findWorkers(type) {
    // Simulate API call
    const workers = await this.mockWorkerSearch(type);
    this.currentMatches = workers;
    this.displayMatches(workers);
  }

  async mockWorkerSearch(type) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock worker data
    const mockWorkers = {
      plumber: [
        { id: 1, name: 'John Smith', rating: 4.8, distance: 2.1, specialty: 'Residential Plumbing' },
        { id: 2, name: 'Maria Garcia', rating: 4.9, distance: 1.5, specialty: 'Emergency Repairs' }
      ],
      electrician: [
        { id: 3, name: 'David Chen', rating: 4.7, distance: 3.2, specialty: 'Home Wiring' },
        { id: 4, name: 'Sarah Johnson', rating: 4.9, distance: 1.8, specialty: 'Panel Upgrades' }
      ],
      handyman: [
        { id: 5, name: 'Mike Wilson', rating: 4.6, distance: 2.5, specialty: 'General Repairs' },
        { id: 6, name: 'Lisa Brown', rating: 4.8, distance: 1.2, specialty: 'Home Maintenance' }
      ]
    };
    
    return mockWorkers[type] || [];
  }

  displayMatches(workers) {
    const matchesSection = document.getElementById('matchesSection');
    if (!matchesSection) return;
    
    matchesSection.style.display = 'block';
    
    const matchesContainer = document.getElementById('matchesContainer');
    if (!matchesContainer) return;
    
    matchesContainer.innerHTML = workers.map(worker => `
      <div class="worker-card" onclick="app.selectWorker(${worker.id})">
        <div class="worker-info">
          <h4>${worker.name}</h4>
          <p class="worker-specialty">${worker.specialty}</p>
          <div class="worker-stats">
            <span class="rating">⭐ ${worker.rating}</span>
            <span class="distance">📍 ${worker.distance} miles</span>
          </div>
        </div>
        <button class="btn-primary">Select</button>
      </div>
    `).join('');
  }

  selectWorker(workerId) {
    const worker = this.currentMatches.find(w => w.id === workerId);
    if (worker) {
      this.addMessage('assistant', `Great choice! I'll help you book ${worker.name}. They specialize in ${worker.specialty} and have a ${worker.rating} star rating.`);
      this.showBookingModal(worker);
    }
  }

  showBookingModal(worker) {
    const modal = document.getElementById('bookingModal');
    if (modal) {
      // Update modal content with worker info
      const workerName = document.getElementById('selectedWorkerName');
      if (workerName) {
        workerName.textContent = worker.name;
      }
      
      modal.classList.add('active');
    }
  }

  addMessage(type, content) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
      <div class="message-avatar">${type === 'user' ? '👤' : '🤖'}</div>
      <div class="message-content">
        <p>${content}</p>
      </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant typing';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  showSuccessMessage(message) {
    this.addMessage('assistant', `✅ ${message}`);
  }

  viewWorkerProfile(workerId) {
    console.log(`Viewing profile for worker ${workerId}`);
    // Implementation for viewing worker profile
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PowerUsApp();
});
