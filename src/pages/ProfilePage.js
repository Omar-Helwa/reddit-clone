import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import { getCurrentUser, getCurrentUserId } from '../utils/auth';
import { getUser } from '../api/usersApi';

function ProfilePage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('posts');
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

        // Fetch full user data from API
        const userData = await getUser(userIdToLoad);
        setUser({
          username: userData.username || storedUser?.username || 'User',
          fullUsername: `u/${userData.username || storedUser?.username || 'user'}`,
          karma: 0,
          cakeDay: new Date(userData.createdAt || Date.now()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          avatar: userData.image || storedUser?.image || '👽',
          bio: userData.bio || 'Just another Redditor exploring the internet',
          email: userData.email,
          _id: userIdToLoad,
        });
      } catch (error) {
        console.error('Failed to load user:', error);
        const storedUser = getCurrentUser();
        if (storedUser) {
          setUser({
            username: storedUser.username,
            fullUsername: `u/${storedUser.username}`,
            karma: 0,
            cakeDay: new Date().toLocaleDateString(),
            avatar: storedUser.image || '👽',
            bio: 'Just another Redditor exploring the internet',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);

  if (loading) {
    return <div className="profile-page"><div className="loading">Loading profile...</div></div>;
  }

  if (!user) {
    return <div className="profile-page"><div className="error">Please log in to view your profile</div></div>;
  }

  const currentUserId = getCurrentUserId();
  const isOwnProfile = currentUserId && user?._id && String(currentUserId) === String(user._id);

  return (
    <div className="profile-page">
      {/* Banner */}
      <div className="profile-banner"></div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-container">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">{user.avatar}</div>
          </div>
          <div className="profile-info">
            <h1 className="profile-username">{user.username}</h1>
            <p className="profile-full-username">{user.fullUsername}</p>
            <p className="profile-bio">{user.bio}</p>
          </div>
          <div className="profile-actions">
            {isOwnProfile ? (
              <button className="btn-new-post" onClick={() => onNavigate('create-post', '/r/general/submit')}>
                New Post
              </button>
            ) : (
              <button
                className="btn-new-post"
                onClick={() => onNavigate('chat', `/chat?to=${encodeURIComponent(user._id)}&name=${encodeURIComponent(user.username || '')}`)}
              >
                New Message
              </button>
            )}
            <button className="btn-edit-profile" onClick={() => onNavigate('settings', '/settings')}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content-wrapper">
        <div className="profile-main-content">
          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button
              className={`profile-tab ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              Comments
            </button>
            <button
              className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
          </div>

          {/* Tab Content */}
          <div className="profile-tab-content">
            {activeTab === 'posts' && (
              <div className="posts-list">
                {userPosts.length === 0 ? (
                  <div className="about-content"><div className="about-card">No posts yet.</div></div>
                ) : (
                userPosts.map((post) => (
                  <div key={post.id} className="profile-post-item">
                    <div className="post-vote-column">
                      <button className="vote-btn">▲</button>
                      <span className="vote-score">{post.upvotes}</span>
                      <button className="vote-btn">▼</button>
                    </div>
                    <div className="post-content">
                      <div className="post-meta">
                        <span className="post-community">{post.community}</span>
                        <span className="post-time">• {post.time}</span>
                      </div>
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-text">{post.text}</p>
                      <div className="post-actions">
                        <button className="post-action-btn">💬 {post.comments} Comments</button>
                        <button className="post-action-btn">🔗 Share</button>
                        <button className="post-action-btn">💾 Save</button>
                      </div>
                    </div>
                  </div>
                )))}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="comments-list">
                {userComments.length === 0 ? (
                  <div className="about-content"><div className="about-card">No comments yet.</div></div>
                ) : (
                userComments.map((comment) => (
                  <div key={comment.id} className="profile-comment-item">
                    <div className="comment-vote-column">
                      <button className="vote-btn">▲</button>
                      <span className="vote-score">{comment.upvotes}</span>
                      <button className="vote-btn">▼</button>
                    </div>
                    <div className="comment-content">
                      <div className="comment-meta">
                        <span className="comment-community">{comment.community}</span>
                        <span className="comment-time">• {comment.time}</span>
                      </div>
                      <p className="comment-post-title">on: {comment.post}</p>
                      <p className="comment-text">{comment.text}</p>
                      <div className="comment-actions">
                        <button className="comment-action-btn">💬 Reply</button>
                        <button className="comment-action-btn">🔗 Share</button>
                      </div>
                    </div>
                  </div>
                )))}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="about-content">
                <div className="about-card">
                  <h3>About {user.username}</h3>
                  <div className="about-stats">
                    <div className="stat-item">
                      <span className="stat-label">Karma</span>
                      <span className="stat-value">{user.karma}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Cake day</span>
                      <span className="stat-value">{user.cakeDay}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="sidebar-card">
            <h3>Karma</h3>
            <div className="karma-breakdown">
              <div className="karma-item">
                <span>📝 Post Karma</span>
                <span>892</span>
              </div>
              <div className="karma-item">
                <span>💬 Comment Karma</span>
                <span>342</span>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Trophies</h3>
            <div className="trophies-grid">
              <div className="trophy-item" title="Verified Email">📧</div>
              <div className="trophy-item" title="One-Year Club">🎂</div>
              <div className="trophy-item" title="Well-Rounded">⭐</div>
            </div>
            <button 
              className="view-all-trophies"
              onClick={() => onNavigate('/achievements')}
            >
              View All Trophies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
