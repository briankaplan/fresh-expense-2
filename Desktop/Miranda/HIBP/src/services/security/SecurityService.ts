import { Password, PasswordStrength } from '../../types';
import { AppError, ErrorCodes } from '../../utils/error';
import { AppConfig } from '../../config';

export class SecurityService {
  private hibpApiKey: string;

  constructor() {
    this.hibpApiKey = process.env.HIBP_API_KEY || '';
  }

  async initialize(): Promise<void> {
    if (!this.hibpApiKey) {
      throw new AppError('HIBP API key not found', ErrorCodes.VALIDATION_ERROR);
    }
  }

  async analyzePassword(password: string): Promise<PasswordStrength> {
    const score = this.calculatePasswordStrength(password);
    return score >= 80 ? 'strong' : score >= 60 ? 'medium' : 'weak';
  }

  async checkBreaches(password: string): Promise<number> {
    try {
      const response = await fetch(`${AppConfig.api.hibp.baseUrl}/breaches`, {
        headers: { 'hibp-api-key': this.hibpApiKey }
      });
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      throw new AppError('Failed to check breaches', ErrorCodes.HIBP_API_ERROR, error);
    }
  }

  private calculatePasswordStrength(password: string): number {
    let score = 0;
    
    // Length
    score += Math.min(password.length * 4, 40);
    
    // Character types
    if (/[A-Z]/.test(password)) score += 10;
    if (/[a-z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;
    
    return Math.min(score, 100);
  }
} 