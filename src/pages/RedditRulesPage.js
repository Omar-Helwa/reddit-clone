import React from 'react';
import './RedditRulesPage.css';

const rules = [
  { title: 'Be respectful', desc: 'Harassment, hate, and threats are not allowed.' },
  { title: 'No spam or manipulation', desc: 'Avoid vote brigading, scams, or repetitive promos.' },
  { title: 'Keep content legal', desc: 'No illegal content, and honor IP rights.' },
  { title: 'Label sensitive media', desc: 'Use NSFW and spoiler tags where appropriate.' }
];

function RedditRulesPage() {
  return (
    <div className="rules-page">
      <section className="rules-hero">
        <h1>Reddit Rules</h1>
        <p className="subtitle">Platform-wide expectations that apply to every community.</p>
      </section>

      <div className="rules-grid">
        {rules.map((rule) => (
          <div key={rule.title} className="rule-card">
            <h3>{rule.title}</h3>
            <p>{rule.desc}</p>
          </div>
        ))}
      </div>

      <div className="footer-note">
        <p>See community-specific rules in each subreddit sidebar. Report violations so moderators can review quickly.</p>
      </div>
    </div>
  );
}

export default RedditRulesPage;
