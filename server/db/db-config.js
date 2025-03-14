// Database configuration and initialization
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database instance
let db;

/**
 * Initialize the database connection and tables
 * @returns {Promise<sqlite3.Database>} Database instance
 */
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '../../database', 'roleplay.db');
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        return reject(err);
      }
      
      console.log('Connected to the SQLite database.');
      
      // Initialize database tables
      db.serialize(() => {
        try {
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
          
          resolve(db);
        } catch (error) {
          reject(error);
        }
      });
    });
  });
};

/**
 * Get the database instance
 * @returns {sqlite3.Database} Database instance
 */
const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

/**
 * Close the database connection
 * @returns {Promise<void>}
 */
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return resolve();
    }
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
        return reject(err);
      }
      console.log('Database connection closed.');
      db = null;
      resolve();
    });
  });
};

// Register shutdown handler
process.on('SIGINT', async () => {
  try {
    await closeDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

module.exports = {
  initDatabase,
  getDb,
  closeDatabase
};