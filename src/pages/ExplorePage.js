import React, { useMemo, useState } from 'react';
import './ExplorePage.css';
import CommunityList from '../features/communities/CommunityList';
import useCommunities from '../hooks/useCommunities';
import { navigate, getJoinedCommunities, joinCommunity, leaveCommunity } from '../utils/helpers';
import { DEFAULT_COMMUNITY_ICON } from '../utils/placeholders';

function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState(getJoinedCommunities());
  const [showMoreRecommended, setShowMoreRecommended] = useState(false);

  const { communities, loading, error } = useCommunities(100);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'most-visited', label: 'Most Visited' },
    { id: 'internet-culture', label: 'Internet Culture' },
    { id: 'games', label: 'Games' },
    { id: 'qna', label: 'Q&As & Stories' },
    { id: 'movies', label: 'Movies & TV' },
    { id: 'technology', label: 'Technology' },
    { id: 'pop-culture', label: 'Pop Culture' },
    { id: 'places', label: 'Places & Travel' },
    { id: 'sports', label: 'Sports' },
    { id: 'business', label: 'Business & Finance' },
  ];

  // Wellness category communities
  const wellnessKeywords = ['workout', 'fitness', 'health', 'gym', 'running', 'wellness', 'adulting', 'mental'];
  
  // Format member count
  const formatMembers = (count) => {
    if (!count) return '0 weekly visitors';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M weekly visitors`;
    if (count >= 1000) return `${Math.floor(count / 1000)}K weekly visitors`;
    return `${count} weekly visitors`;
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleJoinToggle = (communityName) => {
    const slug = (communityName || '').replace(/^r\//, '');
    if (joinedCommunities.includes(slug)) {
      leaveCommunity(slug);
    } else {
      joinCommunity(slug);
    }
    setJoinedCommunities(getJoinedCommunities());
  };

  const isJoined = (communityName) => {
    const slug = (communityName || '').replace(/^r\//, '');
    return joinedCommunities.includes(slug);
  };

  const getCommunitySlug = (community) => {
    const name = community?.name || community?.displayName || '';
    return String(name).replace(/^r\//, '').trim();
  };

  // Filter communities by category
  const filteredCommunities = useMemo(() => {
    if (!communities || !Array.isArray(communities)) return [];
    
    if (selectedCategory === 'all') return communities;
    if (selectedCategory === 'most-visited') {
      return [...communities].sort((a, b) => (b.members || 0) - (a.members || 0));
    }
    
    // Simple keyword matching for categories
    const categoryKeywords = {
      'internet-culture': ['memes', 'funny', 'humor', 'internet', 'viral'],
      'games': ['gaming', 'game', 'playstation', 'xbox', 'nintendo', 'pc'],
      'qna': ['ask', 'question', 'advice', 'stories', 'tifu'],
      'movies': ['movie', 'film', 'tv', 'television', 'netflix', 'show'],
      'technology': ['tech', 'programming', 'coding', 'software', 'computer'],
      'pop-culture': ['celebrity', 'music', 'entertainment', 'pop'],
      'places': ['travel', 'city', 'country', 'place', 'photo'],
      'sports': ['sport', 'football', 'basketball', 'soccer', 'nba', 'nfl'],
      'business': ['business', 'finance', 'money', 'invest', 'stock', 'crypto'],
    };
    
    const keywords = categoryKeywords[selectedCategory] || [];
    return communities.filter(c => {
      const name = (c.name || c.displayName || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      return keywords.some(kw => name.includes(kw) || desc.includes(kw));
    });
  }, [communities, selectedCategory]);

  // Recommended communities (top by members)
  const recommendedCommunities = useMemo(() => {
    const list = filteredCommunities.length > 0 ? filteredCommunities : communities || [];
    const sorted = [...list].sort((a, b) => (b.members || 0) - (a.members || 0));
    return showMoreRecommended ? sorted.slice(0, 12) : sorted.slice(0, 6);
  }, [filteredCommunities, communities, showMoreRecommended]);

  // Wellness communities
  const wellnessCommunities = useMemo(() => {
    if (!communities || !Array.isArray(communities)) return [];
    return communities.filter(c => {
      const name = (c.name || c.displayName || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      return wellnessKeywords.some(kw => name.includes(kw) || desc.includes(kw));
    }).slice(0, 6);
  }, [communities]);

  return (
    <div className={`explore-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Left Sidebar */}
      <aside className={`explore-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar} 
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className={sidebarCollapsed ? 'rotated' : ''}>
            <path d="M12.5 4L6.5 10L12.5 16" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="sidebar-content">
          <CommunityList />
        </div>
      </aside>

      {/* Main Content */}
      <main className="explore-main">
        <h1 className="explore-title">Explore Communities</h1>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Recommended Section */}
        <section className="explore-section">
          <h2 className="section-title">Recommended for you</h2>
          
          {loading && <div className="loading-state">Loading communities...</div>}
          {error && <div className="error-state">Failed to load communities</div>}
          
          {!loading && !error && (
            <>
              <div className="communities-grid">
                {recommendedCommunities.map((community) => {
                  const slug = getCommunitySlug(community);
                  if (!slug) return null;
                  const joined = isJoined(slug);
                  
                  return (
                    <div key={community._id || slug} className="community-card">
                      <div className="community-card-header">
                        <img 
                          src={community.icon || DEFAULT_COMMUNITY_ICON}
                          alt=""
                          className="community-card-icon"
                          onClick={() => navigate(`/r/${slug}`)}
                          onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
                        />
                        <div className="community-card-info">
                          <button 
                            className="community-card-name"
                            onClick={() => navigate(`/r/${slug}`)}
                          >
                            {slug}
                          </button>
                          <span className="community-card-members">{formatMembers(community.members)}</span>
                        </div>
                        <button 
                          className={`community-join-btn ${joined ? 'joined' : ''}`}
                          onClick={() => handleJoinToggle(slug)}
                        >
                          {joined ? 'Joined' : 'Join'}
                        </button>
                      </div>
                      <p className="community-card-desc">
                        {community.description || `Welcome to r/${slug}! A community for discussions and content.`}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              {filteredCommunities.length > 6 && (
                <button 
                  className="show-more-btn"
                  onClick={() => setShowMoreRecommended(!showMoreRecommended)}
                >
                  {showMoreRecommended ? 'Show less' : 'Show more'}
                </button>
              )}
            </>
          )}
        </section>

        {/* Wellness Section */}
        {wellnessCommunities.length > 0 && (
          <section className="explore-section">
            <h2 className="section-title">Wellness</h2>
            
            <div className="communities-grid">
              {wellnessCommunities.map((community) => {
                const slug = getCommunitySlug(community);
                if (!slug) return null;
                const joined = isJoined(slug);
                
                return (
                  <div key={community._id || slug} className="community-card">
                    <div className="community-card-header">
                      <img 
                        src={community.icon || DEFAULT_COMMUNITY_ICON}
                        alt=""
                        className="community-card-icon"
                        onClick={() => navigate(`/r/${slug}`)}
                        onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
                      />
                      <div className="community-card-info">
                        <button 
                          className="community-card-name"
                          onClick={() => navigate(`/r/${slug}`)}
                        >
                          {slug}
                        </button>
                        <span className="community-card-members">{formatMembers(community.members)}</span>
                      </div>
                      <button 
                        className={`community-join-btn ${joined ? 'joined' : ''}`}
                        onClick={() => handleJoinToggle(slug)}
                      >
                        {joined ? 'Joined' : 'Join'}
                      </button>
                    </div>
                    <p className="community-card-desc">
                      {community.description || `Welcome to r/${slug}! A community for discussions and content.`}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Additional communities if no wellness */}
        {wellnessCommunities.length === 0 && communities && communities.length > 6 && (
          <section className="explore-section">
            <h2 className="section-title">More Communities</h2>
            
            <div className="communities-grid">
              {communities.slice(6, 12).map((community) => {
                const slug = getCommunitySlug(community);
                if (!slug) return null;
                const joined = isJoined(slug);
                
                return (
                  <div key={community._id || slug} className="community-card">
                    <div className="community-card-header">
                      <img 
                        src={community.icon || DEFAULT_COMMUNITY_ICON}
                        alt=""
                        className="community-card-icon"
                        onClick={() => navigate(`/r/${slug}`)}
                        onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
                      />
                      <div className="community-card-info">
                        <button 
                          className="community-card-name"
                          onClick={() => navigate(`/r/${slug}`)}
                        >
                          {slug}
                        </button>
                        <span className="community-card-members">{formatMembers(community.members)}</span>
                      </div>
                      <button 
                        className={`community-join-btn ${joined ? 'joined' : ''}`}
                        onClick={() => handleJoinToggle(slug)}
                      >
                        {joined ? 'Joined' : 'Join'}
                      </button>
                    </div>
                    <p className="community-card-desc">
                      {community.description || `Welcome to r/${slug}! A community for discussions and content.`}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default ExplorePage;
