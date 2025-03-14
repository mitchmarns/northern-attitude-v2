// client/src/components/settings/SettingsPanel.jsx
import React, { useState } from 'react';

const SettingsPanel = ({ fontSize, onFontSizeChange }) => {
  const [exportStatus, setExportStatus] = useState('');
  const [importStatus, setImportStatus] = useState('');

  // Handle font size change
  const handleFontSizeChange = (e) => {
    onFontSizeChange(e.target.value);
  };

  // Handle database export
  const handleExportDatabase = async () => {
    try {
      setExportStatus('Exporting...');
      
      // This is a simplified version. You'll need to implement the actual export functionality
      // with your API or fetch call to the server
      const response = await fetch('/api/export');
      
      if (!response.ok) {
        throw new Error('Failed to export database');
      }
      
      const data = await response.json();
      
      // Create a download link for the JSON data
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const downloadLink = document.createElement('a');
      
      downloadLink.href = URL.createObjectURL(dataBlob);
      downloadLink.download = `character-universe-export-${new Date().toISOString().slice(0, 10)}.json`;
      downloadLink.click();
      
      setExportStatus('Export successful!');
      
      // Reset status after a delay
      setTimeout(() => {
        setExportStatus('');
      }, 3000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('Export failed. Please try again.');
      
      // Reset status after a delay
      setTimeout(() => {
        setExportStatus('');
      }, 3000);
    }
  };

  // Handle database import
  const handleImportClick = () => {
    // Trigger file input click
    document.getElementById('db-file-input').click();
  };

  // Handle file selection for import
  const handleFileChange = async (e) => {
    if (!e.target.files.length) return;
    
    const file = e.target.files[0];
    
    try {
      setImportStatus('Importing...');
      
      // Read the selected file
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          if (window.confirm('Importing will replace all current data. Continue?')) {
            // This is a simplified version. You'll need to implement the actual import functionality
            // with your API or fetch call to the server
            const response = await fetch('/api/import', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });
            
            if (!response.ok) {
              throw new Error('Failed to import database');
            }
            
            setImportStatus('Import successful!');
            
            // Reset status after a delay
            setTimeout(() => {
              setImportStatus('');
            }, 3000);
          } else {
            setImportStatus('');
          }
        } catch (error) {
          console.error('Import error:', error);
          setImportStatus('Import failed. Please check the file format.');
          
          // Reset status after a delay
          setTimeout(() => {
            setImportStatus('');
          }, 3000);
        }
      };
      
      fileReader.readAsText(file);
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('Import failed. Please try again.');
      
      // Reset status after a delay
      setTimeout(() => {
        setImportStatus('');
      }, 3000);
    }
    
    // Reset the file input
    e.target.value = '';
  };

  return (
    <div>
      <div className="section-header">
        <h2>Settings</h2>
      </div>
      
      <div className="settings-container">
        {/* Database Management */}
        <div className="setting-card">
          <h3>Database Management</h3>
          <div className="setting-actions">
            <button 
              className="secondary-btn" 
              onClick={handleExportDatabase}
              disabled={exportStatus === 'Exporting...'}
            >
              Export Database
            </button>
            {exportStatus && <span className="status-message">{exportStatus}</span>}
          </div>
          
          <div className="setting-actions">
            <button 
              className="secondary-btn" 
              onClick={handleImportClick}
              disabled={importStatus === 'Importing...'}
            >
              Import Database
            </button>
            <input 
              type="file" 
              id="db-file-input" 
              accept=".json" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            {importStatus && <span className="status-message">{importStatus}</span>}
          </div>
        </div>
        
        {/* Display Settings */}
        <div className="setting-card">
          <h3>Display Settings</h3>
          <div className="setting-option">
            <label htmlFor="font-size">Font Size</label>
            <select 
              id="font-size" 
              value={fontSize}
              onChange={handleFontSizeChange}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;