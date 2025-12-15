import React, { useState, useEffect } from 'react';
import './CommunityList.css';
import { communities as communityData } from '../../data/mockData';

const CommunityList = () => {
  const primaryNav = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'Popular', href: '/popular', icon: '🔥' },
    { label: 'Explore', href: '/explore', icon: '🔍' },
    { label: 'All', href: '/communities', icon: '🧭' },
    { label: 'Start a community', href: '/create-community', icon: '➕' },
  ];

  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      // Map from shared data source
      const communityList = Object.keys(communityData).map(key => ({
        id: key,
        name: communityData[key].name,
        icon: communityData[key].icon,
        members: communityData[key].members,
        description: communityData[key].description
      }));
      setCommunities(communityList);
    } catch (error) {
      console.error('Error fetching communities:', error);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = (communityId) => {
    console.log(`Joined community: ${communityId}`);
    // Update API to add to user's subscriptions
  };

  if (loading) {
    return <div className="community-list loading">Loading communities...</div>;
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
          communities.map(community => (
            <div key={community.id} className="community-item">
              <a href={`/${community.name}`} className="community-link">
                <img 
                  src={community.icon} 
                  alt={community.name}
                  className="community-icon"
                />
                <div className="community-info">
                  <h3 className="community-name">{community.name}</h3>
                  <p className="community-members">{community.members} members</p>
                </div>
              </a>
              <button 
                className="join-button"
                onClick={() => handleJoinCommunity(community.id)}
              >
                Join
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
