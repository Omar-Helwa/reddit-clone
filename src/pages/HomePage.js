import React, { useMemo, useState } from 'react';
import PostList from '../features/posts/PostList';
import CommunityList from '../features/communities/CommunityList';
import SortDropdown from '../components/SortDropdown';
import './HomePage.css';
import { usePosts } from '../hooks/usePosts';
import { navigate } from '../utils/helpers';

function HomePage() {
  const { posts, loading, error } = usePosts();
  const [hiddenPostIds, setHiddenPostIds] = useState([]);
  const [sortBy, setSortBy] = useState('BEST');
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.max(0, now - then);
    const minutes = Math.floor(diff / (60 * 1000));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };
  const recentPosts = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];
    return [...list]
      .filter(p => p && p.title && p.subreddit && !hiddenPostIds.includes(p.postId))
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })
      .slice(0, 5)
      .map(p => {
        const subreddit = p.subreddit;
        const slug = subreddit.startsWith('r/') ? subreddit.slice(2) : subreddit;
        return {
          id: p.postId,
          title: p.title,
          subreddit,
          meta: `${formatTimeAgo(p.createdAt)}${typeof p.commentCount === 'number' ? ` • ${p.commentCount} comments` : ''}`,
          path: `/r/${slug}/comments/${p.postId}`,
        };
      });
  }, [posts, hiddenPostIds]);

  const handleClearRecentPosts = () => {
    const currentPostIds = recentPosts.map(p => p.id);
    setHiddenPostIds(prev => [...prev, ...currentPostIds]);
  };

  return (
    <main className="home-page">
      <aside className="home-sidebar">
        <CommunityList />
      </aside>

      <section className="home-main-content">
        <div className="home-sort-bar">
          <SortDropdown currentSort={sortBy} onSortChange={setSortBy} />
          <button className="view-toggle-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="2" y="3" width="7" height="6" rx="1"/>
              <rect x="11" y="3" width="7" height="6" rx="1"/>
              <rect x="2" y="11" width="7" height="6" rx="1"/>
              <rect x="11" y="11" width="7" height="6" rx="1"/>
            </svg>
            <span className="view-icon-chevron">▼</span>
          </button>
        </div>
        <PostList sortBy={sortBy} />
      </section>

      <aside className="home-right-sidebar">
        <div className="sidebar-widget">
          <div className="widget-header">
            <h3>Recent Posts</h3>
            <span className="widget-action" onClick={handleClearRecentPosts} style={{ cursor: 'pointer' }}>Clear</span>
          </div>
          <div className="recent-posts">
            {loading && (
              <div className="recent-post-item">Loading recent posts...</div>
            )}
            {error && !loading && (
              <div className="recent-post-item">Failed to load recent posts</div>
            )}
            {!loading && !error && recentPosts.length === 0 && (
              <div className="recent-post-item">No recent posts yet</div>
            )}
            {!loading && !error && recentPosts.map((post) => (
              <div
                key={post.id || post.title}
                className="recent-post-item"
                role="button"
                onClick={() => navigate(post.path)}
              >
                <div className="recent-post-dot" aria-hidden="true" />
                <div className="recent-post-body">
                  <div className="recent-post-title">{post.title}</div>
                  <div className="recent-post-meta">{post.subreddit} • {post.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}

export default HomePage;
