/**
 * Advanced search utilities for users, posts, and communities
 */

import { listUsers } from '../api/usersApi';
import { postsAPI } from '../api/postsAPI';
import { listCommunities } from '../api/communitiesApi';

/**
 * Search users by username or display name
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Matching users
 */
export async function searchUsers(query, limit = 10) {
  if (!query || query.trim().length < 2) return [];

  try {
    const response = await listUsers({ limit: 50 });
    const users = response.items || [];
    const lowerQuery = query.toLowerCase();

    return users
      .filter(user => {
        const username = (user.username || '').toLowerCase();
        const displayName = (user.displayName || '').toLowerCase();
        return username.includes(lowerQuery) || displayName.includes(lowerQuery);
      })
      .map(user => ({
        id: user._id,
        type: 'user',
        title: user.displayName || user.username,
        subtitle: `u/${user.username}`,
        avatar: user.image,
        link: `/user/${user.username}`,
      }))
      .slice(0, limit);
  } catch (error) {
    return [];
  }
}

/**
 * Search posts by title or content
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Matching posts
 */
export async function searchPosts(query, limit = 15) {
  if (!query || query.trim().length < 2) return [];

  try {
    // In a real app, use a dedicated search endpoint
    // For now, fetch posts and filter client-side
    const posts = await postsAPI.getAll();
    const lowerQuery = query.toLowerCase();

    return posts
      .filter(post => {
        const title = (post.title || '').toLowerCase();
        const content = (post.textBody || post.content || '').toLowerCase();
        return title.includes(lowerQuery) || content.includes(lowerQuery);
      })
      .map(post => {
        const subreddit = post.subreddit;
        if (!subreddit) return null;
        const slug = subreddit.startsWith('r/') ? subreddit.slice(2) : subreddit;
        return {
          id: post.postId || post._id,
          type: 'post',
          title: post.title,
          subtitle: `${subreddit} • ${post.commentCount || 0} comments`,
          avatar: post.subredditIcon,
          link: `/r/${slug}/comments/${post.postId || post._id}`,
        };
      })
      .filter(Boolean)
      .slice(0, limit);
  } catch (error) {
    return [];
  }
}

/**
 * Search communities
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Matching communities
 */
export async function searchCommunities(query, limit = 10) {
  if (!query || query.trim().length < 2) return [];

  try {
    const response = await listCommunities({ limit: 100 });
    const communities = response.items || [];
    const lowerQuery = query.toLowerCase();

    return communities
      .filter(comm => {
        const name = (comm.name || '').toLowerCase();
        const displayName = (comm.displayName || '').toLowerCase();
        return name.includes(lowerQuery) || displayName.includes(lowerQuery);
      })
      .map(comm => ({
        id: comm._id || comm.id,
        type: 'community',
        title: comm.displayName || comm.name,
        subtitle: `${comm.name} • ${comm.members || 0} members`,
        avatar: comm.icon,
        link: `/r/${(comm.name || '').startsWith('r/') ? (comm.name || '').slice(2) : comm.name}`,
      }))
      .slice(0, limit);
  } catch (error) {
    return [];
  }
}

/**
 * Universal search across all types
 * @param {string} query - Search query
 * @returns {Promise<Object>} { users, posts, communities }
 */
export async function universalSearch(query) {
  if (!query || query.trim().length < 2) {
    return { users: [], posts: [], communities: [] };
  }

  try {
    const [users, posts, communities] = await Promise.all([
      searchUsers(query, 8),
      searchPosts(query, 10),
      searchCommunities(query, 8),
    ]);

    return { users, posts, communities };
  } catch (error) {
    return { users: [], posts: [], communities: [] };
  }
}
