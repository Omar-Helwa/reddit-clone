import React, { useState } from 'react';
import './ChatList.css';

/**
 * ChatList Component
 * Displays list of chat conversations
 */
const ChatList = ({ chats, activeChat, onSelectChat, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.user2.name.toLowerCase();
    return otherUser.includes(searchQuery.toLowerCase());
  });

  // Format timestamp
  const formatTimestamp = (date) => {
    const now = new Date();
    const chatDate = new Date(date);
    const diffMs = now - chatDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return chatDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h2>Messages</h2>
        <input
          type="text"
          className="chat-search"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="chat-list-items">
        {loading && chats.length === 0 ? (
          <div className="chat-list-loading">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="chat-list-empty">
            <div className="chat-list-empty-icon">💬</div>
            <p>No conversations yet</p>
            <small>Start a new conversation to get started</small>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              className={`chat-item ${activeChat?._id === chat._id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar">
                {getInitials(chat.user2.name)}
              </div>
              <div className="chat-item-content">
                <div className="chat-item-header">
                  <span className="chat-user-name">{chat.user2.name}</span>
                  <span className="chat-timestamp">
                    {formatTimestamp(chat.updatedAt)}
                  </span>
                </div>
                <div className="chat-last-message">{chat.lastMessage}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
