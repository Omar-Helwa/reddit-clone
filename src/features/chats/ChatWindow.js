import React, { useState, useEffect, useRef } from 'react';
import './ChatWindow.css';
import { uploadImage } from '../../api/uploadsApi';
import { getUser } from '../../api/usersApi';

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
  const [selectedFiles, setSelectedFiles] = useState([]); // [{file, url, type, name, size, uploading, uploadedUrl}]
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // {x, y, message}
  const [uploadError, setUploadError] = useState(null);
  const [otherUserData, setOtherUserData] = useState(null); // Fetched user data from API
  const [currentUserData, setCurrentUserData] = useState(null); // Fetched current user data from API
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Helper to extract userId from message (handles various field names and formats)
  const getMessageUserId = (message) => {
    // Try multiple possible field names
    const uid = message?.userId || message?.senderId || message?.sender || message?.user || message?.from;
    if (!uid) return null;
    if (typeof uid === 'string') return uid;
    if (typeof uid === 'object') return uid._id || uid.id || uid.userId;
    return String(uid);
  };

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
    
    // Check if any files are still uploading
    const stillUploading = selectedFiles.some(f => f.uploading);
    if (stillUploading) return;

    try {
      // Use uploaded URLs for images
      const uploadedFile = selectedFiles.find(f => f.uploadedUrl);
      const imageLink = uploadedFile?.uploadedUrl || null;
      
      await onSendMessage({ 
        content: messageInput || (imageLink ? 'Sent an image' : ''), 
        imageLink,
        replyTo: replyingTo?._id || null 
      });
      setMessageInput('');
      setSelectedFiles([]);
      setReplyingTo(null);
      setUploadError(null);
    } catch (error) {
      setUploadError('Failed to send message');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Files handling - only images allowed
  const handleFilesSelected = async (files) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    
    // Filter to only image files
    const imageFiles = Array.from(files).filter(file => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      return allowedTypes.includes(file.type);
    });
    
    if (imageFiles.length === 0) {
      setUploadError('Only image files (JPEG, PNG, GIF, WebP) are allowed');
      return;
    }
    
    // Only allow one image at a time
    const file = imageFiles[0];
    
    // Create local preview immediately
    const localPreview = URL.createObjectURL(file);
    const newFile = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url: localPreview,
      type: file.type,
      name: file.name,
      size: file.size,
      uploading: true,
      uploadedUrl: null,
      error: null,
    };
    
    setSelectedFiles([newFile]);
    
    // Upload the image
    try {
      const result = await uploadImage(file, 'general');
      setSelectedFiles(prev => prev.map(f => 
        f.id === newFile.id 
          ? { ...f, uploading: false, uploadedUrl: result.url }
          : f
      ));
    } catch (err) {
      setSelectedFiles(prev => prev.map(f => 
        f.id === newFile.id 
          ? { ...f, uploading: false, error: err.message || 'Upload failed' }
          : f
      ));
      setUploadError(err.message || 'Failed to upload image');
    }
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

  const getParticipants = (chat) => {
    if (!chat) return { me: null, other: null, otherId: null };
    const u1 = chat?.user1;
    const u2 = chat?.user2;
    const u1Id = u1?.id || u1?._id;
    const u2Id = u2?.id || u2?._id;
    
    if (!currentUserId) {
      return { me: u1, other: u2 || u1, otherId: u2Id || u1Id };
    }
    if (String(u1Id) === String(currentUserId)) return { me: u1, other: u2 || u1, otherId: u2Id || u1Id };
    if (String(u2Id) === String(currentUserId)) return { me: u2, other: u1 || u2, otherId: u1Id || u2Id };
    return { me: u1, other: u2 || u1, otherId: u2Id || u1Id };
  };

  const { me, other, otherId } = getParticipants(activeChat);

  // Fetch other user's data from API when chat changes
  useEffect(() => {
    if (!otherId) {
      setOtherUserData(null);
      return;
    }
    
    let cancelled = false;
    const fetchUserData = async () => {
      try {
        const userData = await getUser(otherId);
        if (!cancelled && userData) {
          setOtherUserData(userData);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        if (!cancelled) setOtherUserData(null);
      }
    };
    
    fetchUserData();
    return () => { cancelled = true; };
  }, [otherId]);

  // Fetch current user's data from API to get profile picture
  useEffect(() => {
    if (!currentUserId) {
      setCurrentUserData(null);
      return;
    }
    
    let cancelled = false;
    const fetchCurrentUserData = async () => {
      try {
        const userData = await getUser(currentUserId);
        if (!cancelled && userData) {
          setCurrentUserData(userData);
        }
      } catch (err) {
        console.error('Failed to fetch current user data:', err);
        if (!cancelled) setCurrentUserData(null);
      }
    };
    
    fetchCurrentUserData();
    return () => { cancelled = true; };
  }, [currentUserId]);

  // Get avatar settings from localStorage for current user (fallback)
  const getMyAvatarSettings = () => {
    try {
      return {
        emoji: localStorage.getItem('avatarEmoji') || '😀',
        bgColor: localStorage.getItem('avatarBgColor') || '#0079D3',
      };
    } catch {
      return { emoji: '😀', bgColor: '#0079D3' };
    }
  };

  // Get avatar URL (same pattern as ProfilePage)
  // API returns 'image' field, not 'avatar'
  const getAvatarUrl = (user, apiData) => {
    // Prioritize API data - check 'image' field (what API returns)
    if (apiData?.image) {
      if (typeof apiData.image === 'string') return apiData.image;
      if (apiData.image?.link) return apiData.image.link;
    }
    // Then try chat user object's image field
    if (user?.image) {
      if (typeof user.image === 'string') return user.image;
      if (user.image?.link) return user.image.link;
    }
    return null;
  };

  const otherName = otherUserData?.username || otherUserData?.displayName || other?.name || 'User';
  const meName = me?.name || 'Me';
  const otherAvatarUrl = getAvatarUrl(other, otherUserData);
  const myAvatarUrl = getAvatarUrl(me, currentUserData); // Get current user's profile picture
  const myAvatarSettings = getMyAvatarSettings();

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

  // Render avatar component (same pattern as ProfilePage)
  const renderAvatar = (isSent, size = 32) => {
    if (isSent) {
      // Current user - check for profile picture first
      if (myAvatarUrl) {
        return (
          <img 
            src={myAvatarUrl} 
            alt={meName}
            className="message-avatar message-avatar-img"
            style={{ width: size, height: size }}
          />
        );
      }
      // Fallback to localStorage emoji settings
      return (
        <div 
          className="message-avatar"
          style={{ 
            width: size, 
            height: size, 
            backgroundColor: myAvatarSettings.bgColor,
            fontSize: size * 0.5
          }}
        >
          {myAvatarSettings.emoji}
        </div>
      );
    } else {
      // Other user - check for profile picture
      if (otherAvatarUrl) {
        return (
          <img 
            src={otherAvatarUrl} 
            alt={otherName}
            className="message-avatar message-avatar-img"
            style={{ width: size, height: size }}
          />
        );
      }
      // Fallback to initials
      return (
        <div 
          className="message-avatar"
          style={{ 
            width: size, 
            height: size, 
            backgroundColor: '#0079D3',
            fontSize: size * 0.45
          }}
        >
          {getInitials(otherName)}
        </div>
      );
    }
  };

  return (
    <div className="chat-window-container">
      {/* Header */}
      <div className="chat-window-header">
        {onBack && (
          <button className="chat-window-back-btn" onClick={onBack}>
            ←
          </button>
        )}
        {otherAvatarUrl ? (
          <img 
            src={otherAvatarUrl} 
            alt={otherName}
            className="chat-window-avatar chat-window-avatar-img"
          />
        ) : (
          <div 
            className="chat-window-avatar"
            style={{ backgroundColor: '#0079D3' }}
          >
            {getInitials(otherName)}
          </div>
        )}
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
            const messageUserId = getMessageUserId(message);
            const isSent = messageUserId && String(messageUserId) === String(currentUserId);
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
                {renderAvatar(isSent, 32)}
                <div 
                  className="message-bubble"
                  style={isSent ? { backgroundColor: myAvatarSettings.bgColor } : undefined}
                >
                  {replyMsg && (
                    <div className="message-reply-preview">
                      <span className="reply-icon">↩</span>
                      <span className="reply-text">{replyMsg.content?.slice(0, 80) || 'Attachment'}</span>
                    </div>
                  )}
                  {message.content && <p className="message-text">{message.content}</p>}
                  {/* Display imageLink if present */}
                  {message.imageLink && (
                    <div className="message-image-container">
                      <img
                        src={message.imageLink}
                        alt="Shared image"
                        className="message-image"
                        onClick={() => window.open(message.imageLink, '_blank')}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display = 'flex');
                        }}
                      />
                      <div className="message-image-error" style={{ display: 'none' }}>
                        <span>📷</span>
                        <span>Image unavailable</span>
                      </div>
                    </div>
                  )}
                  {/* Legacy attachments support */}
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
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
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
        {uploadError && (
          <div className="upload-error-bar">
            <span>{uploadError}</span>
            <button onClick={() => setUploadError(null)}>×</button>
          </div>
        )}

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
              <div key={f.id || i} className={`selected-file-item ${f.uploading ? 'uploading' : ''} ${f.error ? 'error' : ''}`}>
                <img src={f.url} alt={f.name} className="selected-file-thumb" />
                {f.uploading && (
                  <div className="upload-progress">
                    <span className="upload-spinner">⏳</span>
                    <span>Uploading...</span>
                  </div>
                )}
                {f.error && (
                  <div className="upload-error">
                    <span>❌ {f.error}</span>
                  </div>
                )}
                {f.uploadedUrl && !f.uploading && !f.error && (
                  <div className="upload-success">✓</div>
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
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
        />

        <button className="attach-btn" title="Attach image" onClick={() => fileInputRef.current?.click()} disabled={sending || selectedFiles.some(f => f.uploading)}>📷</button>
        <textarea
          className="chat-window-input"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          disabled={sending || selectedFiles.some(f => f.uploading)}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={(!!!messageInput.trim() && selectedFiles.length === 0) || sending || selectedFiles.some(f => f.uploading) || selectedFiles.some(f => f.error)}
          title="Send message"
        >
          {sending ? '...' : selectedFiles.some(f => f.uploading) ? '⏳' : '➤'}
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
          {getMessageUserId(contextMenu.message) === currentUserId && onDeleteMessage && (
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

