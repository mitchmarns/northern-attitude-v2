import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

/**
 * Character form component
 * Used for creating and editing characters
 * 
 * @param {Object} props - Component props
 * @param {Object} props.character - Character data for editing (null for new character)
 * @param {string} props.currentUser - Current user ID
 * @param {Function} props.onSave - Save handler
 * @param {Function} props.onClose - Close handler
 */
const CharacterForm = ({ character, currentUser, onSave, onClose }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    portrait: '',
    age: '',
    description: '',
    bio: '',
    userId: currentUser
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Initialize form with character data if editing
  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name || '',
        portrait: character.portrait || '',
        age: character.age || '',
        description: character.description || '',
        bio: character.bio || '',
        userId: currentUser
      });
    }
  }, [character, currentUser]);

  /**
   * Update form data when inputs change
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  /**
   * Validate the form
   * @returns {boolean} True if form is valid
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Age validation (if provided)
    if (formData.age && (isNaN(formData.age) || Number(formData.age) < 0)) {
      newErrors.age = 'Age must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * @param {Object} e - Event object
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert age to number if provided
      const finalData = {
        ...formData,
        age: formData.age ? Number(formData.age) : null
      };
      
      onSave(finalData);
    }
  };

  return (
    <Modal
      title={character ? 'Edit Character' : 'New Character'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <div className="error-text">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="portrait">Portrait URL</label>
          <input
            type="text"
            id="portrait"
            name="portrait"
            value={formData.portrait}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="0"
          />
          {errors.age && <div className="error-text">{errors.age}</div>}
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
          <label htmlFor="bio">Biography</label>
          <textarea
            id="bio"
            name="bio"
            rows="6"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="primary-btn">
            Save Character
          </button>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CharacterForm;