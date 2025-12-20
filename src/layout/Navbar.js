import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { getCurrentUser, clearCurrentUser, getAvatarSettings } from '../utils/auth';
import { toggleTheme, getCurrentTheme } from '../utils/theme';
import { getUnreadCount, getNotifications, markAsRead } from '../utils/notifications';
import { universalSearch } from '../utils/search';
import CreateCommunityModal from '../components/CreateCommunityModal';

function AppNavbar({ onNavigate }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [avatarSettings, setAvatarSettings] = useState({ emoji: '👽', bgColor: null });

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setTheme(getCurrentTheme());
    setUnreadCount(getUnreadCount());
    setNotifications(getNotifications().slice(0, 5));
    setAvatarSettings(getAvatarSettings());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setUnreadCount(getUnreadCount());
      setNotifications(getNotifications().slice(0, 5));
      setAvatarSettings(getAvatarSettings());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (page, path) => {
    const isProtected = path === '/chat' || path === '/create-community';
    if (!currentUser && isProtected) {
      page = 'login';
      path = '/login';
    }
    setShowMenu(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
    setSearchResults(null);
    if (onNavigate) {
      onNavigate(page, path);
    } else {
      window.location.href = path;
    }
  };

  const handleOpenCreateCommunity = (e) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      handleNavClick('login', '/login');
      return;
    }
    setShowMenu(false);
    setShowCreateCommunityModal(true);
  };

  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUser(null);
    setShowProfileDropdown(false);
    window.location.href = '/';
  };

  const handleThemeToggle = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    try {
      const results = await universalSearch(searchQuery);
      setSearchResults(results);
    } catch (error) {
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults(null);
    }
  };

  const handleSearchFocus = async () => {
    if (searchQuery.trim().length >= 2 && !searchResults) {
      try {
        const results = await universalSearch(searchQuery);
        setSearchResults(results);
      } catch (error) {
      }
    }
  };

  

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Left Section: Logo and Menu Toggle */}
        <div className="navbar-left">
          <button
            className="menu-toggle"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <div 
            className="navbar-logo"
            onClick={() => handleNavClick('home', '/')}
            style={{ cursor: 'pointer' }}
          >
            <span className="reddit-wordmark">reddit</span>
          </div>
        </div>

        {/* Center Section: Search */}
        <div className="navbar-center">
          <div 
            className="search-container"
            style={{
              borderColor: avatarSettings.bgColor || '#ff4500'
            }}
          >
            <div className="search-left">
              <span 
                className="search-mascot" 
                aria-hidden="true"
                style={{ backgroundColor: avatarSettings.bgColor || '#ff4500' }}
              >
                {avatarSettings.emoji || '👽'}
              </span>
            </div>
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                placeholder="Search users, posts, communities"
                aria-label="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
              />

              {searchResults && (
                <div className="search-results" role="listbox">
                  {!!searchResults.users?.length && (
                    <div className="search-section">
                      <div className="search-section-title">Users</div>
                      {searchResults.users.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          className="search-result-item"
                          onClick={() => handleNavClick('profile', u.link)}
                        >
                          <div className="result-text">
                            <div className="result-title">{u.title}</div>
                            <div className="result-subtitle">{u.subtitle}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!!searchResults.posts?.length && (
                    <div className="search-section">
                      <div className="search-section-title">Posts</div>
                      {searchResults.posts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="search-result-item"
                          onClick={() => handleNavClick('post', p.link)}
                        >
                          <div className="result-text">
                            <div className="result-title">{p.title}</div>
                            <div className="result-subtitle">{p.subtitle}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!!searchResults.communities?.length && (
                    <div className="search-section">
                      <div className="search-section-title">Communities</div>
                      {searchResults.communities.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="search-result-item"
                          onClick={() => handleNavClick('community', c.link)}
                        >
                          <div className="result-text">
                            <div className="result-title">{c.title}</div>
                            <div className="result-subtitle">{c.subtitle}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!searchResults.users?.length && !searchResults.posts?.length && !searchResults.communities?.length && (
                    <div className="search-empty">No results</div>
                  )}
                </div>
              )}
            </form>
            <div className="search-right">
              <span className="search-divider" aria-hidden="true" />
              <button className="ask-btn" title="Ask">Ask</button>
            </div>
          </div>
        </div>

        {/* Right Section: Auth Buttons */}
        <div className="navbar-right">
          <button className="navbar-icon-btn" title="Ads" aria-label="Ads" onClick={() => handleNavClick('advertise', '/advertise')}>🄰🄳</button>
          <button 
            className="navbar-icon-btn chat-btn"
            onClick={() => handleNavClick('chat', '/chat')}
            title="Chat"
            aria-label="Open Chat"
          >
            💬
          </button>
          <button 
            className="navbar-icon-btn" 
            onClick={() => handleNavClick('create-post', '/submit')}
            title="Create Post"
            aria-label="Create Post"
          >
            ➕
          </button>
          <div className="navbar-notifications">
            <button
              className="navbar-icon-btn"
              title="Notifications"
              aria-label="Notifications"
              onClick={() => setShowNotifications((s) => !s)}
            >
              🔔
              {unreadCount > 0 && <span className="navbar-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="notifications-popover">
                <div className="notifications-popover-header">
                  <strong>Notifications</strong>
                  <button
                    className="notifications-viewall"
                    type="button"
                    onClick={() => handleNavClick('notifications', '/notifications')}
                  >
                    View all
                  </button>
                </div>
                <div className="notifications-popover-list">
                  {notifications.length === 0 ? (
                    <div className="notifications-empty">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`notifications-item ${n.read ? '' : 'unread'}`}
                        onClick={() => {
                          if (!n.read) markAsRead(n.id);
                          if (n.link) {
                            // Determine page type based on link
                            let page = 'home';
                            if (n.link.startsWith('/r/') && n.link.includes('/comments/')) page = 'post';
                            else if (n.link.startsWith('/r/')) page = 'community';
                            else if (n.link.startsWith('/user/') || n.link.startsWith('/u/')) page = 'profile';
                            else if (n.link === '/chats' || n.link.startsWith('/chat')) page = 'chat';
                            handleNavClick(page, n.link);
                          }
                        }}
                        style={{ cursor: n.link ? 'pointer' : 'default' }}
                      >
                        <div className="notifications-icon">{getNotifIcon(n.type)}</div>
                        <div className="notifications-text">
                          <div className="notifications-title">{n.title}</div>
                          <div className="notifications-msg">{n.message}</div>
                          <div className="notifications-time">{formatRelativeTime(n.timestamp)}</div>
                        </div>
                        {n.link && (
                          <span className="notifications-arrow">→</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="profile-dropdown-wrapper">
            <button 
              className="navbar-avatar" 
              title="Profile" 
              aria-label="Profile"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              style={avatarSettings.emoji && !currentUser?.image ? { 
                backgroundColor: avatarSettings.bgColor || '#ff4500',
                borderColor: avatarSettings.bgColor || '#ff4500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              } : {
                borderColor: avatarSettings.bgColor || '#ff4500'
              }}
            >
              {currentUser?.image ? (
                <img 
                  src={currentUser.image} 
                  alt="avatar" 
                />
              ) : (
                <span className="emoji-avatar">{avatarSettings.emoji || '👽'}</span>
              )}
            </button>
            
            {showProfileDropdown && (
              <>
                <div className="dropdown-overlay" onClick={() => setShowProfileDropdown(false)} />
                <div className="profile-dropdown">
                  {currentUser && (
                    <>
                      {/* View Profile Section */}
                      <button 
                        className="dropdown-item profile-header-item" 
                        onClick={() => handleNavClick('profile', '/profile')}
                      >
                        {currentUser.image ? (
                          <img 
                            src={currentUser.image} 
                            alt="avatar" 
                            className="dropdown-profile-avatar"
                          />
                        ) : (
                          <span 
                            className="dropdown-profile-avatar emoji-avatar-large"
                            style={{ backgroundColor: avatarSettings.bgColor || '#ff4500' }}
                          >
                            {avatarSettings.emoji || '👽'}
                          </span>
                        )}
                        <div className="dropdown-text-group">
                          <span className="dropdown-text-primary">View Profile</span>
                          <span className="dropdown-text-secondary">{currentUser.username ? `u/${currentUser.username}` : 'u/user'}</span>
                        </div>
                      </button>

                      <div className="dropdown-divider" />

                      {/* User Actions */}
                      <button className="dropdown-item" onClick={() => handleNavClick('edit-avatar', '/edit-avatar')}>
                        <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"/>
                        </svg>
                        <span className="dropdown-text-primary">Edit Avatar</span>
                      </button>

                      <button className="dropdown-item">
                        <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4h12v2H4V4zm0 4h12v8H4V8zm2 2v4h8v-4H6z"/>
                        </svg>
                        <span className="dropdown-text-primary">Drafts</span>
                      </button>

                      <button className="dropdown-item" onClick={() => handleNavClick('achievements', '/achievements')}>
                        <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 2l2.5 5 5.5.8-4 3.9 1 5.3-5-2.6-5 2.6 1-5.3-4-3.9 5.5-.8z"/>
                        </svg>
                        <div className="dropdown-text-group">
                          <span className="dropdown-text-primary">Achievements</span>
                          <span className="dropdown-text-secondary">7 unlocked</span>
                        </div>
                      </button>

                      <button className="dropdown-item">
                        <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                          <text x="10" y="13" textAnchor="middle" fontSize="9" fill="currentColor">$</text>
                        </svg>
                        <div className="dropdown-text-group">
                          <span className="dropdown-text-primary">Earn</span>
                          <span className="dropdown-text-secondary">Earn cash on Reddit</span>
                        </div>
                      </button>

                      <button className="dropdown-item">
                        <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                          <path d="M7 10h6M10 7v6" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        <span className="dropdown-text-primary">Premium</span>
                      </button>

                      <div className="dropdown-divider" />

                      {/* Dark Mode Toggle */}
                      <button className="dropdown-item" onClick={handleThemeToggle}>
                        <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                        </svg>
                        <span className="dropdown-text-primary">Dark Mode</span>
                        <div className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}>
                          <div className="toggle-knob"></div>
                        </div>
                      </button>

                      <div className="dropdown-divider" />

                      {/* Logout */}
                      <button className="dropdown-item" onClick={handleLogout}>
                        <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 3h8v2H5v10h6v2H3V3zm10 4l4 3-4 3V7zm-2 2H8v2h3v-2z"/>
                        </svg>
                        <span className="dropdown-text-primary">Log Out</span>
                      </button>

                      <div className="dropdown-divider" />

                      {/* Additional Links */}
                      <button className="dropdown-item" onClick={() => handleNavClick('advertise', '/advertise')}>
                        <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/>
                        </svg>
                        <span className="dropdown-text-primary">Advertise on Reddit</span>
                      </button>

                      <button className="dropdown-item">
                        <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                          <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                        <span className="dropdown-text-primary">Try Reddit Pro</span>
                        <span className="dropdown-badge-beta">BETA</span>
                      </button>

                      <div className="dropdown-divider" />

                      {/* Settings */}
                      <button className="dropdown-item" onClick={() => handleNavClick('settings', '/settings')}>
                        <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
                        </svg>
                        <span className="dropdown-text-primary">Settings</span>
                      </button>
                    </>
                  )}
                  {!currentUser && (
                    <>
                      <div className="dropdown-section">
                        <button className="dropdown-item" onClick={() => handleNavClick('login', '/login')}>
                          <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 3h8v2H5v10h6v2H3V3zm10 4l4 3-4 3V7zm-2 2H8v2h3v-2z"/>
                          </svg>
                          <span>Log In / Sign Up</span>
                        </button>
                      </div>
                      <div className="dropdown-divider" />
                      <div className="dropdown-section">
                        <button className="dropdown-item dark-mode-item" onClick={handleThemeToggle}>
                          <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                          </svg>
                          <span>Dark Mode</span>
                          <div className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}>
                            <div className="toggle-knob"></div>
                          </div>
                        </button>
                      </div>
                      <div className="dropdown-divider" />
                      <div className="dropdown-section">
                        <button className="dropdown-item" onClick={() => handleNavClick('settings', '/settings')}>
                          <svg className="dropdown-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
                          </svg>
                          <span>Settings</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          {!currentUser && (
            <>
              <button 
                className="navbar-btn login-btn"
                onClick={() => handleNavClick('login', '/login')}
              >
                Log In
              </button>
              <button 
                className="navbar-btn signup-btn"
                onClick={() => handleNavClick('signup', '/signup')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      {showMenu && (
        <div className="mobile-menu" onClick={() => setShowMenu(false)}>
          <div className="menu-section">
            <h4>Menu</h4>
            <a 
              href="/" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('home', '/'); }}
            >
              🏠 Home
            </a>
            <a 
              href="/explore" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('explore', '/explore'); }}
            >
              🔍 Explore
            </a>
            <a 
              href="/popular" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('popular', '/popular'); }}
            >
              ⭐ Popular
            </a>
            <a 
              href="/chat" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('chat', '/chat'); }}
            >
              💬 Chat
            </a>
            <a 
              href="/accessibility" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('accessibility', '/accessibility'); }}
            >
              ♿ Accessibility
            </a>
            <a 
              href="/developer-platform" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('developer-platform', '/developer-platform'); }}
            >
              🧰 Developer Platform
            </a>
            <a href="#saved" className="menu-link">💾 Saved</a>
            <a 
              href="/about" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('about', '/about'); }}
            >
              ℹ️ About
            </a>
            <a 
              href="/blog" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('blog', '/blog'); }}
            >
              📰 Blog
            </a>
            <a 
              href="/advertise" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('advertise', '/advertise'); }}
            >
              📣 Advertise
            </a>
            <a 
              href="/press" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('press', '/press'); }}
            >
              🗞️ Press
            </a>
            <a 
              href="/careers" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('careers', '/careers'); }}
            >
              💼 Careers
            </a>
            <a 
              href="/help" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('help', '/help'); }}
            >
              🆘 Help
            </a>
            <a 
              href="/communities" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('communities', '/communities'); }}
            >
              🧭 Communities
            </a>
            <a 
              href="/rules" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('rules', '/rules'); }}
            >
              📜 Reddit Rules
            </a>
            <a 
              href="/privacy" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('privacy', '/privacy'); }}
            >
              🔒 Privacy
            </a>
            <a 
              href="/user-agreement" 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('user-agreement', '/user-agreement'); }}
            >
              📑 User Agreement
            </a>
          </div>
          <div className="menu-section">
            <h4>Communities</h4>
            <a 
              href="/create-community" 
              className="menu-link create-link"
              onClick={handleOpenCreateCommunity}
            >
              ➕ Create Community
            </a>
            <a href="#r/all" className="menu-link">r/all</a>
            <a href="#r/popular" className="menu-link">r/popular</a>
            <div 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('community', '/r/hackthebox'); }}
              style={{ cursor: 'pointer' }}
            >
              r/hackthebox
            </div>
            <div 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('community', '/r/gaming'); }}
              style={{ cursor: 'pointer' }}
            >
              r/gaming
            </div>
            <div 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('community', '/r/memes'); }}
              style={{ cursor: 'pointer' }}
            >
              r/memes
            </div>
          </div>
          <div className="menu-section">
            <h4>Account</h4>
            <a href="#profile" className="menu-link">👤 Profile</a>
            <div 
              className="menu-link"
              onClick={(e) => { e.preventDefault(); handleNavClick('my-community', '/my-community'); }}
              style={{ cursor: 'pointer' }}
            >
              🏠 My Communities
            </div>
            <a href="#settings" className="menu-link">⚙️ Settings</a>
          </div>
        </div>
      )}

      {/* Create Community Modal */}
      <CreateCommunityModal 
        isOpen={showCreateCommunityModal}
        onClose={() => setShowCreateCommunityModal(false)}
        onNavigate={onNavigate}
      />
    </header>
  );
}

function getNotifIcon(type) {
  const icons = {
    upvote: '👍',
    comment: '💬',
    follow: '👤',
    join: '👥',
    message: '✉️',
  };
  return icons[type] || '🔔';
}

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = Math.max(0, now - (timestamp || now));
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default AppNavbar;