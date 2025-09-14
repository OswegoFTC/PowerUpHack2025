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
    this.setupBookingListeners();
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

  sendFindWorkersMessage() {
    const input = document.getElementById('findWorkersInput');
    const messagesContainer = document.getElementById('findWorkersMessages');
    const userRequestDisplay = document.getElementById('userRequestDisplay');
    const userRequestText = document.getElementById('userRequestText');

    if (!input || !messagesContainer) return;

    const message = input.value.trim();
    if (!message) return;

    // Add user message
    this.addFindWorkersMessage(message, 'user');
    
    // Show user request in top-right
    if (userRequestDisplay && userRequestText) {
      userRequestText.textContent = message;
      userRequestDisplay.classList.remove('hidden');
    }

    // Clear input
    input.value = '';

    // Simulate AI response and transition to booking
    setTimeout(() => {
      this.addFindWorkersMessage("Perfect! I found some great automotive professionals for your car door issue. Let me show you the best options available.", 'assistant');
      
      setTimeout(() => {
        this.switchTab('book-service');
      }, 2000);
    }, 1000);
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
