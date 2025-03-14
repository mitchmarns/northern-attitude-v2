import ApiService from './api';

class CharacterService {
  constructor() {
    this.api = new ApiService();
    this.endpoint = '/characters';
  }

  async getAllCharacters(userId = null) {
    const params = userId ? { userId } : {};
    return this.api.get(this.endpoint, params);
  }

  async getCharacter(id) {
    return this.api.get(`${this.endpoint}/${id}`);
  }

  async createCharacter(characterData) {
    return this.api.post(this.endpoint, characterData);
  }

  async updateCharacter(id, characterData) {
    return this.api.put(`${this.endpoint}/${id}`, characterData);
  }

  async deleteCharacter(id) {
    return this.api.delete(`${this.endpoint}/${id}`);
  }
}

// Export a singleton instance
const characterService = new CharacterService();
export default characterService;