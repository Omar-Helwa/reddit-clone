import React from 'react';
import './AboutPage.css';

const milestones = [
  { label: 'Communities', value: '100K+', desc: 'Diverse interests and local groups.' },
  { label: 'Daily visits', value: 'Millions', desc: 'Real-time conversations across the globe.' },
  { label: 'Open platform', value: 'APIs', desc: 'Built so developers can extend the experience.' }
];

const principles = [
  'Community-led spaces with clear rules and moderation tools.',
  'Authentic discussion supported by upvotes, comments, and awards.',
  'Accessibility-first design and mobile-friendly performance.',
  'Safety and privacy controls that travel with you on every device.'
];

function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div>
          <p className="eyebrow">About Reddit Clone</p>
          <h1>Where communities connect</h1>
          <p className="subtitle">
            A place to share, learn, and belong. Built for conversations that move quickly and tools that help moderators keep things welcoming.
          </p>
          <div className="milestone-grid">
            {milestones.map((item) => (
              <div key={item.label} className="milestone-card">
                <span className="value">{item.value}</span>
                <span className="label">{item.label}</span>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="about-card">
          <h3>How it works</h3>
          <ul>
            <li>Join communities that match your interests.</li>
            <li>Vote to surface the best contributions.</li>
            <li>Use flair and filters to keep threads organized.</li>
            <li>Report issues so moderators can respond quickly.</li>
          </ul>
        </div>
      </section>

      <section className="principles">
        <h2>Principles we build on</h2>
        <div className="principle-list">
          {principles.map((text) => (
            <div key={text} className="principle-card">{text}</div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
