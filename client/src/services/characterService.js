/**
 * Character API service
 */
import ApiService from './api';

class CharacterService {
  constructor() {
    this.api = new ApiService();
    this.endpoint = '/characters';
  }

  /**
   * Get all characters, optionally filtered by userId
   * @param {string} userId - Optional user ID to filter by
   * @returns {Promise<Array>} Array of character objects
   */
  async getAllCharacters(userId = null) {
    const params = userId ? { userId } : {};
    return this.api.get(this.endpoint, params);
  }

  /**
   * Get a character by ID
   * @param {number} id - Character ID
   * @returns {Promise<Object>} Character object
   */
  async getCharacter(id) {
    return this.api.get(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new character
   * @param {Object} characterData - Character data
   * @returns {Promise<Object>} Object with new character ID
   */
  async createCharacter(characterData) {
    return this.api.post(this.endpoint, characterData);
  }

  /**
   * Update an existing character
   * @param {number} id - Character ID
   * @param {Object} characterData - Updated character data
   * @returns {Promise<Object>} Object with number of changes
   */
  async updateCharacter(id, characterData) {
    return this.api.put(`${this.endpoint}/${id}`, characterData);
  }

  /**
   * Delete a character
   * @param {number} id - Character ID
   * @returns {Promise<Object>} Object with number of deletions
   */
  async deleteCharacter(id) {
    return this.api.delete(`${this.endpoint}/${id}`);
  }
}

// Export a singleton instance
const characterService = new CharacterService();
export default characterService;