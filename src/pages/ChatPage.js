import React, { useState } from 'react';
import ChatList from '../features/chats/ChatList';
import ChatWindow from '../features/chats/ChatWindow';
import useChats from '../hooks/useChats';
import './ChatPage.css';

/**
 * ChatPage Component
 * Main page for chat functionality
 */
function ChatPage() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
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
  } = useChats('1'); // Replace '1' with actual current user ID from auth

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
          currentUserId="1" // Replace with actual current user ID from auth
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
