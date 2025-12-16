import React, { useMemo, useState } from 'react';
import Post from './Post';
import './PostList.css';
import { navigate } from '../../utils/helpers';
import { usePosts } from '../../hooks/usePosts';

const PostList = () => {
  const [sortBy, setSortBy] = useState('BEST');
  const { posts, loading, error, refetch } = usePosts();

  const sortPosts = (postsArray, sort) => {
    switch (sort) {
      case 'NEW':
        return [...postsArray].sort((a, b) => {
          // Simple timestamp sorting (newer first)
          return 0; // Keep original order for now
        });
      case 'TOP':
        return [...postsArray].sort((a, b) => b.score - a.score);
      case 'HOT':
      case 'BEST':
      default:
        // Score + recency blend
        return [...postsArray].sort((a, b) => b.score - a.score);
    }
  };

  const sortedPosts = useMemo(() => sortPosts(posts, sortBy), [posts, sortBy]);

  const handleUpvote = () => {};

  const handleDownvote = () => {};

  const handleCommentClick = (post) => {
    const slug = post.subreddit?.replace(/^r\//, '') || 'general';
    navigate(`/r/${slug}/comments/${post.postId}?comment=1`);
  };

  const handleSubredditClick = (subreddit) => {
    const slug = subreddit.replace(/^r\//, '');
    navigate(`/r/${slug}`);
  };

  if (loading) {
    return <div className="post-list loading">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="post-list loading">
        <div>Error loading posts: {error}</div>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div className="post-list-container">
      {/* Sort Controls */}
      <div className="sort-controls">
        <label htmlFor="sort-select">Sort by:</label>
        <select 
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="BEST">Best</option>
          <option value="HOT">Hot</option>
          <option value="NEW">New</option>
          <option value="TOP">Top</option>
          <option value="RISING">Rising</option>
        </select>
      </div>

      {/* Posts List */}
      <div className="post-list">
        {sortedPosts.length > 0 ? (
          sortedPosts.map(post => (
            <Post
              key={post.uniqueKey}
              postId={post.postId}
              communityKey={post.communityKey}
              title={post.title}
              author={post.author}
              subreddit={post.subreddit}
              timestamp={post.timestamp}
              score={post.score}
              commentCount={post.commentCount}
              textBody={post.textBody}
              authorIcon={post.authorIcon}
              subredditIcon={post.subredditIcon}
              onCommentClick={() => handleCommentClick(post)}
              onSubredditClick={() => handleSubredditClick(post.subreddit)}
              onUpvote={() => handleUpvote(post.uniqueKey)}
              onDownvote={() => handleDownvote(post.uniqueKey)}
            />
          ))
        ) : (
          <div className="no-posts">No posts found</div>
        )}
      </div>
    </div>
  );
};

export default PostList;
