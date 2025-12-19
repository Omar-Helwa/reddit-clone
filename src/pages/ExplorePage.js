import React, { useMemo, useState } from 'react';
import './ExplorePage.css';
import useCommunities from '../hooks/useCommunities';

function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const { communities, loading, error } = useCommunities(200);

  const categories = [
    { id: 'trending', label: 'Trending', icon: '🔥' },
    { id: 'popular', label: 'Popular', icon: '⭐' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'memes', label: 'Memes', icon: '😂' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'movies', label: 'Movies', icon: '🎬' },
  ];

  // Build API-backed lists from communities
  const sortedByMembers = useMemo(() => {
    const list = Array.isArray(communities) ? communities.slice() : [];
    return list.sort((a, b) => (b.members || 0) - (a.members || 0));
  }, [communities]);

  const trendingCommunities = useMemo(() => sortedByMembers.slice(0, 6), [sortedByMembers]);
  const recommendedCommunities = useMemo(() => sortedByMembers.slice(6, 12), [sortedByMembers]);

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Explore</h1>
        <p>Discover trending communities and topics</p>
      </div>

      {/* Category Filter */}
      <div className="explore-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="explore-content">
        {/* Trending Topics Section */}
        <section className="explore-section">
          <div className="section-header">
            <h2>🔥 Trending Now</h2>
            <a href="#view-all" className="view-all-link">View All</a>
          </div>
          <div className="topics-grid">
            {loading && <div className="loading">Loading communities...</div>}
            {error && <div className="error">Failed to load communities</div>}
            {!loading && !error && trendingCommunities.slice(0, 4).map(comm => (
              <div key={comm._id || comm.name} className="topic-card">
                <div className="topic-icon">🏷️</div>
                <div className="topic-content">
                  <h3 className="topic-title">{comm.displayName || comm.name}</h3>
                  <p className="topic-description">{comm.description || 'A growing community'}</p>
                  <div className="topic-footer">
                    <span className="topic-members">{comm.members || 0} members</span>
                    <span className="trending-badge">Trending</span>
                  </div>
                </div>
                <button className="join-topic-btn" onClick={() => window.location.href = `/r/${(comm.name || '').replace(/^r\//,'')}`}>View</button>
              </div>
            ))}
          </div>
        </section>

        {/* Community Recommendations */}
        <section className="explore-section">
          <div className="section-header">
            <h2>⭐ Recommended Communities</h2>
            <a href="#view-all" className="view-all-link">View All</a>
          </div>
          <div className="communities-list">
            {loading && <div className="loading">Loading communities...</div>}
            {error && <div className="error">Failed to load communities</div>}
            {!loading && !error && recommendedCommunities.map(community => (
              <div key={community._id || community.name} className="community-row">
                <div className="community-row-icon">🏘️</div>
                <div className="community-row-content">
                  <h4 className="community-row-name">{community.displayName || community.name}</h4>
                  <p className="community-row-desc">{community.description || 'Community'}</p>
                  <span className="community-row-members">{community.members || 0} members</span>
                </div>
                <button className="join-community-btn" onClick={() => window.location.href = `/r/${(community.name || '').replace(/^r\//,'')}`}>View</button>
              </div>
            ))}
          </div>
        </section>

        {/* More Topics */}
        <section className="explore-section">
          <div className="section-header">
            <h2>📈 More Popular Topics</h2>
          </div>
          <div className="topics-grid">
            {!loading && !error && trendingCommunities.slice(4, 8).map(comm => (
              <div key={comm._id || comm.name} className="topic-card">
                <div className="topic-icon">🏷️</div>
                <div className="topic-content">
                  <h3 className="topic-title">{comm.displayName || comm.name}</h3>
                  <p className="topic-description">{comm.description || 'A growing community'}</p>
                  <div className="topic-footer">
                    <span className="topic-members">{comm.members || 0} members</span>
                  </div>
                </div>
                <button className="join-topic-btn" onClick={() => window.location.href = `/r/${(comm.name || '').replace(/^r\//,'')}`}>View</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ExplorePage;
