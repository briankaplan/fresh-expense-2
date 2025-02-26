import { SecurityService } from '../../services/security/SecurityService';
import { AppError, ErrorCodes } from '../../utils/error';

describe('SecurityService', () => {
  let securityService: SecurityService;

  beforeEach(() => {
    process.env.HIBP_API_KEY = 'test-key';
    securityService = new SecurityService();
  });

  describe('analyzePassword', () => {
    it('should correctly identify weak passwords', async () => {
      const result = await securityService.analyzePassword('password123');
      expect(result).toBe('weak');
    });

    it('should correctly identify strong passwords', async () => {
      const result = await securityService.analyzePassword('P@ssw0rd!123');
      expect(result).toBe('strong');
    });
  });

  describe('checkBreaches', () => {
    it('should throw error when API key is missing', async () => {
      process.env.HIBP_API_KEY = '';
      securityService = new SecurityService();
      
      await expect(securityService.initialize()).rejects.toThrow(
        new AppError('HIBP API key not found', ErrorCodes.VALIDATION_ERROR)
      );
    });

    it('should return breach count', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ count: 5 })
      });

      const result = await securityService.checkBreaches('test-password');
      expect(result).toBe(5);
    });
  });
}); 