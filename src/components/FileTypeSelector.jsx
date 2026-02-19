import React, { useState } from 'react';

const FileTypeSelector = ({ selectedType, onTypeChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const fileTypes = [
    { id: 'pdf', label: 'PDF', icon: '📄', color: '#FF6B6B' },
    { id: 'docx', label: 'Word', icon: '📝', color: '#4D96FF' },
    { id: 'txt', label: 'Текстовый файл', icon: '📃', color: '#6BCF7F' },
  ];

  const selectedFileType = fileTypes.find(type => type.id === selectedType) || fileTypes[0];

  return (
    <div className={`file-type-selector ${className}`}>
      <label className="selector-label">
        <span className="label-icon">📁</span>
        Формат скачивания:
      </label>
      
      <div className="dropdown-container">
        <button
          className="dropdown-toggle"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="selected-option">
            <span 
              className="type-icon" 
              style={{ backgroundColor: selectedFileType.color }}
            >
              {selectedFileType.icon}
            </span>
            <span className="type-label">{selectedFileType.label}</span>
          </span>
          <span className="dropdown-arrow">▼</span>
        </button>
        
        {isOpen && (
          <>
            <div className="dropdown-backdrop" onClick={() => setIsOpen(false)} />
            <div className="dropdown-menu">
              {fileTypes.map((type) => (
                <div
                  key={type.id}
                  className={`dropdown-item ${selectedType === type.id ? 'selected' : ''}`}
                  onClick={() => {
                    onTypeChange(type.id);
                    setIsOpen(false);
                  }}
                >
                  <span 
                    className="type-icon" 
                    style={{ backgroundColor: type.color }}
                  >
                    {type.icon}
                  </span>
                  <span className="type-label">{type.label}</span>
                  {selectedType === type.id && (
                    <span className="check-icon">✓</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="format-info">
        <small>
          {selectedType === 'pdf' && 'Формат для печати и официальных документов'}
          {selectedType === 'docx' && 'Редактируемый формат для Microsoft Word'}
          {selectedType === 'txt' && 'Простой текст, открывается в любом редакторе'}
        </small>
      </div>
    </div>
  );
};

export default FileTypeSelector;