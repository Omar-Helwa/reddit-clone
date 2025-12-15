import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import { communities } from '../data/mockData';
import { getPosts } from '../utils/helpers';

function ProfilePage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('posts');
  
  // Mock user data
  const user = {
    username: 'Nemo',
    fullUsername: 'u/Sad-Royal-2019',
    karma: 1234,
    cakeDay: 'January 15, 2024',
    avatar: '👽',
    bio: 'Just another Redditor exploring the internet',
  };

  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);

  useEffect(() => {
    // Aggregate posts and comments authored by the current user across all communities
    const author = user.fullUsername;
    const keys = Object.keys(communities);
    const collectedPosts = [];
    const collectedComments = [];
    keys.forEach((key) => {
      const posts = getPosts(key);
      posts.forEach((p) => {
        // Posts authored by user
        if (p.author === author) {
          collectedPosts.push({
            id: p.id,
            community: `r/${key}`,
            title: p.title,
            text: p.textBody || '',
            upvotes: p.score || 0,
            comments: p.commentCount || (p.comments ? p.comments.length : 0),
            time: p.timestamp || 'just now',
          });
        }
        // Comments authored by user
        (p.comments || []).forEach((c) => {
          if (c.author === author) {
            collectedComments.push({
              id: c.id,
              post: p.title,
              community: `r/${key}`,
              text: c.text,
              upvotes: c.score || 0,
              time: c.timestamp || 'just now',
            });
          }
        });
      });
    });
    // Newest first
    setUserPosts(collectedPosts.reverse());
    setUserComments(collectedComments.reverse());
  }, []);

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
            <button className="btn-new-post" onClick={() => onNavigate('create-post', '/r/general/submit')}>
              New Post
            </button>
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
