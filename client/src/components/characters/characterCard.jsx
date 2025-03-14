import React from 'react';

const CharacterCard = ({ character, onEdit, onDelete }) => {
  const { name, portrait, age, description } = character;
  
  const handleImageError = (e) => {
    e.target.src = '/assets/img/default-portrait.jpg';
  };

  return (
    <div className="character-card">
      <img
        src={portrait || '/assets/img/default-portrait.jpg'}
        alt={name}
        className="character-portrait"
        onError={handleImageError}
      />
      <div className="character-info">
        <h3 className="character-name">{name}</h3>
        {age && <p className="character-details">Age: {age}</p>}
        {description && <p className="character-details">{description}</p>}
        <div className="card-actions">
          <button className="secondary-btn" onClick={onEdit}>
            Edit
          </button>
          <button className="secondary-btn" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;