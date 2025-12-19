import React, { useEffect, useState } from 'react';
import { useMyProfileData } from '../hooks/useMyProfileData';
import './ProfilePage.css';
import { getCurrentUser, getCurrentUserId } from '../utils/auth';
import { getUser } from '../api/usersApi';
import CommunityList from '../features/communities/CommunityList';

function ProfilePage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = getCurrentUser();
        const path = window.location.pathname;
        const match = path.match(/\/user\/([^/]+)/);
        const userFromPath = match ? match[1] : null;
        const query = new URLSearchParams(window.location.search);
        const userFromQuery = query.get('user');

        const userIdToLoad = userFromPath || userFromQuery || storedUser?._id;
        if (!userIdToLoad) return;

        const userData = await getUser(userIdToLoad);
        const createdDate = new Date(userData.createdAt || Date.now());
        const now = new Date();
        const yearsDiff = Math.floor((now - createdDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        setUser({
          username: userData.username || storedUser?.username || 'User',
          displayName: userData.displayName || userData.username || storedUser?.username || 'User',
          fullUsername: `u/${userData.username || storedUser?.username || 'user'}`,
          karma: userData.karma || 1,
          contributions: userData.contributions || 9,
          redditAge: yearsDiff > 0 ? `${yearsDiff} y` : '< 1 y',
          activeIn: userData.activeIn || 0,
          goldEarned: userData.goldEarned || 0,
          followers: userData.followers || 1,
          cakeDay: createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          avatar: userData.image || storedUser?.image || null,
          bio: userData.bio || '',
          email: userData.email,
          _id: userIdToLoad,
          isNSFW: userData.isNSFW || false,
        });
      } catch (error) {
        console.error('Failed to load user:', error);
        const storedUser = getCurrentUser();
        if (storedUser) {
          setUser({
            username: storedUser.username,
            displayName: storedUser.username,
            fullUsername: `u/${storedUser.username}`,
            karma: 1,
            contributions: 0,
            redditAge: '< 1 y',
            activeIn: 0,
            goldEarned: 0,
            followers: 0,
            cakeDay: new Date().toLocaleDateString(),
            avatar: storedUser.image || null,
            bio: '',
            _id: storedUser._id,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  // Profile data hook

  const {
    posts: userPosts,
    comments: userComments,
    savedPosts,
    hiddenPosts,
    upvotedPosts,
    downvotedPosts,
    loading: profileLoading,
    error: profileError,
    refreshProfileData
  } = useMyProfileData();

  // Upvote/Downvote handlers for profile tab posts
  const { upvotePost, downvotePost } = require('../hooks/usePosts');

  const handleProfileUpvote = async (postId) => {
    await upvotePost(postId);
    refreshProfileData();
  };
  const handleProfileDownvote = async (postId) => {
    await downvotePost(postId);
    refreshProfileData();
  };


  if (loading || profileLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="profile-page">
        <div className="profile-error">{profileError}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">Please log in to view your profile</div>
      </div>
    );
  }

  const currentUserId = getCurrentUserId();
  // Check if viewing own profile for conditional UI elements
  // eslint-disable-next-line no-unused-vars
  const isOwnProfile = currentUserId && user?._id && String(currentUserId) === String(user._id);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'posts', label: 'Posts' },
    { id: 'comments', label: 'Comments' },
    { id: 'saved', label: 'Saved' },
    { id: 'history', label: 'History' },
    { id: 'hidden', label: 'Hidden' },
    { id: 'upvoted', label: 'Upvoted' },
    { id: 'downvoted', label: 'Downvoted' },
  ];

  const renderEmptyState = (type) => (
    <div className="profile-empty-state">
      <div className="empty-state-icon">
        <svg viewBox="0 0 80 80" width="80" height="80">
          <ellipse cx="40" cy="60" rx="20" ry="6" fill="#EDEFF1"/>
          <path d="M30 35 Q30 25 40 25 Q50 25 50 35 L50 50 Q50 55 45 55 L35 55 Q30 55 30 50 Z" fill="#EDEFF1"/>
          <circle cx="35" cy="42" r="4" fill="#FF4500"/>
          <circle cx="45" cy="42" r="4" fill="#FF4500"/>
        </svg>
      </div>
      <h3 className="empty-state-title">
        {type === 'posts' && "You don't have any posts yet"}
        {type === 'comments' && "You don't have any comments yet"}
        {type === 'saved' && "You haven't saved anything yet"}
        {type === 'history' && "No browsing history"}
        {type === 'hidden' && "No hidden posts"}
        {type === 'upvoted' && "You haven't upvoted anything yet"}
        {type === 'downvoted' && "You haven't downvoted anything yet"}
        {type === 'overview' && "You don't have any posts yet"}
      </h3>
      <p className="empty-state-text">
        Any posts you make to communities will be hidden from your profile. To show them, update your settings.
      </p>
      <button className="empty-state-btn" onClick={() => onNavigate('settings', '/settings')}>
        Update Settings
      </button>
    </div>
  );

  return (
    <div className="profile-page">
      {/* Left Sidebar */}
      <aside className="profile-left-sidebar">
        <CommunityList />
      </aside>

      <div className="profile-layout">
        {/* Main Content */}
        <main className="profile-main">
          {/* Profile Header */}
          <div className="profile-header-section">
            <div className="profile-header-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="header-avatar-img" />
              ) : (
                <div className="header-avatar-default">
                  <svg viewBox="0 0 20 20" width="60" height="60">
                    <path fill="#D7DADC" d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm0 18.75A8.75 8.75 0 0 1 1.25 10 8.68 8.68 0 0 1 3.07 4.63l.06-.05A8.74 8.74 0 0 1 10 1.25a8.63 8.63 0 0 1 5.11 1.67 8.75 8.75 0 0 1-5.11 15.83zm4.04-11.19a1.55 1.55 0 1 1-1.55-1.55 1.55 1.55 0 0 1 1.55 1.55zm-6.53 0a1.55 1.55 0 1 1-1.55-1.55 1.55 1.55 0 0 1 1.55 1.55zm6.24 4.32a.62.62 0 0 1 0 .88 5.51 5.51 0 0 1-7.5 0 .62.62 0 1 1 .88-.88 4.26 4.26 0 0 0 5.74 0 .62.62 0 0 1 .88 0z"/>
                  </svg>
                </div>
              )}
              <button className="avatar-edit-btn" title="Edit avatar">
                <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
            <div className="profile-header-info">
              <div className="profile-name-row">
                <h1 className="profile-display-name">{user.displayName}</h1>
                {user.isNSFW && <span className="nsfw-badge">18+</span>}
              </div>
              <p className="profile-username">{user.fullUsername}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Visibility Banner */}
          <div className="content-visibility-banner">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            <span>Hiding all content</span>
            <svg className="chevron-right" viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
          </div>

          {/* Create Post Bar */}
          <div className="profile-create-bar">
            <button className="create-post-btn" onClick={() => onNavigate('create-post', '/submit')}>
              <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              Create Post
            </button>
            <button className="filter-btn">
              <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/>
              </svg>
            </button>
          </div>

          {/* Tab Content */}
          <div className="profile-tab-content">
            {activeTab === 'overview' && (
              userPosts.length === 0 && userComments.length === 0
                ? renderEmptyState('overview')
                : <>
                    <div className="posts-list">
                      {userPosts.map((post) => (
                        <div key={post._id} className="profile-post-item">{post.title}</div>
                      ))}
                    </div>
                    <div className="comments-list">
                      {userComments.map((comment) => (
                        <div key={comment._id} className="profile-comment-item">{comment.text}</div>
                      ))}
                    </div>
                  </>
            )}
            {activeTab === 'posts' && (
              userPosts.length === 0 ? renderEmptyState('posts') : (
                <div className="posts-list">
                  {userPosts.map((post) => (
                    <div key={post._id} className="profile-post-item">
                      {post.title}
                      <button onClick={() => handleProfileUpvote(post._id)}>Upvote</button>
                      <button onClick={() => handleProfileDownvote(post._id)}>Downvote</button>
                    </div>
                  ))}
                </div>
              )
            )}
            {activeTab === 'comments' && (
              userComments.length === 0 ? renderEmptyState('comments') : (
                <div className="comments-list">
                  {userComments.map((comment) => (
                    <div key={comment._id} className="profile-comment-item">{comment.text}</div>
                  ))}
                </div>
              )
            )}
            {activeTab === 'saved' && (
              savedPosts.length === 0 ? renderEmptyState('saved') : (
                <div className="posts-list">
                  {savedPosts.map((post) => (
                    <div key={post._id} className="profile-post-item">{post.title}</div>
                  ))}
                </div>
              )
            )}
            {activeTab === 'history' && renderEmptyState('history')}
            {activeTab === 'hidden' && (
              hiddenPosts.length === 0 ? renderEmptyState('hidden') : (
                <div className="posts-list">
                  {hiddenPosts.map((post) => (
                    <div key={post._id} className="profile-post-item">{post.title}</div>
                  ))}
                </div>
              )
            )}
            {activeTab === 'upvoted' && (
              upvotedPosts.length === 0 ? renderEmptyState('upvoted') : (
                <div className="posts-list">
                  {upvotedPosts.map((post) => (
                    <div key={post._id} className="profile-post-item">
                      {post.title}
                      <button onClick={() => handleProfileUpvote(post._id)}>Upvote</button>
                      <button onClick={() => handleProfileDownvote(post._id)}>Downvote</button>
                    </div>
                  ))}
                </div>
              )
            )}
            {activeTab === 'downvoted' && (
              downvotedPosts.length === 0 ? renderEmptyState('downvoted') : (
                <div className="posts-list">
                  {downvotedPosts.map((post) => (
                    <div key={post._id} className="profile-post-item">
                      {post.title}
                      <button onClick={() => handleProfileUpvote(post._id)}>Upvote</button>
                      <button onClick={() => handleProfileDownvote(post._id)}>Downvote</button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </main>

        {/* Right Sidebar - Profile Card */}
        <aside className="profile-right-sidebar">
          <div className="profile-card">
            {/* Banner */}
            <div className="profile-card-banner">
              <button className="banner-edit-btn" title="Edit banner">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
            
            {/* Profile Info */}
            <div className="profile-card-content">
              <div className="profile-card-name-row">
                <span className="profile-card-name">{user.displayName}</span>
                {user.isNSFW && <span className="nsfw-badge small">18+</span>}
              </div>
              
              <button className="share-profile-btn">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                </svg>
                Share
              </button>

              {/* Stats */}
              <div className="profile-card-followers">
                <span className="follower-count">{user.followers} follower{user.followers !== 1 ? 's' : ''}</span>
              </div>

              <div className="profile-card-stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{user.karma}</span>
                  <span className="stat-name">Karma</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{user.contributions}</span>
                  <span className="stat-name">Contributions</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{user.redditAge}</span>
                  <span className="stat-name">Reddit Age</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{user.activeIn}</span>
                  <span className="stat-name">Active in &gt;</span>
                </div>
              </div>

              <div className="profile-card-gold">
                <span className="gold-number">{user.goldEarned}</span>
                <span className="gold-label">Gold earned</span>
              </div>

              {/* Achievements */}
              <div className="profile-card-section">
                <h4 className="section-title">ACHIEVEMENTS</h4>
                <div className="achievements-row">
                  <div className="achievement-badges">
                    <span className="achievement-badge">🍌</span>
                    <span className="achievement-badge">🍌</span>
                    <span className="achievement-badge">🍌</span>
                  </div>
                  <div className="achievement-info">
                    <span className="achievement-names">Banana Aficionado, Banana Enthusiast, Banana Baby, +6 more</span>
                  </div>
                </div>
                <div className="achievements-footer">
                  <span className="unlocked-count">9 unlocked</span>
                  <button className="view-all-btn" onClick={() => onNavigate('achievements', '/achievements')}>
                    View All
                  </button>
                </div>
              </div>

              {/* Settings */}
              <div className="profile-card-section">
                <h4 className="section-title">SETTINGS</h4>
                
                <div className="settings-item">
                  <div className="settings-item-icon">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="settings-avatar" />
                    ) : (
                      <div className="settings-avatar-default">👽</div>
                    )}
                  </div>
                  <div className="settings-item-content">
                    <span className="settings-item-title">Profile</span>
                    <span className="settings-item-desc">Customize your profile</span>
                  </div>
                  <button className="settings-update-btn" onClick={() => onNavigate('settings', '/settings')}>
                    Update
                  </button>
                </div>

                <div className="settings-item">
                  <div className="settings-item-icon">
                    <svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="settings-item-content">
                    <span className="settings-item-title">Curate your profile</span>
                    <span className="settings-item-desc">Manage what people see when they visit your profile</span>
                  </div>
                  <button className="settings-update-btn" onClick={() => onNavigate('settings', '/settings')}>
                    Update
                  </button>
                </div>

                <div className="settings-item">
                  <div className="settings-item-icon">
                    <svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="settings-item-content">
                    <span className="settings-item-title">Avatar</span>
                    <span className="settings-item-desc">Customize your avatar</span>
                  </div>
                  <button className="settings-update-btn" onClick={() => onNavigate('edit-avatar', '/edit-avatar')}>
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ProfilePage;
