import React, { useState } from 'react';
import './SettingsPage.css';

function SettingsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    email: 'user@example.com',
    displayName: 'Nemo',
    about: 'Just another Redditor exploring the internet',
    nsfw: false,
    activityVisible: true,
    contentVisible: true,
    allowFollow: true,
    showInSearch: true,
    emailNotifications: true,
    pushNotifications: false,
    chatRequests: 'everyone',
    autoplay: true,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    alert('Settings saved!');
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">User Settings</h1>

        <div className="settings-layout">
          {/* Sidebar */}
          <div className="settings-sidebar">
            <button
              className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
            <button
              className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`settings-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy & Safety
            </button>
            <button
              className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button
              className={`settings-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat & Messaging
            </button>
          </div>

          {/* Content */}
          <div className="settings-content">
            {activeTab === 'account' && (
              <div className="settings-section">
                <h2>Account Settings</h2>
                
                <div className="settings-group">
                  <label className="settings-label">Email address</label>
                  <input
                    type="email"
                    className="settings-input"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                  <p className="settings-help">
                    We'll send you emails about your account, activity, and updates.
                  </p>
                </div>

                <div className="settings-group">
                  <label className="settings-label">Change password</label>
                  <button className="settings-button">Change Password</button>
                </div>

                <div className="settings-group">
                  <label className="settings-label">Gender</label>
                  <select className="settings-select">
                    <option>I prefer not to say</option>
                    <option>Man</option>
                    <option>Woman</option>
                    <option>Non-binary</option>
                  </select>
                </div>

                <div className="settings-group">
                  <h3>Connected accounts</h3>
                  <div className="connected-accounts">
                    <div className="account-item">
                      <span>🔵 Google</span>
                      <button className="btn-link">Connect</button>
                    </div>
                    <div className="account-item">
                      <span>⚫ Apple</span>
                      <button className="btn-link">Connect</button>
                    </div>
                  </div>
                </div>

                <div className="settings-group">
                  <button className="btn-danger">Delete Account</button>
                  <p className="settings-help">
                    Once you delete your account, there is no going back.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2>Profile Settings</h2>

                <div className="settings-group">
                  <label className="settings-label">Display name</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={formData.displayName}
                    onChange={(e) => handleChange('displayName', e.target.value)}
                  />
                  <p className="settings-help">
                    This is your public display name on Reddit.
                  </p>
                </div>

                <div className="settings-group">
                  <label className="settings-label">About (optional)</label>
                  <textarea
                    className="settings-textarea"
                    rows="4"
                    value={formData.about}
                    onChange={(e) => handleChange('about', e.target.value)}
                  />
                  <p className="settings-help">
                    A brief description of yourself shown on your profile.
                  </p>
                </div>

                <div className="settings-group">
                  <label className="settings-label">Avatar</label>
                  <div className="avatar-preview">
                    <div className="avatar-display">👽</div>
                    <button 
                      className="settings-button"
                      onClick={() => onNavigate('/edit-avatar')}
                    >
                      Edit Avatar
                    </button>
                  </div>
                </div>

                <div className="settings-group">
                  <label className="settings-label">Profile banner</label>
                  <button className="settings-button">Upload Banner</button>
                </div>

                <div className="settings-group">
                  <div className="settings-toggle">
                    <div>
                      <strong>NSFW</strong>
                      <p className="settings-help">
                        This content is NSFW (may contain nudity, pornography, profanity or inappropriate content for those under 18)
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.nsfw}
                        onChange={(e) => handleChange('nsfw', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="settings-section">
                <h2>Privacy & Safety</h2>

                <div className="settings-group">
                  <div className="settings-toggle">
                    <div>
                      <strong>Make my activity visible</strong>
                      <p className="settings-help">
                        Allow others to see your active communities and other activity
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.activityVisible}
                        onChange={(e) => handleChange('activityVisible', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="settings-toggle">
                    <div>
                      <strong>Content visibility</strong>
                      <p className="settings-help">
                        Posts to this profile can appear in r/all and your profile can be discovered in /users
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.contentVisible}
                        onChange={(e) => handleChange('contentVisible', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="settings-toggle">
                    <div>
                      <strong>Allow people to follow you</strong>
                      <p className="settings-help">
                        Followers will be notified about posts you make to your profile and see them in their home feed
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.allowFollow}
                        onChange={(e) => handleChange('allowFollow', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="settings-toggle">
                    <div>
                      <strong>Show up in search results</strong>
                      <p className="settings-help">
                        Allow search engines like Google to link to your profile in their search results
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.showInSearch}
                        onChange={(e) => handleChange('showInSearch', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Blocked users</h3>
                  <p className="settings-help">No blocked users</p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2>Notification Settings</h2>

                <div className="settings-group">
                  <div className="settings-toggle">
                    <div>
                      <strong>Email notifications</strong>
                      <p className="settings-help">
                        Receive email notifications about your account activity
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.emailNotifications}
                        onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="settings-toggle">
                    <div>
                      <strong>Push notifications</strong>
                      <p className="settings-help">
                        Receive push notifications on this device
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.pushNotifications}
                        onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="settings-section">
                <h2>Chat & Messaging</h2>

                <div className="settings-group">
                  <label className="settings-label">Who can send you chat requests</label>
                  <select
                    className="settings-select"
                    value={formData.chatRequests}
                    onChange={(e) => handleChange('chatRequests', e.target.value)}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="accounts-older">Accounts older than 30 days</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>

                <div className="settings-group">
                  <div className="settings-toggle">
                    <div>
                      <strong>Autoplay videos</strong>
                      <p className="settings-help">
                        Videos will play automatically in chat
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.autoplay}
                        onChange={(e) => handleChange('autoplay', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="settings-actions">
              <button className="btn-save" onClick={handleSave}>
                Save Changes
              </button>
              <button className="btn-cancel" onClick={() => onNavigate('/')}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
