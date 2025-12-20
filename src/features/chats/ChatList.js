import React, { useState, useEffect } from 'react';
import './ChatList.css';
import { getUser } from '../../api/usersApi';

/**
 * ChatList Component
 * Displays list of chat conversations
 */
const ChatList = ({ chats, activeChat, onSelectChat, loading, currentUserId, onNewChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [usersData, setUsersData] = useState({}); // Cache for fetched user data by ID

  const getOtherUserInfo = (chat) => {
    const u1 = chat?.user1;
    const u2 = chat?.user2;
    const u1Id = u1?.id || u1?._id;
    const u2Id = u2?.id || u2?._id;
    if (!currentUserId) return { user: u2 || u1, oderId: u2Id || u1Id };
    if (String(u1Id) === String(currentUserId)) return { user: u2 || u1, oderId: u2Id || u1Id };
    if (String(u2Id) === String(currentUserId)) return { user: u1 || u2, oderId: u1Id || u2Id };
    return { user: u2 || u1, oderId: u2Id || u1Id };
  };

  // Fetch user data for all other users in chats
  useEffect(() => {
    const fetchUsersData = async () => {
      const userIds = chats
        .map(chat => getOtherUserInfo(chat).oderId)
        .filter(id => id && !usersData[id]);
      
      // Dedupe IDs
      const uniqueIds = [...new Set(userIds)];
      
      for (const oderId of uniqueIds) {
        try {
          const userData = await getUser(oderId);
          if (userData) {
            setUsersData(prev => ({ ...prev, [oderId]: userData }));
          }
        } catch (err) {
          console.error('Failed to fetch user:', oderId, err);
        }
      }
    };
    
    if (chats.length > 0) {
      fetchUsersData();
    }
  }, [chats]);

  // Get other user with API data merged
  const getOtherUser = (chat) => {
    const { user, oderId } = getOtherUserInfo(chat);
    const apiData = usersData[oderId];
    return { user, apiData, oderId };
  };

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) => {
    const { user, apiData } = getOtherUser(chat);
    const otherName = (apiData?.username || apiData?.displayName || user?.name || '').toLowerCase();
    return otherName.includes(searchQuery.toLowerCase());
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

  // Render avatar for chat list item (same pattern as ProfilePage)
  // API returns 'image' field, not 'avatar'
  const renderChatAvatar = (user, apiData, name) => {
    // Prioritize API data - check 'image' field (what API returns)
    let avatarUrl = null;
    if (apiData?.image) {
      avatarUrl = typeof apiData.image === 'string' ? apiData.image : apiData.image?.link;
    } else if (user?.image) {
      avatarUrl = typeof user.image === 'string' ? user.image : user.image?.link;
    }
    
    if (avatarUrl) {
      return (
        <img 
          src={avatarUrl} 
          alt={name}
          className="chat-avatar chat-avatar-img"
        />
      );
    }
    
    // Fallback to initials
    return (
      <div 
        className="chat-avatar"
        style={{ backgroundColor: '#0079D3' }}
      >
        {getInitials(name)}
      </div>
    );
  };

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h2>Messages</h2>
        {onNewChat && (
          <button className="new-chat-btn" onClick={onNewChat} title="New Chat">
            ＋
          </button>
        )}
      </div>
      <input
        type="text"
        className="chat-search"
        placeholder="Search conversations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

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
            (() => {
              const { user, apiData } = getOtherUser(chat);
              const otherName = apiData?.username || apiData?.displayName || user?.name || 'User';
              return (
            <div
              key={chat._id}
              className={`chat-item ${activeChat?._id === chat._id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              {renderChatAvatar(user, apiData, otherName)}
              <div className="chat-item-content">
                <div className="chat-item-header">
                  <span className="chat-user-name">{otherName}</span>
                  <span className="chat-timestamp">
                    {formatTimestamp(chat.updatedAt)}
                  </span>
                </div>
                <div className="chat-last-message">{chat.lastMessage}</div>
              </div>
            </div>
              );
            })()
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
