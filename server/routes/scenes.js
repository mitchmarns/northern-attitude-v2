// Scene routes
const express = require('express');
const router = express.Router();
const db = require('../db/db-config').getDb;

/**
 * @route   GET /api/scenes
 * @desc    Get all scenes
 * @access  Public
 */
router.get('/', (req, res, next) => {
  try {
    const db = require('../db/db-config').getDb();
    db.all('SELECT * FROM scenes', [], (err, rows) => {
      if (err) {
        return next(err);
      }
      
      // For each scene, get the character IDs
      const getCharactersPromises = rows.map(scene => {
        return new Promise((resolve, reject) => {
          db.all(
            'SELECT characterId FROM scene_characters WHERE sceneId = ?',
            [scene.id],
            (err, characterRows) => {
              if (err) {
                return reject(err);
              }
              
              scene.characterIds = characterRows.map(row => row.characterId);
              resolve(scene);
            }
          );
        });
      });
      
      Promise.all(getCharactersPromises)
        .then(scenes => {
          res.json(scenes);
        })
        .catch(err => {
          next(err);
        });
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/scenes/:id
 * @desc    Get a scene by ID
 * @access  Public
 */
router.get('/:id', (req, res, next) => {
  try {
    const db = require('../db/db-config').getDb();
    db.get('SELECT * FROM scenes WHERE id = ?', [req.params.id], (err, scene) => {
      if (err) {
        return next(err);
      }
      
      if (!scene) {
        return res.status(404).json({ error: 'Scene not found' });
      }
      
      // Get character IDs for this scene
      db.all(
        'SELECT characterId FROM scene_characters WHERE sceneId = ?',
        [scene.id],
        (err, characterRows) => {
          if (err) {
            return next(err);
          }
          
          scene.characterIds = characterRows.map(row => row.characterId);
          res.json(scene);
        }
      );
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/scenes
 * @desc    Create a new scene
 * @access  Public
 */
router.post('/', (req, res, next) => {
  try {
    const { title, location, description, created, characterIds = [] } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const db = require('../db/db-config').getDb();
    db.run(
      'INSERT INTO scenes (title, location, description, created) VALUES (?, ?, ?, ?)',
      [title, location, description, created || new Date().toISOString()],
      function(err) {
        if (err) {
          return next(err);
        }
        
        const sceneId = this.lastID;
        
        // Insert character associations if any
        if (characterIds.length > 0) {
          const insertPromises = characterIds.map(characterId => {
            return new Promise((resolve, reject) => {
              db.run(
                'INSERT INTO scene_characters (sceneId, characterId) VALUES (?, ?)',
                [sceneId, characterId],
                err => {
                  if (err) {
                    return reject(err);
                  }
                  resolve();
                }
              );
            });
          });
          
          Promise.all(insertPromises)
            .then(() => {
              res.status(201).json({ id: sceneId });
            })
            .catch(err => {
              next(err);
            });
        } else {
          res.status(201).json({ id: sceneId });
        }
      }
    );
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/scenes/:id
 * @desc    Update an existing scene
 * @access  Public
 */
router.put('/:id', (req, res, next) => {
  try {
    const sceneId = parseInt(req.params.id);
    const { title, location, description, characterIds = [] } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const db = require('../db/db-config').getDb();
    db.run(
      'UPDATE scenes SET title = ?, location = ?, description = ? WHERE id = ?',
      [title, location, description, sceneId],
      function(err) {
        if (err) {
          return next(err);
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Scene not found' });
        }
        
        // Update character associations
        db.run('DELETE FROM scene_characters WHERE sceneId = ?', [sceneId], err => {
          if (err) {
            return next(err);
          }
          
          if (characterIds.length > 0) {
            const insertPromises = characterIds.map(characterId => {
              return new Promise((resolve, reject) => {
                db.run(
                  'INSERT INTO scene_characters (sceneId, characterId) VALUES (?, ?)',
                  [sceneId, characterId],
                  err => {
                    if (err) {
                      return reject(err);
                    }
                    resolve();
                  }
                );
              });
            });
            
            Promise.all(insertPromises)
              .then(() => {
                res.json({ changes: this.changes });
              })
              .catch(err => {
                next(err);
              });
          } else {
            res.json({ changes: this.changes });
          }
        });
      }
    );
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/scenes/:id
 * @desc    Delete a scene
 * @access  Public
 */
router.delete('/:id', (req, res, next) => {
  try {
    const db = require('../db/db-config').getDb();
    db.run('DELETE FROM scenes WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return next(err);
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Scene not found' });
      }
      
      res.json({ deleted: this.changes });
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/scenes/:id/posts
 * @desc    Get all posts for a scene
 * @access  Public
 */
router.get('/:id/posts', (req, res, next) => {
  try {
    const db = require('../db/db-config').getDb();
    db.all(
      `SELECT p.*, c.name as characterName, c.portrait as characterPortrait 
       FROM posts p
       JOIN characters c ON p.characterId = c.id
       WHERE p.sceneId = ?
       ORDER BY p.timestamp ASC`,
      [req.params.id],
      (err, rows) => {
        if (err) {
          return next(err);
        }
        
        res.json(rows);
      }
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;