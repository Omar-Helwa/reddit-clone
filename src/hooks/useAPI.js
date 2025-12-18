/*
 * DEPRECATED: This file has been split into separate hooks modules
 * Use instead:
 * - src/hooks/usePosts.js (for post hooks)
 * - src/hooks/useComments.js (for comment hooks)
 * 
 * This file is kept for reference only.
 */

/*
import { useState, useEffect } from 'react';

export function useAPI(apiFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { postsAPI } = await import('../api/apiClient');
      const result = await postsAPI.getAll();
      
      const transformedPosts = result.map(post => ({
        postId: post._id,
        uniqueKey: post._id,
        title: post.title,
        author: post.author,
        subreddit: post.community || '',
        timestamp: post.createdAt,
        score: (post.upvotes || 0) - (post.downvotes || 0),
        commentCount: post.comments?.length || 0,
        textBody: post.content || '',
        type: post.type || 'text',
        imageUrl: post.imageUrl,
        linkUrl: post.linkUrl,
        subredditIcon: 'https://via.placeholder.com/120/ff4500/ffffff?text=R',
        authorIcon: 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_4.png'
      }));
      
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
      
      const { postsAPI } = await import('../api/apiClient');
      const result = await postsAPI.getById(postId);
      setPost(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch post');
      console.error('Post fetch error:', err);
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
*/
