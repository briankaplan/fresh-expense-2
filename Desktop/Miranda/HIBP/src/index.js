import { SystemBootstrap } from './core/SystemBootstrap';

// Start the application
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await SystemBootstrap.start();
  } catch (error) {
    // Error already handled by SystemBootstrap
  }
}); 