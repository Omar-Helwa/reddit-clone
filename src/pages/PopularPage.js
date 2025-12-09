import React, { useState } from 'react';
import Post from '../features/posts/Post';
import './PopularPage.css';

function PopularPage() {
  const [timeFilter, setTimeFilter] = useState('today');
  const [location, setLocation] = useState('everywhere');

  const timeFilters = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' }
  ];

  const locations = [
    { id: 'everywhere', label: 'Everywhere' },
    { id: 'us', label: 'United States' },
    { id: 'uk', label: 'United Kingdom' },
    { id: 'canada', label: 'Canada' },
    { id: 'australia', label: 'Australia' }
  ];

  const popularPosts = [
    {
      postId: 'pop1',
      title: 'This AI tool can turn any text into a working game in seconds',
      author: 'u/TechEnthusiast',
      subreddit: 'r/technology',
      timestamp: '3 hours ago',
      score: 45200,
      commentCount: 2341,
      textBody: 'Researchers have developed an AI model that can generate playable games from simple text descriptions...',
      subredditIcon: '💻',
      authorIcon: '👤'
    },
    {
      postId: 'pop2',
      title: 'I quit my job to build my dream game. After 3 years, here it is!',
      author: 'u/IndieGameDev',
      subreddit: 'r/gaming',
      timestamp: '5 hours ago',
      score: 38900,
      commentCount: 1876,
      textBody: 'After countless sleepless nights and tons of coffee, my passion project is finally ready...',
      subredditIcon: '🎮',
      authorIcon: '👤'
    },
    {
      postId: 'pop3',
      title: 'NASA discovers water on Mars in unexpected location',
      author: 'u/SpaceExplorer',
      subreddit: 'r/space',
      timestamp: '2 hours ago',
      score: 52100,
      commentCount: 3204,
      textBody: 'New data from the Mars Reconnaissance Orbiter shows evidence of liquid water beneath the surface...',
      subredditIcon: '🚀',
      authorIcon: '👤'
    },
    {
      postId: 'pop4',
      title: 'My grandma started coding at 82. Here\'s her first website!',
      author: 'u/ProudGrandkid',
      subreddit: 'r/webdev',
      timestamp: '4 hours ago',
      score: 41800,
      commentCount: 2567,
      textBody: 'She wanted to learn something new during retirement. Started with HTML/CSS and never looked back...',
      subredditIcon: '🌐',
      authorIcon: '👤'
    },
    {
      postId: 'pop5',
      title: 'After 10 years of learning, I finally got my cybersecurity certification!',
      author: 'u/SecurityPro',
      subreddit: 'r/cybersecurity',
      timestamp: '6 hours ago',
      score: 28600,
      commentCount: 1432,
      textBody: 'Started from knowing nothing about security to becoming a certified ethical hacker...',
      subredditIcon: '🔒',
      authorIcon: '👤'
    },
    {
      postId: 'pop6',
      title: 'The most beautiful sunset I\'ve ever photographed [OC]',
      author: 'u/PhotoEnthusiast',
      subreddit: 'r/pics',
      timestamp: '7 hours ago',
      score: 67500,
      commentCount: 1234,
      textBody: 'Taken from the top of Mount Rainier. The colors were absolutely breathtaking...',
      subredditIcon: '📷',
      authorIcon: '👤'
    }
  ];

  const handleUpvote = (postId) => {
    console.log(`Upvoted post: ${postId}`);
  };

  const handleDownvote = (postId) => {
    console.log(`Downvoted post: ${postId}`);
  };

  const handleCommentClick = (postId) => {
    console.log(`Navigate to post: ${postId}`);
  };

  return (
    <div className="popular-page">
      <div className="popular-header">
        <div className="popular-header-content">
          <h1>⭐ Popular Posts</h1>
          <p>The most upvoted posts on Reddit right now</p>
        </div>
      </div>

      <div className="popular-container">
        {/* Filters Section */}
        <div className="popular-filters">
          <div className="filter-group">
            <label>Time:</label>
            <div className="filter-buttons">
              {timeFilters.map(filter => (
                <button
                  key={filter.id}
                  className={`filter-btn ${timeFilter === filter.id ? 'active' : ''}`}
                  onClick={() => setTimeFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Location:</label>
            <select 
              className="location-select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts List */}
        <div className="popular-posts-list">
          {popularPosts.map((post, index) => (
            <div key={post.postId} className="popular-post-wrapper">
              <div className="post-rank">{index + 1}</div>
              <Post
                {...post}
                onUpvote={() => handleUpvote(post.postId)}
                onDownvote={() => handleDownvote(post.postId)}
                onCommentClick={() => handleCommentClick(post.postId)}
              />
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="load-more-section">
          <button className="load-more-btn">Load More Posts</button>
        </div>
      </div>
    </div>
  );
}

export default PopularPage;
