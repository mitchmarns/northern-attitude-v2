// client/src/components/scenes/SceneForm.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../common/modal';
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