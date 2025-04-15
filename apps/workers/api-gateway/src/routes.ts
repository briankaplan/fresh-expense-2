import { Router } from 'itty-router';
import { Env, AuthContext } from './types';
import { handleAuth } from './middleware/auth';
import { handleCors } from './middleware/cors';
import { handleError } from './middleware/error';
import { handleHealth } from './handlers/health';
import { handleExpenses } from './handlers/expenses';
import { handleFiles } from './handlers/files';
import { handleWebhooks } from './handlers/webhooks';

export const router = Router();

// Apply middleware
router.all('*', handleCors);
router.all('/api/*', handleAuth);

// Health check endpoint
router.get('/health', handleHealth);

// API routes
router.get('/api/expenses', handleExpenses);
router.post('/api/expenses', handleExpenses);
router.get('/api/expenses/:id', handleExpenses);
router.put('/api/expenses/:id', handleExpenses);
router.delete('/api/expenses/:id', handleExpenses);

// File upload/download routes
router.post('/api/files', handleFiles);
router.get('/api/files/:id', handleFiles);
router.delete('/api/files/:id', handleFiles);

// Webhook routes
router.post('/webhooks/teller', handleWebhooks);

// 404 handler
router.all('*', () => new Response('Not Found', { status: 404 }));
