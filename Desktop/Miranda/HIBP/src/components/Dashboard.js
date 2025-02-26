import { PasswordList } from './PasswordList';
import { SecurityPanel } from './SecurityPanel';
import { SettingsPanel } from './SettingsPanel';

export class Dashboard {
  constructor() {
    this.currentView = 'passwords';
    this.components = new Map();
    this.initialized = false;
  }

  async initialize() {
    try {
      // Initialize sub-components
      this.components.set('passwords', new PasswordList());
      this.components.set('security', new SecurityPanel());
      this.components.set('settings', new SettingsPanel());

      await Promise.all(
        Array.from(this.components.values()).map(c => c.initialize())
      );

      this.render();
      this.attachEventListeners();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
      throw error;
    }
  }

  render() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="dashboard">
        <nav class="sidebar">
          <div class="nav-header">
            <h1>Password Manager</h1>
          </div>
          <div class="nav-items">
            <button class="nav-item ${this.currentView === 'passwords' ? 'active' : ''}" data-view="passwords">
              <i class="fas fa-key"></i> Passwords
            </button>
            <button class="nav-item ${this.currentView === 'security' ? 'active' : ''}" data-view="security">
              <i class="fas fa-shield-alt"></i> Security
            </button>
            <button class="nav-item ${this.currentView === 'settings' ? 'active' : ''}" data-view="settings">
              <i class="fas fa-cog"></i> Settings
            </button>
          </div>
          <div class="nav-footer">
            <button id="lockVault" class="btn-danger">
              <i class="fas fa-lock"></i> Lock Vault
            </button>
          </div>
        </nav>
        <main class="content">
          ${this.renderCurrentView()}
        </main>
      </div>
    `;
  }

  renderCurrentView() {
    const component = this.components.get(this.currentView);
    return component ? component.render() : 'Loading...';
  }

  attachEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        this.switchView(item.dataset.view);
      });
    });

    // Lock vault
    document.getElementById('lockVault').addEventListener('click', () => {
      this.lockVault();
    });
  }

  async switchView(view) {
    if (this.currentView === view) return;
    
    this.currentView = view;
    this.render();
  }

  async lockVault() {
    try {
      await window.__APP__.services.get('security').lock();
      location.reload();
    } catch (error) {
      console.error('Lock vault failed:', error);
    }
  }
} 