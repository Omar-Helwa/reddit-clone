import React from 'react';
import './CommunitiesHubPage.css';

const tips = [
  'Use flairs to keep posts organized and easy to scan.',
  'Pin welcome or rules posts for newcomers.',
  'Set clear content guidelines and automate with filters.',
  'Encourage weekly megathreads to focus discussion.'
];

const tools = [
  { title: 'Mod queue', desc: 'Review reports, approve or remove content quickly.' },
  { title: 'Automod basics', desc: 'Set keyword rules, filters, and author conditions.' },
  { title: 'Insights', desc: 'Track growth, retention, and top contributors.' }
];

function CommunitiesHubPage() {
  return (
    <div className="communities-page">
      <section className="communities-hero">
        <div>
          <p className="eyebrow">Communities</p>
          <h1>Build and grow your community</h1>
          <p className="subtitle">Guides, tips, and tools to keep your subreddit organized and welcoming.</p>
          <div className="tip-grid">
            {tips.map((tip) => (
              <div key={tip} className="tip-card">{tip}</div>
            ))}
          </div>
        </div>
        <div className="tool-card">
          <h3>Moderator toolkit</h3>
          <ul>
            {tools.map((tool) => (
              <li key={tool.title}>
                <strong>{tool.title}:</strong> {tool.desc}
              </li>
            ))}
          </ul>
          <button className="text-btn">Open mod resources →</button>
        </div>
      </section>
    </div>
  );
}
n
export default CommunitiesHubPage;
