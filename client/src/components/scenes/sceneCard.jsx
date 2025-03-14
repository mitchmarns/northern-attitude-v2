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