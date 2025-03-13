const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dbPath = path.join(__dirname, 'database', 'roleplay.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Characters table
    db.run(`CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      portrait TEXT,
      age INTEGER,
      description TEXT,
      bio TEXT,
      userId TEXT NOT NULL
    )`);

    // Scenes table
    db.run(`CREATE TABLE IF NOT EXISTS scenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      location TEXT,
      description TEXT,
      created TEXT NOT NULL
    )`);

    // Scene-Character relationship table
    db.run(`CREATE TABLE IF NOT EXISTS scene_characters (
      sceneId INTEGER,
      characterId INTEGER,
      PRIMARY KEY (sceneId, characterId),
      FOREIGN KEY (sceneId) REFERENCES scenes(id) ON DELETE CASCADE,
      FOREIGN KEY (characterId) REFERENCES characters(id) ON DELETE CASCADE
    )`);

    // Posts table
    db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sceneId INTEGER,
      characterId INTEGER,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (sceneId) REFERENCES scenes(id) ON DELETE CASCADE,
      FOREIGN KEY (characterId) REFERENCES characters(id) ON DELETE CASCADE
    )`);
  });
}

// API Routes
// Get all characters
app.get('/api/characters', (req, res) => {
  const userId = req.query.userId;
  let query = 'SELECT * FROM characters';
  let params = [];

  if (userId) {
    query += ' WHERE userId = ?';
    params.push(userId);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get a single character
app.get('/api/characters/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM characters WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }
    res.json(row);
  });
});

// Create a character
app.post('/api/characters', (req, res) => {
  const { name, portrait, age, description, bio, userId } = req.body;
  
  if (!name || !userId) {
    res.status(400).json({ error: 'Name and userId are required' });
    return;
  }

  db.run(
    'INSERT INTO characters (name, portrait, age, description, bio, userId) VALUES (?, ?, ?, ?, ?, ?)',
    [name, portrait, age, description, bio, userId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Update a character
app.put('/api/characters/:id', (req, res) => {
  const id = req.params.id;
  const { name, portrait, age, description, bio, userId } = req.body;
  
  if (!name || !userId) {
    res.status(400).json({ error: 'Name and userId are required' });
    return;
  }

  db.run(
    'UPDATE characters SET name = ?, portrait = ?, age = ?, description = ?, bio = ?, userId = ? WHERE id = ?',
    [name, portrait, age, description, bio, userId, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Character not found' });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

// Delete a character
app.delete('/api/characters/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM characters WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Get all scenes
app.get('/api/scenes', (req, res) => {
  db.all('SELECT * FROM scenes ORDER BY created DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // For each scene, get its character IDs
    const getSceneWithCharacters = rows.map(scene => {
      return new Promise((resolve, reject) => {
        db.all(
          'SELECT characterId FROM scene_characters WHERE sceneId = ?',
          [scene.id],
          (err, characterRows) => {
            if (err) {
              reject(err);
              return;
            }
            scene.characterIds = characterRows.map(row => row.characterId);
            resolve(scene);
          }
        );
      });
    });
    
    Promise.all(getSceneWithCharacters)
      .then(scenesWithCharacters => res.json(scenesWithCharacters))
      .catch(error => res.status(500).json({ error: error.message }));
  });
});

// Get a single scene with its characters
app.get('/api/scenes/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM scenes WHERE id = ?', [id], (err, scene) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!scene) {
      res.status(404).json({ error: 'Scene not found' });
      return;
    }
    
    // Get character IDs for this scene
    db.all(
      'SELECT characterId FROM scene_characters WHERE sceneId = ?',
      [id],
      (err, characterRows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        scene.characterIds = characterRows.map(row => row.characterId);
        res.json(scene);
      }
    );
  });
});

// Create a scene
app.post('/api/scenes', (req, res) => {
  const { title, location, description, characterIds = [] } = req.body;
  
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const created = new Date().toISOString();
  
  db.run(
    'INSERT INTO scenes (title, location, description, created) VALUES (?, ?, ?, ?)',
    [title, location, description, created],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const sceneId = this.lastID;
      
      // Insert character relationships
      if (characterIds.length > 0) {
        const insertPromises = characterIds.map(characterId => {
          return new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO scene_characters (sceneId, characterId) VALUES (?, ?)',
              [sceneId, characterId],
              function(err) {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });
        
        Promise.all(insertPromises)
          .then(() => res.json({ id: sceneId }))
          .catch(error => res.status(500).json({ error: error.message }));
      } else {
        res.json({ id: sceneId });
      }
    }
  );
});

// Update a scene
app.put('/api/scenes/:id', (req, res) => {
  const id = req.params.id;
  const { title, location, description, characterIds = [] } = req.body;
  
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  db.run(
    'UPDATE scenes SET title = ?, location = ?, description = ? WHERE id = ?',
    [title, location, description, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Scene not found' });
        return;
      }
      
      // Update character relationships
      // First delete existing relationships
      db.run('DELETE FROM scene_characters WHERE sceneId = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Then add new relationships
        if (characterIds.length > 0) {
          const insertPromises = characterIds.map(characterId => {
            return new Promise((resolve, reject) => {
              db.run(
                'INSERT INTO scene_characters (sceneId, characterId) VALUES (?, ?)',
                [id, characterId],
                function(err) {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          });
          
          Promise.all(insertPromises)
            .then(() => res.json({ changes: this.changes }))
            .catch(error => res.status(500).json({ error: error.message }));
        } else {
          res.json({ changes: this.changes });
        }
      });
    }
  );
});

// Delete a scene
app.delete('/api/scenes/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM scenes WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Scene not found' });
      return;
    }
    
    // Scene-character relationships and posts will be deleted via CASCADE
    res.json({ deleted: this.changes });
  });
});

// Get posts for a scene
app.get('/api/scenes/:id/posts', (req, res) => {
  const sceneId = req.params.id;
  db.all(
    'SELECT * FROM posts WHERE sceneId = ? ORDER BY timestamp ASC',
    [sceneId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Create a post
app.post('/api/posts', (req, res) => {
  const { sceneId, characterId, content } = req.body;
  
  if (!sceneId || !characterId || !content) {
    res.status(400).json({ error: 'SceneId, characterId, and content are required' });
    return;
  }

  const timestamp = new Date().toISOString();
  
  db.run(
    'INSERT INTO posts (sceneId, characterId, content, timestamp) VALUES (?, ?, ?, ?)',
    [sceneId, characterId, content, timestamp],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});