import React, { useState } from 'react';
import './CommunityList.css';
import useCommunities from '../../hooks/useCommunities';
import { getJoinedCommunities, isJoined as isJoinedStore, joinCommunity, leaveCommunity } from '../../utils/helpers';

const CommunityList = () => {
  const primaryNav = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'Popular', href: '/popular', icon: '🔥' },
    { label: 'Explore', href: '/explore', icon: '🔍' },
    { label: 'All', href: '/communities', icon: '🧭' },
    { label: 'Start a community', href: '/create-community', icon: '➕' },
  ];

  const { communities, loading, error } = useCommunities();

  const [joined, setJoined] = useState(() => getJoinedCommunities());

  const handleJoinCommunity = (communityName) => {
    const slug = (communityName || '').replace(/^r\//, '');
    if (!slug) return;

    if (isJoinedStore(slug)) {
      leaveCommunity(slug);
    } else {
      joinCommunity(slug);
    }
    setJoined(getJoinedCommunities());
  };

  if (loading) {
    return <div className="community-list loading">Loading communities...</div>;
  }

  if (error) {
    return <div className="community-list error">Failed to load communities.</div>;
  }

  return (
    <div className="community-list-container">
      <div className="community-list-header">
        <h2>Home</h2>
        <a href="/explore" className="explore-link" title="Explore communities">
          🔍
        </a>
      </div>

      <div className="primary-nav">
        {primaryNav.map((item) => (
          <a key={item.label} href={item.href} className="nav-pill">
            <span className="pill-icon" aria-hidden="true">{item.icon}</span>
            <span className="pill-label">{item.label}</span>
          </a>
        ))}
      </div>

      {/* Quick Links */}
      <div className="nav-sections">
        <div className="nav-section">
          <div className="nav-section-title">Resources</div>
          <a href="/about" className="nav-link">☕ About Reddit</a>
          <a href="/advertise" className="nav-link">📣 Advertise</a>
          <a href="/developer-platform" className="nav-link">🧰 Developer Platform</a>
          <a href="/help" className="nav-link">❓ Help</a>
          <a href="/blog" className="nav-link">📰 Blog</a>
          <a href="/careers" className="nav-link">💼 Careers</a>
          <a href="/press" className="nav-link">🗞️ Press</a>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Communities</div>
          <a href="/communities" className="nav-link">🧭 Communities</a>
          <a href="/best" className="nav-link">🌟 Best of Reddit</a>
          <a href="/popular" className="nav-link">⭐ Popular</a>
          <a href="/explore" className="nav-link">🔍 Explore</a>
          <a href="/create-community" className="nav-link">➕ Create Community</a>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Policies</div>
          <a href="/rules" className="nav-link">📜 Reddit Rules</a>
          <a href="/privacy" className="nav-link">🔒 Privacy Policy</a>
          <a href="/user-agreement" className="nav-link">📑 User Agreement</a>
          <a href="/accessibility" className="nav-link">♿ Accessibility</a>
        </div>
      </div>

      <div className="community-list">
        {communities.length > 0 ? (
          communities.map((community) => (
            <div key={community._id || community.name} className="community-item">
              <a href={`/${community.name}`} className="community-link">
                <img 
                  src={community.icon || 'https://via.placeholder.com/40'} 
                  alt={community.name}
                  className="community-icon"
                />
                <div className="community-info">
                  <h3 className="community-name">{community.name}</h3>
                  <p className="community-members">{community.members ?? 0} members</p>
                </div>
              </a>
              <button 
                className={`join-button ${joined.includes((community.name || '').replace(/^r\//, '')) ? 'joined' : ''}`}
                onClick={() => handleJoinCommunity(community.name)}
              >
                {joined.includes((community.name || '').replace(/^r\//, '')) ? 'Joined' : 'Join'}
              </button>
            </div>
          ))
        ) : (
          <p className="no-communities">No communities found</p>
        )}
      </div>

      <a href="/communities/discover" className="view-all-link">
        View All Communities →
      </a>
    </div>
  );
};

export default CommunityList;
