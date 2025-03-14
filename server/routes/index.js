// Main API router
const express = require('express');
const router = express.Router();

// Import resource routes
const characterRoutes = require('./characters');
const sceneRoutes = require('./scenes');
const postRoutes = require('./posts');

// Mount resource routes
router.use('/characters', characterRoutes);
router.use('/scenes', sceneRoutes);
router.use('/posts', postRoutes);

// API health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;