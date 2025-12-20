import React, { useState, useEffect } from 'react';
import './NotificationsPage.css';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  clearAllNotifications 
} from '../utils/notifications';

function NotificationsPage({ onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, upvote, comment, follow, join, message

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const notifs = getNotifications();
    setNotifications(notifs);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const handleMarkAsRead = (id) => {
    markAsRead(id);
    loadNotifications();
  };

  const handleDeleteNotification = (id) => {
    deleteNotification(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    loadNotifications();
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      clearAllNotifications();
      loadNotifications();
    }
  };

  // Handle notification click with proper navigation
  const handleNotificationClick = (notif) => {
    // Mark as read
    if (!notif.read) {
      markAsRead(notif.id);
      loadNotifications();
    }
    
    // Navigate based on notification type and link
    if (notif.link && onNavigate) {
      // Determine the page type based on link pattern
      let page = 'home';
      const link = notif.link;
      
      if (link.startsWith('/r/') && link.includes('/comments/')) {
        page = 'post';
      } else if (link.startsWith('/r/')) {
        page = 'community';
      } else if (link.startsWith('/user/') || link.startsWith('/u/')) {
        page = 'profile';
      } else if (link === '/chats' || link.startsWith('/chat')) {
        page = 'chat';
      } else if (link === '/notifications') {
        page = 'notifications';
      }
      
      onNavigate(page, link);
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <h1>Notifications</h1>
          <div className="header-actions">
            {notifications.some(n => !n.read) && (
              <button className="action-btn" onClick={handleMarkAllAsRead}>
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button className="action-btn danger" onClick={handleClearAll}>
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="notifications-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button 
            className={`filter-btn ${filter === 'upvote' ? 'active' : ''}`}
            onClick={() => setFilter('upvote')}
          >
            👍 Upvotes
          </button>
          <button 
            className={`filter-btn ${filter === 'comment' ? 'active' : ''}`}
            onClick={() => setFilter('comment')}
          >
            💬 Comments
          </button>
          <button 
            className={`filter-btn ${filter === 'follow' ? 'active' : ''}`}
            onClick={() => setFilter('follow')}
          >
            👤 Followers
          </button>
          <button 
            className={`filter-btn ${filter === 'join' ? 'active' : ''}`}
            onClick={() => setFilter('join')}
          >
            👥 Joins
          </button>
          <button 
            className={`filter-btn ${filter === 'message' ? 'active' : ''}`}
            onClick={() => setFilter('message')}
          >
            ✉️ Messages
          </button>
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h2>No notifications</h2>
              <p>
                {filter === 'all' 
                  ? "You're all caught up!" 
                  : `No ${filter} notifications`}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notification-card ${!notif.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notif)}
                style={{ cursor: notif.link ? 'pointer' : 'default' }}
              >
                <div className="notif-left">
                  {notif.avatar && (
                    <img src={notif.avatar} alt={notif.title} className="notif-avatar" />
                  )}
                  {!notif.avatar && (
                    <div className="notif-avatar-icon">{getNotifIcon(notif.type)}</div>
                  )}
                </div>

                <div className="notif-center">
                  <div className="notif-title">{notif.title}</div>
                  <div className="notif-message">{notif.message}</div>
                  <div className="notif-time">{formatRelativeTime(notif.timestamp)}</div>
                </div>

                <div className="notif-right">
                  {!notif.read && (
                    <button 
                      className="mark-read-btn" 
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    className="delete-btn" 
                    onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif.id); }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function getNotifIcon(type) {
  const icons = {
    upvote: '👍',
    comment: '💬',
    follow: '👤',
    join: '👥',
    message: '✉️',
    default: '🔔'
  };
  return icons[type] || icons.default;
}

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default NotificationsPage;
