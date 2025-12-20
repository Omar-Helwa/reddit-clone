import React, { useEffect, useRef, useState } from 'react';
import ChatList from '../features/chats/ChatList';
import ChatWindow from '../features/chats/ChatWindow';
import useChats from '../hooks/useChats';
import './ChatPage.css';
import { getCurrentUserId, getCurrentUser } from '../utils/auth';
import { searchUsers } from '../api/usersApi';

/**
 * ChatPage Component
 * Main page for chat functionality
 */
function ChatPage() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatUsername, setNewChatUsername] = useState('');
  const [newChatSearching, setNewChatSearching] = useState(false);
  const [newChatError, setNewChatError] = useState('');
  const currentUserId = getCurrentUserId();
  const didAutoOpenRef = useRef(false);
  
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
    if (didAutoOpenRef.current) return;
    if (!currentUserId) return;
    if (chatsLoading) return; // Wait for chats to load

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    // Handle /chat/:chatId path
    const chatIdMatch = path.match(/\/chat\/([^/]+)/);
    if (chatIdMatch) {
      const chatId = chatIdMatch[1];
      didAutoOpenRef.current = true;
      
      // Find and select the chat by ID
      const existingById = (Array.isArray(chats) ? chats : []).find((c) => {
        return String(c._id) === String(chatId) || String(c.id) === String(chatId);
      });
      if (existingById) {
        selectChat(existingById);
      }
      return;
    }

    // Handle ?to=userId&name=userName query params
    const to = params.get('to');
    const name = params.get('name') || 'User';
    if (!to || !startNewChat) return;

    didAutoOpenRef.current = true;

    // Try to select existing chat with that user if present
    const existing = (Array.isArray(chats) ? chats : []).find((c) => {
      const u1 = c?.user1?.id || c?.user1?._id;
      const u2 = c?.user2?.id || c?.user2?._id;
      return String(u1) === String(to) || String(u2) === String(to);
    });
    if (existing) {
      selectChat(existing);
      return;
    }

    // Otherwise create a new chat
    startNewChat({ id: to, name, image: {} }).then((created) => {
      if (created) selectChat(created);
    });
  }, [chats, chatsLoading, currentUserId, selectChat, startNewChat]);

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

  // Handle new chat creation
  const handleStartNewChat = async () => {
    if (!newChatUsername.trim()) {
      setNewChatError('Please enter a username');
      return;
    }
    
    setNewChatSearching(true);
    setNewChatError('');
    
    try {
      // Search for user
      const users = await searchUsers(newChatUsername.trim());
      const targetUser = users.find(u => 
        u.username?.toLowerCase() === newChatUsername.trim().toLowerCase()
      );
      
      if (!targetUser) {
        setNewChatError('User not found');
        setNewChatSearching(false);
        return;
      }

      // Check if chat already exists
      const existingChat = chats.find(c => {
        const u1Id = c.user1?.id || c.user1?._id;
        const u2Id = c.user2?.id || c.user2?._id;
        const targetId = targetUser._id || targetUser.id;
        return String(u1Id) === String(targetId) || String(u2Id) === String(targetId);
      });

      if (existingChat) {
        selectChat(existingChat);
        setShowNewChatModal(false);
        setNewChatUsername('');
        return;
      }

      // Create new chat
      const newChat = await startNewChat({
        id: targetUser._id || targetUser.id,
        name: targetUser.username || targetUser.displayName || 'User',
        image: targetUser.avatar ? { link: targetUser.avatar } : {}
      });
      
      if (newChat) {
        selectChat(newChat);
      }
      setShowNewChatModal(false);
      setNewChatUsername('');
    } catch (err) {
      setNewChatError(err.message || 'Failed to start chat');
    } finally {
      setNewChatSearching(false);
    }
  };

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
          onNewChat={() => setShowNewChatModal(true)}
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
                className="new-chat-input"
                placeholder="Enter username..."
                value={newChatUsername}
                onChange={(e) => setNewChatUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartNewChat()}
                autoFocus
              />
              {newChatError && (
                <div className="new-chat-error">{newChatError}</div>
              )}
            </div>
            <div className="new-chat-modal-footer">
              <button 
                className="new-chat-cancel-btn"
                onClick={() => setShowNewChatModal(false)}
              >
                Cancel
              </button>
              <button 
                className="new-chat-start-btn"
                onClick={handleStartNewChat}
                disabled={newChatSearching || !newChatUsername.trim()}
              >
                {newChatSearching ? 'Searching...' : 'Start Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
