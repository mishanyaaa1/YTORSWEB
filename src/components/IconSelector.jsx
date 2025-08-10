import React, { useState } from 'react';
import './IconSelector.css';

const AVAILABLE_ICONS = [
  '🏆', '📦', '🚚', '✅', '⚙️', '🛡️', '💼', '👥', '🔧', '⭐',
  '🎯', '💡', '🔥', '💪', '🚀', '⚡', '🎁', '📈', '🏅', '🎪',
  '🎨', '🔬', '🏗️', '🌟', '💎', '🎊', '🎯', '🎪', '🔑', '🛠️',
  '📊', '📋', '📱', '💻', '🖥️', '⚙️', '🔧', '🔨', '🛡️', '🔒',
  '🎓', '🏆', '🥇', '🥈', '🥉', '🏅', '⭐', '🌟', '✨', '💫'
];

export default function IconSelector({ value, onChange, placeholder = "Выберите иконку" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = AVAILABLE_ICONS.filter(icon => 
    icon.includes(searchTerm) || searchTerm === ''
  );

  const handleIconSelect = (icon) => {
    onChange(icon);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="icon-selector">
      <button
        type="button"
        className="icon-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="selected-icon">{value || '🎯'}</span>
        <span className="icon-text">{value ? 'Иконка выбрана' : placeholder}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="icon-dropdown">
          <div className="icon-search">
            <input
              type="text"
              placeholder="Поиск иконки..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="icon-search-input"
            />
          </div>
          <div className="icon-grid">
            {filteredIcons.map((icon, index) => (
              <button
                key={index}
                type="button"
                className={`icon-option ${value === icon ? 'selected' : ''}`}
                onClick={() => handleIconSelect(icon)}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
