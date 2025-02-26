import { PasswordHistory } from './PasswordHistory.js';
import { PasswordGenerator } from '../utils/PasswordGenerator';
import { PasswordValidator } from '../utils/PasswordValidator';

export class PasswordManager {
  constructor() {
    this.crypto = window.crypto.subtle;
    this.history = new PasswordHistory();
    this.generator = new PasswordGenerator();
    this.validator = new PasswordValidator();
    this.passwords = new Map();
  }

  async initialize() {
    try {
      // Load passwords from secure storage
      await this.loadPasswords();
      
      // Start auto-save system
      this.startAutoSave();
      
      return true;
    } catch (error) {
      console.error('Password manager initialization failed:', error);
      throw error;
    }
  }

  async addPassword(entry) {
    try {
      // Validate password
      const validationResult = this.validator.validate(entry.password);
      if (!validationResult.valid) {
        throw new Error(validationResult.errors.join(', '));
      }

      // Generate ID if not provided
      entry.id = entry.id || crypto.randomUUID();
      
      // Add metadata
      entry.created = new Date();
      entry.modified = new Date();
      entry.version = 1;

      // Store password
      this.passwords.set(entry.id, entry);
      
      // Save to persistent storage
      await this.savePasswords();

      return entry;
    } catch (error) {
      console.error('Add password failed:', error);
      throw error;
    }
  }

  async updatePassword(id, updates) {
    try {
      const password = this.passwords.get(id);
      if (!password) throw new Error('Password not found');

      // Update fields
      Object.assign(password, updates, {
        modified: new Date(),
        version: password.version + 1
      });

      // Store update
      this.passwords.set(id, password);
      
      // Save to persistent storage
      await this.savePasswords();

      return password;
    } catch (error) {
      console.error('Update password failed:', error);
      throw error;
    }
  }

  async generatePassword(options = {}) {
    return this.generator.generate(options);
  }

  startAutoSave() {
    setInterval(async () => {
      try {
        await this.savePasswords();
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000); // Save every 30 seconds
  }

  async viewPassword(password, service) {
    try {
      // Log access attempt for security
      console.log(`Viewing password for: ${service}`);
      
      // In a real implementation, we'd decrypt here
      return {
        password: password,
        lastViewed: new Date(),
        service: service
      };
    } catch (error) {
      console.error('Error viewing password:', error);
      throw new Error('Unable to view password');
    }
  }

  validatePassword(password) {
    const requirements = {
      minLength: 12,
      hasUpper: /[A-Z]/,
      hasLower: /[a-z]/,
      hasNumber: /[0-9]/,
      hasSpecial: /[^A-Za-z0-9]/
    };

    const errors = [];

    if (password.length < requirements.minLength) {
      errors.push(`Password must be at least ${requirements.minLength} characters`);
    }
    if (!requirements.hasUpper.test(password)) {
      errors.push('Password must contain uppercase letters');
    }
    if (!requirements.hasLower.test(password)) {
      errors.push('Password must contain lowercase letters');
    }
    if (!requirements.hasNumber.test(password)) {
      errors.push('Password must contain numbers');
    }
    if (!requirements.hasSpecial.test(password)) {
      errors.push('Password must contain special characters');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  calculateStrengthScore(password) {
    let score = 0;
    
    // Length
    score += Math.min(password.length * 4, 40);
    
    // Character types
    if (/[A-Z]/.test(password)) score += 10;
    if (/[a-z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;
    
    // Complexity
    const unique = new Set(password).size;
    score += unique * 2;

    return Math.min(score, 100);
  }

  generateSecurePassword() {
    const charset = {
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lower: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    const length = 16;
    let password = '';

    // Ensure at least one of each type
    password += this.getRandomChar(charset.upper);
    password += this.getRandomChar(charset.lower);
    password += this.getRandomChar(charset.numbers);
    password += this.getRandomChar(charset.special);

    // Fill the rest randomly
    const allChars = Object.values(charset).join('');
    while (password.length < length) {
      password += this.getRandomChar(allChars);
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  getRandomChar(charset) {
    const array = new Uint8Array(1);
    crypto.getRandomValues(array);
    return charset[array[0] % charset.length];
  }

  async viewHistory(service, account) {
    await this.history.viewHistoryDialog(service, account);
  }
} 