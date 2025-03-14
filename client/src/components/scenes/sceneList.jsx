// client/src/components/scenes/SceneList.jsx
import React, { useState, useEffect } from 'react';
import sceneService from '../../services/sceneService';
import SceneCard from '../scenes/sceneCard';
import SceneForm from '../scenes/sceneForm';
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

