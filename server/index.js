// Main server entry point
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
app.use(express.static(path.join(__dirname, '../client/public')));
app.use(logger);

// API Routes
app.use('/api', apiRoutes);

// Serve the frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    // Initialize database
    await initDatabase();
    
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
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