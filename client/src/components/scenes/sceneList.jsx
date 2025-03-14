// client/src/components/scenes/SceneList.jsx
import React, { useState, useEffect } from 'react';
import sceneService from '../../services/sceneService';
import SceneCard from './SceneCard';
import SceneForm from './SceneForm';
import './scene.css';

const SceneList = ({ currentUser }) => {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentScene, setCurrentScene] = useState(null);

  // Load scenes when component mounts
  useEffect(() => {
    loadScenes();
  }, []);

  const loadScenes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sceneService.getAllScenes();
      setScenes(data);
    } catch (err) {
      setError('Failed to load scenes. Please try again.');
      console.error('Error loading scenes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddScene = () => {
    setCurrentScene(null);
    setShowForm(true);
  };

  const handleEditScene = (scene) => {
    setCurrentScene(scene);
    setShowForm(true);
  };

  const handleDeleteScene = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scene? All posts in this scene will also be deleted.')) {
      return;
    }
    
    try {
      await sceneService.deleteScene(id);
      await loadScenes();
    } catch (err) {
      setError('Failed to delete scene. Please try again.');
      console.error('Error deleting scene:', err);
    }
  };

  const handleSaveScene = async (sceneData) => {
    try {
      if (currentScene) {
        // Update existing scene
        await sceneService.updateScene(currentScene.id, {
          ...sceneData,
          id: currentScene.id
        });
      } else {
        // Create new scene
        await sceneService.createScene(sceneData);
      }
      
      setShowForm(false);
      await loadScenes();
    } catch (err) {
      setError('Failed to save scene. Please try again.');
      console.error('Error saving scene:', err);
    }
  };

  const handleViewScene = async (sceneId) => {
    // This will be implemented in the next step with SceneView component
    alert('Scene view functionality will be implemented soon.');
  };

  return (
    <div className="scene-list-container">
      <div className="section-header">
        <h2>Active Scenes</h2>
        <button className="action-btn" onClick={handleAddScene}>
          + New Scene
        </button>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading state */}
      {loading ? (
        <div className="loading">Loading scenes...</div>
      ) : (
        <div className="card-grid">
          {scenes.length === 0 ? (
            <p className="empty-message">
              No scenes found. Create your first scene!
            </p>
          ) : (
            scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                onView={() => handleViewScene(scene.id)}
                onEdit={() => handleEditScene(scene)}
                onDelete={() => handleDeleteScene(scene.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Scene form modal */}
      {showForm && (
        <SceneForm
          scene={currentScene}
          onSave={handleSaveScene}
          onClose={() => setShowForm(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default SceneList;

// client/src/components/scenes/SceneCard.jsx
import React from 'react';

const SceneCard = ({ scene, onView, onEdit, onDelete }) => {
  const { title, location, created, characterIds = [] } = scene;
  
  // Format date for display
  const formattedDate = new Date(created).toLocaleDateString();
  
  return (
    <div className="scene-card">
      <div className="scene-info">
        <h3 className="scene-title">{title}</h3>
        <p className="scene-details">Location: {location || 'Not specified'}</p>
        <p className="scene-details">Created: {formattedDate}</p>
        <p className="scene-details">
          Characters: {characterIds.length}
        </p>
        <div className="card-actions">
          <button className="secondary-btn" onClick={onEdit}>
            Edit
          </button>
          <button className="primary-btn" onClick={onView}>
            View
          </button>
          <button className="secondary-btn" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default SceneCard;

// client/src/components/scenes/SceneForm.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import characterService from '../../services/characterService';

const SceneForm = ({ scene, onSave, onClose, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    characterIds: []
  });
  
  const [errors, setErrors] = useState({});
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load characters and initialize form data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // Load all characters for selection
        const charactersData = await characterService.getAllCharacters();
        setCharacters(charactersData);
        
        // If editing, populate form with scene data
        if (scene) {
          setFormData({
            title: scene.title || '',
            location: scene.location || '',
            description: scene.description || '',
            characterIds: scene.characterIds || []
          });
        }
      } catch (err) {
        console.error('Error initializing scene form:', err);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [scene]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const handleCharacterChange = (e) => {
    const characterId = parseInt(e.target.value);
    const isChecked = e.target.checked;
    
    setFormData(prev => {
      if (isChecked) {
        // Add character ID if it's not already in the array
        return {
          ...prev,
          characterIds: [...prev.characterIds, characterId]
        };
      } else {
        // Remove character ID from the array
        return {
          ...prev,
          characterIds: prev.characterIds.filter(id => id !== characterId)
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        ...formData,
        created: scene?.created || new Date().toISOString()
      });
    }
  };

  if (loading) {
    return (
      <Modal title="Loading" onClose={onClose}>
        <div className="loading">Loading form data...</div>
      </Modal>
    );
  }

  return (
    <Modal
      title={scene ? 'Edit Scene' : 'New Scene'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          {errors.title && <div className="error-text">{errors.title}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Characters in Scene</label>
          <div className="checkbox-grid">
            {characters.length === 0 ? (
              <p>No characters available. Create characters first.</p>
            ) : (
              characters.map(character => (
                <div key={character.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`char-${character.id}`}
                    value={character.id}
                    checked={formData.characterIds.includes(character.id)}
                    onChange={handleCharacterChange}
                  />
                  <label htmlFor={`char-${character.id}`}>
                    {character.name} ({character.userId})
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="primary-btn">
            Save Scene
          </button>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SceneForm;