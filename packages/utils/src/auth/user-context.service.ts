import { Injectable, Logger, Inject } from '@nestjs/common';
import { UserContext } from './user-context.decorator';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UserContextService {
  private readonly logger = new Logger(UserContextService.name);
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Get user context from cache or create new one
   */
  async getUserContext(userId: string): Promise<UserContext> {
    const cacheKey = `user:${userId}:context`;

    try {
      // Try to get from cache first
      const cachedContext = await this.cacheManager.get<UserContext>(cacheKey);
      if (cachedContext) {
        this.logger.debug(`Cache hit for user context: ${userId}`);
        return cachedContext;
      }

      // TODO: Fetch user data from database or auth service
      const userContext: UserContext = {
        userId,
        email: 'user@example.com', // Placeholder
        role: 'user',
        companyId: 'company123', // Placeholder
      };

      // Cache the context
      await this.cacheManager.set(cacheKey, userContext, this.CACHE_TTL);

      return userContext;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting user context for ${userId}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Clear user context cache
   */
  async clearUserContext(userId: string): Promise<void> {
    const cacheKey = `user:${userId}:context`;
    await this.cacheManager.del(cacheKey);
  }

  /**
   * Check if user has required role
   */
  hasRequiredRole(userContext: UserContext, requiredRole: string): boolean {
    return userContext.role === requiredRole;
  }

  /**
   * Check if user has access to company
   */
  hasCompanyAccess(userContext: UserContext, companyId: string): boolean {
    return userContext.companyId === companyId;
  }
}
