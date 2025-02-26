export class PasswordHistory {
  constructor() {
    this.historyStore = new Map();
    this.maxHistoryLength = 10; // Keep last 10 versions
  }

  async addToHistory(passwordEntry) {
    try {
      const historyKey = `${passwordEntry.service}:${passwordEntry.account}`;
      let history = this.historyStore.get(historyKey) || [];

      // Create history entry
      const historyEntry = {
        password: passwordEntry.password,
        timestamp: new Date(),
        reason: passwordEntry.reason || 'update',
        strengthScore: passwordEntry.strengthScore,
        metadata: {
          updatedBy: passwordEntry.updatedBy || 'user',
          automated: passwordEntry.automated || false,
          source: passwordEntry.source || 'manual'
        }
      };

      // Add to history and maintain max length
      history = [historyEntry, ...history].slice(0, this.maxHistoryLength);
      this.historyStore.set(historyKey, history);

      return {
        success: true,
        historyLength: history.length
      };
    } catch (error) {
      console.error('Failed to add to history:', error);
      throw new Error('Could not update password history');
    }
  }

  async getHistory(service, account) {
    const historyKey = `${service}:${account}`;
    return this.historyStore.get(historyKey) || [];
  }

  async viewHistoryDialog(service, account) {
    const history = await this.getHistory(service, account);
    
    const dialog = document.createElement('div');
    dialog.className = 'password-dialog';
    dialog.innerHTML = `
      <div class="dialog-content">
        <h3>Password History</h3>
        <div class="history-info">
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Account:</strong> ${account}</p>
        </div>
        
        <div class="history-timeline">
          ${history.map((entry, index) => `
            <div class="history-entry ${index === 0 ? 'current' : ''}">
              <div class="history-meta">
                <span class="history-date">
                  ${new Date(entry.timestamp).toLocaleDateString()} 
                  ${new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span class="history-reason">${entry.reason}</span>
              </div>
              <div class="history-details">
                <div class="strength-indicator ${this.getStrengthClass(entry.strengthScore)}">
                  Strength: ${entry.strengthScore}%
                </div>
                ${entry.metadata.automated ? 
                  '<span class="automated-tag">Automated</span>' : 
                  '<span class="manual-tag">Manual</span>'
                }
              </div>
            </div>
          `).join('')}
        </div>

        <div class="dialog-actions">
          <button class="btn-secondary" id="closeHistory">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Add event listener to close button
    document.getElementById('closeHistory').addEventListener('click', () => {
      dialog.remove();
    });
  }

  getStrengthClass(score) {
    if (score >= 80) return 'strong';
    if (score >= 60) return 'medium';
    return 'weak';
  }
} 