import React from 'react';
import './HelpPage.css';

const topics = [
  'Account & login help',
  'Posting and commenting',
  'Moderation tools',
  'Safety and reporting',
  'Notifications and email',
  'API and developer help'
];

function HelpPage() {
  return (
    <div className="help-page">
      <section className="help-hero">
        <div>
          <p className="eyebrow">Help Center</p>
          <h1>How can we help?</h1>
          <p className="subtitle">Browse quick answers or reach support for account, content, or technical issues.</p>
          <div className="search-box">
            <input type="text" placeholder="Search help articles" aria-label="Search help" />
            <button>🔍</button>
          </div>
        </div>
        <div className="contact-card">
          <h3>Contact support</h3>
          <p>Send details about the issue and we will follow up.</p>
          <button className="primary-btn">Start a request</button>
        </div>
      </section>

      <section className="topic-grid">
        {topics.map((topic) => (
          <div key={topic} className="topic-card">{topic}</div>
        ))}
      </section>
    </div>
  );
}

export default HelpPage;
