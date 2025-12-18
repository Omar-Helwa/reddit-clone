import React, { useState } from 'react';
import './SortDropdown.css';

const SortDropdown = ({ onSortChange, currentSort = 'BEST' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'BEST', label: 'Best' },
    { value: 'HOT', label: 'Hot' },
    { value: 'NEW', label: 'New' },
    { value: 'TOP', label: 'Top' },
    { value: 'RISING', label: 'Rising' }
  ];

  const handleSelect = (value) => {
    onSortChange(value);
    setIsOpen(false);
  };

  const currentLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Best';

  return (
    <div className="sort-dropdown">
      <button
        className="sort-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="sort-label">{currentLabel}</span>
        <span className="sort-icon">▼</span>
      </button>

      {isOpen && (
        <div className="sort-dropdown-menu" role="menu">
          {sortOptions.map(option => (
            <button
              key={option.value}
              className={`sort-option ${option.value === currentSort ? 'active' : ''}`}
              onClick={() => handleSelect(option.value)}
              role="menuitem"
            >
              <span className="option-label">{option.label}</span>
              {option.value === currentSort && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
