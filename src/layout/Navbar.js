import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { getCurrentUser, clearCurrentUser } from '../utils/auth';

function AppNavbar({ onNavigate }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleNavClick = (page, path) => {
    setShowMenu(false);
    setShowProfileDropdown(false);
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
            <input
              type="text"
              className="search-input"
              placeholder="Find anything"
              aria-label="Search"
            />
            <div className="search-right">
              <span className="search-divider" aria-hidden="true" />
              <button className="ask-btn" title="Ask">Ask</button>
            </div>
          </div>
        </div>

        {/* Right Section: Auth Buttons */}
        <div className="navbar-right">
          <button className="navbar-icon-btn" title="Ads" aria-label="Ads">🄰🄳</button>
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
            onClick={() => handleNavClick('create-post', '/r/general/submit')}
            title="Create Post"
            aria-label="Create Post"
          >
            ➕
          </button>
          <button className="navbar-icon-btn" title="Notifications" aria-label="Notifications">🔔</button>
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
                    <button className="dropdown-item" onClick={() => handleNavClick('create-post', '/r/general/submit')}>
                      <span className="dropdown-icon">➕</span>
                      <span>Create Post</span>
                    </button>
                    <button className="dropdown-item">
                      <span className="dropdown-icon">💾</span>
                      <span>Saved</span>
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
                    <button className="dropdown-item">
                      <span className="dropdown-icon">🌙</span>
                      <span>Dark Mode</span>
                      <span className="dropdown-toggle">Off</span>
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

export default AppNavbar;