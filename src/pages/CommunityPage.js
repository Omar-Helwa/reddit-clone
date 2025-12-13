import React, { useState, useEffect } from 'react';
import './CommunityPage.css';
import Post from '../features/posts/Post';
import { communities as communityData, ensureSeeded } from '../data/mockData';
import { getPosts, isJoined as isJoinedStore, joinCommunity, leaveCommunity, navigate } from '../utils/helpers';

function CommunityPage() {
  const [isJoined, setIsJoined] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [sortBy, setSortBy] = useState('hot');
  const [communityName, setCommunityName] = useState('');

  // Extract community name from URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/r\/([^\/]+)/);
    if (match) {
      setCommunityName(match[1]);
    } else {
      setCommunityName('general');
    }
  }, []);

  // Seed posts storage once
  useEffect(() => {
    ensureSeeded();
  }, []);

  // Community database - different communities with their own data
  const communityDataLocal = {
    hackthebox: {
      name: 'r/hackthebox',
      displayName: 'HackTheBox',
      description: 'Discussion about hackthebox.com machines, challenges, and cybersecurity learning!',
      icon: 'https://styles.redditmedia.com/t5_3kc4k/styles/communityIcon_awrm7y13mg851.jpg',
      banner: 'https://via.placeholder.com/1200x200/0045ac/ffffff?text=HackTheBox',
      members: '101K',
      online: '2.3K',
      createdDate: 'Created Jan 15, 2018',
      type: 'Public',
      rules: [
        'Be respectful and civil',
        'No spoilers in post titles',
        'No asking for solutions directly',
        'Search before posting',
        'Only HackTheBox related content'
      ],
      moderators: ['u/admin', 'u/moduser1', 'u/moduser2']
    },
    gaming: {
      name: 'r/gaming',
      displayName: 'Gaming',
      description: 'A subreddit for (almost) anything related to games - video games, board games, card games, etc.',
      icon: 'https://via.placeholder.com/120/ff4500/ffffff?text=G',
      banner: 'https://via.placeholder.com/1200x200/ff4500/ffffff?text=Gaming',
      members: '35M',
      online: '45K',
      createdDate: 'Created Sep 25, 2008',
      type: 'Public',
      rules: [
        'No bandwagon or direct reply posts',
        'No spoilers in titles',
        'No general URL shorteners',
        'No spam or personal blog content',
        'Be civil and respectful'
      ],
      moderators: ['u/gamemod', 'u/admin_gaming', 'u/moderator3']
    },
    memes: {
      name: 'r/memes',
      displayName: 'Memes',
      description: 'Memes! A way of describing cultural information being shared. An element of a culture or system of behavior.',
      icon: 'https://via.placeholder.com/120/46d160/ffffff?text=M',
      banner: 'https://via.placeholder.com/1200x200/46d160/ffffff?text=Memes',
      members: '28M',
      online: '32K',
      createdDate: 'Created Dec 1, 2008',
      type: 'Public',
      rules: [
        'All posts must be memes',
        'No spam or watermarks',
        'No hate speech',
        'No asking for upvotes',
        'No memes about violent tragedies'
      ],
      moderators: ['u/mememaster', 'u/funnymod', 'u/lolmod']
    },
    mynewcommunity: {
      name: 'r/mynewcommunity',
      displayName: 'My New Community',
      description: 'A fresh community ready to grow! Join us to discuss technology and innovation.',
      icon: 'https://via.placeholder.com/120/0079d3/ffffff?text=MNC',
      banner: 'https://via.placeholder.com/1200x200/0079d3/ffffff?text=My+New+Community',
      members: '1',
      online: '1',
      createdDate: 'Created Dec 12, 2024',
      type: 'Public',
      rules: [
        'Be respectful and kind',
        'Stay on topic',
        'No spam or self-promotion',
        'Follow Reddit content policy',
        'Have fun and engage!'
      ],
      moderators: ['u/creator']
    },
    general: {
      name: 'r/general',
      displayName: 'General',
      description: 'A general community for discussions about anything and everything!',
      icon: 'https://via.placeholder.com/120/7c4dff/ffffff?text=G',
      banner: 'https://via.placeholder.com/1200x200/7c4dff/ffffff?text=General',
      members: '500K',
      online: '5K',
      createdDate: 'Created Jan 1, 2015',
      type: 'Public',
      rules: [
        'Be respectful',
        'No spam',
        'Stay civil',
        'No personal attacks',
        'Follow site-wide rules'
      ],
      moderators: ['u/generalmod', 'u/admin', 'u/moderator']
    }
  };

  // Posts database - different posts for each community
  const postsData = {
    hackthebox: [
      {
        id: 1,
        title: 'Just rooted my first HTB machine! Any tips for privilege escalation?',
        author: 'u/newbie_hacker',
        subreddit: 'r/hackthebox',
        score: 245,
        comments: 42,
        timePosted: '5 hours ago',
        content: 'Feeling awesome after getting root on my first box. Looking for resources to improve my privesc skills.',
        flair: 'Achievement'
      },
      {
        id: 2,
        title: 'Weekly Machine Discussion - "Forest"',
        author: 'u/htb_mod',
        subreddit: 'r/hackthebox',
        score: 189,
        comments: 67,
        timePosted: '1 day ago',
        isPinned: true,
        flair: 'Discussion'
      },
      {
        id: 3,
        title: 'Best methodology for initial enumeration?',
        author: 'u/security_enthusiast',
        subreddit: 'r/hackthebox',
        score: 312,
        comments: 89,
        timePosted: '2 days ago',
        flair: 'Question'
      }
    ],
    gaming: [
      {
        id: 1,
        title: 'What game are you currently playing?',
        author: 'u/gamer123',
        subreddit: 'r/gaming',
        score: 1842,
        comments: 523,
        timePosted: '3 hours ago',
        content: 'Drop your current favorites!',
        flair: 'Discussion'
      },
      {
        id: 2,
        title: 'Just finished God of War Ragnarök - What a masterpiece!',
        author: 'u/playstation_fan',
        subreddit: 'r/gaming',
        score: 3421,
        comments: 189,
        timePosted: '8 hours ago',
        isPinned: false,
        flair: 'Achievement'
      },
      {
        id: 3,
        title: 'Looking for co-op game recommendations for 2 players',
        author: 'u/coop_seeker',
        subreddit: 'r/gaming',
        score: 672,
        comments: 234,
        timePosted: '12 hours ago',
        flair: 'Question'
      }
    ],
    memes: [
      {
        id: 1,
        title: 'When you finally understand the meme',
        author: 'u/meme_lord_420',
        subreddit: 'r/memes',
        score: 8234,
        comments: 156,
        timePosted: '2 hours ago',
        content: '[Image]',
        flair: 'Funny'
      },
      {
        id: 2,
        title: 'POV: You just got paid',
        author: 'u/broke_student',
        subreddit: 'r/memes',
        score: 5621,
        comments: 98,
        timePosted: '6 hours ago',
        isPinned: false,
        flair: 'Relatable'
      },
      {
        id: 3,
        title: 'Programmers be like',
        author: 'u/coder_memes',
        subreddit: 'r/memes',
        score: 4532,
        comments: 201,
        timePosted: '10 hours ago',
        flair: 'Tech'
      }
    ],
    mynewcommunity: [
      {
        id: 1,
        title: 'Welcome to our new community! 🎉',
        author: 'u/creator',
        subreddit: 'r/mynewcommunity',
        score: 1,
        comments: 0,
        timePosted: '1 hour ago',
        content: 'Excited to build this community together!',
        isPinned: true,
        flair: 'Announcement'
      }
    ],
    general: [
      {
        id: 1,
        title: 'What\'s everyone up to this weekend?',
        author: 'u/casual_user',
        subreddit: 'r/general',
        score: 423,
        comments: 145,
        timePosted: '4 hours ago',
        content: 'Share your plans!',
        flair: 'Discussion'
      },
      {
        id: 2,
        title: 'TIL: Interesting fact about the universe',
        author: 'u/science_nerd',
        subreddit: 'r/general',
        score: 892,
        comments: 67,
        timePosted: '9 hours ago',
        flair: 'TIL'
      }
    ]
  };

  // Get current community data
  const community = communityData[communityName] || communityDataLocal[communityName] || communityDataLocal.general;
  const mockPosts = getPosts(communityName);

  useEffect(() => {
    if (communityName) {
      setIsJoined(isJoinedStore(communityName));
    }
  }, [communityName]);

  const handleJoin = () => {
    if (isJoined) {
      leaveCommunity(communityName);
      setIsJoined(false);
    } else {
      joinCommunity(communityName);
      setIsJoined(true);
    }
  };

  return (
    <div className="community-page">
      {/* Banner */}
      <div className="community-banner" style={{ backgroundImage: `url(${community.banner})` }}>
        <div className="banner-overlay"></div>
      </div>

      {/* Header */}
      <div className="community-header">
        <div className="community-header-content">
          <div className="community-info">
            <img src={community.icon} alt={community.name} className="community-icon-large" />
            <div className="community-title-section">
              <h1>{community.displayName}</h1>
              <p className="community-name">{community.name}</p>
            </div>
          </div>
          <div className="community-actions">
            <button className={`join-btn ${isJoined ? 'joined' : ''}`} onClick={handleJoin}>
              {isJoined ? '✓ Joined' : '+ Join'}
            </button>
            <button className="notify-btn" title="Turn on notifications">🔔</button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="community-nav">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button 
            className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button 
            className={`nav-tab ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            Rules
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="community-content">
        <div className="community-main">
          {activeTab === 'posts' && (
            <>
              <div className="feed-controls">
                <div className="sort-buttons">
                  <button className={`sort-btn ${sortBy === 'hot' ? 'active' : ''}`} onClick={() => setSortBy('hot')}>
                    🔥 Hot
                  </button>
                  <button className={`sort-btn ${sortBy === 'new' ? 'active' : ''}`} onClick={() => setSortBy('new')}>
                    ✨ New
                  </button>
                  <button className={`sort-btn ${sortBy === 'top' ? 'active' : ''}`} onClick={() => setSortBy('top')}>
                    ⬆️ Top
                  </button>
                  <button className={`sort-btn ${sortBy === 'rising' ? 'active' : ''}`} onClick={() => setSortBy('rising')}>
                    📈 Rising
                  </button>
                </div>
                <button className="create-post-btn" onClick={() => navigate(`/r/${communityName}/submit`)}>+ Create Post</button>
              </div>

              <div className="posts-feed">
                {mockPosts.map(post => (
                  <div key={post.id} className="post-wrapper">
                    {post.isPinned && <span className="pinned-badge">📌 Pinned by moderators</span>}
                    <Post 
                      postId={post.id}
                      title={post.title}
                      author={post.author}
                      subreddit={communityName}
                      timestamp={post.timestamp}
                      score={post.score}
                      commentCount={post.commentCount}
                      textBody={post.textBody}
                      onCommentClick={() => navigate(`/r/${communityName}/comments/${post.id}?comment=1`)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'about' && (
            <div className="about-content">
              <h2>About Community</h2>
              <p>{community.description}</p>
              <div className="community-details">
                <div className="detail-row">
                  <strong>Type:</strong> <span>{community.type}</span>
                </div>
                <div className="detail-row">
                  <strong>Created:</strong> <span>{community.createdDate}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="rules-content">
              <h2>Community Rules</h2>
              <div className="rules-list">
                {community.rules.map((rule, index) => (
                  <div key={index} className="rule-item">
                    <span className="rule-number">{index + 1}</span>
                    <span className="rule-text">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="community-sidebar">
          <div className="sidebar-card">
            <h3>About Community</h3>
            <p className="sidebar-description">{community.description}</p>
            <div className="community-stats">
              <div className="stat">
                <strong>{community.members}</strong>
                <span>Members</span>
              </div>
              <div className="stat">
                <strong>{community.online}</strong>
                <span>Online</span>
              </div>
            </div>
            <p className="created-date">{community.createdDate}</p>
            <button 
              className="create-post-btn-full"
              onClick={() => navigate(`/r/${communityName}/submit`)}
            >
              Create Post
            </button>
          </div>

          <div className="sidebar-card">
            <h3>Community Rules</h3>
            <div className="rules-preview">
              {community.rules.slice(0, 3).map((rule, index) => (
                <div key={index} className="rule-preview-item">
                  {index + 1}. {rule}
                </div>
              ))}
            </div>
            <button className="see-all-btn" onClick={() => setActiveTab('rules')}>
              See all rules →
            </button>
          </div>

          <div className="sidebar-card">
            <h3>Moderators</h3>
            <div className="moderators-list">
              {community.moderators.map((mod, index) => (
                <div key={index} className="moderator-item">
                  <span className="mod-icon">👤</span>
                  <span className="mod-name">{mod}</span>
                </div>
              ))}
            </div>
            <button className="message-mods-btn">Message the mods</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CommunityPage;
