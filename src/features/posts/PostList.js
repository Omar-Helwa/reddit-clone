import React, { useState, useEffect } from 'react';
import Post from './Post';
import './PostList.css';
import { navigate } from '../../utils/helpers';
import { communities, initialPosts, ensureSeeded } from '../../data/mockData';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('BEST');

  useEffect(() => {
    // Fetch posts from API
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Ensure data is seeded
      ensureSeeded();
      
      // Aggregate posts from all communities
      const allPosts = [];
      Object.keys(communities).forEach(communityKey => {
        const storageKey = `posts:${communityKey}`;
        const postsRaw = localStorage.getItem(storageKey);
        if (postsRaw) {
          const communityPosts = JSON.parse(postsRaw);
          const community = communities[communityKey];
          
          communityPosts.forEach(post => {
            allPosts.push({
              postId: post.id,
              communityKey: communityKey,
              uniqueKey: `${communityKey}_${post.id}`,
              title: post.title,
              author: post.author,
              subreddit: community.name,
              timestamp: post.timestamp,
              score: post.score,
              commentCount: post.commentCount,
              textBody: post.textBody || '',
              type: post.type || 'text',
              imageUrl: post.imageUrl,
              linkUrl: post.linkUrl,
              pollOptions: post.pollOptions,
              subredditIcon: community.icon,
              authorIcon: 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_4.png'
            });
          });
        }
      });
      
      // Sort posts based on sortBy
      const sorted = sortPosts(allPosts, sortBy);
      setPosts(sorted);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleUpvote = (postId) => {
    setPosts(posts.map(post => 
      post.postId === postId 
        ? { ...post, score: post.score + 1 }
        : post
    ));
  };

  const handleDownvote = (postId) => {
    setPosts(posts.map(post => 
      post.postId === postId 
        ? { ...post, score: Math.max(0, post.score - 1) }
        : post
    ));
  };

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
        {posts.length > 0 ? (
          posts.map(post => (
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
