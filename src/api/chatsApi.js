import apiClient from './apiClient';
import { mockChats, mockMessages } from '../data/mockChatData';

/**
 * Chat API Module
 * Handles all chat-related API requests
 */

// Flag to enable mock data fallback for development
const USE_MOCK_DATA = true;

// In-memory store for mock chats so new chats persist in dev
let inMemoryChats = null;
const getChatsStore = () => {
  if (!inMemoryChats) {
    inMemoryChats = (mockChats || []).map((c) => ({ ...c }));
  }
  return inMemoryChats;
};

// In-memory store for mock messages so sends/deletes persist in dev
let inMemoryMessages = null;
const getMessagesStore = () => {
  if (!inMemoryMessages) {
    // Deep copy mockMessages to avoid mutating import
    inMemoryMessages = Object.keys(mockMessages).reduce((acc, key) => {
      acc[key] = mockMessages[key].map((m) => ({ ...m }));
      return acc;
    }, {});
  }
  return inMemoryMessages;
};

/**
 * Fetch all chats for the current user
 * @returns {Promise<Array>} List of chat conversations
 */
export const fetchChats = async () => {
  if (USE_MOCK_DATA) {
    // Return mock data for development
    return new Promise((resolve) => {
      setTimeout(() => resolve(getChatsStore()), 300);
    });
  }
  
  try {
    const response = await apiClient.get('/chats');
    return response;
  } catch (error) {
    console.error('Error fetching chats:', error);
    // Fallback to mock data on error
    return mockChats;
  }
};

/**
 * Fetch a specific chat by ID
 * @param {string} chatId - The chat ID
 * @returns {Promise<Object>} Chat details
 */
export const fetchChatById = async (chatId) => {
  if (USE_MOCK_DATA) {
    const chat = mockChats.find(c => c._id === chatId);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (chat) resolve(chat);
        else reject(new Error('Chat not found'));
      }, 300);
    });
  }
  
  try {
    const response = await apiClient.get(`/chats/${chatId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching chat ${chatId}:`, error);
    throw error;
  }
};

/**
 * Create a new chat conversation
 * @param {Object} chatData - Chat data (user1, user2)
 * @returns {Promise<Object>} Created chat
 */
export const createChat = async (chatData) => {
  if (USE_MOCK_DATA) {
    const newChat = {
      _id: String(Date.now()),
      ...chatData,
      updatedAt: new Date(),
    };

    // Persist in in-memory store
    const store = getChatsStore();
    store.unshift({ ...newChat });

    return new Promise((resolve) => {
      setTimeout(() => resolve(newChat), 500);
    });
  }
  
  try {
    const response = await apiClient.post('/chats', chatData);
    return response;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

/**
 * Send a message in a chat
 * @param {string} chatId - The chat ID
 * @param {Object} messageData - Message content
 * @returns {Promise<Object>} Updated chat
 */
export const sendMessage = async (chatId, messageData) => {
  if (USE_MOCK_DATA) {
    const now = new Date().toISOString();
    const newMessage = {
      _id: String(Date.now()),
      chatId,
      content: messageData.content || '',
      userId: messageData.userId,
      timestamp: messageData.timestamp || now,
      attachments: messageData.attachments || [], // [{ id, url, type, name, size }]
      replyTo: messageData.replyTo || null,
    };

    // Persist in in-memory store
    const store = getMessagesStore();
    if (!store[chatId]) store[chatId] = [];
    store[chatId].push(newMessage);

    // Update chat list metadata so it moves to top and shows last message
    const chatsStore = getChatsStore();
    const idx = chatsStore.findIndex((c) => String(c._id) === String(chatId));
    if (idx >= 0) {
      chatsStore[idx] = {
        ...chatsStore[idx],
        lastMessage: newMessage.content || (newMessage.attachments?.length ? '📎 Attachment' : ''),
        updatedAt: newMessage.timestamp || now,
      };
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(newMessage), 200);
    });
  }
  
  try {
    const response = await apiClient.post(`/chats/${chatId}/messages`, messageData);
    return response;
  } catch (error) {
    console.error(`Error sending message to chat ${chatId}:`, error);
    throw error;
  }
};

/**
 * Fetch all messages for a specific chat
 * @param {string} chatId - The chat ID
 * @returns {Promise<Array>} List of messages
 */
export const fetchChatMessages = async (chatId) => {
  if (USE_MOCK_DATA) {
    const store = getMessagesStore();
    const messages = (store[chatId] || []).slice();
    return new Promise((resolve) => {
      setTimeout(() => resolve(messages), 200);
    });
  }
  
  try {
    const response = await apiClient.get(`/chats/${chatId}/messages`);
    return response;
  } catch (error) {
    console.error(`Error fetching messages for chat ${chatId}:`, error);
    // Fallback to mock data on error
    return mockMessages[chatId] || [];
  }
};

/**
 * Delete a chat conversation
 * @param {string} chatId - The chat ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteChat = async (chatId) => {
  try {
    const response = await apiClient.delete(`/chats/${chatId}`);
    return response;
  } catch (error) {
    console.error(`Error deleting chat ${chatId}:`, error);
    throw error;
  }
};

/**
 * Delete a single message in a chat (mock only)
 * @param {string} chatId
 * @param {string} messageId
 * @returns {Promise<{success: boolean}>}
 */
export const deleteMessage = async (chatId, messageId) => {
  if (USE_MOCK_DATA) {
    const store = getMessagesStore();
    if (!store[chatId]) return { success: false };
    const before = store[chatId].length;
    store[chatId] = store[chatId].filter((m) => m._id !== messageId);
    const after = store[chatId].length;
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: before !== after }), 150);
    });
  }
  try {
    const response = await apiClient.delete(`/chats/${chatId}/messages/${messageId}`);
    return response;
  } catch (error) {
    console.error(`Error deleting message ${messageId} in chat ${chatId}:`, error);
    throw error;
  }
};

/**
 * Search chats by user name
 * @param {string} query - Search query
 * @returns {Promise<Array>} Filtered chats
 */
export const searchChats = async (query) => {
  try {
    const response = await apiClient.get(`/chats/search?q=${encodeURIComponent(query)}`);
    return response;
  } catch (error) {
    console.error('Error searching chats:', error);
    throw error;
  }
};

/**
 * Mark chat as read
 * @param {string} chatId - The chat ID
 * @returns {Promise<Object>} Updated chat
 */
export const markChatAsRead = async (chatId) => {
  try {
    const response = await apiClient.patch(`/chats/${chatId}/read`);
    return response;
  } catch (error) {
    console.error(`Error marking chat ${chatId} as read:`, error);
    throw error;
  }
};

export default {
  fetchChats,
  fetchChatById,
  createChat,
  sendMessage,
  fetchChatMessages,
  deleteChat,
  deleteMessage,
  searchChats,
  markChatAsRead,
};
