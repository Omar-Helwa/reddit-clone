import React, { useState } from 'react';
import './ExplorePage.css';

function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState('trending');

  const categories = [
    { id: 'trending', label: 'Trending', icon: '🔥' },
    { id: 'popular', label: 'Popular', icon: '⭐' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'memes', label: 'Memes', icon: '😂' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'movies', label: 'Movies', icon: '🎬' },
  ];

  const trendingTopics = [
    {
      id: 1,
      title: 'Machine Learning',
      icon: '🤖',
      description: 'Artificial intelligence and machine learning discussions',
      members: '245K',
      trending: true
    },
    {
      id: 2,
      title: 'Web Development',
      icon: '🌐',
      description: 'Frontend, backend, and fullstack development',
      members: '189K',
      trending: true
    },
    {
      id: 3,
      title: 'Cybersecurity',
      icon: '🔒',
      description: 'Cybersecurity news and best practices',
      members: '156K',
      trending: true
    },
    {
      id: 4,
      title: 'Cloud Computing',
      icon: '☁️',
      description: 'AWS, Azure, GCP and cloud infrastructure',
      members: '134K',
      trending: true
    },
    {
      id: 5,
      title: 'DevOps',
      icon: '⚙️',
      description: 'DevOps practices and tools',
      members: '98K',
      trending: false
    },
    {
      id: 6,
      title: 'Data Science',
      icon: '📊',
      description: 'Data analysis and visualization',
      members: '127K',
      trending: false
    },
  ];

  const communityRecommendations = [
    {
      id: 'r_programming',
      name: 'r/programming',
      icon: '💻',
      members: '3.2M',
      description: 'Computer Science'
    },
    {
      id: 'r_learnprogramming',
      name: 'r/learnprogramming',
      icon: '📚',
      members: '2.1M',
      description: 'Learning Hub'
    },
    {
      id: 'r_webdev',
      name: 'r/webdev',
      icon: '🌐',
      members: '1.8M',
      description: 'Web Development'
    },
    {
      id: 'r_python',
      name: 'r/python',
      icon: '🐍',
      members: '1.5M',
      description: 'Python Programming'
    },
    {
      id: 'r_javascript',
      name: 'r/javascript',
      icon: '⚡',
      members: '1.2M',
      description: 'JavaScript & TypeScript'
    },
    {
      id: 'r_csharp',
      name: 'r/csharp',
      icon: '#️⃣',
      members: '456K',
      description: 'C# Development'
    },
  ];

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Explore</h1>
        <p>Discover trending communities and topics</p>
      </div>

      {/* Category Filter */}
      <div className="explore-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="explore-content">
        {/* Trending Topics Section */}
        <section className="explore-section">
          <div className="section-header">
            <h2>🔥 Trending Now</h2>
            <a href="#view-all" className="view-all-link">View All</a>
          </div>
          <div className="topics-grid">
            {trendingTopics.slice(0, 4).map(topic => (
              <div key={topic.id} className="topic-card">
                <div className="topic-icon">{topic.icon}</div>
                <div className="topic-content">
                  <h3 className="topic-title">{topic.title}</h3>
                  <p className="topic-description">{topic.description}</p>
                  <div className="topic-footer">
                    <span className="topic-members">{topic.members} members</span>
                    {topic.trending && <span className="trending-badge">Trending</span>}
                  </div>
                </div>
                <button className="join-topic-btn">Join</button>
              </div>
            ))}
          </div>
        </section>

        {/* Community Recommendations */}
        <section className="explore-section">
          <div className="section-header">
            <h2>⭐ Recommended Communities</h2>
            <a href="#view-all" className="view-all-link">View All</a>
          </div>
          <div className="communities-list">
            {communityRecommendations.map(community => (
              <div key={community.id} className="community-row">
                <div className="community-row-icon">{community.icon}</div>
                <div className="community-row-content">
                  <h4 className="community-row-name">{community.name}</h4>
                  <p className="community-row-desc">{community.description}</p>
                  <span className="community-row-members">{community.members} members</span>
                </div>
                <button className="join-community-btn">Join</button>
              </div>
            ))}
          </div>
        </section>

        {/* More Topics */}
        <section className="explore-section">
          <div className="section-header">
            <h2>📈 More Popular Topics</h2>
          </div>
          <div className="topics-grid">
            {trendingTopics.slice(4, 6).map(topic => (
              <div key={topic.id} className="topic-card">
                <div className="topic-icon">{topic.icon}</div>
                <div className="topic-content">
                  <h3 className="topic-title">{topic.title}</h3>
                  <p className="topic-description">{topic.description}</p>
                  <div className="topic-footer">
                    <span className="topic-members">{topic.members} members</span>
                  </div>
                </div>
                <button className="join-topic-btn">Join</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ExplorePage;
