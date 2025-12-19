import React, { useState } from 'react';
import './CommunityList.css';
import useCommunities from '../../hooks/useCommunities';
import { getCurrentUser } from '../../utils/auth';
import CreateCommunityModal from '../../components/CreateCommunityModal';

import { DEFAULT_COMMUNITY_ICON } from '../../utils/placeholders';

const CommunityList = () => {
  const pickCommunityText = (community) => {
    const candidates = [
      community?.displayName,
      community?.name,
      community?.slug,
      community?.subreddit,
      community?.communityName,
      community?.title,
    ];
    for (const value of candidates) {
      const text = typeof value === 'string' ? value.trim() : '';
      if (!text) continue;
      if (text.toLowerCase() === 'r/' || text.toLowerCase() === '/r/') continue;
      return text;
    }
    return '';
  };

  const getCommunitySlug = (community) => {
    const raw = pickCommunityText(community);
    const slug = String(raw).replace(/^\//, '').replace(/^r\//i, '').trim();
    return slug;
  };

  const getCommunityLabel = (community) => {
    const raw = pickCommunityText(community);
    const trimmed = String(raw).trim();
    if (!trimmed) return 'r/community';
    const noPrefix = trimmed.replace(/^\/?r\//i, '');
    if (!noPrefix) return 'r/community';
    return `r/${noPrefix}`;
  };
  const [sectionsExpanded, setSectionsExpanded] = useState({
    recent: true,
    communities: true,
    resources: true,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleOpenCreateCommunity = (e) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    setShowCreateModal(true);
  };

  const toggleSection = (section) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const primaryNav = [
    { label: 'Home', href: '/', icon: 'home' },
    { label: 'Popular', href: '/popular', icon: 'popular' },
    { label: 'Explore', href: '/explore', icon: 'explore' },
    { label: 'All', href: '/all', icon: 'all' },
  ];

  const { communities, loading, error } = useCommunities();

  if (loading) {
    return <div className="community-list loading">Loading communities...</div>;
  }

  if (error) {
    return <div className="community-list error">Failed to load communities.</div>;
  }

  const renderIcon = (iconName) => {
    const icons = {
      home: <svg className="nav-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 0.5l-10 9h3v10h6v-6h2v6h6v-10h3l-10-9z"/></svg>,
      popular: <svg className="nav-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2l2.4 6.5 6.6.5-5 4.5 1.5 6.5-5.5-3.5-5.5 3.5 1.5-6.5-5-4.5 6.6-.5z"/></svg>,
      explore: <svg className="nav-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/><circle cx="10" cy="10" r="2"/></svg>,
      all: <svg className="nav-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 0c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/><path d="M8 6h4v8h-4z"/></svg>,
      chevron: <svg className="chevron-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      star: <svg className="star-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 1l2.5 6.5 6.5.5-5 4.5 1.5 6.5-5.5-3.5-5.5 3.5 1.5-6.5-5-4.5 6.5-.5z"/></svg>,
      settings: <svg className="nav-icon-small" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm8.5 2.5l-1.8-.8.5-1.9-1.8-.8-.8-1.8-1.9.5-.8-1.8h-2l-.8 1.8-1.9-.5-.8 1.8-1.8.8.5 1.9-1.8.8v2l1.8.8-.5 1.9 1.8.8.8 1.8 1.9-.5.8 1.8h2l.8-1.8 1.9.5.8-1.8 1.8-.8-.5-1.9 1.8-.8v-2z"/></svg>,
      about: <svg className="nav-icon-small" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5S10.8 6 10 6zm0 5c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1s1-.4 1-1v-3c0-.6-.4-1-1-1z" fill="currentColor"/></svg>,
      advertise: <svg className="nav-icon-small" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M3 4l4 8-4 8h2l4-8-4-8H3zm6 0l4 8-4 8h2l4-8-4-8H9z" fill="currentColor"/></svg>,
      developer: <svg className="nav-icon-small" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2l-8 4.5v7l8 4.5 8-4.5v-7L10 2zm0 2l5.5 3.1L10 10.2 4.5 7.1 10 4zm-6 5.2l5 2.8v5.5l-5-2.8V9.2zm7 8.3v-5.5l5-2.8v5.5l-5 2.8z" fill="currentColor"/></svg>,
      help: <svg className="nav-icon-small" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6c-1.7 0-3 1.3-3 3h1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 1.5-2.3 1.3-2.3 3.8h1.5c0-1.7 2.3-1.9 2.3-3.8 0-1.7-1.3-3-3-3zm-.8 9h1.6v1.5H9.2V15z" fill="currentColor"/></svg>,
      blog: <svg className="nav-icon-small" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v14h14V3H3zm12 12H5V5h10v10zM7 7h6v1.5H7V7zm0 3h6v1.5H7V10zm0 3h4v1.5H7V13z" fill="currentColor"/></svg>,
      careers: <svg className="nav-icon-small" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7 5V3h6v2h4v12H3V5h4zm1.5 0h3V4.5h-3V5zM4.5 6.5v9h11v-9h-11z" fill="currentColor"/></svg>,
      press: <svg className="nav-icon-small" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v14h14V3H3zm12 12H5V5h10v10zm-8-8h6v1.5H7V7zm0 3h6v1.5H7V10z" fill="currentColor"/></svg>,
      communities: <svg className="nav-icon-small" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="5" r="2.5" fill="currentColor"/><circle cx="5" cy="10" r="2" fill="currentColor"/><circle cx="15" cy="10" r="2" fill="currentColor"/><path d="M10 9c-2.2 0-4 1.3-4 3v3h8v-3c0-1.7-1.8-3-4-3zM5 13c-1.7 0-3 1-3 2.3V17h4v-2c0-.7.3-1.3.7-1.8-.5-.1-1.1-.2-1.7-.2zm10 0c-.6 0-1.2.1-1.7.2.4.5.7 1.1.7 1.8v2h4v-1.7c0-1.3-1.3-2.3-3-2.3z" fill="currentColor"/></svg>,
      bestof: <svg className="nav-icon-small" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="currentColor"/></svg>,
      book: <svg className="nav-icon-small" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M4 3v14h12V3H4zm10 12H6V5h8v10zM8 7h4v1.5H8V7zm0 3h4v1.5H8V10z" fill="currentColor"/></svg>,
      accessibility: <svg className="nav-icon-small" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="5" r="2" fill="currentColor"/><path d="M10 8c-1.7 0-3 1.3-3 3v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-1.7-1.3-3-3-3z" fill="currentColor"/><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>,
    };
    return icons[iconName] || null;
  };

  return (
    <div className="community-list-container">
      <div className="primary-nav">
        {primaryNav.map((item) => (
          <a key={item.label} href={item.href} className="nav-pill">
            {renderIcon(item.icon)}
            <span className="pill-label">{item.label}</span>
          </a>
        ))}
        <a href="/create-community" className="nav-pill nav-pill-special" onClick={handleOpenCreateCommunity}>
          <svg className="nav-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 3v14M3 10h14"/></svg>
          <span className="pill-label">Start a community</span>
        </a>
      </div>

      {/* Create Community Modal */}
      <CreateCommunityModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onNavigate={(page, path) => { window.location.href = path; }}
      />

      <div className="sidebar-separator"></div>

      {/* Communities Section */}
      <div className="collapsible-section">
        <button className="section-header" onClick={() => toggleSection('communities')}>
          <span className="section-title">COMMUNITIES</span>
          <span className={`chevron ${sectionsExpanded.communities ? 'expanded' : ''}`}>
            {renderIcon('chevron')}
          </span>
        </button>
        {sectionsExpanded.communities && (
          <div className="section-content">
            <a href="/communities/manage" className="nav-link-small">
              {renderIcon('settings')}
              <span>Manage Communities</span>
            </a>
            <div className="community-list">
              {communities.length > 0 ? (
                communities.map((community) => (
                  <div key={community._id || community.name} className="community-item">
                    {(() => {
                      const slug = getCommunitySlug(community);
                      const label = getCommunityLabel(community);
                      const href = slug ? `/r/${slug}` : '#';
                      return (
                        <>
                          <a
                            href={href}
                            className="community-link"
                            onClick={(e) => {
                              if (!slug) e.preventDefault();
                            }}
                          >
                            <img 
                              src={community.icon || DEFAULT_COMMUNITY_ICON} 
                              alt={label || 'community'}
                              className="community-icon"
                              onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
                            />
                            <span className="community-name">{label || 'r/community'}</span>
                          </a>
                          <button className="favorite-btn">
                            {renderIcon('star')}
                          </button>
                        </>
                      );
                    })()}
                  </div>
                ))
              ) : (
                <p className="no-communities">No communities yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-separator"></div>

      {/* Resources Section */}
      <div className="collapsible-section">
        <button className="section-header" onClick={() => toggleSection('resources')}>
          <span className="section-title">RESOURCES</span>
          <span className={`chevron ${sectionsExpanded.resources ? 'expanded' : ''}`}>
            {renderIcon('chevron')}
          </span>
        </button>
        {sectionsExpanded.resources && (
          <div className="section-content">
            <a href="/about" className="nav-link-small">{renderIcon('about')}<span>About Reddit</span></a>
            <a href="/advertise" className="nav-link-small">{renderIcon('advertise')}<span>Advertise</span></a>
            <a href="/developer-platform" className="nav-link-small">{renderIcon('developer')}<span>Developer Platform</span></a>
            <a href="/help" className="nav-link-small">{renderIcon('help')}<span>Help</span></a>
            <a href="/blog" className="nav-link-small">{renderIcon('blog')}<span>Blog</span></a>
            <a href="/careers" className="nav-link-small">{renderIcon('careers')}<span>Careers</span></a>
            <a href="/press" className="nav-link-small">{renderIcon('press')}<span>Press</span></a>
          </div>
        )}
      </div>

      <div className="sidebar-separator"></div>

      {/* Policies */}
      <div className="section-content policies-section">
        <a href="/communities" className="nav-link-small">{renderIcon('communities')}<span>Communities</span></a>
        <a href="/best" className="nav-link-small">{renderIcon('bestof')}<span>Best of Reddit</span></a>
        <a href="/rules" className="nav-link-small">{renderIcon('book')}<span>Reddit Rules</span></a>
        <a href="/privacy" className="nav-link-small">{renderIcon('book')}<span>Privacy Policy</span></a>
        <a href="/user-agreement" className="nav-link-small">{renderIcon('book')}<span>User Agreement</span></a>
        <a href="/accessibility" className="nav-link-small">{renderIcon('accessibility')}<span>Accessibility</span></a>
      </div>

      <div className="sidebar-footer">
        <p>Reddit, Inc. © 2025. All rights reserved.</p>
      </div>
    </div>
  );
};

export default CommunityList;
