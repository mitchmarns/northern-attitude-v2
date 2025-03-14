/**
 * Simple request logging middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request information
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Add response listener to log when request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = logger;