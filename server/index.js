// server/index.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { initDatabase } = require('./db/db-config');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/error-handler');
const logger = require('./middleware/logger');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(logger);

// API Routes
app.use('/api', apiRoutes);

// Serve static files from the React app in production
// In development, React runs on its own server (typically port 3001)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // For any request that doesn't match an API route, serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
} else {
  // In development, serve the public directory for easier testing
  app.use(express.static(path.join(__dirname, '../public')));
  
  // For any request that doesn't match an API route, serve the public/index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    // Initialize database
    await initDatabase();
    
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      process.exit(0);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app; // Export for testing