import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/app';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// client/src/components/App.jsx
import React, { useState, useEffect } from 'react';
import Header from './common/Header';
import CharacterList from './characters/CharacterList';
import SceneList from './scenes/SceneList';
import SettingsPanel from './settings/SettingsPanel';

const App = () => {
  // App state
  const [activeSection, setActiveSection] = useState('characters');
  const [currentUser, setCurrentUser] = useState('user1');
  const [fontSize, setFontSize] = useState('medium');

  // Load saved preferences
  useEffect(() => {
    // Load user preference
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
    }

    // Load font size preference
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      setFontSize(savedFontSize);
      applyFontSize(savedFontSize);
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('currentUser', currentUser);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    applyFontSize(fontSize);
  }, [fontSize]);

  // Apply font size to body
  const applyFontSize = (size) => {
    document.body.style.fontSize = 
      size === 'small' ? '0.9rem' : 
      size === 'large' ? '1.1rem' : 
      '1rem';
  };

  // Handle section change
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Handle user change
  const handleUserChange = (userId) => {
    setCurrentUser(userId);
  };

  // Handle font size change
  const handleFontSizeChange = (size) => {
    setFontSize(size);
  };

  // Render active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'characters':
        return <CharacterList currentUser={currentUser} />;
      case 'scenes':
        return <SceneList currentUser={currentUser} />;
      case 'settings':
        return (
          <SettingsPanel 
            fontSize={fontSize} 
            onFontSizeChange={handleFontSizeChange} 
          />
        );
      default:
        return <CharacterList currentUser={currentUser} />;
    }
  };

  return (
    <div className="app-container">
      <Header 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        currentUser={currentUser}
        onUserChange={handleUserChange}
      />
      
      <main id="main-content">
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default App;