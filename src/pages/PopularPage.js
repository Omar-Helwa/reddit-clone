import React, { useMemo, useState } from 'react';
import Post from '../features/posts/Post';
import './PopularPage.css';
import { usePosts } from '../hooks/usePosts';

function PopularPage() {
  const [timeFilter, setTimeFilter] = useState('today');
  const [location, setLocation] = useState('everywhere');

  const timeFilters = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' }
  ];

  const locations = [
    { id: 'everywhere', label: 'Everywhere' },
    { id: 'us', label: 'United States' },
    { id: 'uk', label: 'United Kingdom' },
    { id: 'canada', label: 'Canada' },
    { id: 'australia', label: 'Australia' }
  ];

  const { posts, loading, error, refetch } = usePosts();

  const cutoff = useMemo(() => {
    const now = new Date();
    const map = {
      today: () => new Date(now.getTime() - 24 * 60 * 60 * 1000),
      week: () => new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: () => new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      year: () => new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      all: () => new Date(0),
    };
    return (map[timeFilter] || map.today)();
  }, [timeFilter]);

  const popularPosts = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];
    return list
      .filter(p => {
        const created = new Date(p.createdAt || Date.now());
        return created >= cutoff;
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 50);
  }, [posts, cutoff]);

  const handleUpvote = (postId) => {
    console.log(`Upvoted post: ${postId}`);
  };

  const handleDownvote = (postId) => {
    console.log(`Downvoted post: ${postId}`);
  };

  const handleCommentClick = (postId) => {
    console.log(`Navigate to post: ${postId}`);
  };

  return (
    <div className="popular-page">
      <div className="popular-header">
        <div className="popular-header-content">
          <h1>⭐ Popular Posts</h1>
          <p>The most upvoted posts on Reddit right now</p>
        </div>
      </div>

      <div className="popular-container">
        {/* Filters Section */}
        <div className="popular-filters">
          <div className="filter-group">
            <label>Time:</label>
            <div className="filter-buttons">
              {timeFilters.map(filter => (
                <button
                  key={filter.id}
                  className={`filter-btn ${timeFilter === filter.id ? 'active' : ''}`}
                  onClick={() => setTimeFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Location:</label>
            <select 
              className="location-select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts List */}
        <div className="popular-posts-list">
          {loading && <div className="loading">Loading posts...</div>}
          {error && (
            <div className="error">
              Failed to load posts
              <button className="retry-btn" onClick={refetch}>Retry</button>
            </div>
          )}
          {!loading && !error && popularPosts.map((post, index) => (
            <div key={post.postId} className="popular-post-wrapper">
              <div className="post-rank">{index + 1}</div>
              <Post
                {...post}
                onUpvote={() => handleUpvote(post.postId)}
                onDownvote={() => handleDownvote(post.postId)}
                onCommentClick={() => handleCommentClick(post.postId)}
              />
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="load-more-section">
          <button className="load-more-btn" onClick={refetch}>Refresh</button>
        </div>
      </div>
    </div>
  );
}

export default PopularPage;
