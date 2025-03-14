import ApiService from './api';

class PostService {
  constructor() {
    this.api = new ApiService();
    this.endpoint = '/posts';
  }

  async createPost(postData) {
    return this.api.post(this.endpoint, postData);
  }
}

// Export a singleton instance
const postService = new PostService();
export default postService;