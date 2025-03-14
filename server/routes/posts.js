// Post routes
const express = require('express');
const router = express.Router();
const db = require('../db/db-config').getDb;

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Public
 */
router.post('/', (req, res, next) => {
  try {
    const { sceneId, characterId, content } = req.body;
    
    // Validate required fields
    if (!sceneId || !characterId || !content) {
      return res.status(400).json({ 
        error: 'Scene ID, character ID, and content are required' 
      });
    }
    
    const timestamp = new Date().toISOString();
    const db = require('../db/db-config').getDb();
    
    db.run(
      'INSERT INTO posts (sceneId, characterId, content, timestamp) VALUES (?, ?, ?, ?)',
      [sceneId, characterId, content, timestamp],
      function(err) {
        if (err) {
          return next(err);
        }
        
        // Get the created post with character info
        db.get(
          `SELECT p.*, c.name as characterName, c.portrait as characterPortrait 
           FROM posts p
           JOIN characters c ON p.characterId = c.id
           WHERE p.id = ?`,
          [this.lastID],
          (err, post) => {
            if (err) {
              return next(err);
            }
            
            res.status(201).json(post);
          }
        );
      }
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;