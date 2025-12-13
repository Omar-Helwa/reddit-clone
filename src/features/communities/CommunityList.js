import React, { useState, useEffect } from 'react';
import './CommunityList.css';

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
      // Replace with your actual API endpoint
      const response = await fetch('/api/communities');
      const data = await response.json();
      setCommunities(data);
    } catch (error) {
      console.error('Error fetching communities:', error);
      setMockCommunities();
    } finally {
      setLoading(false);
    }
  };

  const setMockCommunities = () => {
    const mockData = [
      {
        id: 'r_hackthebox',
        name: 'r/hackthebox',
        icon: 'https://styles.redditmedia.com/t5_3kc4k/styles/communityIcon_awrm7y13mg851.jpg',
        members: '101K',
        description: 'Discussion about hackthebox.com machines!'
      },
      {
        id: 'r_tryhackme',
        name: 'r/tryhackme',
        icon: 'https://styles.redditmedia.com/t5_ygv5g/styles/communityIcon_kr7d3dc0a9vf1.png',
        members: '94K',
        description: 'Level up your cyber security skills'
      },
      {
        id: 'r_cybersecurity',
        name: 'r/cybersecurity',
        icon: 'https://styles.redditmedia.com/t5_4wiyk8/styles/communityIcon_j5sxctp4tgh71.png',
        members: '45K',
        description: 'Cybersecurity news, discussion, and guidance'
      },
      {
        id: 'r_devsecops',
        name: 'r/devsecops',
        icon: 'https://styles.redditmedia.com/t5_3hhfv/styles/communityIcon.png',
        members: '13K',
        description: 'DevSecOps community and resources'
      },
      {
        id: 'r_bugbounty',
        name: 'r/bugbounty',
        icon: 'https://styles.redditmedia.com/t5_2zisx/styles/communityIcon_j4ynb1c9sar21.png',
        members: '72K',
        description: 'Bug bounty and responsible disclosure'
      }
    ];
    setCommunities(mockData);
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
