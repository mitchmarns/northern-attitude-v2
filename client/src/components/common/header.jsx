import React from 'react';
import Navigation from './navigation';

const Header = ({ activeSection, onSectionChange, currentUser, onUserChange }) => {
  const handleUserSelect = (e) => {
    onUserChange(e.target.value);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <h1 className="site-title">Character Universe</h1>
      </div>
      
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={onSectionChange} 
      />
      
      <div className="user-controls">
        <select 
          id="user-select" 
          value={currentUser}
          onChange={handleUserSelect}
        >
          <option value="user1">User 1</option>
          <option value="user2">User 2</option>
        </select>
      </div>
    </nav>
  );
};

export default Header;