import { ExecutionContext } from '@nestjs/common';

/**
 * Standard handler for checking auth results
 */
export function handleAuthResult(err: any, user: any): any {
  if (err || !user) {
    throw err || new Error('Unauthorized');
  }
  return user;
}

/**
 * Get request from execution context (supports HTTP, WS, RPC)
 */
export function getRequestFromContext(context: ExecutionContext): any {
  const contextType = context.getType();
  if (contextType === 'http') {
    return context.switchToHttp().getRequest();
  } else if (contextType === 'ws') {
    return context.switchToWs().getClient();
  } else if (contextType === 'rpc') {
    return context.switchToRpc().getData();
  }
  throw new Error(`Unsupported context type: ${contextType}`);
}
