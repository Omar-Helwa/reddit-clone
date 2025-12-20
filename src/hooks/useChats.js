import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchChats, fetchChatsForUser, fetchChatMessages, sendMessage, createChat, deleteMessage as apiDeleteMessage } from '../api/chatsApi';
import { addNotification } from '../utils/notifications';
import { getCurrentUser } from '../utils/auth';

/**
 * Custom hook for managing chat functionality
 * @param {string} userId - Current user ID (optional)
 * @returns {Object} Chat state and methods
 */
const useChats = (userId = null) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsRefreshing, setChatsRefreshing] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesRefreshing, setMessagesRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const pollingRef = useRef(null);
  const lastSeenMessageIdRef = useRef(null);
  const activeChatIdRef = useRef(null);
  const POLLING_INTERVAL_MS = 3000;

  const sortChats = useCallback((list) => {
    const arr = Array.isArray(list) ? list : [];
    return [...arr].sort((a, b) => {
      const da = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const db = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return db - da;
    });
  }, []);

  /**
   * Load all chats for the user
   */
  const loadChats = useCallback(async () => {
    const isInitial = chats.length === 0;
    if (isInitial) setChatsLoading(true);
    else setChatsRefreshing(true);
    setError(null);
    try {
      const data = userId ? await fetchChatsForUser(userId) : await fetchChats();
      setChats(sortChats(data));
    } catch (err) {
      setError(err.message || 'Failed to load chats');
    } finally {
      setChatsLoading(false);
      setChatsRefreshing(false);
    }
  }, [chats.length, sortChats, userId]);

  /**
   * Load messages for a specific chat
   * @param {string} chatId - Chat ID
   */
  const loadMessages = useCallback(async (chatId, options = {}) => {
    if (!chatId) return;
    const { background = false } = options;
    
    if (background) setMessagesRefreshing(true);
    else setMessagesLoading(true);
    setError(null);
    try {
      const data = await fetchChatMessages(chatId);
      const messagesArray = Array.isArray(data) ? data : [];

      // Lightweight "real-time" notification: when polling brings in a new message
      // from someone else, create a notification.
      const newest = messagesArray[messagesArray.length - 1];
      if (newest?._id && newest._id !== lastSeenMessageIdRef.current) {
        // Handle userId being either a string or an object with _id/id
        const newestUserId = typeof newest.userId === 'object' 
          ? (newest.userId?._id || newest.userId?.id) 
          : newest.userId;
        const isFromSomeoneElse = newestUserId && userId && String(newestUserId) !== String(userId);
        if (isFromSomeoneElse) {
          addNotification({
            type: 'message',
            title: 'New message',
            message: newest.content || 'You received a new message',
            link: '/chat',
          });
        }
        lastSeenMessageIdRef.current = newest._id;
      }

      setMessages(messagesArray);

      // Keep chat list ordered like Messenger: bump the active chat to the top
      // whenever its newest message changes.
      if (newest) {
        const derivedUpdatedAt = newest.timestamp || newest.createdAt || new Date().toISOString();
        const derivedLastMessage = (newest.content && newest.content.trim())
          ? newest.content.trim()
          : (Array.isArray(newest.attachments) && newest.attachments.length ? '📎 Attachment' : '');

        setChats((prev) => {
          const updated = prev.map((c) => {
            if (c?._id !== chatId) return c;
            const next = {
              ...c,
              updatedAt: derivedUpdatedAt,
              lastMessage: derivedLastMessage || c.lastMessage,
            };
            return next;
          });
          return sortChats(updated);
        });

        setActiveChat((prev) => {
          if (!prev || prev._id !== chatId) return prev;
          return {
            ...prev,
            updatedAt: derivedUpdatedAt,
            lastMessage: derivedLastMessage || prev.lastMessage,
          };
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setMessagesLoading(false);
      setMessagesRefreshing(false);
    }
  }, [userId, sortChats]);

  /**
   * Select a chat and load its messages
   * @param {Object} chat - Chat object
   */
  const selectChat = useCallback(async (chat) => {
    setActiveChat(chat);
    if (chat && chat._id) {
      activeChatIdRef.current = chat._id;
      setMessages([]);
      await loadMessages(chat._id, { background: false });
    }
  }, [loadMessages]);

  /**
   * Send a new message in the active chat
   * @param {string} content - Message content
   */
  const sendChatMessage = useCallback(async (payload) => {
    if (!activeChat) return;

    // Support string or object payload
    const isString = typeof payload === 'string';
    const content = isString ? payload : (payload?.content || '');
    const imageLink = isString ? null : (payload?.imageLink || null);
    const replyTo = isString ? null : (payload?.replyTo || null);

    if (!content.trim() && !imageLink) return;

    setSending(true);
    setError(null);
    try {
      const messageData = {
        content: content.trim() || (imageLink ? 'Sent an image' : ''),
        imageLink,
        replyTo,
        userId: userId,
        timestamp: new Date(),
      };
      
      const response = await sendMessage(activeChat._id, messageData);
      
      // Update messages list with the returned message
      if (response) {
        setMessages((prev) => [...prev, response]);
        // Track last seen so we don't notify on our own message during the next poll.
        if (response?._id) lastSeenMessageIdRef.current = response._id;
      } else {
        // If backend doesn't return the message, refetch to update UI
        await loadMessages(activeChat._id, { background: true });
      }
      
      // Update chat's last message in the chats list
      setChats((prev) =>
        sortChats(
          prev.map((chat) =>
            chat._id === activeChat._id
              ? {
                  ...chat,
                  lastMessage: content.trim() || (imageLink ? '📷 Image' : ''),
                  updatedAt: new Date().toISOString(),
                }
              : chat
          )
        )
      );

      setActiveChat((prev) => {
        if (!prev || prev._id !== activeChat._id) return prev;
        return {
          ...prev,
          lastMessage: content.trim() || (imageLink ? '📷 Image' : ''),
          updatedAt: new Date().toISOString(),
        };
      });
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to send message');
      throw err;
    } finally {
      setSending(false);
    }
  }, [activeChat, userId]);

  /**
   * Create a new chat conversation
   * @param {Object} otherUser - The other user's info
   */
  const startNewChat = useCallback(async (otherUser) => {
    setChatsLoading(true);
    setError(null);
    try {
      const currentUser = getCurrentUser();
      const chatData = {
        user1: {
          id: userId,
          name: currentUser?.username || 'User',
          image: currentUser?.image ? { link: currentUser.image } : {},
        },
        user2: otherUser,
        lastMessage: '',
        updatedAt: new Date(),
      };
      
      const newChat = await createChat(chatData);
      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat);
      return newChat;
    } catch (err) {
      setError(err.message || 'Failed to create chat');
      throw err;
    } finally {
      setChatsLoading(false);
    }
  }, [userId]);

  /**
   * Sort chats by most recent
   */
  const sortChatsByRecent = useCallback(() => {
    setChats((prev) => sortChats(prev));
  }, [sortChats]);

  /**
   * Clear active chat
   */
  const clearActiveChat = useCallback(() => {
    setActiveChat(null);
    setMessages([]);
  }, []);

  /**
   * Delete a message in the active chat
   */
  const deleteChatMessage = useCallback(async (messageId) => {
    if (!activeChat || !messageId) return false;
    try {
      const res = await apiDeleteMessage(activeChat._id, messageId);
      if (res?.success || res?.status === 'ok') {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, [activeChat]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Keep a stable sorted list on first mount and subsequent fetches/updates.

  // Poll for new messages on active chat
  useEffect(() => {
    if (!activeChat?._id) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }
    // Initial fetch (foreground only if we don't have messages yet)
    loadMessages(activeChat._id, { background: messages.length > 0 });

    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      loadMessages(activeChat._id, { background: true });
    }, POLLING_INTERVAL_MS);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [activeChat?._id, loadMessages, messages.length]);

  return {
    // State
    chats,
    activeChat,
    messages,
    chatsLoading,
    chatsRefreshing,
    messagesLoading,
    messagesRefreshing,
    error,
    sending,
    
    // Methods
    loadChats,
    loadMessages,
    selectChat,
    sendChatMessage,
    deleteChatMessage,
    startNewChat,
    clearActiveChat,
    sortChatsByRecent,
  };
};

export default useChats;
