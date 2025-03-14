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

// client/src/services/sceneService.js
import ApiService from './api';

class SceneService {
  constructor() {
    this.api = new ApiService();
    this.endpoint = '/scenes';
  }

  /**
   * Get all scenes
   * @returns {Promise<Array>} Array of scene objects
   */
  async getAllScenes() {
    return this.api.get(this.endpoint);
  }

  /**
   * Get a scene by ID
   * @param {number} id - Scene ID
   * @returns {Promise<Object>} Scene object
   */
  async getScene(id) {
    return this.api.get(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new scene
   * @param {Object} sceneData - Scene data
   * @returns {Promise<Object>} Object with new scene ID
   */
  async createScene(sceneData) {
    return this.api.post(this.endpoint, sceneData);
  }

  /**
   * Update an existing scene
   * @param {number} id - Scene ID
   * @param {Object} sceneData - Updated scene data
   * @returns {Promise<Object>} Object with number of changes
   */
  async updateScene(id, sceneData) {
    return this.api.put(`${this.endpoint}/${id}`, sceneData);
  }

  /**
   * Delete a scene
   * @param {number} id - Scene ID
   * @returns {Promise<Object>} Object with number of deletions
   */
  async deleteScene(id) {
    return this.api.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Get posts for a scene
   * @param {number} sceneId - Scene ID
   * @returns {Promise<Array>} Array of post objects
   */
  async getScenePosts(sceneId) {
    return this.api.get(`${this.endpoint}/${sceneId}/posts`);
  }
}

// Export a singleton instance
const sceneService = new SceneService();
export default sceneService;

// client/src/services/postService.js
import ApiService from './api';

class PostService {
  constructor() {
    this.api = new ApiService();
    this.endpoint = '/posts';
  }

  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Object with new post ID
   */
  async createPost(postData) {
    return this.api.post(this.endpoint, postData);
  }
}

// Export a singleton instance
const postService = new PostService();
export default postService;