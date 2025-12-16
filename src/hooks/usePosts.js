/**
 * Custom React hook for fetching posts from the API
 * Transforms MongoDB data to component-ready format
 */

import { useState, useEffect } from 'react';
import postsAPI from '../api/postsAPI';

/**
 * Transform MongoDB post document to component format
 * @param {Object} post - Raw post from API
 * @returns {Object} Transformed post ready for components
 */
function transformPost(post) {
  // Use Mongo _id as primary identifier for routing; keep original postId for display if needed
  const primaryId = post._id || post.postId;
  return {
    postId: primaryId,
    uniqueKey: primaryId,
    originalPostId: post.postId,
    title: post.title,
    author: post.author,
    subreddit: post.subreddit || 'r/general',
    type: post.type || 'text',
    
    // Content
    textBody: post.textBody || '',
    linkUrl: post.linkUrl,
    imageUrl: post.imageUrl,
    pollOptions: post.pollOptions || [],
    
    // Engagement
    upvotes: post.upvotes || 0,
    downvotes: post.downvotes || 0,
    score: post.score || 0,
    commentCount: post.commentCount || 0,
    comments: post.comments || [],
    
    // Metadata
    isPinned: post.isPinned || false,
    createdAt: post.createdAt,
    
    // UI defaults
    subredditIcon: 'https://via.placeholder.com/120/ff4500/ffffff?text=R',
    authorIcon: 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_4.png',
  };
}

/**
 * Hook to fetch all posts
 * @returns {Object} { posts, loading, error, refetch }
 */
export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await postsAPI.getAll();
      const list = Array.isArray(result) ? result : (result?.items ?? []);
      const transformedPosts = list.map(transformPost);
      setPosts(transformedPosts);
    } catch (err) {
      setError(err.message || 'Failed to fetch posts');
      console.error('Posts fetch error:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  };
}

/**
 * Hook to fetch posts from a specific subreddit/community
 * @param {string} subreddit - Subreddit name (e.g., 'r/hackthebox')
 * @returns {Object} { posts, loading, error, refetch }
 */
export function usePostsBySubreddit(subreddit) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    if (!subreddit) {
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await postsAPI.getBySubreddit(subreddit);
      const list = Array.isArray(result) ? result : (result?.items ?? []);
      const transformedPosts = list.map(transformPost);
      const filteredPosts = transformedPosts.filter(p => p.subreddit === subreddit);
      setPosts(filteredPosts);
    } catch (err) {
      setError(err.message || 'Failed to fetch posts');
      console.error('Posts by subreddit fetch error:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [subreddit]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  };
}

/**
 * Hook to fetch a single post by ID
 * @param {string} postId - Post ID (ObjectId)
 * @returns {Object} { post, loading, error, refetch }
 */
export function usePost(postId) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPost = async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await postsAPI.getById(postId);
      const transformedPost = transformPost(result);
      setPost(transformedPost);
    } catch (err) {
      setError(err.message || 'Failed to fetch post');
      console.error('Post fetch error:', err);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  };
}

/**
 * Hook to create a new post
 * @returns {Object} { createPost, loading, error }
 */
export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPost = async (postData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await postsAPI.create(postData);
      const transformedPost = transformPost(result);
      return transformedPost;
    } catch (err) {
      setError(err.message || 'Failed to create post');
      console.error('Create post error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPost,
    loading,
    error,
  };
}

/**
 * Hook to upvote/downvote a post
 * @returns {Object} { upvotePost, downvotePost, loading, error }
 */
export function usePostVote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const upvotePost = async (postId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await postsAPI.upvote(postId);
      return transformPost(result);
    } catch (err) {
      setError(err.message || 'Failed to upvote post');
      console.error('Upvote error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downvotePost = async (postId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await postsAPI.downvote(postId);
      return transformPost(result);
    } catch (err) {
      setError(err.message || 'Failed to downvote post');
      console.error('Downvote error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    upvotePost,
    downvotePost,
    loading,
    error,
  };
}
