import React, { useState, useEffect, useRef } from 'react';
import './ChatWindow.css';

/**
 * ChatWindow Component
 * Displays the active chat conversation and message input
 */
const ChatWindow = ({ 
  activeChat, 
  messages, 
  onSendMessage, 
  currentUserId,
  loading,
  sending,
  onBack,
  onDeleteMessage,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // [{file, url, type, name, size}]
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // {x, y, message}
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle send message
  const handleSend = async () => {
    if ((messageInput.trim().length === 0 && selectedFiles.length === 0) || sending) return;

    try {
      const attachments = selectedFiles.map((f) => ({ id: f.id, url: f.url, type: f.type, name: f.name, size: f.size }));
      await onSendMessage({ content: messageInput, attachments, replyTo: replyingTo?._id || null });
      setMessageInput('');
      setSelectedFiles([]);
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Files handling
  const handleFilesSelected = async (files) => {
    if (!files || files.length === 0) return;
    const atts = await Promise.all(files.map(fileToAttachment));
    setSelectedFiles((prev) => [...prev, ...atts]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2);
  };

  // Format timestamp
  const formatTimestamp = (date) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  // If no chat is selected
  if (!activeChat) {
    return (
      <div className="chat-window-container">
        <div className="chat-window-empty">
          <div className="chat-window-empty-icon">💬</div>
          <h3>Select a conversation</h3>
          <p>Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    );
  }

  const getParticipants = (chat) => {
    const u1 = chat?.user1;
    const u2 = chat?.user2;
    const u1Id = u1?.id || u1?._id;
    const u2Id = u2?.id || u2?._id;
    if (!currentUserId) {
      return { me: u1, other: u2 || u1 };
    }
    if (String(u1Id) === String(currentUserId)) return { me: u1, other: u2 || u1 };
    if (String(u2Id) === String(currentUserId)) return { me: u2, other: u1 || u2 };
    return { me: u1, other: u2 || u1 };
  };

  const { me, other } = getParticipants(activeChat);
  const otherName = other?.name || 'User';
  const meName = me?.name || 'Me';

  return (
    <div className="chat-window-container">
      {/* Header */}
      <div className="chat-window-header">
        {onBack && (
          <button className="chat-window-back-btn" onClick={onBack}>
            ←
          </button>
        )}
        <div className="chat-window-avatar">
          {getInitials(otherName)}
        </div>
        <div className="chat-window-user-info">
          <h3>{otherName}</h3>
          <p>Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className={`chat-messages-container ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = Array.from(e.dataTransfer.files || []);
          handleFilesSelected(files);
        }}
      >
        {isDragging && (
          <div className="drag-overlay">
            <div className="drag-content">Drop files to attach</div>
          </div>
        )}
        {loading && messages.length === 0 ? (
          <div className="chat-window-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isSent = message.userId === currentUserId;
            const replyMsg = message.replyTo ? messages.find(m => m._id === message.replyTo) : null;
            return (
              <div
                key={message._id || index}
                className={`chat-message ${isSent ? 'sent' : 'received'}`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, message });
                }}
              >
                <div className="message-avatar">
                  {isSent 
                    ? getInitials(meName)
                    : getInitials(otherName)
                  }
                </div>
                <div className="message-bubble">
                  {replyMsg && (
                    <div className="message-reply-preview">
                      <span className="reply-icon">↩</span>
                      <span className="reply-text">{replyMsg.content?.slice(0, 80) || 'Attachment'}</span>
                    </div>
                  )}
                  <p className="message-text">{message.content}</p>
                  {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                    <div className="message-attachments">
                      {message.attachments.map((att, idx) => (
                        <div key={att.id || idx} className="attachment-item">
                          {att.type?.startsWith('image/') ? (
                            <img
                              src={att.url}
                              alt={att.name || 'attachment'}
                              className="attachment-image"
                              onClick={() => window.open(att.url, '_blank')}
                            />
                          ) : (
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="attachment-link">
                              {att.name || 'Attachment'}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="message-timestamp">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-window-input-container">
        {replyingTo && (
          <div className="reply-bar">
            <span className="reply-label">Replying to:</span>
            <span className="reply-snippet">{replyingTo.content?.slice(0, 60) || 'Attachment'}</span>
            <button className="reply-cancel" onClick={() => setReplyingTo(null)} title="Cancel reply">×</button>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="selected-files">
            {selectedFiles.map((f, i) => (
              <div key={i} className="selected-file-item">
                {f.type.startsWith('image/') ? (
                  <img src={f.url} alt={f.name} className="selected-file-thumb" />
                ) : (
                  <span className="selected-file-name">{f.name}</span>
                )}
                <button className="remove-file" onClick={() => removeSelectedFile(i)} title="Remove">×</button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
        />

        <button className="attach-btn" title="Attach files" onClick={() => fileInputRef.current?.click()} disabled={sending}>📎</button>
        <textarea
          className="chat-window-input"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          disabled={sending}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={(!!!messageInput.trim() && selectedFiles.length === 0) || sending}
          title="Send message"
        >
          {sending ? '...' : '➤'}
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={() => setContextMenu(null)}
        >
          <button
            className="context-item"
            onClick={(e) => { e.stopPropagation(); setReplyingTo(contextMenu.message); setContextMenu(null); }}
          >
            Reply
          </button>
          {contextMenu.message.userId === currentUserId && onDeleteMessage && (
            <button
              className="context-item danger"
              onClick={(e) => { e.stopPropagation(); onDeleteMessage(contextMenu.message._id); setContextMenu(null); }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;

// Helpers
function fileToAttachment(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url: reader.result,
        type: file.type || 'application/octet-stream',
        name: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  });
}

