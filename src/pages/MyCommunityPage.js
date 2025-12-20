import React, { useState } from 'react';
import './MyCommunityPage.css';

function MyCommunityPage({ onNavigate }) {
  const handleViewCommunity = () => {
    if (onNavigate) {
      onNavigate('community', '/r/mynewcommunity');
    }
  };
  const handleCreateFirstPost = () => {
    if (onNavigate) {
      onNavigate('create-post', '/r/mynewcommunity/submit');
    }
  };
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock community data (just created)
  const community = {
    name: 'r/mynewcommunity',
    displayName: 'My New Community',
    description: 'A fresh community ready to grow!',
    icon: 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_3.png',
    type: 'Public',
    nsfw: false,
    category: 'Technology',
    members: 1,
    createdDate: new Date().toLocaleDateString()
  };

  const [settings, setSettings] = useState({
    allowImages: true,
    allowVideos: true,
    allowPolls: true,
    requireApproval: false,
    requireFlair: false
  });

  const handleSettingChange = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="my-community-page">
      {/* Success Header */}
      <div className="success-banner">
        <div className="success-content">
          <span className="success-icon">🎉</span>
          <div>
            <h1>Community Created Successfully!</h1>
            <p>Your community <strong>{community.name}</strong> is now live and ready for members.</p>
          </div>
        </div>
      </div>

      {/* Community Info Card */}
      <div className="community-container">
        <div className="community-overview-card">
          <div className="overview-header">
            <img src={community.icon} alt={community.name} className="community-icon" />
            <div>
              <h2>{community.displayName}</h2>
              <p className="community-handle">{community.name}</p>
              <span className="community-badge">{community.type}</span>
            </div>
          </div>

          <div className="community-stats-grid">
            <div className="stat-box">
              <span className="stat-value">{community.members}</span>
              <span className="stat-label">Members</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">0</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">Public</span>
              <span className="stat-label">Type</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{community.category}</span>
              <span className="stat-label">Category</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="primary-action-btn" onClick={handleCreateFirstPost}>📝 Create First Post</button>
            <button className="secondary-action-btn">🔗 Share Community</button>
            <button className="secondary-action-btn" onClick={handleViewCommunity}>👁️ View Community</button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="my-community-nav">
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`nav-tab ${activeTab === 'customize' ? 'active' : ''}`}
            onClick={() => setActiveTab('customize')}
          >
            Customize
          </button>
          <button 
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button 
            className={`nav-tab ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            Rules
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <h3>Next Steps</h3>
              <div className="steps-grid">
                <div className="step-card">
                  <span className="step-icon">🎨</span>
                  <h4>Customize Appearance</h4>
                  <p>Add a banner, update colors, and make your community stand out.</p>
                  <button className="step-btn" onClick={() => setActiveTab('customize')}>Customize</button>
                </div>

                <div className="step-card">
                  <span className="step-icon">📜</span>
                  <h4>Create Rules</h4>
                  <p>Set clear guidelines to keep your community healthy and welcoming.</p>
                  <button className="step-btn" onClick={() => setActiveTab('rules')}>Add Rules</button>
                </div>

                <div className="step-card">
                  <span className="step-icon">📝</span>
                  <h4>Write First Post</h4>
                  <p>Welcome members and set the tone with an introductory post.</p>
                  <button className="step-btn">Create Post</button>
                </div>

                <div className="step-card">
                  <span className="step-icon">👥</span>
                  <h4>Invite Members</h4>
                  <p>Share your community link and invite people to join.</p>
                  <button className="step-btn">Share Link</button>
                </div>

                <div className="step-card">
                  <span className="step-icon">⚙️</span>
                  <h4>Configure Settings</h4>
                  <p>Adjust post types, approval settings, and more.</p>
                  <button className="step-btn" onClick={() => setActiveTab('settings')}>Settings</button>
                </div>

                <div className="step-card">
                  <span className="step-icon">🛡️</span>
                  <h4>Add Moderators</h4>
                  <p>Invite trusted members to help manage your community.</p>
                  <button className="step-btn">Invite Mods</button>
                </div>
              </div>

              <div className="tips-card">
                <h4>💡 Tips for Growing Your Community</h4>
                <ul>
                  <li>Post consistently to keep the community active</li>
                  <li>Engage with every member who joins or comments</li>
                  <li>Cross-promote in related communities (with permission)</li>
                  <li>Use clear, descriptive titles for posts</li>
                  <li>Create weekly discussion threads or events</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'customize' && (
            <div className="customize-content">
              <h3>Appearance</h3>
              <div className="customize-section">
                <h4>Community Icon</h4>
                <div className="icon-preview">
                  <img src={community.icon} alt="Icon" />
                  <button className="upload-btn">Upload New Icon</button>
                </div>
              </div>

              <div className="customize-section">
                <h4>Banner Image</h4>
                <div className="banner-preview">
                  <div className="placeholder-banner">No banner yet</div>
                  <button className="upload-btn">Upload Banner</button>
                </div>
              </div>

              <div className="customize-section">
                <h4>Community Description</h4>
                <textarea 
                  className="description-input"
                  placeholder="Describe your community..."
                  defaultValue={community.description}
                  rows={4}
                />
                <button className="save-btn">Save Description</button>
              </div>

              <div className="customize-section">
                <h4>Color Theme</h4>
                <div className="color-picker-grid">
                  <div className="color-option" style={{ background: '#0079d3' }}></div>
                  <div className="color-option" style={{ background: '#ff4500' }}></div>
                  <div className="color-option" style={{ background: '#46d160' }}></div>
                  <div className="color-option" style={{ background: '#7c4dff' }}></div>
                  <div className="color-option" style={{ background: '#ff6b9d' }}></div>
                  <div className="color-option" style={{ background: '#ffb000' }}></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-content">
              <h3>Post Settings</h3>
              <div className="settings-list">
                <div className="setting-item">
                  <div>
                    <strong>Allow Images</strong>
                    <p>Members can upload images in posts</p>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.allowImages}
                      onChange={() => handleSettingChange('allowImages')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div>
                    <strong>Allow Videos</strong>
                    <p>Members can upload videos in posts</p>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.allowVideos}
                      onChange={() => handleSettingChange('allowVideos')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div>
                    <strong>Allow Polls</strong>
                    <p>Members can create poll posts</p>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.allowPolls}
                      onChange={() => handleSettingChange('allowPolls')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div>
                    <strong>Require Post Approval</strong>
                    <p>All posts must be approved by moderators</p>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.requireApproval}
                      onChange={() => handleSettingChange('requireApproval')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div>
                    <strong>Require Post Flair</strong>
                    <p>Posts must have a flair tag</p>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.requireFlair}
                      onChange={() => handleSettingChange('requireFlair')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <button className="save-settings-btn">Save Settings</button>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="rules-content">
              <h3>Community Rules</h3>
              <p className="rules-description">Create clear rules to help maintain a healthy community.</p>
              
              <div className="rules-list-empty">
                <span className="empty-icon">📜</span>
                <p>No rules yet</p>
                <button className="add-rule-btn">+ Add First Rule</button>
              </div>

              <div className="rule-template">
                <h4>Common Rule Templates</h4>
                <div className="template-buttons">
                  <button className="template-btn">Be respectful</button>
                  <button className="template-btn">No spam</button>
                  <button className="template-btn">Stay on topic</button>
                  <button className="template-btn">No personal attacks</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyCommunityPage;
