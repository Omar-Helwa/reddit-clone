import React from 'react';
import './BestOfRedditPage.css';

const categories = [
  { title: 'Top today', desc: 'The most upvoted posts in the last 24 hours.' },
  { title: 'Rising', desc: 'Conversations gaining momentum right now.' },
  { title: 'All time', desc: 'Iconic threads the community still loves.' }
];

const highlights = [
  'Week in Review digest across popular communities',
  'Curated collections for memes, tech, sports, and art',
  'Moderator picks featuring great discussion quality',
  'Event hubs for live games, launches, and AMAs'
];

function BestOfRedditPage() {
  return (
    <div className="best-page">
      <section className="best-hero">
        <div>
          <p className="eyebrow">Best of Reddit</p>
          <h1>See what everyone is talking about</h1>
          <p className="subtitle">A curated feed of top posts, rising threads, and timeless favorites.</p>
          <div className="category-grid">
            {categories.map((item) => (
              <div key={item.title} className="category-card">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="best-card">
          <h3>Spotlight</h3>
          <ul>
            <li>Community AMAs scheduled weekly.</li>
            <li>Theme days: Throwback Thursday, Fan Art Friday.</li>
            <li>Rotating highlights from niche communities.</li>
          </ul>
        </div>
      </section>

      <section className="highlights">
        <h2>What’s inside</h2>
        <div className="highlight-list">
          {highlights.map((item) => (
            <div key={item} className="highlight-card">{item}</div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default BestOfRedditPage;
