import { AppError, ErrorCodes } from '../utils/error';
import { AppConfig } from '../config';

interface KeychainItem {
  service: string;
  account: string;
  password: string;
  accessGroup?: string;
}

export class AppleKeychainService {
  private static instance: AppleKeychainService;
  private keytar: any; // Type this properly based on keytar library

  private constructor() {
    try {
      this.keytar = require('keytar');
    } catch (error) {
      throw new AppError(
        'Failed to initialize keychain service',
        ErrorCodes.KEYCHAIN_ERROR,
        error
      );
    }
  }

  static getInstance(): AppleKeychainService {
    if (!AppleKeychainService.instance) {
      AppleKeychainService.instance = new AppleKeychainService();
    }
    return AppleKeychainService.instance;
  }

  async savePassword(account: string, password: string): Promise<void> {
    try {
      await this.keytar.setPassword(
        AppConfig.api.keychain.service,
        account,
        password
      );
    } catch (error) {
      throw new AppError(
        'Failed to save to keychain',
        ErrorCodes.KEYCHAIN_ERROR,
        error
      );
    }
  }

  async getPassword(account: string): Promise<string | null> {
    try {
      return await this.keytar.getPassword(
        AppConfig.api.keychain.service,
        account
      );
    } catch (error) {
      throw new AppError(
        'Failed to retrieve from keychain',
        ErrorCodes.KEYCHAIN_ERROR,
        error
      );
    }
  }

  async deletePassword(account: string): Promise<boolean> {
    try {
      return await this.keytar.deletePassword(
        AppConfig.api.keychain.service,
        account
      );
    } catch (error) {
      throw new AppError(
        'Failed to delete from keychain',
        ErrorCodes.KEYCHAIN_ERROR,
        error
      );
    }
  }

  async findCredentials(): Promise<KeychainItem[]> {
    try {
      return await this.keytar.findCredentials(
        AppConfig.api.keychain.service
      );
    } catch (error) {
      throw new AppError(
        'Failed to find credentials',
        ErrorCodes.KEYCHAIN_ERROR,
        error
      );
    }
  }
} 