import React, { useState } from 'react';
import './Navbar.css';

function AppNavbar({ onNavigate }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleNavClick = (page, path) => {
    setShowMenu(false);
    if (onNavigate) {
      onNavigate(page, path);
    } else {
      window.location.href = path;
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
            onClick={() => handleNavClick('create', '/create-community')}
            title="Create"
            aria-label="Create"
          >
            ➕
          </button>
          <button className="navbar-icon-btn" title="Notifications" aria-label="Notifications">🔔</button>
          <div className="navbar-avatar" title="Profile" aria-label="Profile">
            <img src="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_5.png" alt="avatar" />
          </div>
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
            <a href="#logout" className="menu-link">🚪 Log Out</a>
          </div>
        </div>
      )}
    </header>
  );
}

export default AppNavbar;