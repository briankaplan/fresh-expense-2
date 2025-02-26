import { Password, PasswordStrength } from '../types';
import { SecurityService } from './security.service';
import { DatabaseService } from './database.service';
import { AppError, ErrorCodes } from '../utils/error';
import { AppConfig } from '../config';

export class PasswordManager {
  private static instance: PasswordManager;

  private constructor() {}

  static getInstance(): PasswordManager {
    if (!PasswordManager.instance) {
      PasswordManager.instance = new PasswordManager();
    }
    return PasswordManager.instance;
  }

  async analyzePassword(password: string): Promise<PasswordStrength> {
    try {
      return SecurityService.analyzePassword(password);
    } catch (error) {
      throw new AppError(
        'Failed to analyze password',
        ErrorCodes.VALIDATION_ERROR,
        error
      );
    }
  }

  async updatePassword(passwordData: Partial<Password>): Promise<Password> {
    try {
      if (!passwordData.id) {
        throw new AppError(
          'Password ID is required',
          ErrorCodes.VALIDATION_ERROR
        );
      }

      const existingPassword = await DatabaseService.getPassword(passwordData.id);
      if (!existingPassword) {
        throw new AppError(
          'Password not found',
          ErrorCodes.DATABASE_ERROR
        );
      }

      const updatedPassword = {
        ...existingPassword,
        ...passwordData,
        lastModified: new Date()
      };

      await DatabaseService.updatePassword(updatedPassword);
      return updatedPassword;
    } catch (error) {
      throw new AppError(
        'Failed to update password',
        ErrorCodes.DATABASE_ERROR,
        error
      );
    }
  }

  async checkPasswordHealth(password: Password): Promise<void> {
    try {
      const breachCount = await SecurityService.checkForBreaches(password);
      
      await this.updatePassword({
        ...password,
        metadata: {
          ...password.metadata,
          breachCount,
          lastChecked: new Date(),
          riskLevel: this.calculateRiskLevel(breachCount)
        }
      });
    } catch (error) {
      throw new AppError(
        'Failed to check password health',
        ErrorCodes.HIBP_API_ERROR,
        error
      );
    }
  }

  private calculateRiskLevel(breachCount: number): 'low' | 'medium' | 'high' {
    if (breachCount === 0) return 'low';
    if (breachCount < 5) return 'medium';
    return 'high';
  }
} 