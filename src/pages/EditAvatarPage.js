import React, { useState, useEffect } from 'react';
import './EditAvatarPage.css';
import { updateCurrentUser, getAvatarSettings, isLoggedIn } from '../utils/auth';

function EditAvatarPage({ onNavigate }) {
  const [selectedAvatar, setSelectedAvatar] = useState('👽');
  const [selectedTab, setSelectedTab] = useState('faces');
  const [backgroundColor, setBackgroundColor] = useState(null);

  // Load saved avatar settings on mount
  useEffect(() => {
    const settings = getAvatarSettings();
    if (settings.emoji) {
      setSelectedAvatar(settings.emoji);
    }
    if (settings.bgColor) {
      setBackgroundColor(settings.bgColor);
    }
  }, []);

  const avatars = {
    faces: ['👽', '😀', '😎', '🤓', '😇', '🥳', '🤩', '😺', '🐶', '🐻', '🐼', '🦊', '🐱', '🐵', '🦁'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
    nature: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌲', '🌴', '🌵', '🍀', '🍁', '🍂', '🌿', '🌾', '🌱', '🍄'],
    food: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧀', '🍩', '🍪', '🎂', '🍰', '🧁', '🍦', '🍨', '🍧', '🥤'],
    objects: ['⚽', '🏀', '🎮', '🎲', '🎯', '🎸', '🎹', '🎨', '🎭', '🎪', '🎬', '📚', '💎', '🎁', '🔮'],
    symbols: ['❤️', '💙', '💚', '💛', '💜', '🖤', '🤍', '⭐', '✨', '💫', '⚡', '🔥', '💥', '💢', '🌟'],
  };

  const colors = [
    { name: 'Default', value: null },
    { name: 'Red', value: '#ff4500' },
    { name: 'Orange', value: '#ff8700' },
    { name: 'Yellow', value: '#ffd635' },
    { name: 'Green', value: '#00a368' },
    { name: 'Blue', value: '#0079d3' },
    { name: 'Purple', value: '#7c53db' },
    { name: 'Pink', value: '#ff66ac' },
  ];

  const handleSave = () => {
    // Save to localStorage via auth utility
    updateCurrentUser({
      avatarEmoji: selectedAvatar,
      avatarBgColor: backgroundColor
    });
    
    // Navigate back to profile
    if (onNavigate) {
      onNavigate('profile', '/profile');
    }
  };

  return (
    <div className="edit-avatar-page">
      <div className="edit-avatar-container">
        {/* Header */}
        <div className="edit-avatar-header">
          <button className="back-button" onClick={() => onNavigate('/settings')}>
            ← Back to Settings
          </button>
          <h1 className="edit-avatar-title">Edit Avatar</h1>
          <p className="edit-avatar-subtitle">
            Choose an emoji to represent you on Reddit
          </p>
        </div>

        <div className="edit-avatar-layout">
          {/* Preview */}
          <div className="avatar-preview-section">
            <div className="preview-card">
              <h2>Preview</h2>
              <div
                className="avatar-preview-large"
                style={{ backgroundColor: backgroundColor || 'var(--card-bg)' }}
              >
                {selectedAvatar}
              </div>
              <p className="preview-text">This is how your avatar will appear</p>
            </div>

            <div className="color-picker-section">
              <h3>Background Color</h3>
              <div className="color-grid">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    className={`color-option ${backgroundColor === color.value ? 'selected' : ''}`}
                    style={{
                      backgroundColor: color.value || 'var(--card-bg)',
                      border: color.value ? 'none' : '2px solid var(--card-border)',
                    }}
                    onClick={() => setBackgroundColor(color.value)}
                    title={color.name}
                  >
                    {backgroundColor === color.value && '✓'}
                  </button>
                ))}
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-save" onClick={handleSave}>
                Save Avatar
              </button>
              <button className="btn-cancel" onClick={() => onNavigate('/settings')}>
                Cancel
              </button>
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="avatar-selection-section">
            <div className="avatar-tabs">
              <button
                className={`avatar-tab ${selectedTab === 'faces' ? 'active' : ''}`}
                onClick={() => setSelectedTab('faces')}
              >
                😀 Faces
              </button>
              <button
                className={`avatar-tab ${selectedTab === 'animals' ? 'active' : ''}`}
                onClick={() => setSelectedTab('animals')}
              >
                🐶 Animals
              </button>
              <button
                className={`avatar-tab ${selectedTab === 'nature' ? 'active' : ''}`}
                onClick={() => setSelectedTab('nature')}
              >
                🌸 Nature
              </button>
              <button
                className={`avatar-tab ${selectedTab === 'food' ? 'active' : ''}`}
                onClick={() => setSelectedTab('food')}
              >
                🍕 Food
              </button>
              <button
                className={`avatar-tab ${selectedTab === 'objects' ? 'active' : ''}`}
                onClick={() => setSelectedTab('objects')}
              >
                ⚽ Objects
              </button>
              <button
                className={`avatar-tab ${selectedTab === 'symbols' ? 'active' : ''}`}
                onClick={() => setSelectedTab('symbols')}
              >
                ⭐ Symbols
              </button>
            </div>

            <div className="avatar-grid">
              {avatars[selectedTab].map((avatar, index) => (
                <button
                  key={index}
                  className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditAvatarPage;
