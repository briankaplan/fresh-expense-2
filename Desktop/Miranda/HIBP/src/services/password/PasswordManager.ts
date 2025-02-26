import { Password, PasswordStrength } from '../../types';
import { SecurityService } from '../security/SecurityService';
import { DatabaseService } from '../database/DatabaseService';
import { AppError, ErrorCodes } from '../../utils/error';
import { validatePassword } from '../../utils/validation';
import { generateSecurePassword } from '../../utils/crypto';

export class PasswordManager {
  private securityService: SecurityService;
  private databaseService: DatabaseService;

  constructor() {
    this.securityService = new SecurityService();
    this.databaseService = new DatabaseService();
  }

  async initialize(): Promise<void> {
    await this.databaseService.initialize();
  }

  async addPassword(password: Password): Promise<Password> {
    try {
      validatePassword(password);
      
      const strength = await this.securityService.analyzePassword(password.password);
      const enrichedPassword = {
        ...password,
        strength,
        lastModified: new Date(),
        status: 'pending'
      };

      const id = await this.databaseService.savePassword(enrichedPassword);
      return { ...enrichedPassword, id };
    } catch (error) {
      throw new AppError('Failed to add password', ErrorCodes.VALIDATION_ERROR, error);
    }
  }

  async generatePassword(): Promise<string> {
    return generateSecurePassword();
  }
} 