import React, { useState, useEffect, useMemo } from 'react';
import './CommunityPage.css';
import Post from '../features/posts/Post';
import useCommunities from '../hooks/useCommunities';
import { deleteCommunity } from '../api/communitiesApi';
import { usePostsBySubreddit } from '../hooks/usePosts';
import { isJoined as isJoinedStore, joinCommunity, leaveCommunity, navigate } from '../utils/helpers';

function CommunityPage() {
  const [isJoined, setIsJoined] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [sortBy, setSortBy] = useState('hot');
  const [communityName, setCommunityName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { communities: communityList, loading: communitiesLoading } = useCommunities(200);

  // Extract community name from URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/r\/([^\/]+)/);
    if (match) {
      setCommunityName(match[1]);
    } else {
      setCommunityName('general');
    }
  }, []);

  const community = useMemo(() => {
    const slug = communityName || '';
    const found = communityList.find((c) => c.name === slug || c.displayName === slug || c.name === `r/${slug}` || c.displayName === `r/${slug}`);
    return found || {
      name: `r/${slug || 'community'}`,
      displayName: `r/${slug || 'community'}`,
      description: 'Community details coming soon.',
      icon: 'https://via.placeholder.com/80',
      banner: 'https://via.placeholder.com/1200x200',
      members: 0,
      online: 0,
      createdDate: new Date().toDateString(),
      type: 'Public',
      rules: [],
      moderators: []
    };
  }, [communityList, communityName]);
  // Pass full subreddit name with r/ prefix to match database format
  const subredditKey = communityName ? `r/${communityName}` : '';
  const { posts, loading: postsLoading, error: postsError, refetch } = usePostsBySubreddit(subredditKey);

  useEffect(() => {
    if (communityName) {
      setIsJoined(isJoinedStore(communityName));
    }
  }, [communityName]);

  const handleJoin = () => {
    if (isJoined) {
      leaveCommunity(communityName);
      setIsJoined(false);
    } else {
      joinCommunity(communityName);
      setIsJoined(true);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!window.confirm(`Are you sure you want to delete r/${communityName}? This cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteCommunity(community._id);
      alert(`Community r/${communityName} has been deleted.`);
      navigate('/');
    } catch (err) {
      alert('Failed to delete community: ' + err.message);
      console.error('Error deleting community:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="community-page">
      {/* Banner */}
      <div className="community-banner" style={{ backgroundImage: `url(${community.banner})` }}>
        <div className="banner-overlay"></div>
      </div>

      {/* Header */}
      <div className="community-header">
        <div className="community-header-content">
          <div className="community-info">
            <img src={community.icon} alt={community.name} className="community-icon-large" />
            <div className="community-title-section">
              <h1>{community.displayName}</h1>
              <p className="community-name">{community.name}</p>
            </div>
          </div>
          <div className="community-actions">
            <button className={`join-btn ${isJoined ? 'joined' : ''}`} onClick={handleJoin}>
              {isJoined ? '✓ Joined' : '+ Join'}
            </button>
            <button className="notify-btn" title="Turn on notifications">🔔</button>
            <button 
              className="delete-btn" 
              title="Delete community" 
              onClick={handleDeleteCommunity}
              disabled={isDeleting}
              style={{ background: 'red', color: 'white', padding: '8px 12px', borderRadius: '20px', cursor: isDeleting ? 'not-allowed' : 'pointer' }}
            >
              {isDeleting ? '⏳ Deleting...' : '🗑️ Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="community-nav">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button 
            className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button 
            className={`nav-tab ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            Rules
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="community-content">
        <div className="community-main">
          {activeTab === 'posts' && (
            <>
              <div className="feed-controls">
                <div className="sort-buttons">
                  <button className={`sort-btn ${sortBy === 'hot' ? 'active' : ''}`} onClick={() => setSortBy('hot')}>
                    🔥 Hot
                  </button>
                  <button className={`sort-btn ${sortBy === 'new' ? 'active' : ''}`} onClick={() => setSortBy('new')}>
                    ✨ New
                  </button>
                  <button className={`sort-btn ${sortBy === 'top' ? 'active' : ''}`} onClick={() => setSortBy('top')}>
                    ⬆️ Top
                  </button>
                  <button className={`sort-btn ${sortBy === 'rising' ? 'active' : ''}`} onClick={() => setSortBy('rising')}>
                    📈 Rising
                  </button>
                </div>
                <button className="create-post-btn" onClick={() => navigate(`/r/${communityName}/submit`)}>+ Create Post</button>
              </div>

              <div className="posts-feed">
                {postsLoading && <div className="loading">Loading posts...</div>}
                {postsError && (
                  <div className="error">
                    Failed to load posts: {postsError}
                    <button onClick={refetch} className="retry-btn">Retry</button>
                  </div>
                )}
                {!postsLoading && !postsError && posts.length === 0 && (
                  <div className="no-posts">No posts yet.</div>
                )}
                {!postsLoading && !postsError && posts.length > 0 && posts.map(post => (
                  <div key={post.postId} className="post-wrapper">
                    {post.isPinned && <span className="pinned-badge">📌 Pinned by moderators</span>}
                    <Post 
                      postId={post.postId}
                      title={post.title}
                      author={post.author}
                      subreddit={communityName}
                      timestamp={post.createdAt || post.timestamp}
                      score={post.score}
                      commentCount={post.commentCount}
                      textBody={post.textBody}
                      onCommentClick={() => navigate(`/r/${communityName}/comments/${post.postId}?comment=1`)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'about' && (
            <div className="about-content">
              <h2>About Community</h2>
              <p>{community.description}</p>
              <div className="community-details">
                <div className="detail-row">
                  <strong>Type:</strong> <span>{community.type}</span>
                </div>
                <div className="detail-row">
                  <strong>Created:</strong> <span>{community.createdDate}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="rules-content">
              <h2>Community Rules</h2>
              <div className="rules-list">
                {community.rules.map((rule, index) => (
                  <div key={index} className="rule-item">
                    <span className="rule-number">{index + 1}</span>
                    <span className="rule-text">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="community-sidebar">
          <div className="sidebar-card">
            <h3>About Community</h3>
            <p className="sidebar-description">{community.description}</p>
            <div className="community-stats">
              <div className="stat">
                <strong>{community.members}</strong>
                <span>Members</span>
              </div>
              <div className="stat">
                <strong>{community.online}</strong>
                <span>Online</span>
              </div>
            </div>
            <p className="created-date">{community.createdDate}</p>
            <button 
              className="create-post-btn-full"
              onClick={() => navigate(`/r/${communityName}/submit`)}
            >
              Create Post
            </button>
          </div>

          <div className="sidebar-card">
            <h3>Community Rules</h3>
            <div className="rules-preview">
              {community.rules.slice(0, 3).map((rule, index) => (
                <div key={index} className="rule-preview-item">
                  {index + 1}. {rule}
                </div>
              ))}
            </div>
            <button className="see-all-btn" onClick={() => setActiveTab('rules')}>
              See all rules →
            </button>
          </div>

          <div className="sidebar-card">
            <h3>Moderators</h3>
            <div className="moderators-list">
              {community.moderators.map((mod, index) => (
                <div key={index} className="moderator-item">
                  <span className="mod-icon">👤</span>
                  <span className="mod-name">{mod}</span>
                </div>
              ))}
            </div>
            <button className="message-mods-btn">Message the mods</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CommunityPage;
