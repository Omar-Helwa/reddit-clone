import { useState, useMemo, useEffect } from 'react';
import './ManageCommunitiesPage.css';
import CommunityList from '../features/communities/CommunityList';
import useCommunities from '../hooks/useCommunities';
import { getJoinedCommunities, leaveCommunity, navigate } from '../utils/helpers';
import { toggleFavoriteCommunity, isFavoriteCommunity } from '../utils/favorites';
import { DEFAULT_COMMUNITY_ICON } from '../utils/placeholders';

function ManageCommunitiesPage() {
  const { communities, loading, error } = useCommunities(200);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [joinedNames, setJoinedNames] = useState([]);

  useEffect(() => {
    setJoinedNames(getJoinedCommunities());
  }, []);

  const joinedCommunities = useMemo(() => {
    if (!Array.isArray(communities)) return [];
    return communities.filter(community => {
      const slug = (community.name || community.slug || '').replace(/^r\//, '');
      return joinedNames.includes(slug);
    });
  }, [communities, joinedNames]);

  const filteredCommunities = useMemo(() => {
    let filtered = joinedCommunities;

    if (filterType === 'favorites') {
      filtered = filtered.filter(community => {
        const slug = (community.name || community.slug || '').replace(/^r\//, '');
        return isFavoriteCommunity(slug);
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(community => {
        const name = (community.name || community.displayName || '').toLowerCase();
        const description = (community.description || '').toLowerCase();
        return name.includes(query) || description.includes(query);
      });
    }

    return filtered;
  }, [joinedCommunities, filterType, searchQuery]);

  const handleToggleFavorite = (communitySlug) => {
    toggleFavoriteCommunity(communitySlug);
    setJoinedNames([...getJoinedCommunities()]);
  };

  const handleLeave = (communitySlug) => {
    leaveCommunity(communitySlug);
    setJoinedNames(getJoinedCommunities());
  };

  const getCommunitySlug = (community) => {
    return (community.name || community.slug || '').replace(/^r\//, '');
  };

  const getCommunityName = (community) => {
    const slug = getCommunitySlug(community);
    return slug ? `r/${slug}` : 'r/community';
  };

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  return (
    <div className={`manage-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Left Sidebar */}
      <aside className={`manage-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
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

      <div className="manage-page-inner">
        {/* Main Content */}
        <main className="manage-main">
          <h1 className="manage-title">Manage communities</h1>

          {/* Search Bar */}
          <div className="manage-search-container">
            <svg className="manage-search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              className="manage-search-input"
              placeholder="Filter your communities"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Communities List */}
          <div className="manage-list">
            {loading && (
              <div className="manage-empty">Loading communities...</div>
            )}

            {error && !loading && (
              <div className="manage-empty">Failed to load communities</div>
            )}

            {!loading && !error && filteredCommunities.length === 0 && (
              <div className="manage-empty">
                {searchQuery ? 'No communities match your search' : "You haven't joined any communities yet"}
              </div>
            )}

            {!loading && !error && filteredCommunities.map((community) => {
              const slug = getCommunitySlug(community);
              const name = getCommunityName(community);
              const isFavorite = isFavoriteCommunity(slug);

              return (
                <div key={community._id || slug} className="manage-community-row">
                  <img
                    src={community.icon || DEFAULT_COMMUNITY_ICON}
                    alt={name}
                    className="manage-community-icon"
                    onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
                  />
                  <div className="manage-community-info">
                    <button
                      className="manage-community-name"
                      onClick={() => navigate(`/r/${slug}`)}
                    >
                      {name}
                    </button>
                    <p className="manage-community-desc">
                      {community.description || 'No description available'}
                    </p>
                  </div>
                  <button
                    className={`manage-star-btn ${isFavorite ? 'active' : ''}`}
                    onClick={() => handleToggleFavorite(slug)}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg viewBox="0 0 20 20" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </button>
                  <button
                    className="manage-joined-btn"
                    onClick={() => handleLeave(slug)}
                  >
                    Joined
                  </button>
                </div>
              );
            })}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="manage-right-sidebar">
          {/* Filter Tabs */}
          <div className="manage-tabs">
            <button
              className={`manage-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Communities
            </button>
            <button
              className={`manage-tab ${filterType === 'favorites' ? 'active' : ''}`}
              onClick={() => setFilterType('favorites')}
            >
              Favorites
            </button>
          </div>

          {/* Footer */}
          <div className="manage-footer">
            <div className="manage-footer-links">
              <a href="/rules">Reddit Rules</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/user-agreement">User Agreement</a>
            </div>
            <div className="manage-footer-links">
              <a href="/accessibility">Accessibility</a>
            </div>
            <span className="manage-footer-copyright">Reddit, Inc. © 2025. All rights reserved.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ManageCommunitiesPage;
