import React, { useState, useEffect } from 'react';
import Post from './Post';
import './PostList.css';

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
      // Replace with your actual API endpoint
      const response = await fetch(`/api/posts?sort=${sortBy}`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Set mock data for development
      setMockPosts();
    } finally {
      setLoading(false);
    }
  };

  const setMockPosts = () => {
    const mockData = [
      {
        postId: 't3_1pfxsd1',
        title: 'Web testing before pentesting pathos?',
        author: 'SecurityEnthusiast',
        subreddit: 'r/hackthebox',
        timestamp: '7 hr. ago',
        score: 24,
        commentCount: 5,
        textBody: 'I am planning on doing the CPTS though I\'ve noticed that colleagues spend more time using Burp Suite than testing AD or windows systems.',
        subredditIcon: 'https://styles.redditmedia.com/t5_3kc4k/styles/communityIcon_awrm7y13mg851.jpg',
        authorIcon: 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_4.png'
      },
      {
        postId: 't3_1pha1jz',
        title: 'Role of open source in digital forensics',
        author: 'CountryElegant5758',
        subreddit: 'r/digitalforensics',
        timestamp: '7 hr. ago',
        score: 7,
        commentCount: 12,
        textBody: 'Hello everyone, I wish to collect knowledge about the role of open source tools in digital forensics through this thread.',
        subredditIcon: 'https://styles.redditmedia.com/t5_2r6up/styles/communityIcon.jpg',
        authorIcon: 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_4.png'
      },
      {
        postId: 't3_1pf34vx',
        title: 'CPTS vs OSCP',
        author: 'SpeedPositive1224',
        subreddit: 'r/hackthebox',
        timestamp: '3 days ago',
        score: 9,
        commentCount: 16,
        textBody: 'Hey everyone, I\'m a dev with 4 years experience and recently passed the eJPT. I have been doing the CPTS path on HTB but think I\'ll switch to OSCP.',
        subredditIcon: 'https://styles.redditmedia.com/t5_3kc4k/styles/communityIcon_awrm7y13mg851.jpg',
        authorIcon: 'https://preview.redd.it/snoovatar/avatars/d39464a6-da7c-4279-83bf-a3232d7edb42-headshot.png'
      },
      {
        postId: 't3_1pgyak4',
        title: 'OMG, you CAN convert handwriting on iPad to Text in One Note',
        author: 'Janknitz',
        subreddit: 'r/OneNote',
        timestamp: '18 hr. ago',
        score: 25,
        commentCount: 11,
        textBody: 'Am I the only idiot who couldn\'t figure this out after more than a year??? I\'ve even seen Microsoft sources that said it can\'t be done. But it CAN.',
        subredditIcon: 'https://styles.redditmedia.com/t5_2uhau/styles/communityIcon_lez0y8el927b1.png',
        authorIcon: 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png'
      },
      {
        postId: 't3_1peaohi',
        title: 'Has TryHackMe gotten worse?',
        author: 'crashmace',
        subreddit: 'r/tryhackme',
        timestamp: '4 days ago',
        score: 69,
        commentCount: 27,
        textBody: 'Hello, I am a TryHackMe user since 2023 and was a subscriber for the majority of that time. I don\'t like the direction this platform is heading',
        subredditIcon: 'https://styles.redditmedia.com/t5_ygv5g/styles/communityIcon_kr7d3dc0a9vf1.png',
        authorIcon: 'https://preview.redd.it/snoovatar/avatars/fa6a7b16-312e-4d8c-8ba5-724df20152b3-headshot.png'
      }
    ];
    setPosts(mockData);
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

  const handleCommentClick = (postId) => {
    // Navigate to post detail page or open comments modal
    console.log(`Navigate to post ${postId}`);
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
              key={post.postId}
              postId={post.postId}
              title={post.title}
              author={post.author}
              subreddit={post.subreddit}
              timestamp={post.timestamp}
              score={post.score}
              commentCount={post.commentCount}
              textBody={post.textBody}
              authorIcon={post.authorIcon}
              subredditIcon={post.subredditIcon}
              onCommentClick={() => handleCommentClick(post.postId)}
              onUpvote={() => handleUpvote(post.postId)}
              onDownvote={() => handleDownvote(post.postId)}
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
