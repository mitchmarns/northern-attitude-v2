// Main application logic
let db;
let dbAccess;
let currentUser = 'user1'; // Default user

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize database
        db = await initDatabase();
        dbAccess = new DBAccess(db);
        
        // Setup event listeners
        setupNavigation();
        setupCharacterHandlers();
        setupSceneHandlers();
        setupSettingsHandlers();
        setupUserSelection();
        
        // Initial data load
        await loadCharacters();
        await loadScenes();
    } catch (error) {
        console.error('Application initialization error:', error);
        alert('Failed to initialize the application. Please refresh the page.');
    }
});

// Navigation
function setupNavigation() {
    const charactersBtn = document.getElementById('characters-btn');
    const scenesBtn = document.getElementById('scenes-btn');
    const settingsBtn = document.getElementById('settings-btn');
    
    charactersBtn.addEventListener('click', () => switchSection('characters'));
    scenesBtn.addEventListener('click', () => switchSection('scenes'));
    settingsBtn.addEventListener('click', () => switchSection('settings'));
}

function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active-section');
    
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${sectionName}-btn`).classList.add('active');
}

// User Selection
function setupUserSelection() {
    const userSelect = document.getElementById('user-select');
    
    userSelect.addEventListener('change', async () => {
        currentUser = userSelect.value;
        await loadCharacters(); // Reload characters for the selected user
    });
}

// Character Handling
function setupCharacterHandlers() {
    const addCharacterBtn = document.getElementById('add-character-btn');
    const characterModal = document.getElementById('character-modal');
    const characterForm = document.getElementById('character-form');
    const closeButtons = characterModal.querySelectorAll('.close-modal, .close-btn');
    
    // Open modal for new character
    addCharacterBtn.addEventListener('click', () => {
        document.getElementById('character-modal-title').textContent = 'New Character';
        document.getElementById('character-form').reset();
        document.getElementById('character-id').value = '';
        characterModal.style.display = 'block';
    });
    
    // Close modal
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            characterModal.style.display = 'none';
        });
    });
    
    // Save character
    characterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const characterId = document.getElementById('character-id').value;
        const character = {
            name: document.getElementById('character-name').value,
            portrait: document.getElementById('character-portrait').value || '/img/default-portrait.jpg',
            age: document.getElementById('character-age').value,
            description: document.getElementById('character-description').value,
            bio: document.getElementById('character-bio').value,
            userId: currentUser
        };
        
        try {
            if (characterId) {
                // Update existing character
                character.id = parseInt(characterId);
                await dbAccess.updateCharacter(character);
            } else {
                // Add new character
                await dbAccess.addCharacter(character);
            }
            
            characterModal.style.display = 'none';
            await loadCharacters();
        } catch (error) {
            console.error('Error saving character:', error);
            alert('Failed to save character. Please try again.');
        }
    });
    
    // Setup delegation for edit and delete buttons
    document.getElementById('character-list').addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-character')) {
            const characterId = parseInt(e.target.dataset.id);
            editCharacter(characterId);
        } else if (e.target.classList.contains('delete-character')) {
            const characterId = parseInt(e.target.dataset.id);
            deleteCharacter(characterId);
        }
    });
}

async function loadCharacters() {
    try {
        const characters = await dbAccess.getAllCharacters(currentUser);
        const characterList = document.getElementById('character-list');
        
        characterList.innerHTML = '';
        
        if (characters.length === 0) {
            characterList.innerHTML = '<p class="empty-message">No characters found. Create your first character!</p>';
            return;
        }
        
        characters.forEach(character => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.innerHTML = `
                <img src="${character.portrait || '/img/default-portrait.jpg'}" alt="${character.name}" class="character-portrait" onerror="this.src='/img/default-portrait.jpg'">
                <div class="character-info">
                    <h3 class="character-name">${character.name}</h3>
                    <p class="character-details">${character.age ? `Age: ${character.age}` : ''}</p>
                    <p class="character-details">${character.description || ''}</p>
                    <div class="card-actions">
                        <button class="secondary-btn edit-character" data-id="${character.id}">Edit</button>
                        <button class="secondary-btn delete-character" data-id="${character.id}">Delete</button>
                    </div>
                </div>
            `;
            
            characterList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading characters:', error);
        alert('Failed to load characters. Please refresh the page.');
    }
}

async function editCharacter(characterId) {
    try {
        const character = await dbAccess.getCharacter(characterId);
        
        document.getElementById('character-modal-title').textContent = 'Edit Character';
        document.getElementById('character-id').value = character.id;
        document.getElementById('character-name').value = character.name;
        document.getElementById('character-portrait').value = character.portrait;
        document.getElementById('character-age').value = character.age || '';
        document.getElementById('character-description').value = character.description || '';
        document.getElementById('character-bio').value = character.bio || '';
        
        document.getElementById('character-modal').style.display = 'block';
    } catch (error) {
        console.error('Error editing character:', error);
        alert('Failed to load character data. Please try again.');
    }
}

async function deleteCharacter(characterId) {
    if (confirm('Are you sure you want to delete this character?')) {
        try {
            await dbAccess.deleteCharacter(characterId);
            await loadCharacters();
        } catch (error) {
            console.error('Error deleting character:', error);
            alert('Failed to delete character. Please try again.');
        }
    }
}

// Scene Handling
function setupSceneHandlers() {
    const addSceneBtn = document.getElementById('add-scene-btn');
    const sceneModal = document.getElementById('scene-modal');
    const sceneForm = document.getElementById('scene-form');
    const closeButtons = sceneModal.querySelectorAll('.close-modal, .close-btn');
    const sceneViewModal = document.getElementById('scene-view-modal');
    const sceneViewCloseButton = sceneViewModal.querySelector('.close-modal');
    
    // Open modal for new scene
    addSceneBtn.addEventListener('click', async () => {
        document.getElementById('scene-modal-title').textContent = 'New Scene';
        document.getElementById('scene-form').reset();
        document.getElementById('scene-id').value = '';
        
        // Load characters for scene selection
        await loadCharactersForSceneSelection();
        
        sceneModal.style.display = 'block';
    });
    
    // Close modals
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sceneModal.style.display = 'none';
        });
    });
    
    sceneViewCloseButton.addEventListener('click', () => {
        sceneViewModal.style.display = 'none';
    });
    
    // Save scene
    sceneForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const sceneId = document.getElementById('scene-id').value;
        
        // Get selected characters
        const characterCheckboxes = document.querySelectorAll('#scene-characters input[type="checkbox"]:checked');
        const characterIds = Array.from(characterCheckboxes).map(cb => parseInt(cb.value));
        
        const scene = {
            title: document.getElementById('scene-title').value,
            location: document.getElementById('scene-location').value,
            description: document.getElementById('scene-description').value,
            characterIds: characterIds,
            created: new Date().toISOString()
        };
        
        try {
            if (sceneId) {
                // Update existing scene
                scene.id = parseInt(sceneId);
                await dbAccess.updateScene(scene);
            } else {
                // Add new scene
                await dbAccess.addScene(scene);
            }
            
            sceneModal.style.display = 'none';
            await loadScenes();
        } catch (error) {
            console.error('Error saving scene:', error);
            alert('Failed to save scene. Please try again.');
        }
    });
    
    // Setup delegation for scene actions
    document.getElementById('scene-list').addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-scene')) {
            const sceneId = parseInt(e.target.dataset.id);
            editScene(sceneId);
        } else if (e.target.classList.contains('delete-scene')) {
            const sceneId = parseInt(e.target.dataset.id);
            deleteScene(sceneId);
        } else if (e.target.classList.contains('view-scene') || e.target.closest('.view-scene')) {
            const button = e.target.classList.contains('view-scene') ? e.target : e.target.closest('.view-scene');
            const sceneId = parseInt(button.dataset.id);
            viewScene(sceneId);
        }
    });
    
    // Post submission
    document.getElementById('submit-post').addEventListener('click', async () => {
        const characterId = document.getElementById('post-character-select').value;
        const content = document.getElementById('post-content').value;
        const sceneId = parseInt(document.getElementById('view-scene-title').dataset.sceneId);
        
        if (!characterId || !content.trim()) {
            alert('Please select a character and enter content.');
            return;
        }
        
        try {
            const post = {
                sceneId: sceneId,
                characterId: parseInt(characterId),
                content: content,
                timestamp: new Date().toISOString()
            };
            
            await dbAccess.addPost(post);
            
            // Clear form and refresh posts
            document.getElementById('post-content').value = '';
            await loadScenePosts(sceneId);
        } catch (error) {
            console.error('Error adding post:', error);
            alert('Failed to add post. Please try again.');
        }
    });
}

async function loadCharactersForSceneSelection() {
    try {
        const characters = await dbAccess.getAllCharacters(); // Get all characters, not just current user's
        const charactersContainer = document.getElementById('scene-characters');
        
        charactersContainer.innerHTML = '';
        
        if (characters.length === 0) {
            charactersContainer.innerHTML = '<p>No characters available. Create characters first.</p>';
            return;
        }
        
        characters.forEach(character => {
            const checkbox = document.createElement('div');
            checkbox.className = 'checkbox-item';
            checkbox.innerHTML = `
                <input type="checkbox" id="char-${character.id}" value="${character.id}" name="characters">
                <label for="char-${character.id}">${character.name} (${character.userId})</label>
            `;
            
            charactersContainer.appendChild(checkbox);
        });
    } catch (error) {
        console.error('Error loading characters for scene:', error);
    }
}

async function loadScenes() {
    try {
        const scenes = await dbAccess.getAllScenes();
        const sceneList = document.getElementById('scene-list');
        
        sceneList.innerHTML = '';
        
        if (scenes.length === 0) {
            sceneList.innerHTML = '<p class="empty-message">No scenes found. Create your first scene!</p>';
            return;
        }
        
        scenes.forEach(scene => {
            const card = document.createElement('div');
            card.className = 'scene-card';
            
            const created = new Date(scene.created);
            const formattedDate = created.toLocaleDateString();
            
            card.innerHTML = `
                <div class="scene-info">
                    <h3 class="scene-title">${scene.title}</h3>
                    <p class="scene-details">Location: ${scene.location || 'Not specified'}</p>
                    <p class="scene-details">Created: ${formattedDate}</p>
                    <p class="scene-details">Characters: ${scene.characterIds?.length || 0}</p>
                    <div class="card-actions">
                        <button class="secondary-btn edit-scene" data-id="${scene.id}">Edit</button>
                        <button class="primary-btn view-scene" data-id="${scene.id}">View</button>
                        <button class="secondary-btn delete-scene" data-id="${scene.id}">Delete</button>
                    </div>
                </div>
            `;
            
            sceneList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading scenes:', error);
        alert('Failed to load scenes. Please refresh the page.');
    }
}

async function editScene(sceneId) {
    try {
        const scene = await dbAccess.getScene(sceneId);
        
        document.getElementById('scene-modal-title').textContent = 'Edit Scene';
        document.getElementById('scene-id').value = scene.id;
        document.getElementById('scene-title').value = scene.title;
        document.getElementById('scene-location').value = scene.location || '';
        document.getElementById('scene-description').value = scene.description || '';
        
        // Load characters for scene selection
        await loadCharactersForSceneSelection();
        
        // Check characters that belong to the scene
        scene.characterIds.forEach(charId => {
            const checkbox = document.getElementById(`char-${charId}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        document.getElementById('scene-modal').style.display = 'block';
    } catch (error) {
        console.error('Error editing scene:', error);
        alert('Failed to load scene data. Please try again.');
    }
}

