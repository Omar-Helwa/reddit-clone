import React, { useMemo, useState, useRef } from 'react';
import './PopularPage.css';
import { usePosts } from '../hooks/usePosts';
import CommunityList from '../features/communities/CommunityList';
import SortDropdown from '../components/SortDropdown';
import { navigate, getJoinedCommunities, joinCommunity, leaveCommunity } from '../utils/helpers';
import { DEFAULT_COMMUNITY_ICON } from '../utils/placeholders';

function PopularPage() {
  const [sortBy, setSortBy] = useState('BEST');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState(getJoinedCommunities());
  const carouselRef = useRef(null);
  
  // Vote state - stored locally with postId as key
  const [postVotes, setPostVotes] = useState(() => {
    try {
      const saved = localStorage.getItem('redditVotes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const { posts, loading, error } = usePosts();

  const placeholderImages = [
    'https://picsum.photos/seed/pop1/400/300',
    'https://picsum.photos/seed/pop2/400/300',
    'https://picsum.photos/seed/pop3/400/300',
    'https://picsum.photos/seed/pop4/400/300',
    'https://picsum.photos/seed/pop5/400/300',
    'https://picsum.photos/seed/pop6/400/300',
  ];

  const trendingPosts = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];
    return [...list]
      .filter(p => p && p.title)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 6)
      .map((p, index) => ({
        ...p,
        subredditSlug: (p.subreddit || '').replace(/^r\//, ''),
        trendingImage: p.imageUrl || placeholderImages[index % placeholderImages.length],
      }));
  }, [posts, placeholderImages]);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.max(0, now - then);
    const minutes = Math.floor(diff / (60 * 1000));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}hr. ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };

  const getTimestampMs = (post) => {
    const raw = post?.createdAt || post?.timestamp || post?.created || 0;
    const ms = new Date(raw).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  };

  const sortedPosts = useMemo(() => {
    const hotRank = (post, exponent = 1.5) => {
      const score = Number(post?.score) || 0;
      const ts = getTimestampMs(post);
      const hoursSince = Math.max(0, (Date.now() - ts) / 3600000);
      return score / Math.pow(hoursSince + 2, exponent);
    };

    const list = Array.isArray(posts) ? posts : [];
    let sorted = [...list].filter(p => p && p.title);
    
    switch (sortBy) {
      case 'NEW':
        sorted.sort((a, b) => getTimestampMs(b) - getTimestampMs(a));
        break;
      case 'TOP':
        sorted.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0) || getTimestampMs(b) - getTimestampMs(a));
        break;
      case 'RISING':
        sorted.sort((a, b) => hotRank(b, 1.15) - hotRank(a, 1.15) || getTimestampMs(b) - getTimestampMs(a));
        break;
      case 'HOT':
        sorted.sort((a, b) => hotRank(b, 1.5) - hotRank(a, 1.5) || getTimestampMs(b) - getTimestampMs(a));
        break;
      case 'BEST':
      default:
        sorted.sort((a, b) => hotRank(b, 1.35) - hotRank(a, 1.35) || getTimestampMs(b) - getTimestampMs(a));
        break;
    }
    
    return sorted.slice(0, 50);
  }, [posts, sortBy]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleJoinToggle = (communityName) => {
    const slug = communityName.replace(/^r\//, '');
    if (joinedCommunities.includes(slug)) {
      leaveCommunity(slug);
    } else {
      joinCommunity(slug);
    }
    setJoinedCommunities(getJoinedCommunities());
  };

  const isJoined = (communityName) => {
    const slug = (communityName || '').replace(/^r\//, '');
    return joinedCommunities.includes(slug);
  };

  // Carousel scroll
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 240;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Vote handling
  const handleUpvote = (postId) => {
    setPostVotes(prev => {
      const currentVote = prev[postId];
      let newVotes;
      
      if (currentVote === 'up') {
        // Remove upvote
        newVotes = { ...prev };
        delete newVotes[postId];
      } else {
        // Set upvote
        newVotes = { ...prev, [postId]: 'up' };
      }
      
      localStorage.setItem('redditVotes', JSON.stringify(newVotes));
      return newVotes;
    });
  };

  const handleDownvote = (postId) => {
    setPostVotes(prev => {
      const currentVote = prev[postId];
      let newVotes;
      
      if (currentVote === 'down') {
        // Remove downvote
        newVotes = { ...prev };
        delete newVotes[postId];
      } else {
        // Set downvote
        newVotes = { ...prev, [postId]: 'down' };
      }
      
      localStorage.setItem('redditVotes', JSON.stringify(newVotes));
      return newVotes;
    });
  };

  const getDisplayScore = (post) => {
    const baseScore = post.score || 0;
    const vote = postVotes[post.postId];
    if (vote === 'up') return baseScore + 1;
    if (vote === 'down') return baseScore - 1;
    return baseScore;
  };

  return (
    <div className={`popular-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Left Sidebar */}
      <aside className={`popular-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar} 
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className={sidebarCollapsed ? 'rotated' : ''}>
            <path d="M12.5 4L6.5 10L12.5 16" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="sidebar-content">
          <CommunityList />
        </div>
      </aside>

      {/* Main Content */}
      <main className="popular-main">
        {/* Trending Carousel with Navigation Buttons */}
        {trendingPosts.length > 0 && (
          <div className="trending-section">
            <button 
              className="carousel-nav-btn carousel-nav-left" 
              onClick={() => scrollCarousel('left')}
              aria-label="Scroll left"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M12.5 4L6.5 10L12.5 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="trending-carousel" ref={carouselRef}>
              {trendingPosts.map((post, index) => (
                <div 
                  key={post.postId || index} 
                  className="trending-card"
                  onClick={() => navigate(`/r/${post.subredditSlug}/comments/${post.postId}`)}
                >
                  <div className="trending-image-wrapper">
                    <img src={post.trendingImage} alt="" className="trending-image" />
                    <div className="trending-gradient"></div>
                    <div className="trending-content">
                      <h3 className="trending-title">{post.title}</h3>
                      <p className="trending-desc">{(post.textBody || post.title || '').slice(0, 50)}...</p>
                    </div>
                  </div>
                  <div className="trending-footer">
                    <img 
                      src={post.subredditIcon || DEFAULT_COMMUNITY_ICON} 
                      alt=""
                      className="trending-sub-icon"
                      onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
                    />
                    <span className="trending-sub-name">r/{post.subredditSlug}</span>
                    <span className="trending-and-more">and more</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="carousel-nav-btn carousel-nav-right" 
              onClick={() => scrollCarousel('right')}
              aria-label="Scroll right"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M7.5 4L13.5 10L7.5 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Sort Controls */}
        <div className="popular-sort-bar">
          <SortDropdown currentSort={sortBy} onSortChange={setSortBy} />
          <button className="view-toggle-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="2" y="3" width="7" height="6" rx="1"/>
              <rect x="11" y="3" width="7" height="6" rx="1"/>
              <rect x="2" y="11" width="7" height="6" rx="1"/>
              <rect x="11" y="11" width="7" height="6" rx="1"/>
            </svg>
            <span className="view-icon-chevron">▼</span>
          </button>
        </div>

        {/* Posts Feed */}
        <div className="popular-posts-feed">
          {loading && <div className="popular-loading">Loading popular posts...</div>}
          {error && <div className="popular-error">Failed to load posts. Please try again.</div>}
          {!loading && !error && sortedPosts.length === 0 && (
            <div className="popular-empty">No posts yet.</div>
          )}
          {!loading && !error && sortedPosts.map((post) => {
            const subredditSlug = (post.subreddit || '').replace(/^r\//, '');
            const joined = isJoined(subredditSlug);
            const currentVote = postVotes[post.postId];
            const displayScore = getDisplayScore(post);
            
            return (
              <article key={post.postId} className="pop-post">
                <div className="pop-post-header">
                  <img 
                    src={post.subredditIcon || DEFAULT_COMMUNITY_ICON} 
                    alt=""
                    className="pop-post-icon"
                    onClick={() => navigate(`/r/${subredditSlug}`)}
                    onError={(e) => { e.currentTarget.src = DEFAULT_COMMUNITY_ICON; }}
                  />
                  <button className="pop-post-subreddit" onClick={() => navigate(`/r/${subredditSlug}`)}>
                    r/{subredditSlug}
                  </button>
                  <span className="pop-post-dot">•</span>
                  <span className="pop-post-time">{formatTimeAgo(post.createdAt)}</span>
                  <button 
                    className={`pop-join-btn ${joined ? 'joined' : ''}`} 
                    onClick={() => handleJoinToggle(subredditSlug)}
                  >
                    {joined ? 'Joined' : 'Join'}
                  </button>
                  <button className="pop-more-btn">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <circle cx="4" cy="10" r="1.5"/>
                      <circle cx="10" cy="10" r="1.5"/>
                      <circle cx="16" cy="10" r="1.5"/>
                    </svg>
                  </button>
                </div>

                <h2 className="pop-post-title" onClick={() => navigate(`/r/${subredditSlug}/comments/${post.postId}`)}>
                  {post.title}
                </h2>

                {post.textBody && (
                  <p className="pop-post-text">{post.textBody}</p>
                )}

                {post.imageUrl && (
                  <div className="pop-post-image" onClick={() => navigate(`/r/${subredditSlug}/comments/${post.postId}`)}>
                    <img src={post.imageUrl} alt="" />
                  </div>
                )}

                <div className="pop-post-actions">
                  <div className="pop-vote-group">
                    <button 
                      className={`pop-vote-btn upvote ${currentVote === 'up' ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleUpvote(post.postId); }}
                      aria-label="Upvote"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 3L3 12h4v5h6v-5h4L10 3z"/></svg>
                    </button>
                    <span className={`pop-vote-count ${currentVote === 'up' ? 'upvoted' : ''} ${currentVote === 'down' ? 'downvoted' : ''}`}>
                      {displayScore}
                    </span>
                    <button 
                      className={`pop-vote-btn downvote ${currentVote === 'down' ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleDownvote(post.postId); }}
                      aria-label="Downvote"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 17L3 8h4V3h6v5h4L10 17z"/></svg>
                    </button>
                  </div>
                  <button className="pop-action-btn" onClick={() => navigate(`/r/${subredditSlug}/comments/${post.postId}`)}>
                    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 4V5z"/></svg>
                    <span>{post.commentCount || 0}</span>
                  </button>
                  <button className="pop-action-btn">
                    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg>
                    <span>Share</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default PopularPage;
