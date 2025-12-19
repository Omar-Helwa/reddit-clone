import React, { useEffect, useRef, useState } from 'react';
import ChatList from '../features/chats/ChatList';
import ChatWindow from '../features/chats/ChatWindow';
import useChats from '../hooks/useChats';
import './ChatPage.css';
import { getCurrentUserId } from '../utils/auth';

/**
 * ChatPage Component
 * Main page for chat functionality
 */
function ChatPage() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
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

    const params = new URLSearchParams(window.location.search);
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
  }, [chats, currentUserId, selectChat, startNewChat]);

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
      console.error('Failed to send message:', err);
    }
  };
  const handleDeleteMessage = async (messageId) => {
    try {
      if (!messageId) return;
      if (typeof window !== 'undefined' && !window.confirm('Delete this message?')) return;
      await deleteChatMessage(messageId);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  // Handle back button on mobile
  const handleBack = () => {
    if (window.innerWidth <= 768) {
      setShowMobileSidebar(true);
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
    </div>
  );
}

export default ChatPage;