async function deleteScene(sceneId) {
    if (confirm('Are you sure you want to delete this scene? All posts in this scene will also be deleted.')) {
        try {
            await dbAccess.deleteScene(sceneId);
            await loadScenes();
        } catch (error) {
            console.error('Error deleting scene:', error);
            alert('Failed to delete scene. Please try again.');
        }
    }
}

async function viewScene(sceneId) {
    try {
        const scene = await dbAccess.getScene(sceneId);
        const charactersInScene = await Promise.all(
            scene.characterIds.map(id => dbAccess.getCharacter(id))
        );
        
        // Set scene details
        const titleElement = document.getElementById('view-scene-title');
        titleElement.textContent = scene.title;
        titleElement.dataset.sceneId = scene.id;
        
        document.getElementById('view-scene-location').textContent = scene.location || 'Not specified';
        
        const created = new Date(scene.created);
        document.getElementById('view-scene-date').textContent = created.toLocaleDateString();
        
        document.getElementById('view-scene-description').textContent = scene.description || 'No description provided.';
        
        // Display character avatars
        const characterAvatars = document.getElementById('view-scene-characters');
        characterAvatars.innerHTML = '';
        
        charactersInScene.forEach(character => {
            const avatar = document.createElement('img');
            avatar.className = 'character-avatar';
            avatar.src = character.portrait || '/img/default-portrait.jpg';
            avatar.alt = character.name;
            avatar.title = character.name;
            avatar.onerror = () => { avatar.src = '/img/default-portrait.jpg'; };
            
            characterAvatars.appendChild(avatar);
        });
        
        // Populate character select for posting
        const characterSelect = document.getElementById('post-character-select');
        characterSelect.innerHTML = '<option value="">Select a character...</option>';
        
        // Filter characters by current user
        const userCharacters = charactersInScene.filter(char => char.userId === currentUser);
        
        userCharacters.forEach(character => {
            const option = document.createElement('option');
            option.value = character.id;
            option.textContent = character.name;
            characterSelect.appendChild(option);
        });
        
        // Load posts
        await loadScenePosts(sceneId);
        
        // Show modal
        document.getElementById('scene-view-modal').style.display = 'block';
    } catch (error) {
        console.error('Error viewing scene:', error);
        alert('Failed to load scene. Please try again.');
    }
}

