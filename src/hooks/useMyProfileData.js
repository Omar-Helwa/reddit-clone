import { useEffect, useState, useCallback } from 'react';
import {
  getMyPosts,
  getMyComments,
  getMySavedPosts,
  getMyHiddenPosts,
  getMyUpvotedPosts,
  getMyDownvotedPosts
} from '../api/usersApi';

export function useMyProfileData() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [hiddenPosts, setHiddenPosts] = useState([]);
  const [upvotedPosts, setUpvotedPosts] = useState([]);
  const [downvotedPosts, setDownvotedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [postsRes, commentsRes, savedRes, hiddenRes, upvotedRes, downvotedRes] = await Promise.all([
        getMyPosts({ limit: 25 }),
        getMyComments({ limit: 25 }),
        getMySavedPosts({ limit: 25 }),
        getMyHiddenPosts({ limit: 25 }),
        getMyUpvotedPosts({ limit: 25 }),
        getMyDownvotedPosts({ limit: 25 })
      ]);
      setPosts(postsRes.items || []);
      setComments(commentsRes.items || []);
      setSavedPosts(savedRes.items || []);
      setHiddenPosts(hiddenRes.items || []);
      setUpvotedPosts(upvotedRes.items || []);
      setDownvotedPosts(downvotedRes.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return {
    posts,
    comments,
    savedPosts,
    hiddenPosts,
    upvotedPosts,
    downvotedPosts,
    loading,
    error,
    refreshProfileData: fetchProfileData
  };
}
