import { useMemo, useState, useEffect, useRef } from 'react';
import Post from '../features/posts/Post';
import CommunityList from '../features/communities/CommunityList';
import './AllPage.css';
import { usePosts } from '../hooks/usePosts';
import { navigate } from '../utils/helpers';

function AllPage() {
  const { posts, loading, error } = usePosts();
  const [sortBy, setSortBy] = useState('HOT');
  const [viewMode, setViewMode] = useState('card');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Dropdown states
  const [sortOpen, setSortOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  // Refs for click outside detection
  const sortRef = useRef(null);
  const viewRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
      if (viewRef.current && !viewRef.current.contains(event.target)) {
        setViewOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { id: 'HOT', label: 'Hot', icon: '🔥' },
    { id: 'NEW', label: 'New', icon: '✨' },
    { id: 'TOP', label: 'Top', icon: '📈' },
    { id: 'RISING', label: 'Rising', icon: '🚀' },
  ];

  const viewOptions = [
    { id: 'card', label: 'Card', icon: '▢' },
    { id: 'compact', label: 'Compact', icon: '≡' },
  ];

  const sortedPosts = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];
    const filtered = [...list].filter(p => p && p.title);

    switch (sortBy) {
      case 'HOT':
        return filtered.sort((a, b) => {
          const scoreA = (a.score || 0) + (a.commentCount || 0) * 2;
          const scoreB = (b.score || 0) + (b.commentCount || 0) * 2;
          return scoreB - scoreA;
        });
      case 'NEW':
        return filtered.sort((a, b) => {
          const da = new Date(a.createdAt || 0).getTime();
          const db = new Date(b.createdAt || 0).getTime();
          return db - da;
        });
      case 'TOP':
        return filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
      case 'RISING':
        return filtered.sort((a, b) => {
          const ageA = Date.now() - new Date(a.createdAt || Date.now()).getTime();
          const ageB = Date.now() - new Date(b.createdAt || Date.now()).getTime();
          const rateA = (a.score || 0) / Math.max(ageA / 3600000, 1);
          const rateB = (b.score || 0) / Math.max(ageB / 3600000, 1);
          return rateB - rateA;
        });
      default:
        return filtered;
    }
  }, [posts, sortBy]);

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  const handlePostClick = (postId, subreddit) => {
    const slug = subreddit?.replace(/^r\//, '') || 'all';
    navigate(`/r/${slug}/comments/${postId}`);
  };

  const currentSortLabel = sortOptions.find(s => s.id === sortBy)?.label || 'Hot';

  return (
    <main className={`all-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Left Sidebar */}
      <aside className={`all-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar} 
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg viewBox="0 0 20 20" className={sidebarCollapsed ? 'rotated' : ''}>
            <path d="M12.5 4L6.5 10L12.5 16" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="sidebar-content">
          <CommunityList />
        </div>
      </aside>

      <div className="all-page-inner">
        {/* Main Content */}
        <section className="all-main-content">
        {/* Sort/Filter Bar - Like Reddit: Sort dropdown + View button */}
        <div className="all-sort-bar">
          {/* Sort Dropdown */}
          <div className="all-dropdown" ref={sortRef}>
            <button
              className="all-dropdown-trigger"
              onClick={() => {
                setSortOpen(!sortOpen);
                setViewOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={sortOpen}
            >
              <span>{currentSortLabel}</span>
              <span className={`all-dropdown-arrow ${sortOpen ? 'open' : ''}`}>▼</span>
            </button>
            {sortOpen && (
              <div className="all-dropdown-menu">
                <div className="all-dropdown-header">Sort by</div>
                {sortOptions.map(option => (
                  <button
                    key={option.id}
                    className={`all-dropdown-item ${sortBy === option.id ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy(option.id);
                      setSortOpen(false);
                    }}
                  >
                    <span className="all-dropdown-icon">{option.icon}</span>
                    <span className="all-dropdown-label">{option.label}</span>
                    {sortBy === option.id && <span className="all-dropdown-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Mode Dropdown */}
          <div className="all-dropdown" ref={viewRef}>
            <button
              className="all-dropdown-trigger view-trigger"
              onClick={() => {
                setViewOpen(!viewOpen);
                setSortOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={viewOpen}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="view-grid-icon">
                <rect x="2" y="3" width="7" height="6" rx="1"/>
                <rect x="11" y="3" width="7" height="6" rx="1"/>
                <rect x="2" y="11" width="7" height="6" rx="1"/>
                <rect x="11" y="11" width="7" height="6" rx="1"/>
              </svg>
              <span className={`all-dropdown-arrow ${viewOpen ? 'open' : ''}`}>▼</span>
            </button>
            {viewOpen && (
              <div className="all-dropdown-menu">
                <div className="all-dropdown-header">View</div>
                {viewOptions.map(option => (
                  <button
                    key={option.id}
                    className={`all-dropdown-item ${viewMode === option.id ? 'active' : ''}`}
                    onClick={() => {
                      setViewMode(option.id);
                      setViewOpen(false);
                    }}
                  >
                    <span className="all-dropdown-icon">{option.icon}</span>
                    <span className="all-dropdown-label">{option.label}</span>
                    {viewMode === option.id && <span className="all-dropdown-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Posts Feed */}
        <div className={`all-posts-feed ${viewMode}`}>
          {loading && (
            <div className="all-loading">
              <div className="loading-spinner"></div>
              <span>Loading posts...</span>
            </div>
          )}
          {error && !loading && (
            <div className="all-error">
              <span>Failed to load posts</span>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}
          {!loading && !error && sortedPosts.length === 0 && (
            <div className="all-empty">
              <span>No posts found</span>
            </div>
          )}
          {!loading && !error && sortedPosts.map((post) => (
            <Post
              key={post.postId || post._id}
              postId={post.postId || post._id}
              communityKey={post.subreddit}
              title={post.title}
              author={post.author || post.userId}
              authorId={post.userId || post.authorId}
              subreddit={post.subreddit?.startsWith('r/') ? post.subreddit : `r/${post.subreddit || 'all'}`}
              timestamp={post.createdAt}
              score={post.score || 0}
              commentCount={post.commentCount || 0}
              textBody={post.textBody || post.body}
              imageUrl={post.imageUrl}
              subredditIcon={post.subredditIcon}
              authorIcon={post.authorIcon}
              onCommentClick={() => handlePostClick(post.postId || post._id, post.subreddit)}
              onSubredditClick={() => navigate(`/r/${(post.subreddit || '').replace(/^r\//, '')}`)}
            />
          ))}
        </div>
      </section>

        {/* Right Sidebar */}
        <aside className="all-right-sidebar">
          <div className="sidebar-widget footer-widget">
            <div className="footer-links">
              <a href="/rules">Content Policy</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/user-agreement">User Agreement</a>
            </div>
            <div className="footer-copyright">
              Reddit, Inc. © 2025. All rights reserved.
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default AllPage;
