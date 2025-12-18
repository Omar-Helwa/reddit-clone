import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { getCurrentUser, clearCurrentUser } from '../utils/auth';
import { toggleTheme, getCurrentTheme } from '../utils/theme';
import { getUnreadCount, getNotifications } from '../utils/notifications';
import { universalSearch } from '../utils/search';

function AppNavbar({ onNavigate }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setTheme(getCurrentTheme());
    setUnreadCount(getUnreadCount());
    setNotifications(getNotifications().slice(0, 5));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setUnreadCount(getUnreadCount());
      setNotifications(getNotifications().slice(0, 5));
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
      console.error('Search failed:', error);
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
        console.error('Search failed:', error);
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
          <div className="search-container">
            <div className="search-left">
              <span className="search-mascot" aria-hidden="true">👽</span>
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
                      <div key={n.id} className={`notifications-item ${n.read ? '' : 'unread'}`}>
                        <div className="notifications-icon">{getNotifIcon(n.type)}</div>
                        <div className="notifications-text">
                          <div className="notifications-title">{n.title}</div>
                          <div className="notifications-msg">{n.message}</div>
                          <div className="notifications-time">{formatRelativeTime(n.timestamp)}</div>
                        </div>
                        {n.link && (
                          <button
                            type="button"
                            className="notifications-open"
                            onClick={() => handleNavClick('notifications', n.link)}
                            aria-label="Open"
                            title="Open"
                          >
                            →
                          </button>
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
            >
              <img 
                src={(currentUser && currentUser.image) ? currentUser.image : "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_5.png"} 
                alt="avatar" 
              />
            </button>
            
            {showProfileDropdown && (
              <>
                <div className="dropdown-overlay" onClick={() => setShowProfileDropdown(false)} />
                <div className="profile-dropdown">
                  {currentUser && (
                    <>
                      <div className="dropdown-section">
                        <div className="dropdown-user-info">
                          <img 
                            src={currentUser.image || "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_5.png"} 
                            alt="avatar" 
                            className="dropdown-avatar"
                          />
                          <div className="dropdown-user-details">
                            <div className="dropdown-username">{currentUser.username ? `u/${currentUser.username}` : 'u/user'}</div>
                            <div className="dropdown-karma">0 karma</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {!currentUser && (
                    <>
                      <div className="dropdown-section">
                        <button className="dropdown-item" onClick={() => handleNavClick('login', '/login')}>
                          <span className="dropdown-icon">🔓</span>
                          <span>Log In</span>
                        </button>
                        <button className="dropdown-item" onClick={() => handleNavClick('signup', '/signup')}>
                          <span className="dropdown-icon">✍️</span>
                          <span>Sign Up</span>
                        </button>
                      </div>
                    </>
                  )}
                  <div className="dropdown-divider" />
                  <div className="dropdown-section">
                    <button className="dropdown-item" onClick={() => handleNavClick('profile', '/profile')}>
                      <span className="dropdown-icon">👤</span>
                      <span>Profile</span>
                    </button>
                    <button className="dropdown-item" onClick={() => handleNavClick('create-post', '/submit')}>
                      <span className="dropdown-icon">➕</span>
                      <span>Create Post</span>
                    </button>
                    <button className="dropdown-item" onClick={() => handleNavClick('favorites', '/favorites')}>
                      <span className="dropdown-icon">💾</span>
                      <span>Favorites</span>
                    </button>
                    <button className="dropdown-item">
                      <span className="dropdown-icon">📊</span>
                      <span>Reddit Recap</span>
                    </button>
                  </div>
                  <div className="dropdown-divider" />
                  
                  <div className="dropdown-section">
                    <button className="dropdown-item" onClick={() => handleNavClick('settings', '/settings')}>
                      <span className="dropdown-icon">⚙️</span>
                      <span>Settings</span>
                    </button>
                    <button className="dropdown-item">
                      <span className="dropdown-icon">❓</span>
                      <span>Help Center</span>
                    </button>
                  </div>
                  
                  <div className="dropdown-divider" />
                  
                  <div className="dropdown-section">
                    <button className="dropdown-item" onClick={handleThemeToggle}>
                      <span className="dropdown-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
                      <span>Dark Mode</span>
                      <span className="dropdown-toggle">{theme === 'dark' ? 'On' : 'Off'}</span>
                    </button>
                  </div>
                  
                  {currentUser && (
                    <>
                      <div className="dropdown-divider" />
                      <div className="dropdown-section">
                        <button className="dropdown-item logout-item" onClick={handleLogout}>
                          <span className="dropdown-icon">🚪</span>
                          <span>Log Out</span>
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
              onClick={(e) => { e.preventDefault(); handleNavClick('create-community', '/create-community'); }}
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