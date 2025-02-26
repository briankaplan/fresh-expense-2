export class PasswordList {
  constructor() {
    this.passwords = [];
    this.filter = '';
    this.sortBy = 'service';
    this.sortDir = 'asc';
  }

  async initialize() {
    try {
      await this.loadPasswords();
      return true;
    } catch (error) {
      console.error('Password list initialization failed:', error);
      throw error;
    }
  }

  async loadPasswords() {
    const passwordManager = window.__APP__.services.get('passwords');
    this.passwords = await passwordManager.getAllPasswords();
  }

  render() {
    return `
      <div class="password-list">
        ${this.renderToolbar()}
        ${this.renderList()}
      </div>
    `;
  }

  renderToolbar() {
    return `
      <div class="list-toolbar">
        <div class="search-bar">
          <input type="search" 
                 placeholder="Search passwords..." 
                 value="${this.filter}"
                 id="passwordSearch">
        </div>
        <div class="toolbar-actions">
          <button id="addPassword" class="btn-primary">
            <i class="fas fa-plus"></i> Add Password
          </button>
          <button id="importPasswords" class="btn-secondary">
            <i class="fas fa-file-import"></i> Import
          </button>
          <button id="exportPasswords" class="btn-secondary">
            <i class="fas fa-file-export"></i> Export
          </button>
        </div>
      </div>
    `;
  }

  renderList() {
    const filteredPasswords = this.getFilteredPasswords();
    
    if (filteredPasswords.length === 0) {
      return this.renderEmptyState();
    }

    return `
      <div class="password-grid">
        ${filteredPasswords.map(password => this.renderPasswordCard(password)).join('')}
      </div>
    `;
  }

  renderPasswordCard(password) {
    const health = window.__APP__.services.get('health').getPasswordHealth(password.id);
    
    return `
      <div class="password-card" data-id="${password.id}">
        <div class="card-header">
          <img src="${this.getServiceIcon(password.service)}" alt="${password.service}">
          <h3>${password.service}</h3>
        </div>
        <div class="card-body">
          <p class="username">${password.username}</p>
          <div class="password-field">
            <input type="password" value="${password.password}" readonly>
            <button class="btn-icon" data-action="toggle">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon" data-action="copy">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        <div class="card-footer">
          <div class="health-indicator ${health.score >= 80 ? 'good' : health.score >= 50 ? 'medium' : 'poor'}">
            ${health.score}%
          </div>
          <div class="card-actions">
            <button class="btn-icon" data-action="edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" data-action="delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getFilteredPasswords() {
    return this.passwords
      .filter(p => this.filterPassword(p))
      .sort((a, b) => this.sortPasswords(a, b));
  }

  filterPassword(password) {
    if (!this.filter) return true;
    
    const searchTerm = this.filter.toLowerCase();
    return password.service.toLowerCase().includes(searchTerm) ||
           password.username.toLowerCase().includes(searchTerm);
  }

  sortPasswords(a, b) {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return a[this.sortBy].localeCompare(b[this.sortBy]) * dir;
  }
} 