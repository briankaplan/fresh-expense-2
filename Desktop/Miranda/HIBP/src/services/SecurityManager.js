import { BiometricAuth } from './auth/BiometricAuth';
import { CryptoService } from './crypto/CryptoService';
import { KeychainService } from './keychain/KeychainService';

export class SecurityManager {
  constructor() {
    this.crypto = new CryptoService();
    this.biometric = new BiometricAuth();
    this.keychain = new KeychainService();
    this.securityLevel = 'high';
  }

  async initialize() {
    try {
      await this.crypto.initialize();
      await this.biometric.checkAvailability();
      await this.keychain.initialize();
      
      // Set up security monitors
      this.startSecurityMonitoring();
      
      return true;
    } catch (error) {
      console.error('Security initialization failed:', error);
      throw error;
    }
  }

  async authenticate(credentials) {
    try {
      // Check biometric if available
      if (this.biometric.isAvailable()) {
        const bioResult = await this.biometric.authenticate();
        if (!bioResult) throw new Error('Biometric authentication failed');
      }

      // Verify master password
      const verified = await this.verifyMasterPassword(credentials.password);
      if (!verified) throw new Error('Invalid master password');

      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  async encryptData(data) {
    return this.crypto.encrypt(data);
  }

  async decryptData(encryptedData) {
    return this.crypto.decrypt(encryptedData);
  }

  startSecurityMonitoring() {
    setInterval(() => {
      this.checkSecurityStatus();
    }, 60000); // Check every minute
  }

  async checkSecurityStatus() {
    try {
      // Check system integrity
      await this.verifySystemIntegrity();
      
      // Check for suspicious activity
      await this.detectSuspiciousActivity();
      
      // Verify secure storage
      await this.verifySecureStorage();
    } catch (error) {
      console.error('Security check failed:', error);
      await this.handleSecurityIssue(error);
    }
  }
} 