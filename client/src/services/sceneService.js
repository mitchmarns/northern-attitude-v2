import ApiService from './api';

class SceneService {
  constructor() {
    this.api = new ApiService();
    this.endpoint = '/scenes';
  }

  async getAllScenes() {
    return this.api.get(this.endpoint);
  }

  async getScene(id) {
    return this.api.get(`${this.endpoint}/${id}`);
  }

  async createScene(sceneData) {
    return this.api.post(this.endpoint, sceneData);
  }

  async updateScene(id, sceneData) {
    return this.api.put(`${this.endpoint}/${id}`, sceneData);
  }

  async deleteScene(id) {
    return this.api.delete(`${this.endpoint}/${id}`);
  }

  async getScenePosts(sceneId) {
    return this.api.get(`${this.endpoint}/${sceneId}/posts`);
  }
}

// Export a singleton instance
const sceneService = new SceneService();
export default sceneService;