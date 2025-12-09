import React from 'react';
import PostList from '../features/posts/PostList';
import CommunityList from '../features/communities/CommunityList';
import './HomePage.css';

function HomePage() {
  return (
    <main className="home-page">
      <aside className="home-sidebar">
        <CommunityList />
      </aside>

      <section className="home-main-content">
        <h1 className="home-title">Home</h1>
        <PostList />
      </section>

      <aside className="home-right-sidebar">
        <div className="sidebar-widget">
          <h3>Popular Communities</h3>
          <p>Community recommendations would go here.</p>
        </div>
      </aside>
    </main>
  );
}

export default HomePage;
