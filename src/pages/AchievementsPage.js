import React from 'react';
import './AchievementsPage.css';

function AchievementsPage({ onNavigate }) {
  const trophies = [
    {
      id: 1,
      icon: '📧',
      name: 'Verified Email',
      description: 'Verified your email address',
      date: 'January 15, 2024',
      rarity: 'common',
    },
    {
      id: 2,
      icon: '🎂',
      name: 'One-Year Club',
      description: 'Been a Redditor for one year',
      date: 'January 15, 2024',
      rarity: 'uncommon',
    },
    {
      id: 3,
      icon: '⭐',
      name: 'Well-Rounded',
      description: 'Posted a comment in multiple communities',
      date: 'January 20, 2024',
      rarity: 'common',
    },
    {
      id: 4,
      icon: '💬',
      name: 'Commenter',
      description: 'Posted your first comment',
      date: 'January 15, 2024',
      rarity: 'common',
    },
    {
      id: 5,
      icon: '✍️',
      name: 'First Post',
      description: 'Created your first post',
      date: 'January 16, 2024',
      rarity: 'common',
    },
    {
      id: 6,
      icon: '👥',
      name: 'Community Builder',
      description: 'Joined 10 communities',
      date: 'January 25, 2024',
      rarity: 'uncommon',
    },
    {
      id: 7,
      icon: '🔥',
      name: 'Hot Contributor',
      description: 'Had a post reach the front page',
      date: 'February 1, 2024',
      rarity: 'rare',
    },
    {
      id: 8,
      icon: '👍',
      name: 'Good Sport',
      description: 'Received 100 upvotes',
      date: 'February 5, 2024',
      rarity: 'uncommon',
    },
  ];

  const achievements = {
    posts: 24,
    comments: 156,
    karma: 1234,
    awards: 3,
    communities: 15,
    followers: 42,
  };

  const getRarityClass = (rarity) => {
    return `trophy-card-${rarity}`;
  };

  return (
    <div className="achievements-page">
      <div className="achievements-container">
        {/* Header */}
        <div className="achievements-header">
          <button className="back-button" onClick={() => onNavigate('/profile')}>
            ← Back to Profile
          </button>
          <h1 className="achievements-title">Achievements & Trophies</h1>
          <p className="achievements-subtitle">
            Your accomplishments and milestones on Reddit
          </p>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{achievements.posts}</div>
            <div className="stat-label">Posts</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-value">{achievements.comments}</div>
            <div className="stat-label">Comments</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⬆️</div>
            <div className="stat-value">{achievements.karma}</div>
            <div className="stat-label">Karma</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{achievements.awards}</div>
            <div className="stat-label">Awards</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{achievements.communities}</div>
            <div className="stat-label">Communities</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-value">{achievements.followers}</div>
            <div className="stat-label">Followers</div>
          </div>
        </div>

        {/* Trophies Section */}
        <div className="trophies-section">
          <h2 className="section-title">Your Trophies</h2>
          <p className="section-subtitle">
            {trophies.length} trophies earned
          </p>

          <div className="trophies-grid">
            {trophies.map((trophy) => (
              <div key={trophy.id} className={`trophy-card ${getRarityClass(trophy.rarity)}`}>
                <div className="trophy-icon">{trophy.icon}</div>
                <h3 className="trophy-name">{trophy.name}</h3>
                <p className="trophy-description">{trophy.description}</p>
                <div className="trophy-meta">
                  <span className={`trophy-rarity ${trophy.rarity}`}>
                    {trophy.rarity}
                  </span>
                  <span className="trophy-date">{trophy.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <h2 className="section-title">In Progress</h2>
          <p className="section-subtitle">Keep going to unlock these achievements</p>

          <div className="progress-grid">
            <div className="progress-card">
              <div className="progress-header">
                <div className="progress-icon locked">🎯</div>
                <div className="progress-info">
                  <h3>Marksman</h3>
                  <p>Receive 1,000 upvotes on a single post</p>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '45%' }}></div>
              </div>
              <div className="progress-text">450 / 1000</div>
            </div>

            <div className="progress-card">
              <div className="progress-header">
                <div className="progress-icon locked">🏅</div>
                <div className="progress-info">
                  <h3>Comment Ninja</h3>
                  <p>Post 500 comments</p>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '31%' }}></div>
              </div>
              <div className="progress-text">156 / 500</div>
            </div>

            <div className="progress-card">
              <div className="progress-header">
                <div className="progress-icon locked">💎</div>
                <div className="progress-info">
                  <h3>Five-Year Club</h3>
                  <p>Be a Redditor for five years</p>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '20%' }}></div>
              </div>
              <div className="progress-text">1 / 5 years</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AchievementsPage;
