import { createRouter, createRootRoute } from '@tanstack/react-router';
import { App } from '@/app/app';
import type { AuthUser } from '@fresh-expense/types/auth';

const rootRoute = createRootRoute({
  component: App,
});

// Create the router instance
export const router = createRouter({
  routeTree: rootRoute,
  context: {
    auth: undefined as AuthUser | undefined,
  },
});

// Register router for type safety
declare module '@tanstack/react-router' {
}
