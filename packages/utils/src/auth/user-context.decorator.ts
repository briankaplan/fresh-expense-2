import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@fresh-expense/types';

export interface UserContext {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
}

export const UserContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    if (!user) {
      throw new Error('User not found in request context');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companies[0] || undefined,
    };
  },
);
