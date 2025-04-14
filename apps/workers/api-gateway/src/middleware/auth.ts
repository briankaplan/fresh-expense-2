import { jwtVerify } from 'jose';
import { Env, CustomRequest } from '../types';

export async function auth(request: CustomRequest, env: Env) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const secret = new TextEncoder().encode(env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });

    if (!payload.sub || !payload.email || !payload.role) {
      return new Response('Invalid token payload', { status: 401 });
    }

    request.user = {
      userId: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    };

    return undefined;
  } catch (error) {
    console.error('Auth error:', error);
    return new Response('Unauthorized', { status: 401 });
  }
} 