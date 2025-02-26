export class SystemBootstrap {
  static async start() {
    try {
      console.log('🔄 Starting system bootstrap...');
      
      // Create init system
      const initSystem = new InitSystem();
      
      // Bootstrap application
      const app = await initSystem.bootstrap();
      
      // Store application instance globally
      window.__APP__ = app;
      
      console.log('✅ System bootstrap complete');
      return app;
    } catch (error) {
      console.error('❌ System bootstrap failed:', error);
      this.handleBootstrapError(error);
      throw error;
    }
  }

  static handleBootstrapError(error) {
    // Show error screen to user
    document.body.innerHTML = `
      <div class="error-screen">
        <h1>System Error</h1>
        <p>Unable to start the application. Please try:</p>
        <ul>
          <li>Refreshing the page</li>
          <li>Clearing your browser cache</li>
          <li>Using a modern browser</li>
        </ul>
        <p>Error details: ${error.message}</p>
      </div>
    `;
  }
} 