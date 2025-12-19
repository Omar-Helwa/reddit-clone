import React, { useState, useEffect } from 'react';
import './SettingsPage.css';
import { getCurrentUserId } from '../utils/auth';
import { updateUser, getUser, toggleNsfw, toggleAllowFollow } from '../api/usersApi';
import CommunityList from '../features/communities/CommunityList';

function SettingsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('account');

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    about: 'Just another Redditor exploring the internet',
    gender: 'Man',
    location: '',
    nsfw: false,
    activityVisible: true,
    contentVisible: true,
    allowFollow: true,
    showInSearch: true,
    emailNotifications: true,
    pushNotifications: false,
    chatRequests: 'everyone',
    autoplay: true,
    image: '',
    twoFactorEnabled: false,
    googleConnected: true,
    appleConnected: false,
    contentVisibility: 'hide-all',
    showNsfw: false,
    showFollowers: false,
    personalizeAds: false,
    showMatureContent: true,
    blurMature: false,
    showRecommendations: true,
    reduceMotion: false,
    syncMotion: true,
    communityThemes: true,
    openInNewTab: false,
    feedView: 'Card',
    markdownEditor: false,
    oldReddit: false,
    emailAdminNotifications: false,
    emailChatRequests: false,
    emailNewUserWelcome: false,
    emailCommentsOnPosts: false,
    emailRepliesToComments: false,
    emailUpvotesOnPosts: false,
    emailUpvotesOnComments: false,
    emailUsernameMentions: false,
    emailNewFollowers: false,
    emailDailyDigest: false,
    emailWeeklyRecap: false,
    emailWeeklyTopic: false,
    unsubscribeAllEmails: true,
    socialLinks: {
      twitter: '',
      instagram: '',
      facebook: '',
      github: '',
      youtube: '',
      website: ''
    }
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Email editing state
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  
  // Social links editing state
  const [editingSocialLinks, setEditingSocialLinks] = useState(false);
  const [socialLinksError, setSocialLinksError] = useState('');
  const [socialLinksSuccess, setSocialLinksSuccess] = useState('');
  
  // Profile fields editing state
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingGender, setEditingGender] = useState(false);
  const [profileFieldError, setProfileFieldError] = useState('');
  const [profileFieldSuccess, setProfileFieldSuccess] = useState('');
  
  // Notification modal state
  const [notificationModal, setNotificationModal] = useState({ open: false, setting: '', title: '' });
  const [notificationModalValue, setNotificationModalValue] = useState('all-on');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = getCurrentUserId();
        
        if (userId) {
          const userData = await getUser(userId);
          setFormData((prev) => ({
            ...prev,
            email: userData.email || '',
            displayName: userData.displayName || userData.username || '',
            image: userData.image || '',
            about: userData.about || userData.bio || '',
            gender: userData.gender === true ? 'Woman' : userData.gender === false ? 'Man' : (userData.gender || 'Prefer not to say'),
            nsfw: userData.nsfw || false,
            allowFollow: userData.allowFollowing !== false, // default to true if not set
            socialLinks: {
              twitter: userData.socialLinks?.twitter || '',
              instagram: userData.socialLinks?.instagram || '',
              facebook: userData.socialLinks?.facebook || '',
              github: userData.socialLinks?.github || '',
              youtube: userData.socialLinks?.youtube || '',
              website: userData.socialLinks?.website || ''
            }
          }));
        }
      } catch (error) {
      }
    };
    loadUserData();
  }, []);

  const handleChange = async (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Call dedicated API endpoints for specific settings
    try {
      if (field === 'nsfw') {
        await toggleNsfw(value);
      } else if (field === 'allowFollow') {
        await toggleAllowFollow(value);
        // Show temporary success message
        const message = value 
          ? 'People can now follow you!' 
          : 'You have disabled followers. People cannot follow you anymore.';
        setSaveMessage(`✅ ${message}`);
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      // Revert the state change on error
      setFormData((prev) => ({ ...prev, [field]: !value }));
      // Show error message
      setSaveMessage(`❌ Failed to update setting: ${error.message}`);
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleUpdateEmail = async () => {
    try {
      setEmailError('');
      setEmailSuccess('');

      // Validation
      if (!formData.email) {
        setEmailError('Email cannot be empty');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setEmailError('Please enter a valid email address');
        return;
      }

      const { updateEmail } = await import('../api/usersApi');
      await updateEmail(formData.email);
      
      setEmailSuccess('✅ Email updated successfully!');
      setEditingEmail(false);
      setTimeout(() => setEmailSuccess(''), 3000);
    } catch (error) {
      setEmailError('❌ Failed to update email: ' + error.message);
    }
  };

  const handleUpdateSocialLinks = async () => {
    try {
      setSocialLinksError('');
      setSocialLinksSuccess('');

      const { updateSocialLinks } = await import('../api/usersApi');
      await updateSocialLinks(formData.socialLinks);
      
      setSocialLinksSuccess('✅ Social links updated successfully!');
      setEditingSocialLinks(false);
      setTimeout(() => setSocialLinksSuccess(''), 3000);
    } catch (error) {
      setSocialLinksError('❌ Failed to update social links: ' + error.message);
    }
  };

  const handleChangePassword = async () => {
    try {
      setPasswordError('');
      setPasswordSuccess('');

      // Validation
      if (!passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordError('Please fill in all password fields');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters long');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      const userId = getCurrentUserId();
      if (!userId) {
        setPasswordError('No user logged in');
        return;
      }

      // Update password (JWT token verifies authentication)
      await updateUser(userId, { 
        password: passwordData.newPassword 
      });
      
      // Password changed successfully - log user out for security
      alert('✅ Password changed successfully! Please log in with your new password.');
      
      // Clear all user data and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      setPasswordError('❌ Failed to change password: ' + error.message);
    }
  };

  // Handle saving individual profile fields
  const handleSaveProfileField = async (field) => {
    try {
      setProfileFieldError('');
      setProfileFieldSuccess('');
      
      const userId = getCurrentUserId();
      if (!userId) {
        setProfileFieldError('No user logged in');
        return;
      }

      let updatePayload = {};
      
      if (field === 'displayName') {
        if (!formData.displayName.trim()) {
          setProfileFieldError('Display name cannot be empty');
          return;
        }
        updatePayload = { displayName: formData.displayName.trim() };
      } else if (field === 'about') {
        updatePayload = { about: formData.about.trim() };
      } else if (field === 'gender') {
        // Save gender value - API accepts boolean (Man = false, Woman = true)
        // For other values, we'll save them as-is and let API handle
        let genderValue = undefined;
        if (formData.gender === 'Man') genderValue = false;
        else if (formData.gender === 'Woman') genderValue = true;
        else if (formData.gender === 'Non-binary') genderValue = formData.gender;
        else if (formData.gender === 'I prefer not to say' || formData.gender === '') genderValue = null;
        
        updatePayload = { gender: genderValue };
      }

      await updateUser(userId, updatePayload);
      
      // Close the edit mode
      if (field === 'displayName') {
        setEditingDisplayName(false);
        localStorage.setItem('username', formData.displayName);
      } else if (field === 'about') {
        setEditingAbout(false);
      } else if (field === 'gender') {
        setEditingGender(false);
      }
      
      setProfileFieldSuccess(`✅ ${field === 'displayName' ? 'Display name' : field === 'about' ? 'About' : 'Gender'} updated successfully!`);
      setTimeout(() => setProfileFieldSuccess(''), 3000);
    } catch (error) {
      setProfileFieldError(`❌ Failed to update: ${error.message}`);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage('');
      
      const userId = getCurrentUserId();
      if (!userId) {
        alert('No user logged in');
        return;
      }

      // Prepare update payload (only send fields the schema accepts)
      // Convert gender string to boolean for API (Man = false, Woman = true)
      let genderValue = undefined;
      if (formData.gender === 'Man') genderValue = false;
      else if (formData.gender === 'Woman') genderValue = true;
      
      const updatePayload = {
        username: formData.displayName,
        displayName: formData.displayName,
        email: formData.email,
        image: formData.image,
        about: formData.about,
        gender: genderValue,
      };

      // Update to API
      await updateUser(userId, updatePayload);
      
      // Update localStorage so navbar and profile reflect changes immediately
      localStorage.setItem('username', formData.displayName);
      localStorage.setItem('userEmail', formData.email);
      if (formData.image) {
        localStorage.setItem('userImage', formData.image);
      }
      
      setSaveMessage('✅ Settings saved to database!');
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (error) {
      setSaveMessage('❌ Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const openNotificationModal = (setting, title) => {
    setNotificationModal({ open: true, setting, title });
    setNotificationModalValue('all-on');
  };

  const closeNotificationModal = () => {
    setNotificationModal({ open: false, setting: '', title: '' });
  };

  const saveNotificationSetting = () => {
    // In a real app, you would save this setting
    closeNotificationModal();
  };

  const NotificationModal = () => {
    if (!notificationModal.open) return null;
    
    return (
      <div className="notification-modal-overlay" onClick={closeNotificationModal}>
        <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
          <div className="notification-modal-header">
            <h3 className="notification-modal-title">{notificationModal.title}</h3>
            <button className="notification-modal-close" onClick={closeNotificationModal}>
              ×
            </button>
          </div>
          
          <div className="notification-modal-options">
            <div 
              className="notification-option" 
              onClick={() => setNotificationModalValue('all-on')}
            >
              <div className="notification-option-icon">🔔</div>
              <div className="notification-option-content">
                <p className="notification-option-title">All on</p>
                <p className="notification-option-description">Get notifications to your device and Reddit inbox</p>
              </div>
              {notificationModalValue === 'all-on' && (
                <div className="notification-option-check">✓</div>
              )}
            </div>
            
            <div 
              className="notification-option" 
              onClick={() => setNotificationModalValue('inbox')}
            >
              <div className="notification-option-icon">🔕</div>
              <div className="notification-option-content">
                <p className="notification-option-title">Inbox</p>
                <p className="notification-option-description">Only get notifications to your Reddit inbox</p>
              </div>
              {notificationModalValue === 'inbox' && (
                <div className="notification-option-check">✓</div>
              )}
            </div>
          </div>
          
          <div className="notification-modal-actions">
            <button className="notification-modal-btn notification-modal-btn-cancel" onClick={closeNotificationModal}>
              Cancel
            </button>
            <button className="notification-modal-btn notification-modal-btn-save" onClick={saveNotificationSetting}>
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteAccount = async () => {
    try {
      // Import auth utils and APIs
      const { getCurrentUserId, getCurrentUser, clearCurrentUser } = await import('../utils/auth');
      const { deleteUser } = await import('../api/usersApi');
      const { postsAPI } = await import('../api/postsAPI');
      const commentsAPI = await import('../api/commentsAPI');
      const { getAllChats, deleteChat } = await import('../api/chatsApi');
      
      // Get the current user's ID and username
      const userId = getCurrentUserId();
      const currentUser = getCurrentUser();
      const username = currentUser?.username;
      
      if (!userId) {
        alert('No user logged in');
        return;
      }


      // Step 1: Delete all user's posts
      try {
        const allPosts = await postsAPI.getAll();
        // Posts can have author (username) or authorId/userId
        const userPosts = allPosts.filter(post => 
          post.author === username || 
          post.authorId === userId || 
          post.userId === userId ||
          String(post.authorId) === String(userId) ||
          String(post.userId) === String(userId)
        );
        
        for (const post of userPosts) {
          const postId = post._id || post.id;
          await postsAPI.delete(postId);
        }
      } catch (error) {
      }

      // Step 2: Delete all user's comments
      try {
        // Use listAll() to get all comments, then filter by userId
        const allComments = await commentsAPI.default.listAll();
        // Comments store userId (user's ID), not author username
        const userComments = allComments.filter(comment => 
          comment.userId === userId || String(comment.userId) === String(userId)
        );
        
        for (const comment of userComments) {
          const commentId = comment._id || comment.id;
          await commentsAPI.default.delete(commentId);
        }
      } catch (error) {
      }

      // Step 3: Delete all user's chats
      try {
        const allChats = await getAllChats();
        const userChats = allChats.filter(chat => 
          chat.participants?.some(p => p.username === username || p === username)
        );
        
        for (const chat of userChats) {
          await deleteChat(chat._id);
        }
      } catch (error) {
      }

      // Step 4: Delete user account from MongoDB
      await deleteUser(userId);
      
      
      // Clear user data from localStorage
      clearCurrentUser();
      
      alert('Your account has been deleted. We\'re sorry to see you go!');
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      alert('Failed to delete account: ' + error.message);
    }
  };

  const confirmDelete = () => {
    const confirmation = window.prompt(
      'Type "DELETE" to permanently delete your account. This action cannot be undone.'
    );
    
    if (confirmation === 'DELETE') {
      handleDeleteAccount();
    } else {
      alert('Account deletion cancelled');
    }
  };

  return (
    <div className="settings-page">
      {/* Left Sidebar */}
      <aside className="settings-left-sidebar">
        <CommunityList />
      </aside>

      {/* Main Content */}
      <main className="settings-main-content">
        <h1 className="settings-title">Settings</h1>

        {/* Horizontal Tabs */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
          <button
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`settings-tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy
          </button>
          <button
            className={`settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={`settings-tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            Email
          </button>
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="settings-section">
            <h3 className="settings-section-title">General</h3>

            {/* Email Address - Editable */}
            <div className="settings-row-editable">
              <div className="settings-row-left">
                <span className="settings-row-label">Email address</span>
              </div>
              {editingEmail ? (
                <div className="settings-edit-container">
                  <input
                    type="email"
                    className="settings-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                  {emailError && <p className="error-message">{emailError}</p>}
                  {emailSuccess && <p className="success-message">{emailSuccess}</p>}
                  <div className="settings-edit-buttons">
                    <button className="settings-btn settings-btn-filled" onClick={handleUpdateEmail}>
                      Save
                    </button>
                    <button 
                      className="settings-btn settings-btn-outline"
                      onClick={() => {
                        setEditingEmail(false);
                        setEmailError('');
                        setEmailSuccess('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="settings-row-right" onClick={() => setEditingEmail(true)} style={{ cursor: 'pointer' }}>
                  <span className="settings-row-value">{formData.email || 'Not set'}</span>
                  <span className="settings-row-arrow">›</span>
                </div>
              )}
            </div>

            <div className="settings-row" onClick={() => setEditingGender(true)}>
              <div className="settings-row-left">
                <span className="settings-row-label">Gender</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">{formData.gender || 'I prefer not to say'}</span>
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Location customization</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value link">{formData.location || 'No location specified'}</span>
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <h3 className="settings-section-title">Account authorization</h3>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Google</span>
                <span className="account-auth-description">Connect to log in to Reddit with your Google account</span>
              </div>
              <button 
                className={`settings-btn ${formData.googleConnected ? 'settings-btn-outline' : 'settings-btn-filled'}`}
                onClick={() => handleChange('googleConnected', !formData.googleConnected)}
              >
                {formData.googleConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Apple</span>
                <span className="account-auth-description">Connect to log in to Reddit with your Apple account</span>
              </div>
              <button 
                className={`settings-btn ${formData.appleConnected ? 'settings-btn-outline' : 'settings-btn-filled'}`}
                onClick={() => handleChange('appleConnected', !formData.appleConnected)}
              >
                {formData.appleConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Two-factor authentication</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.twoFactorEnabled}
                  onChange={(e) => handleChange('twoFactorEnabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <h3 className="settings-section-title">Reddit Premium</h3>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Get premium</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <h3 className="settings-section-title">Advanced</h3>

            <div className="settings-row" onClick={confirmDelete}>
              <div className="settings-row-left">
                <span className="settings-row-label">Delete account</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            {/* Password Change Section */}
            {showPasswordFields && (
              <div className="password-section">
                <h3 className="settings-section-title">Change Password</h3>
                <div className="password-inputs">
                  <input
                    type="password"
                    className="settings-input"
                    placeholder="New Password (min 6 characters)"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  />
                  <input
                    type="password"
                    className="settings-input"
                    placeholder="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  />
                </div>
                {passwordError && <p className="error-message">{passwordError}</p>}
                {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
                <div className="password-buttons">
                  <button className="settings-btn settings-btn-filled" onClick={handleChangePassword}>
                    Update Password
                  </button>
                  <button 
                    className="settings-btn settings-btn-outline"
                    onClick={() => {
                      setShowPasswordFields(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {!showPasswordFields && (
              <div className="settings-row" onClick={() => setShowPasswordFields(true)}>
                <div className="settings-row-left">
                  <span className="settings-row-label">Change password</span>
                </div>
                <div className="settings-row-right">
                  <span className="settings-row-arrow">›</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="settings-section">
            <h3 className="settings-section-title">General</h3>

            {/* Profile field success/error messages */}
            {profileFieldSuccess && <div className="settings-success">{profileFieldSuccess}</div>}
            {profileFieldError && <div className="settings-error">{profileFieldError}</div>}

            {/* Display name row */}
            <div className="settings-row" onClick={() => setEditingDisplayName(true)}>
              <div className="settings-row-left">
                <span className="settings-row-label">Display name</span>
                <span className="settings-row-description">Changing your display name won't change your username</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">{formData.displayName || 'Not set'}</span>
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            {/* About description row */}
            <div className="settings-row" onClick={() => setEditingAbout(true)}>
              <div className="settings-row-left">
                <span className="settings-row-label">About description</span>
                <span className="settings-row-description">{formData.about ? formData.about.substring(0, 50) + (formData.about.length > 50 ? '...' : '') : 'Add a bio'}</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            {/* Gender row */}
            <div className="settings-row" onClick={() => setEditingGender(true)}>
              <div className="settings-row-left">
                <span className="settings-row-label">Gender</span>
                <span className="settings-row-description">This information may be used to improve your recommendations</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">{formData.gender || 'I prefer not to say'}</span>
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Avatar</span>
                <span className="settings-row-description">Edit your avatar or upload an image</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Banner</span>
                <span className="settings-row-description">Upload a profile background image</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            {/* Social Links - Editable */}
            <div className="settings-row-editable">
              <div className="settings-row-left">
                <span className="settings-row-label">Social links</span>
              </div>
              {editingSocialLinks ? (
                <div className="settings-edit-container social-links-edit">
                  <div className="social-link-input-group">
                    <label>Twitter</label>
                    <input
                      type="url"
                      className="settings-input"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                  <div className="social-link-input-group">
                    <label>Instagram</label>
                    <input
                      type="url"
                      className="settings-input"
                      value={formData.socialLinks.instagram}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                  <div className="social-link-input-group">
                    <label>Facebook</label>
                    <input
                      type="url"
                      className="settings-input"
                      value={formData.socialLinks.facebook}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: e.target.value } })}
                      placeholder="https://facebook.com/yourprofile"
                    />
                  </div>
                  <div className="social-link-input-group">
                    <label>GitHub</label>
                    <input
                      type="url"
                      className="settings-input"
                      value={formData.socialLinks.github}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                  <div className="social-link-input-group">
                    <label>YouTube</label>
                    <input
                      type="url"
                      className="settings-input"
                      value={formData.socialLinks.youtube}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, youtube: e.target.value } })}
                      placeholder="https://youtube.com/@yourchannel"
                    />
                  </div>
                  <div className="social-link-input-group">
                    <label>Website</label>
                    <input
                      type="url"
                      className="settings-input"
                      value={formData.socialLinks.website}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: e.target.value } })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  {socialLinksError && <p className="error-message">{socialLinksError}</p>}
                  {socialLinksSuccess && <p className="success-message">{socialLinksSuccess}</p>}
                  <div className="settings-edit-buttons">
                    <button className="settings-btn settings-btn-filled" onClick={handleUpdateSocialLinks}>
                      Save
                    </button>
                    <button 
                      className="settings-btn settings-btn-outline"
                      onClick={() => {
                        setEditingSocialLinks(false);
                        setSocialLinksError('');
                        setSocialLinksSuccess('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="settings-row-right" onClick={() => setEditingSocialLinks(true)} style={{ cursor: 'pointer' }}>
                  <span className="settings-row-value">
                    {Object.values(formData.socialLinks).some(link => link) ? 'Configured' : 'Not set'}
                  </span>
                  <span className="settings-row-arrow">›</span>
                </div>
              )}
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Mark as mature (18+)</span>
                <span className="account-auth-description">Label your profile as Not Safe for Work (NSFW) and ensure it's inaccessible to people under 18</span>
              </div>
              <label className="toggle-switch toggle-switch-blue">
                <input
                  type="checkbox"
                  checked={formData.nsfw}
                  onChange={(e) => handleChange('nsfw', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <h3 className="settings-section-title-large">Curate your profile</h3>
            <p className="settings-section-subtitle">Manage what content shows on your profile.</p>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Content and activity</span>
                <span className="account-auth-description">Posts, comments, and communities you're active in</span>
              </div>
              <select 
                className="settings-dropdown"
                value={formData.contentVisibility || 'hide-all'}
                onChange={(e) => handleChange('contentVisibility', e.target.value)}
              >
                <option value="show-all">Show all</option>
                <option value="hide-all">Hide all</option>
              </select>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">NSFW</span>
                <span className="account-auth-description">Show all NSFW posts and comments</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.showNsfw}
                  onChange={(e) => handleChange('showNsfw', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Followers</span>
                <span className="account-auth-description">Show your follower count</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.showFollowers}
                  onChange={(e) => handleChange('showFollowers', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-info-box">
              <span className="settings-info-link">Profile curation</span> only applies to your profile and your content stays visible in communities. Mods of communities you participate in and redditors whose profile posts you engage with can still see your full profile for moderation.
            </div>

            <h3 className="settings-section-title-large">Advanced</h3>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Profile moderation</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-external-icon">↗</span>
              </div>
            </div>

            <div className="settings-footer">
              <a href="/reddit-rules">Reddit Rules</a>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/user-agreement">User Agreement</a>
              <a href="/accessibility">Accessibility</a>
              <span className="settings-footer-copyright">• Reddit, Inc. © 2025. All rights reserved.</span>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="settings-section">
            <h3 className="settings-section-title-large">Social interactions</h3>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Allow people to follow you</span>
                <span className="account-auth-description">Let people follow you to see your profile posts in their home feed</span>
              </div>
              <label className="toggle-switch toggle-switch-blue">
                <input
                  type="checkbox"
                  checked={formData.allowFollow}
                  onChange={(e) => handleChange('allowFollow', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Who can send you chat requests</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">{formData.chatRequests === 'everyone' ? 'Everyone' : formData.chatRequests === 'accounts-older' ? 'Accounts older than 30 days' : 'Nobody'}</span>
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Blocked accounts</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <h3 className="settings-section-title-large">Discoverability</h3>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">List your profile on old.reddit.com/users</span>
                <span className="account-auth-description">List your profile on old.reddit.com/users and allow posts to your profile to appear in r/all</span>
              </div>
              <label className="toggle-switch toggle-switch-blue">
                <input
                  type="checkbox"
                  checked={formData.contentVisible}
                  onChange={(e) => handleChange('contentVisible', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Show up in search results</span>
                <span className="account-auth-description">Allow search engines like Google to link to your profile in their search results</span>
              </div>
              <label className="toggle-switch toggle-switch-blue">
                <input
                  type="checkbox"
                  checked={formData.showInSearch}
                  onChange={(e) => handleChange('showInSearch', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <h3 className="settings-section-title-large">Advertising</h3>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Personalize ads on Reddit based on information and activity from our partners</span>
                <span className="account-auth-description">Allow us to use information from our partners to show you better ads on Reddit</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.personalizeAds}
                  onChange={(e) => handleChange('personalizeAds', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <h3 className="settings-section-title-large">Advanced</h3>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label settings-row-label-link">Third-party app authorizations</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-external-icon">↗</span>
              </div>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Clear history</span>
                <span className="account-auth-description">Delete your post views history</span>
              </div>
              <button className="settings-btn settings-btn-outline">Clear</button>
            </div>

            <div className="settings-footer">
              <a href="/reddit-rules">Reddit Rules</a>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/user-agreement">User Agreement</a>
              <a href="/accessibility">Accessibility</a>
              <span className="settings-footer-copyright">• Reddit, Inc. © 2025. All rights reserved.</span>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="settings-section">
            <h3 className="settings-section-title-large">Language</h3>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Display language</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Content languages</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <h3 className="settings-section-title-large">Content</h3>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Show mature content (I'm over 18)</span>
                <span className="account-auth-description">See Not Safe for Work mature and adult content in your feeds and search results</span>
              </div>
              <label className="toggle-switch toggle-switch-blue">
                <input
                  type="checkbox"
                  checked={formData.showMatureContent}
                  onChange={(e) => handleChange('showMatureContent', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Blur mature (18+) images and media</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.blurMature}
                  onChange={(e) => handleChange('blurMature', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Show recommendations in home feed</span>
              </div>
              <label className="toggle-switch toggle-switch-blue">
                <input
                  type="checkbox"
                  checked={formData.showRecommendations}
                  onChange={(e) => handleChange('showRecommendations', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Muted communities</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <h3 className="settings-section-title-large">Accessibility</h3>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Autoplay media</span>
              </div>
              <label className="toggle-switch toggle-switch-blue">
                <input
                  type="checkbox"
                  checked={formData.autoplay}
                  onChange={(e) => handleChange('autoplay', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">Reduce Motion</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.reduceMotion}
                  onChange={(e) => handleChange('reduceMotion', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Sync with computer's motion settings</span>
              </div>
              <label className="toggle-switch toggle-switch-blue">
                <input
                  type="checkbox"
                  checked={formData.syncMotion}
                  onChange={(e) => handleChange('syncMotion', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <h3 className="settings-section-title-large">Experience</h3>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Use community themes</span>
              </div>
              <label className="toggle-switch toggle-switch-blue">
                <input
                  type="checkbox"
                  checked={formData.communityThemes}
                  onChange={(e) => handleChange('communityThemes', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Open posts in new tab</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.openInNewTab}
                  onChange={(e) => handleChange('openInNewTab', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Default feed view</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">{formData.feedView || 'Card'}</span>
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Default to markdown editor</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.markdownEditor}
                  onChange={(e) => handleChange('markdownEditor', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Keyboard shortcuts</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Default to old Reddit</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.oldReddit}
                  onChange={(e) => handleChange('oldReddit', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <h3 className="settings-section-title-large">Sensitive advertising categories</h3>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Limit ads in selected categories</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-arrow">›</span>
              </div>
            </div>

            <div className="settings-footer">
              <a href="/reddit-rules">Reddit Rules</a>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/user-agreement">User Agreement</a>
              <a href="/accessibility">Accessibility</a>
              <span className="settings-footer-copyright">• Reddit, Inc. © 2025. All rights reserved.</span>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <NotificationModal />
            
            <h3 className="settings-section-title-large">General</h3>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Community notifications</span>
              </div>
              <div className="settings-row-right">
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('community', 'Community notifications')}>›</button>
              </div>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Web push notifications</span>
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

            <h3 className="settings-section-title-large">Messages</h3>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Chat messages</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('chatMessages', 'Chat messages')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Chat requests</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('chatRequests', 'Chat requests')}>›</button>
              </div>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Mark all as read</span>
                <span className="account-auth-description">Mark all chat conversations as read</span>
              </div>
              <button className="settings-btn settings-btn-filled">Mark as read</button>
            </div>

            <h3 className="settings-section-title-large">Activity</h3>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Mentions of u/username</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('mentions', 'Mentions of u/username')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Comments on your posts</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('commentsOnPosts', 'Comments on your posts')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Upvotes on your posts</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('upvotesPosts', 'Upvotes on your posts')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Upvotes on your comments</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('upvotesComments', 'Upvotes on your comments')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Replies to your comments</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('replies', 'Replies to your comments')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Activity on your comments</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('activityComments', 'Activity on your comments')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">New followers</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('newFollowers', 'New followers')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Awards you receive</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('awards', 'Awards you receive')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Posts you follow</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('followedPosts', 'Posts you follow')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Comments you follow</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('followedComments', 'Comments you follow')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Keyword alerts</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('keywords', 'Keyword alerts')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Achievement updates</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('achievements', 'Achievement updates')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Streak reminders</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('streaks', 'Streak reminders')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Insights on your posts</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('insights', 'Insights on your posts')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Developer Platform app notifications</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('devPlatform', 'Developer Platform app notifications')}>›</button>
              </div>
            </div>

            <h3 className="settings-section-title-large">Recommendations</h3>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Trending posts</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('trending', 'Trending posts')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">ReReddit</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('rereddit', 'ReReddit')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Featured content</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('featured', 'Featured content')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Breaking news</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('breaking', 'Breaking news')}>›</button>
              </div>
            </div>

            <h3 className="settings-section-title-large">Updates</h3>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Reddit announcements</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('announcements', 'Reddit announcements')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Cake day</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('cakeday', 'Cake day')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Admin notifications</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('admin', 'Admin notifications')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Disabled admin notifications</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">0</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('disabledAdmin', 'Disabled admin notifications')}>›</button>
              </div>
            </div>

            <h3 className="settings-section-title-large">Moderation</h3>

            <div className="settings-row">
              <div className="settings-row-left">
                <span className="settings-row-label">Mod notifications</span>
              </div>
              <div className="settings-row-right">
                <span className="settings-row-value">All on</span>
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('mod', 'Mod notifications')}>›</button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-left">
                <div className="settings-community-row">
                  <span className="settings-community-icon">🔵</span>
                  <span className="settings-row-label">r/asdrfa</span>
                </div>
              </div>
              <div className="settings-row-right">
                <button className="settings-arrow-btn" onClick={() => openNotificationModal('community-asdrfa', 'r/asdrfa')}>›</button>
              </div>
            </div>

            <div className="settings-footer">
              <a href="/reddit-rules">Reddit Rules</a>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/user-agreement">User Agreement</a>
              <a href="/accessibility">Accessibility</a>
              <span className="settings-footer-copyright">• Reddit, Inc. © 2025. All rights reserved.</span>
            </div>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="settings-section">
            <h3 className="settings-section-title-large">Messages</h3>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">Admin notifications</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailAdminNotifications}
                  onChange={(e) => handleChange('emailAdminNotifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">Chat requests</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailChatRequests}
                  onChange={(e) => handleChange('emailChatRequests', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <h3 className="settings-section-title-large">Activity</h3>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">New user welcome</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailNewUserWelcome}
                  onChange={(e) => handleChange('emailNewUserWelcome', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">Comments on your posts</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailCommentsOnPosts}
                  onChange={(e) => handleChange('emailCommentsOnPosts', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">Replies to your comments</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailRepliesToComments}
                  onChange={(e) => handleChange('emailRepliesToComments', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">Upvotes on your posts</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailUpvotesOnPosts}
                  onChange={(e) => handleChange('emailUpvotesOnPosts', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">Upvotes on your comments</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailUpvotesOnComments}
                  onChange={(e) => handleChange('emailUpvotesOnComments', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">Username mentions</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailUsernameMentions}
                  onChange={(e) => handleChange('emailUsernameMentions', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">New followers</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailNewFollowers}
                  onChange={(e) => handleChange('emailNewFollowers', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <h3 className="settings-section-title-large">Newsletters</h3>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">Daily Digest</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailDailyDigest}
                  onChange={(e) => handleChange('emailDailyDigest', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">Weekly Recap</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailWeeklyRecap}
                  onChange={(e) => handleChange('emailWeeklyRecap', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name settings-label-muted">Weekly Topic</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailWeeklyTopic}
                  onChange={(e) => handleChange('emailWeeklyTopic', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <h3 className="settings-section-title-large">Advanced</h3>

            <div className="account-auth-row">
              <div className="account-auth-left">
                <span className="account-auth-name">Unsubscribe from all emails</span>
              </div>
              <label className="toggle-switch toggle-switch-blue">
                <input
                  type="checkbox"
                  checked={formData.unsubscribeAllEmails}
                  onChange={(e) => handleChange('unsubscribeAllEmails', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-footer">
              <a href="/reddit-rules">Reddit Rules</a>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/user-agreement">User Agreement</a>
              <a href="/accessibility">Accessibility</a>
              <span className="settings-footer-copyright">• Reddit, Inc. © 2025. All rights reserved.</span>
            </div>
          </div>
        )}

        {/* Save Actions */}
        <div className="settings-save-actions">
          <button 
            className="settings-btn settings-btn-filled" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            className="settings-btn settings-btn-outline" 
            onClick={() => onNavigate('/')}
          >
            Cancel
          </button>
          {saveMessage && <span className="save-message">{saveMessage}</span>}
        </div>
      </main>

      {/* Display Name Modal */}
      {editingDisplayName && (
        <div className="settings-modal-overlay" onClick={() => setEditingDisplayName(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h2 className="settings-modal-title">Display name</h2>
              <button className="settings-modal-close" onClick={() => setEditingDisplayName(false)}>
                <svg viewBox="0 0 20 20" width="20" height="20">
                  <path fill="currentColor" d="M10 8.586L15.293 3.293a1 1 0 111.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10 3.293 4.707a1 1 0 011.414-1.414L10 8.586z"/>
                </svg>
              </button>
            </div>
            <p className="settings-modal-description">Changing your display name won't change your username</p>
            <div className="settings-modal-body">
              <div className="settings-floating-input">
                <input
                  type="text"
                  id="displayNameInput"
                  className="settings-floating-input-field"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value.slice(0, 30) })}
                  placeholder=" "
                  maxLength={30}
                />
                <label htmlFor="displayNameInput" className="settings-floating-label">Display name</label>
                <span className="settings-input-char-count">{formData.displayName?.length || 0}/30</span>
              </div>
            </div>
            <div className="settings-modal-footer">
              <button className="settings-modal-cancel-btn" onClick={() => setEditingDisplayName(false)}>Cancel</button>
              <button className="settings-modal-save-btn" onClick={() => handleSaveProfileField('displayName')}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* About Description Modal */}
      {editingAbout && (
        <div className="settings-modal-overlay" onClick={() => setEditingAbout(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h2 className="settings-modal-title">About</h2>
              <button className="settings-modal-close" onClick={() => setEditingAbout(false)}>
                <svg viewBox="0 0 20 20" width="20" height="20">
                  <path fill="currentColor" d="M10 8.586L15.293 3.293a1 1 0 111.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10 3.293 4.707a1 1 0 011.414-1.414L10 8.586z"/>
                </svg>
              </button>
            </div>
            <p className="settings-modal-description">A brief description of yourself shown on your profile</p>
            <div className="settings-modal-body">
              <div className="settings-floating-input">
                <textarea
                  id="aboutInput"
                  className="settings-floating-textarea-field"
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value.slice(0, 200) })}
                  placeholder=" "
                  maxLength={200}
                  rows={4}
                />
                <label htmlFor="aboutInput" className="settings-floating-label">About (optional)</label>
                <span className="settings-input-char-count">{formData.about?.length || 0}/200</span>
              </div>
            </div>
            <div className="settings-modal-footer">
              <button className="settings-modal-cancel-btn" onClick={() => setEditingAbout(false)}>Cancel</button>
              <button className="settings-modal-save-btn" onClick={() => handleSaveProfileField('about')}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Gender Modal */}
      {editingGender && (
        <div className="settings-modal-overlay" onClick={() => setEditingGender(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h2 className="settings-modal-title">Gender</h2>
              <button className="settings-modal-close" onClick={() => setEditingGender(false)}>
                <svg viewBox="0 0 20 20" width="20" height="20">
                  <path fill="currentColor" d="M10 8.586L15.293 3.293a1 1 0 111.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10 3.293 4.707a1 1 0 011.414-1.414L10 8.586z"/>
                </svg>
              </button>
            </div>
            <p className="settings-modal-description">This information may be used to improve your recommendations and ads.</p>
            <div className="settings-modal-body">
              <div className="settings-radio-group">
                <label className="settings-radio-option">
                  <input
                    type="radio"
                    name="gender"
                    value="Woman"
                    checked={formData.gender === 'Woman'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  />
                  <span className="settings-radio-checkmark"></span>
                  <span className="settings-radio-label">Woman</span>
                </label>
                <label className="settings-radio-option">
                  <input
                    type="radio"
                    name="gender"
                    value="Man"
                    checked={formData.gender === 'Man'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  />
                  <span className="settings-radio-checkmark"></span>
                  <span className="settings-radio-label">Man</span>
                </label>
                <label className="settings-radio-option">
                  <input
                    type="radio"
                    name="gender"
                    value="Non-binary"
                    checked={formData.gender === 'Non-binary'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  />
                  <span className="settings-radio-checkmark"></span>
                  <span className="settings-radio-label">Non-binary</span>
                </label>
                <label className="settings-radio-option">
                  <input
                    type="radio"
                    name="gender"
                    value=""
                    checked={formData.gender === '' || formData.gender === 'I prefer not to say'}
                    onChange={(e) => setFormData({ ...formData, gender: 'I prefer not to say' })}
                  />
                  <span className="settings-radio-checkmark"></span>
                  <span className="settings-radio-label">I prefer not to say</span>
                </label>
              </div>
            </div>
            <div className="settings-modal-footer">
              <button className="settings-modal-cancel-btn" onClick={() => setEditingGender(false)}>Cancel</button>
              <button className="settings-modal-save-btn" onClick={() => handleSaveProfileField('gender')}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
