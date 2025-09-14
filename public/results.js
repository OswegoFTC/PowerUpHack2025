class ResultsPage {
  constructor() {
    this.jobData = null;
    this.workerMatches = [];
    this.init();
  }

  init() {
    // Get data from URL parameters or localStorage
    this.loadJobData();
    this.renderJobSummary();
    this.renderWorkerMatches();
  }

  loadJobData() {
    // Try to get data from URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const jobDataParam = urlParams.get('jobData');
    
    if (jobDataParam) {
      try {
        this.jobData = JSON.parse(decodeURIComponent(jobDataParam));
      } catch (error) {
        console.error('Error parsing job data from URL:', error);
      }
    }
    
    // Fallback to localStorage
    if (!this.jobData) {
      const storedData = localStorage.getItem('powerus_job_results');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          this.jobData = data.jobData;
          this.workerMatches = data.workerMatches || [];
        } catch (error) {
          console.error('Error parsing stored job data:', error);
        }
      }
    }

    // If still no data, show error
    if (!this.jobData) {
      this.showNoDataError();
    }
  }

  renderJobSummary() {
    const summaryContainer = document.getElementById('jobSummary');
    if (!this.jobData || !summaryContainer) return;

    const analysis = this.jobData.analysis || {};
    const problem = this.jobData.problem || {};

    summaryContainer.innerHTML = `
      <h3>Job Summary</h3>
      <p><strong>Problem:</strong> ${problem.description || analysis.summary || 'Service request'}</p>
      
      <div class="job-details">
        <div class="job-detail">
          <div class="job-detail-label">Trade Required</div>
          <div class="job-detail-value">${this.getTradesText(analysis.trades)}</div>
        </div>
        <div class="job-detail">
          <div class="job-detail-label">Urgency</div>
          <div class="job-detail-value">${this.getUrgencyText(analysis.urgency)}</div>
        </div>
        <div class="job-detail">
          <div class="job-detail-label">Estimated Duration</div>
          <div class="job-detail-value">${analysis.estimatedHours || 2} hours</div>
        </div>
        <div class="job-detail">
          <div class="job-detail-label">Location</div>
          <div class="job-detail-value">${analysis.location || 'Your location'}</div>
        </div>
      </div>
    `;
  }

  renderWorkerMatches() {
    const matchesContainer = document.getElementById('workerMatches');
    if (!matchesContainer) return;

    if (!this.workerMatches || this.workerMatches.length === 0) {
      matchesContainer.innerHTML = `
        <div class="no-matches">
          <h3>No matches found</h3>
          <p>We couldn't find any available workers for your request at this time.</p>
          <p>Please try again later or modify your search criteria.</p>
        </div>
      `;
      return;
    }

    matchesContainer.innerHTML = this.workerMatches.map(worker => `
      <div class="worker-card">
        <div class="worker-header">
          <div class="worker-info">
            <div class="worker-name">${worker.name}</div>
            <div class="worker-trade">${worker.trade}</div>
            <div class="worker-rating">
              <span class="stars">${this.renderStars(worker.rating)}</span>
              <span class="rating-text">${worker.rating}/5.0 (${worker.reviewCount} reviews)</span>
            </div>
            <div class="worker-distance">📍 ${worker.distance} miles away</div>
          </div>
        </div>

        ${worker.pricing ? this.renderPricingSection(worker.pricing) : ''}

        <div class="specialties">
          ${worker.specialties.map(specialty => 
            `<span class="specialty-tag">${specialty}</span>`
          ).join('')}
        </div>

        <div class="worker-actions">
          <button class="btn btn-primary" onclick="resultsPage.bookWorker('${worker.id}')">
            Book Now - ${worker.pricing ? '$' + worker.pricing.total : 'Get Quote'}
          </button>
          <button class="btn btn-secondary" onclick="resultsPage.contactWorker('${worker.id}')">
            Contact Worker
          </button>
        </div>
      </div>
    `).join('');
  }

  renderPricingSection(pricing) {
    if (!pricing) return '';

    return `
      <div class="pricing-section">
        <div class="price-header">
          <div class="total-price">$${pricing.total}</div>
          <div class="price-confidence">${Math.round((pricing.confidence || 0.8) * 100)}% confidence</div>
        </div>
        
        ${pricing.breakdown ? `
          <div class="price-breakdown">
            ${Object.entries(pricing.breakdown).map(([key, value]) => `
              <div class="breakdown-item">
                <span class="breakdown-label">${this.formatBreakdownLabel(key)}</span>
                <span class="breakdown-value">$${value}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${pricing.reasoning ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
            <small style="color: #6c757d;"><strong>Pricing Notes:</strong> ${pricing.reasoning}</small>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  }

  getTradesText(trades) {
    if (!trades || trades.length === 0) return 'General service';
    
    return trades.map(trade => 
      `${trade.trade} (${Math.round(trade.confidence * 100)}%)`
    ).join(', ');
  }

  getUrgencyText(urgency) {
    const urgencyMap = {
      'emergency': '🚨 Emergency',
      'urgent': '⚡ Urgent',
      'soon': '📅 Soon',
      'flexible': '📆 Flexible'
    };
    
    return urgencyMap[urgency] || '📆 Flexible';
  }

  formatBreakdownLabel(key) {
    const labelMap = {
      'labor': 'Labor',
      'materials': 'Materials',
      'travel': 'Travel',
      'urgency': 'Urgency Fee',
      'base': 'Base Rate',
      'diagnostic': 'Diagnostic',
      'equipment': 'Equipment'
    };
    
    return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  bookWorker(workerId) {
    const worker = this.workerMatches.find(w => w.id === workerId);
    if (!worker) return;

    // Store booking data
    const bookingData = {
      worker: worker,
      jobData: this.jobData,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('powerus_booking_data', JSON.stringify(bookingData));
    
    // For now, show alert - in production this would navigate to booking page
    alert(`Booking ${worker.name} for $${worker.pricing?.total || 'TBD'}. This would normally open the booking flow.`);
  }

  contactWorker(workerId) {
    const worker = this.workerMatches.find(w => w.id === workerId);
    if (!worker) return;

    // For now, show alert - in production this would open messaging
    alert(`Contacting ${worker.name}. This would normally open a messaging interface.`);
  }

  showNoDataError() {
    const container = document.querySelector('.results-container');
    if (container) {
      container.innerHTML = `
        <div class="no-matches">
          <h3>No job data found</h3>
          <p>It looks like you navigated here directly without completing a job search.</p>
          <a href="/" class="btn btn-primary">Start New Search</a>
        </div>
      `;
    }
  }
}

// Initialize the results page
const resultsPage = new ResultsPage();
