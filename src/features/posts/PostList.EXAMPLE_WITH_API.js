// Example: Updated PostList.js using the API

import React, { useState } from 'react';
import Post from './Post';
import './PostList.css';
import { navigate } from '../../utils/helpers';
import { usePosts } from '../../hooks/useAPI';

const PostList = () => {
  const { posts, loading, error, refetch } = usePosts();
  const [sortBy, setSortBy] = useState('BEST');

  // Sort posts based on sortBy
  const sortedPosts = React.useMemo(() => {
    const postsArray = [...posts];
    switch (sortBy) {
      case 'NEW':
        return postsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      case 'TOP':
        return postsArray.sort((a, b) => b.score - a.score);
      case 'HOT':
      case 'BEST':
      default:
        return postsArray.sort((a, b) => b.score - a.score);
    }
  }, [posts, sortBy]);

  const handleUpvote = async (postId) => {
    // TODO: Call API to update upvote
    // For now, just update locally
  };

  const handleDownvote = async (postId) => {
    // TODO: Call API to update downvote
  };

  const handleCommentClick = (post) => {
    const slug = post.subreddit?.replace(/^r\//, '');
    if (!slug) return;
    navigate(`/community/${slug}/post/${post.postId}`);
  };

  const handlePostClick = (post) => {
    const slug = post.subreddit?.replace(/^r\//, '');
    if (!slug) return;
    navigate(`/community/${slug}/post/${post.postId}`);
  };

  if (loading) {
    return (
      <div className="post-list">
        <div className="loading-spinner">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-list">
        <div className="error-message">
          <p>Error loading posts: {error}</p>
          <button onClick={refetch}>Try Again</button>
        </div>
      </div>
    );
  }

  if (sortedPosts.length === 0) {
    return (
      <div className="post-list">
        <div className="empty-state">
          <p>No posts found. Be the first to create one!</p>
        </div>
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
          onPostClick={handlePostClick}
        />
      ))}
    </div>
  );
};

export default PostList;
