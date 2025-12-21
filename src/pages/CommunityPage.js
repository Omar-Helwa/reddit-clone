import React, { useState, useEffect, useMemo } from 'react';
import './CommunityPage.css';
import Post from '../features/posts/Post';
import useCommunities from '../hooks/useCommunities';
import { deleteCommunity } from '../api/communitiesApi';
import { usePostsBySubreddit } from '../hooks/usePosts';
import { isJoined as isJoinedStore, joinCommunity, leaveCommunity, navigate } from '../utils/helpers';
import { isFavoriteCommunity, toggleFavoriteCommunity } from '../utils/favorites';
import { DEFAULT_COMMUNITY_ICON } from '../utils/placeholders';

function formatCommunityCreated(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (!/^\d{4}-\d{2}-\d{2}T/.test(trimmed) && !/\d{2}:\d{2}:\d{2}/.test(trimmed)) return trimmed;
  }
  const ms = new Date(value).getTime();
  if (Number.isNaN(ms)) return String(value);
  return new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function CommunityPage() {
  const [isJoined, setIsJoined] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sortBy, setSortBy] = useState('best');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { communities: communityList } = useCommunities(200);

  // Extract community name from URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/r\/([^/]+)/);
    if (match) {
      setCommunityName(match[1]);
    } else {
      setCommunityName('');
    }
  }, []);

  const community = useMemo(() => {
    const slug = communityName || '';
    const found = communityList.find((c) => c.name === slug || c.displayName === slug || c.name === `r/${slug}` || c.displayName === `r/${slug}`);
    return found || {
      name: `r/${slug || 'community'}`,
      displayName: slug || 'Community',
      description: 'Community details coming soon.',
      icon: DEFAULT_COMMUNITY_ICON,
      members: 0,
      online: 0,
      weeklyVisitors: 0,
      weeklyContributions: 0,
      createdAt: new Date().toISOString(),
      type: 'Public',
      rules: [],
      moderators: ['u/moderator1', 'u/moderator2']
    };
  }, [communityList, communityName]);

  const createdLabel = useMemo(() => {
    return formatCommunityCreated(community?.createdAt || community?.createdDate || community?.created);
  }, [community]);

  const subredditKey = communityName ? `${communityName}` : '';
  const { posts, loading: postsLoading, error: postsError, refetch } = usePostsBySubreddit(subredditKey);

  const getTimestampMs = (post) => {
    const raw = post?.createdAt || post?.timestamp || post?.created || 0;
    const ms = new Date(raw).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  };

  const sortedPosts = useMemo(() => {
    const hotRank = (post, exponent = 1.5) => {
      const score = Number(post?.score) || 0;
      const ts = getTimestampMs(post);
      const hoursSince = Math.max(0, (Date.now() - ts) / 3600000);
      return score / Math.pow(hoursSince + 2, exponent);
    };

    const list = Array.isArray(posts) ? posts : [];
    switch (sortBy) {
      case 'new':
        return [...list].sort((a, b) => getTimestampMs(b) - getTimestampMs(a));
      case 'top':
        return [...list].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0) || getTimestampMs(b) - getTimestampMs(a));
      case 'hot':
        return [...list].sort((a, b) => hotRank(b, 1.5) - hotRank(a, 1.5) || getTimestampMs(b) - getTimestampMs(a));
      case 'best':
      default:
        return [...list].sort((a, b) => hotRank(b, 1.3) - hotRank(a, 1.3) || getTimestampMs(b) - getTimestampMs(a));
    }
  }, [posts, sortBy]);

  useEffect(() => {
    if (communityName) {
      setIsJoined(isJoinedStore(communityName));
      setIsFavorite(isFavoriteCommunity(communityName));
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
    } finally {
      setIsDeleting(false);
      setShowMoreMenu(false);
    }
  };

  const handleToggleFavorite = () => {
    const next = toggleFavoriteCommunity(communityName);
    setIsFavorite(next);
    setShowMoreMenu(false);
  };

  const sortOptions = [
    { value: 'best', label: 'Best', icon: '🏆' },
    { value: 'hot', label: 'Hot', icon: '🔥' },
    { value: 'new', label: 'New', icon: '✨' },
    { value: 'top', label: 'Top', icon: '⬆️' },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSortDropdown(false);
      setShowMoreMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="community-page">
      <div className="community-layout">
        {/* Main Content */}
        <main className="community-main">
          {/* Community Header */}
          <div className="community-header-card">
            <div className="community-header-left">
              <div className="community-icon-wrapper">
                <img
                  src={community.icon || DEFAULT_COMMUNITY_ICON}
                  alt={community.name}
                  className="community-icon"
                  onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
                />
              </div>
              <h1 className="community-title">r/{communityName}</h1>
            </div>
            <div className="community-header-actions">
              <button 
                className="header-action-btn create-post-btn"
                onClick={() => navigate(`/r/${communityName}/submit`)}
              >
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <path fill="currentColor" d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Create Post
              </button>
              <button className="header-action-btn icon-btn" title="Notifications">
                <svg viewBox="0 0 20 20" width="20" height="20">
                  <path fill="currentColor" d="M10 18a2 2 0 0 0 2-2H8a2 2 0 0 0 2 2zm6-5V9c0-3.07-1.64-5.64-4.5-6.32V2a1.5 1.5 0 0 0-3 0v.68C5.63 3.36 4 5.92 4 9v4l-2 2v1h16v-1l-2-2z"/>
                </svg>
              </button>
              <button 
                className={`header-action-btn join-btn ${isJoined ? 'joined' : ''}`}
                onClick={handleJoin}
              >
                {isJoined ? 'Joined' : 'Join'}
              </button>
              <div className="more-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="header-action-btn icon-btn more-btn"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                >
                  <svg viewBox="0 0 20 20" width="20" height="20">
                    <circle cx="4" cy="10" r="2" fill="currentColor"/>
                    <circle cx="10" cy="10" r="2" fill="currentColor"/>
                    <circle cx="16" cy="10" r="2" fill="currentColor"/>
                  </svg>
                </button>
                {showMoreMenu && (
                  <div className="more-menu-dropdown">
                    <button onClick={handleToggleFavorite}>
                      {isFavorite ? '★ Remove from favorites' : '☆ Add to favorites'}
                    </button>
                    <button onClick={handleDeleteCommunity} disabled={isDeleting} className="delete-option">
                      {isDeleting ? '⏳ Deleting...' : '🗑️ Delete community'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="feed-sort-bar">
            <div className="sort-dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
              <button 
                className="sort-dropdown-btn"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                <span>{sortOptions.find(o => o.value === sortBy)?.label || 'Best'}</span>
                <svg viewBox="0 0 20 20" width="12" height="12">
                  <path fill="currentColor" d="M5 8l5 5 5-5z"/>
                </svg>
              </button>
              {showSortDropdown && (
                <div className="sort-dropdown-menu">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      className={sortBy === option.value ? 'active' : ''}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                    >
                      <span className="sort-icon">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="view-toggle-btn" title="Card view">
              <svg viewBox="0 0 20 20" width="18" height="18">
                <rect x="2" y="2" width="7" height="7" rx="1" fill="currentColor"/>
                <rect x="11" y="2" width="7" height="7" rx="1" fill="currentColor"/>
                <rect x="2" y="11" width="7" height="7" rx="1" fill="currentColor"/>
                <rect x="11" y="11" width="7" height="7" rx="1" fill="currentColor"/>
              </svg>
              <svg viewBox="0 0 20 20" width="12" height="12" className="chevron">
                <path fill="currentColor" d="M5 8l5 5 5-5z"/>
              </svg>
            </button>
          </div>

          {/* Posts Feed */}
          <div className="posts-feed">
            {postsLoading && <div className="loading-state">Loading posts...</div>}
            {postsError && (
              <div className="error-state">
                Failed to load posts: {postsError}
                <button onClick={refetch} className="retry-btn">Retry</button>
              </div>
            )}
            {!postsLoading && !postsError && posts.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No posts yet</h3>
                <p>Be the first to share something with this community!</p>
                <button 
                  className="empty-cta-btn"
                  onClick={() => navigate(`/r/${communityName}/submit`)}
                >
                  Create Post
                </button>
              </div>
            )}
            {!postsLoading && !postsError && sortedPosts.length > 0 && sortedPosts.map(post => (
              <div key={post.postId} className="post-item">
                {post.isPinned && <span className="pinned-indicator">📌 Pinned by moderators</span>}
                <Post 
                  postId={post.postId}
                  communityKey={communityName}
                  title={post.title}
                  author={post.author}
                  authorId={post.authorId}
                  subreddit={`r/${communityName}`}
                  timestamp={post.createdAt || post.timestamp}
                  score={post.score}
                  commentCount={post.commentCount}
                  textBody={post.textBody}
                  imageUrl={post.imageUrl}
                  onCommentClick={() => navigate(`/r/${communityName}/comments/${post.postId}?comment=1`)}
                />
              </div>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="community-sidebar">
          {/* Community Info Card */}
          <div className="sidebar-card info-card">
            <h3 className="info-title">{community.displayName || communityName}</h3>
            <div className="info-meta">
              <div className="meta-item">
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <path fill="currentColor" d="M6 2a2 2 0 0 0-2 2v1H3a1 1 0 0 0 0 2h1v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7h1a1 1 0 1 0 0-2h-1V4a2 2 0 0 0-2-2H6zm0 2h8v1H6V4zm0 3h8v9H6V7z"/>
                </svg>
                <span>Created {createdLabel}</span>
              </div>
              <div className="meta-item">
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="10" cy="10" r="3" fill="currentColor"/>
                </svg>
                <span>{community.type || 'Public'}</span>
              </div>
            </div>
            <div className="community-stats-row">
              <div className="stat-item">
                <strong>{community.members?.toLocaleString() || community.weeklyVisitors?.toLocaleString() || '0'}</strong>
                <span>Weekly visitors</span>
              </div>
              <div className="stat-item">
                <strong>{community.online?.toLocaleString() || community.weeklyContributions?.toLocaleString() || '0'}</strong>
                <span>Weekly contributions</span>
              </div>
            </div>
          </div>

          {/* Moderators Card */}
          <div className="sidebar-card moderators-card">
            <h4 className="card-section-title">MODERATORS</h4>
            <button className="message-mods-btn">
              <svg viewBox="0 0 20 20" width="16" height="16">
                <path fill="currentColor" d="M2 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6l-4 4V4z"/>
              </svg>
              Message Mods
            </button>
            <div className="moderators-list">
              {(community.moderators || ['u/moderator']).map((mod, index) => (
                <a key={index} href={`/user/${mod.replace('u/', '')}`} className="moderator-item">
                  <div className="mod-avatar">
                    <svg viewBox="0 0 20 20" width="20" height="20">
                      <circle cx="10" cy="10" r="10" fill="#46d160"/>
                      <circle cx="10" cy="8" r="3" fill="white"/>
                      <ellipse cx="10" cy="15" rx="5" ry="3" fill="white"/>
                    </svg>
                  </div>
                  <span className="mod-name">{mod}</span>
                </a>
              ))}
            </div>
            <button className="view-all-mods-btn">View all moderators</button>
          </div>

          {/* Footer Links */}
          <div className="sidebar-footer">
            <a href="/content-policy">Reddit Rules</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/user-agreement">User Agreement</a>
            <a href="/accessibility">Accessibility</a>
            <p className="copyright">Reddit, Inc. © 2025. All rights reserved.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CommunityPage;