async function loadScenePosts(sceneId) {
    try {
        const posts = await dbAccess.getScenePosts(sceneId);
        const postsContainer = document.getElementById('scene-posts-container');
        
        postsContainer.innerHTML = '';
        
        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="empty-message">No posts yet. Be the first to contribute!</p>';
            return;
        }
        
        for (const post of posts) {
            const character = await dbAccess.getCharacter(post.characterId);
            const postElement = document.createElement('div');
            postElement.className = 'post';
            
            const timestamp = new Date(post.timestamp);
            const formattedTime = timestamp.toLocaleString();
            
            postElement.innerHTML = `
                <div class="post-header">
                    <img src="${character.portrait || '/img/default-portrait.jpg'}" alt="${character.name}" class="post-avatar" onerror="this.src='/img/default-portrait.jpg'">
                    <span class="post-character">${character.name}</span>
                    <span class="post-timestamp">${formattedTime}</span>
                </div>
                <div class="post-content">${post.content}</div>
            `;
            
            postsContainer.appendChild(postElement);
        }
        
        // Scroll to bottom of posts
        postsContainer.scrollTop = postsContainer.scrollHeight;
    } catch (error) {
        console.error('Error loading posts:', error);
        alert('Failed to load posts. Please try again.');
    }
}

// Settings Handling
function setupSettingsHandlers() {
    const exportDbBtn = document.getElementById('export-db-btn');
    const importDbBtn = document.getElementById('import-db-btn');
    const dbFileInput = document.getElementById('db-file-input');
    const fontSizeSelect = document.getElementById('font-size');
    
    // Export database
    exportDbBtn.addEventListener('click', async () => {
        try {
            const data = await dbAccess.exportDatabase();
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(dataBlob);
            downloadLink.download = `character-universe-export-${new Date().toISOString().slice(0, 10)}.json`;
            downloadLink.click();
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export database. Please try again.');
        }
    });
    
    // Import database
    importDbBtn.addEventListener('click', () => {
        dbFileInput.click();
    });
    
    dbFileInput.addEventListener('change', async (e) => {
        if (!e.target.files.length) return;
        
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (confirm('Importing will replace all current data. Continue?')) {
                    await dbAccess.importDatabase(data);
                    
                    // Refresh data
                    await loadCharacters();
                    await loadScenes();
                    
                    alert('Database imported successfully!');
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Failed to import database. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
    });
    
    // Font size
    fontSizeSelect.addEventListener('change', () => {
        const size = fontSizeSelect.value;
        document.body.style.fontSize = size === 'small' ? '0.9rem' : size === 'large' ? '1.1rem' : '1rem';
        localStorage.setItem('fontSize', size);
    });
    
    // Load saved font size preference
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        fontSizeSelect.value = savedFontSize;
        document.body.style.fontSize = savedFontSize === 'small' ? '0.9rem' : savedFontSize === 'large' ? '1.1rem' : '1rem';
    }
}