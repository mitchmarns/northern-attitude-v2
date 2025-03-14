import React from 'react';

const Navigation = ({ activeSection, onSectionChange }) => {
  const navItems = [
    { id: 'characters', label: 'Characters' },
    { id: 'scenes', label: 'Scenes' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="nav-links">
      {navItems.map(item => (
        <button
          key={item.id}
          id={`${item.id}-btn`}
          className={`nav-btn ${activeSection === item.id ? 'active' : ''}`}
          onClick={() => onSectionChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Navigation;