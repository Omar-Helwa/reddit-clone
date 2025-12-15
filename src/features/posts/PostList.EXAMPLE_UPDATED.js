/**
 * EXAMPLE: How to use Posts API and Hooks
 * Replace src/features/posts/PostList.js with this structure
 */

import React, { useState } from 'react';
import Post from './Post';
import './PostList.css';
import { usePosts, usePostVote } from '../../hooks/usePosts';

const PostList = () => {
  const { posts, loading, error, refetch } = usePosts();
  const { upvotePost, downvotePost } = usePostVote();
  const [sortBy, setSortBy] = useState('BEST');

  // Sort posts based on sortBy
  const sortedPosts = React.useMemo(() => {
    const postsArray = [...posts];
    switch (sortBy) {
      case 'NEW':
        return postsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'TOP':
        return postsArray.sort((a, b) => b.score - a.score);
      case 'HOT':
      case 'BEST':
      default:
        return postsArray.sort((a, b) => b.score - a.score);
    }
  }, [posts, sortBy]);

  const handleUpvote = async (postId) => {
    try {
      await upvotePost(postId);
      refetch(); // Refresh posts
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  const handleDownvote = async (postId) => {
    try {
      await downvotePost(postId);
      refetch(); // Refresh posts
    } catch (err) {
      console.error('Downvote failed:', err);
    }
  };

  const handleCommentClick = (post) => {
    const slug = post.subreddit?.replace(/^r\//, '') || 'general';
    window.location.href = `/community/${slug}/post/${post.postId}`;
  };

  if (loading) {
    return <div className="post-list"><div className="loading">Loading posts...</div></div>;
  }

  if (error) {
    return (
      <div className="post-list">
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={refetch}>Try Again</button>
        </div>
      </div>
    );
  }

  if (sortedPosts.length === 0) {
    return (
      <div className="post-list">
        <div className="empty">No posts found. Be the first to create one!</div>
      </div>
    );
  }

  return (
    <div className="post-list">
      {sortedPosts.map((post) => (
        <Post
          key={post.uniqueKey}
          post={post}
          onUpvote={handleUpvote}
          onDownvote={handleDownvote}
          onCommentClick={handleCommentClick}
        />
      ))}
    </div>
  );
};

export default PostList;
