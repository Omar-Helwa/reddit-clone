import React, { useEffect, useRef, useState } from 'react';
import ChatList from '../features/chats/ChatList';
import ChatWindow from '../features/chats/ChatWindow';
import useChats from '../hooks/useChats';
import './ChatPage.css';
import { getCurrentUserId } from '../utils/auth';
import { listUsers } from '../api/usersApi';

/**
 * ChatPage Component
 * Main page for chat functionality
 */
function ChatPage() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const currentUserId = getCurrentUserId();
  const lastUrlRef = useRef('');
  
  // Using the custom useChats hook
  const {
    chats,
    activeChat,
    messages,
    chatsLoading,
    chatsRefreshing,
    messagesLoading,
    error,
    sending,
    selectChat,
    sendChatMessage,
    deleteChatMessage,
    startNewChat,
  } = useChats(currentUserId);

  useEffect(() => {
    if (!currentUserId) return;
    if (chatsLoading || !chats || chats.length === 0) return;

    const currentUrl = window.location.pathname + window.location.search;
    if (lastUrlRef.current === currentUrl) return; // Already handled this URL
    lastUrlRef.current = currentUrl;

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    // Handle /chat/:chatId path (from profile page)
    const chatIdMatch = path.match(/\/chat\/([^/]+)/);
    if (chatIdMatch) {
      const chatId = chatIdMatch[1];
      
      // Find and select the chat by ID
      const existingById = (Array.isArray(chats) ? chats : []).find((c) => {
        return String(c._id) === String(chatId) || String(c.id) === String(chatId);
      });
      if (existingById && existingById._id !== activeChat?._id) {
        selectChat(existingById);
      }
      return;
    }

    // Handle ?to=userId&name=userName query params
    const to = params.get('to');
    const name = params.get('name') || 'User';
    if (!to || !startNewChat) return;

    // Try to select existing chat with that user if present
    const existing = (Array.isArray(chats) ? chats : []).find((c) => {
      const u1 = c?.user1?.id || c?.user1?._id;
      const u2 = c?.user2?.id || c?.user2?._id;
      return String(u1) === String(to) || String(u2) === String(to);
    });
    if (existing) {
      if (existing._id !== activeChat?._id) {
        selectChat(existing);
      }
      return;
    }

    // Otherwise create a new chat
    startNewChat({ id: to, name, image: {} }).then((created) => {
      if (created) selectChat(created);
    });
  }, [chats, chatsLoading, currentUserId, selectChat, startNewChat, activeChat]);

  // Handle selecting a chat
  const handleSelectChat = (chat) => {
    selectChat(chat);
    // On mobile, hide sidebar when chat is selected
    if (window.innerWidth <= 768) {
      setShowMobileSidebar(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (content) => {
    try {
      await sendChatMessage(content);
    } catch (err) {
    }
  };
  const handleDeleteMessage = async (messageId) => {
    try {
      if (!messageId) return;
      if (typeof window !== 'undefined' && !window.confirm('Delete this message?')) return;
      await deleteChatMessage(messageId);
    } catch (err) {
    }
  };

  // Handle back button on mobile
  const handleBack = () => {
    if (window.innerWidth <= 768) {
      setShowMobileSidebar(true);
    }
  };

  // Open new chat modal and load all users
  const handleOpenNewChat = async () => {
    setShowNewChatModal(true);
    setUserSearchQuery('');
    if (allUsers.length === 0) {
      setUsersLoading(true);
      try {
        const result = await listUsers({ limit: 100 });
        const users = result?.items || result || [];
        // Filter out current user
        setAllUsers(users.filter(u => String(u._id || u.id) !== String(currentUserId)));
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setUsersLoading(false);
      }
    }
  };

  // Handle selecting a user to start chat
  const handleSelectUser = async (user) => {
    const userId = user._id || user.id;
    const userName = user.username || user.displayName || user.name || 'User';
    
    // Check if chat already exists with this user
    const existingChat = chats.find(c => {
      const u1Id = c.user1?.id || c.user1?._id;
      const u2Id = c.user2?.id || c.user2?._id;
      return String(u1Id) === String(userId) || String(u2Id) === String(userId);
    });

    if (existingChat) {
      selectChat(existingChat);
    } else {
      // Create new chat
      const newChat = await startNewChat({
        id: userId,
        name: userName,
        image: user.avatar ? { link: user.avatar } : {}
      });
      if (newChat) {
        selectChat(newChat);
      }
    }
    
    setShowNewChatModal(false);
    setUserSearchQuery('');
  };

  // Filter users based on search query
  const filteredUsers = allUsers.filter(user => {
    const name = (user.username || user.displayName || user.name || '').toLowerCase();
    return name.includes(userSearchQuery.toLowerCase());
  });

  return (
    <div className="chat-page-container">
      {/* Sidebar with chat list */}
      <div className={`chat-page-sidebar ${showMobileSidebar ? 'mobile-show' : ''}`}>
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          loading={chatsLoading}
          refreshing={chatsRefreshing}
          currentUserId={currentUserId || ''}
          onNewChat={handleOpenNewChat}
        />
      </div>

      {/* Main chat window */}
      <div className={`chat-page-main ${showMobileSidebar ? 'mobile-hide' : ''}`}>
        {error && (
          <div className="chat-error">
            <strong>Error:</strong> {error}
          </div>
        )}
        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUserId={currentUserId || ''}
          loading={messagesLoading}
          sending={sending}
          onBack={handleBack}
          onDeleteMessage={handleDeleteMessage}
        />
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="new-chat-modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="new-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="new-chat-modal-header">
              <h3>New Chat</h3>
              <button 
                className="new-chat-modal-close" 
                onClick={() => setShowNewChatModal(false)}
              >
                ×
              </button>
            </div>
            <div className="new-chat-modal-body">
              <input
                type="text"
                className="new-chat-search"
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="new-chat-user-list">
                {usersLoading ? (
                  <div className="new-chat-loading">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="new-chat-empty">No users found</div>
                ) : (
                  filteredUsers.map(user => (
                    <div 
                      key={user._id || user.id} 
                      className="new-chat-user-item"
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="new-chat-user-avatar">
                        {(user.username || user.name || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <span className="new-chat-user-name">
                        {user.username || user.displayName || user.name || 'User'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
