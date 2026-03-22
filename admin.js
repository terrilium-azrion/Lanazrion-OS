import { Database, auth } from './database.js';

const AdminUI = {
  init() {
    this.checkAuth();
    this.listenToData();
  },

  checkAuth() {
    Database.onAuthChange((user) => {
      if (!user) {
        console.warn('Admin access denied. Redirecting to login.');
        // In a real app, we'd check for admin role here
        // For now, we just check if logged in
        // window.location.href = '/';
      }
    });
  },

  listenToData() {
    Database.listenToLeads((leads) => {
      this.updateLeadsList(leads);
      this.updateStats(leads);
    });

    Database.listenToQuoteRequests((requests) => {
      this.updateQuotesList(requests);
    });
  },

  updateLeadsList(leads) {
    const container = document.getElementById('leads-list');
    if (!container) return;

    container.innerHTML = leads.map(lead => `
      <div style="padding: 1rem; border-bottom: 1px solid rgba(212, 175, 55, 0.2); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700;">${lead.email}</div>
          <div style="font-size: 0.8rem; opacity: 0.6;">Score: ${lead.score} | ${lead.results?.dominantPole || 'N/A'}</div>
        </div>
        <div style="font-size: 0.7rem; opacity: 0.5;">${new Date(lead.createdAt?.toDate()).toLocaleDateString()}</div>
      </div>
    `).join('');
  },

  updateQuotesList(requests) {
    const container = document.getElementById('quotes-list');
    if (!container) return;

    container.innerHTML = requests.map(req => `
      <div style="padding: 1rem; border-bottom: 1px solid rgba(212, 175, 55, 0.2);">
        <div style="font-weight: 700; color: var(--gold-leaf);">${req.service}</div>
        <div style="font-size: 0.9rem; margin-top: 0.5rem;">${req.message}</div>
        <div style="font-size: 0.7rem; opacity: 0.5; margin-top: 0.5rem;">Lead ID: ${req.leadId}</div>
      </div>
    `).join('');
  },

  updateStats(leads) {
    document.getElementById('total-leads').textContent = leads.length;
    
    // Mock MRR calculation: 500€ per lead with score > 50
    const mrr = leads.filter(l => l.score > 50).length * 500;
    document.getElementById('total-mrr').textContent = `${mrr} €`;
    
    // Quotes count
    // (This would be updated by the quote listener)
  }
};

window.AdminUI = AdminUI;
AdminUI.init();
