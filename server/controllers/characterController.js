// Character model
const { getDb } = require('../db-config');

/**
 * Character model with database operations
 */
class Character {
  /**
   * Find all characters, optionally filtered by userId
   * @param {string} userId - Optional user ID to filter by
   * @returns {Promise<Array>} Array of character objects
   */
  static findAll(userId = null) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      let query = 'SELECT * FROM characters';
      let params = [];

      if (userId) {
        query += ' WHERE userId = ?';
        params.push(userId);
      }

      db.all(query, params, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  /**
   * Find a character by ID
   * @param {number} id - Character ID
   * @returns {Promise<Object>} Character object
   */
  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get('SELECT * FROM characters WHERE id = ?', [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        if (!row) {
          return reject(new Error('Character not found'));
        }
        resolve(row);
      });
    });
  }

  /**
   * Create a new character
   * @param {Object} characterData - Character data
   * @returns {Promise<Object>} Object with new character ID
   */
  static create(characterData) {
    return new Promise((resolve, reject) => {
      const { name, portrait, age, description, bio, userId } = characterData;
      
      if (!name || !userId) {
        return reject(new Error('Name and userId are required'));
      }

      const db = getDb();
      db.run(
        'INSERT INTO characters (name, portrait, age, description, bio, userId) VALUES (?, ?, ?, ?, ?, ?)',
        [name, portrait, age, description, bio, userId],
        function(err) {
          if (err) {
            return reject(err);
          }
          resolve({ id: this.lastID });
        }
      );
    });
  }

  /**
   * Update an existing character
   * @param {number} id - Character ID
   * @param {Object} characterData - Updated character data
   * @returns {Promise<Object>} Object with number of changes
   */
  static update(id, characterData) {
    return new Promise((resolve, reject) => {
      const { name, portrait, age, description, bio, userId } = characterData;
      
      if (!name || !userId) {
        return reject(new Error('Name and userId are required'));
      }

      const db = getDb();
      db.run(
        'UPDATE characters SET name = ?, portrait = ?, age = ?, description = ?, bio = ?, userId = ? WHERE id = ?',
        [name, portrait, age, description, bio, userId, id],
        function(err) {
          if (err) {
            return reject(err);
          }
          if (this.changes === 0) {
            return reject(new Error('Character not found'));
          }
          resolve({ changes: this.changes });
        }
      );
    });
  }

  /**
   * Delete a character
   * @param {number} id - Character ID
   * @returns {Promise<Object>} Object with number of deletions
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.run('DELETE FROM characters WHERE id = ?', [id], function(err) {
        if (err) {
          return reject(err);
        }
        if (this.changes === 0) {
          return reject(new Error('Character not found'));
        }
        resolve({ deleted: this.changes });
      });
    });
  }
}

module.exports = Character;