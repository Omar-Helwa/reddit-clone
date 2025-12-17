import React, { useMemo, useState } from 'react';
import Post from './Post';
import './PostList.css';
import { navigate } from '../../utils/helpers';
import { usePosts } from '../../hooks/usePosts';

const PostList = () => {
  const [sortBy, setSortBy] = useState('BEST');
  const { posts, loading, error, refetch } = usePosts();

  const getTimestampMs = (post) => {
    const raw = post?.createdAt || post?.timestamp || post?.created || 0;
    const ms = new Date(raw).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  };

  const hotRank = (post, exponent = 1.5) => {
    const score = Number(post?.score) || 0;
    const ts = getTimestampMs(post);
    const hoursSince = Math.max(0, (Date.now() - ts) / 3600000);
    return score / Math.pow(hoursSince + 2, exponent);
  };

  const sortPosts = (postsArray, sort) => {
    const list = Array.isArray(postsArray) ? postsArray : [];
    switch (sort) {
      case 'NEW':
        return [...list].sort((a, b) => getTimestampMs(b) - getTimestampMs(a));
      case 'TOP':
        return [...list].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0) || getTimestampMs(b) - getTimestampMs(a));
      case 'RISING':
        return [...list].sort((a, b) => hotRank(b, 1.15) - hotRank(a, 1.15) || getTimestampMs(b) - getTimestampMs(a));
      case 'HOT':
        return [...list].sort((a, b) => hotRank(b, 1.5) - hotRank(a, 1.5) || getTimestampMs(b) - getTimestampMs(a));
      case 'BEST':
      default:
        // Slight recency bias, less aggressive than HOT
        return [...list].sort((a, b) => hotRank(b, 1.35) - hotRank(a, 1.35) || getTimestampMs(b) - getTimestampMs(a));
    }
  };

  const sortedPosts = useMemo(() => sortPosts(posts, sortBy), [posts, sortBy]);

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
          sortedPosts.map((post) => {
            const subreddit = post.subreddit || 'r/general';
            const communityKey = subreddit.replace(/^r\//, '') || 'general';
            const timestamp = post.createdAt || post.timestamp;
            return (
              <Post
                key={post.uniqueKey}
                postId={post.postId}
                communityKey={communityKey}
                title={post.title}
                author={post.author}
                  authorId={post.authorId}
                subreddit={subreddit}
                timestamp={timestamp}
                score={post.score}
                commentCount={post.commentCount}
                textBody={post.textBody}
                authorIcon={post.authorIcon}
                subredditIcon={post.subredditIcon}
                onCommentClick={() => handleCommentClick(post)}
                onSubredditClick={() => handleSubredditClick(post.subreddit)}
              />
            );
          })
        ) : (
          <div className="no-posts">No posts found</div>
        )}
      </div>
    </div>
  );
};

export default PostList;
