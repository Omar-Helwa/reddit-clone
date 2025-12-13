import React from 'react';
import PostList from '../features/posts/PostList';
import CommunityList from '../features/communities/CommunityList';
import './HomePage.css';

function HomePage() {
  const recentPosts = [
    {
      subreddit: 'r/cats',
      title: 'I saved this cat and now I feel like sh*t',
      meta: '4d ago • 923 comments',
    },
    {
      subreddit: 'r/digitalforensics',
      title: 'Force Extraction of iPhone 14 or 15 without PIN code',
      meta: '3h ago • 9 comments',
    },
    {
      subreddit: 'r/hackthebox',
      title: 'Are My CPTS Notes Too Long ?',
      meta: '7d ago • 13 comments',
    }
  ];

  return (
    <main className="home-page">
      <aside className="home-sidebar">
        <CommunityList />
      </aside>

      <section className="home-main-content">
        <div className="home-hero">
          <div className="home-hero-title">
            <h1 className="home-title">Home</h1>
            <p className="home-subtitle">Your personalized front page based on communities you follow.</p>
          </div>
          <button className="create-btn" onClick={() => window.location.href = '/create-community'}>
            ✨ Create Community
          </button>
        </div>
        <PostList />
      </section>

      <aside className="home-right-sidebar">
        <div className="sidebar-widget">
          <div className="widget-header">
            <h3>Recent Posts</h3>
            <span className="widget-action">Clear</span>
          </div>
          <div className="recent-posts">
            {recentPosts.map((post) => (
              <div key={post.title} className="recent-post-item">
                <div className="recent-post-dot" aria-hidden="true" />
                <div className="recent-post-body">
                  <div className="recent-post-title">{post.title}</div>
                  <div className="recent-post-meta">{post.subreddit} • {post.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}

export default HomePage;
