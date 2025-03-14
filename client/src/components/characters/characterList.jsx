import React, { useState, useEffect } from 'react';
import CharacterCard from '/CharacterCard';
import CharacterForm from '/CharacterForm';
import characterService from '../../services/characterService';
import './character.css';

const CharacterList = ({ currentUser }) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState(null);

  // Load characters when component mounts or currentUser changes
  useEffect(() => {
    loadCharacters();
  }, [currentUser]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await characterService.getAllCharacters(currentUser);
      setCharacters(data);
    } catch (err) {
      setError('Failed to load characters. Please try again.');
      console.error('Error loading characters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCharacter = () => {
    setCurrentCharacter(null);
    setShowModal(true);
  };

  const handleEditCharacter = (character) => {
    setCurrentCharacter(character);
    setShowModal(true);
  };

  const handleDeleteCharacter = async (id) => {
    if (!window.confirm('Are you sure you want to delete this character?')) {
      return;
    }
    
    try {
      await characterService.deleteCharacter(id);
      await loadCharacters();
    } catch (err) {
      setError('Failed to delete character. Please try again.');
      console.error('Error deleting character:', err);
    }
  };

  const handleSaveCharacter = async (characterData) => {
    try {
      if (currentCharacter) {
        // Update existing character
        await characterService.updateCharacter(currentCharacter.id, {
          ...characterData,
          id: currentCharacter.id
        });
      } else {
        // Create new character
        await characterService.createCharacter(characterData);
      }
      
      setShowModal(false);
      await loadCharacters();
    } catch (err) {
      setError('Failed to save character. Please try again.');
      console.error('Error saving character:', err);
    }
  };

  return (
    <div className="character-list-container">
      <div className="section-header">
        <h2>Your Characters</h2>
        <button className="action-btn" onClick={handleAddCharacter}>
          + New Character
        </button>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading state */}
      {loading ? (
        <div className="loading">Loading characters...</div>
      ) : (
        <div className="card-grid">
          {characters.length === 0 ? (
            <p className="empty-message">
              No characters found. Create your first character!
            </p>
          ) : (
            characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onEdit={() => handleEditCharacter(character)}
                onDelete={() => handleDeleteCharacter(character.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Character form modal */}
      {showModal && (
        <CharacterForm
          character={currentCharacter}
          currentUser={currentUser}
          onSave={handleSaveCharacter}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default CharacterList;