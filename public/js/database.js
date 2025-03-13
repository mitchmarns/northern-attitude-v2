// API-based database access
class DBAccess {
    constructor() {
        this.apiBase = '/api';
    }
    
    // API request helper
    async _apiRequest(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, options);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }
            
            if (method === 'DELETE') {
                return response.ok;
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
    
    // Characters
    async addCharacter(character) {
        return this._apiRequest('/characters', 'POST', character);
    }
    
    async updateCharacter(character) {
        return this._apiRequest(`/characters/${character.id}`, 'PUT', character);
    }
    
    async deleteCharacter(id) {
        return this._apiRequest(`/characters/${id}`, 'DELETE');
    }
    
    async getCharacter(id) {
        return this._apiRequest(`/characters/${id}`);
    }
    
    async getAllCharacters(userId = null) {
        const endpoint = userId ? `/characters?userId=${userId}` : '/characters';
        return this._apiRequest(endpoint);
    }
    
    // Scenes
    async addScene(scene) {
        return this._apiRequest('/scenes', 'POST', scene);
    }
    
    async updateScene(scene) {
        return this._apiRequest(`/scenes/${scene.id}`, 'PUT', scene);
    }
    
    async deleteScene(id) {
        return this._apiRequest(`/scenes/${id}`, 'DELETE');
    }
    
    async getScene(id) {
        return this._apiRequest(`/scenes/${id}`);
    }
    
    async getAllScenes() {
        return this._apiRequest('/scenes');
    }
    
    // Posts
    async addPost(post) {
        return this._apiRequest('/posts', 'POST', post);
    }
    
    async getScenePosts(sceneId) {
        return this._apiRequest(`/scenes/${sceneId}/posts`);
    }
    
    // Export and import functionality should be implemented with server-side endpoints
    // These methods are left as placeholders
    async exportDatabase() {
        // Could implement via a dedicated export endpoint
        console.warn('Database export not implemented in server mode');
        return { characters: [], scenes: [], posts: [] };
    }
    
    async importDatabase(data) {
        // Could implement via a dedicated import endpoint
        console.warn('Database import not implemented in server mode');
    }
}

// Initialize the database access
const initDatabase = async () => {
    // No actual initialization needed for the API-based approach
    return new DBAccess();
};