import { useEffect, useState } from 'react';
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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    Promise.all([
      getMyPosts({ limit: 25 }),
      getMyComments({ limit: 25 }),
      getMySavedPosts({ limit: 25 }),
      getMyHiddenPosts({ limit: 25 }),
      getMyUpvotedPosts({ limit: 25 }),
      getMyDownvotedPosts({ limit: 25 })
    ])
      .then(([
        postsRes,
        commentsRes,
        savedRes,
        hiddenRes,
        upvotedRes,
        downvotedRes
      ]) => {
        if (!isMounted) return;
        setPosts(postsRes.items || []);
        setComments(commentsRes.items || []);
        setSavedPosts(savedRes.items || []);
        setHiddenPosts(hiddenRes.items || []);
        setUpvotedPosts(upvotedRes.items || []);
        setDownvotedPosts(downvotedRes.items || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load profile data');
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    posts,
    comments,
    savedPosts,
    hiddenPosts,
    upvotedPosts,
    downvotedPosts,
    loading,
    error
  };
}
