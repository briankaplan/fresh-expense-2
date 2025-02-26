import { InitSystem } from './core/InitSystem';
import { AppError } from './utils/error';
import React from 'react';
import ReactDOM from 'react-dom';
import { Dashboard } from './pages/Dashboard';
import './styles/dashboard.css';

async function startApplication() {
  try {
    // Initialize the system
    await InitSystem.start();

    // Render the React application
    ReactDOM.render(
      <React.StrictMode>
        <Dashboard />
      </React.StrictMode>,
      document.getElementById('root')
    );
  } catch (error) {
    console.error('Application failed to start:', error);
    
    // Show error to user
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div class="error-screen">
          <h1>Application Error</h1>
          <p>${error instanceof AppError ? error.message : 'Failed to start application'}</p>
        </div>
      `;
    }
  }
}

// Start the application
startApplication(); 