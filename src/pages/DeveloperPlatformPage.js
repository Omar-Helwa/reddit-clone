import React from 'react';
import './DeveloperPlatformPage.css';

const pillars = [
  {
    title: 'APIs you already know',
    desc: 'REST endpoints for posts, comments, votes, subs, flairs, and moderation. OAuth2 for secure access.'
  },
  {
    title: 'Modern dev stack',
    desc: 'SDKs, typed responses, webhooks, and sandbox keys to ship quickly without surprises.'
  },
  {
    title: 'Built for scale',
    desc: 'Rate-limit guidance, caching tips, and observability so your app stays reliable as you grow.'
  }
];

const resources = [
  { name: 'Quickstart', description: 'Spin up an app, get client keys, and make your first authenticated request.', action: 'Open quickstart' },
  { name: 'API Reference', description: 'Endpoints for listings, search, voting, moderation, and identity.', action: 'View reference' },
  { name: 'Webhooks', description: 'Subscribe to comment, post, and mod events with signed payloads.', action: 'Configure webhooks' },
  { name: 'Guides', description: 'Best practices for pagination, rate limits, and testing against the sandbox.', action: 'Read guides' }
];

const tools = [
  { label: 'Dev Console', detail: 'Issue sandbox tokens, inspect payloads, and replay webhook deliveries.' },
  { label: 'Playground', detail: 'Try endpoints live with your keys and see typed responses.' },
  { label: 'SDKs', detail: 'JavaScript and Python SDKs with helpers for auth, pagination, and retries.' },
  { label: 'Samples', detail: 'Starter apps: content browser, moderation dashboard, and feed widgets.' }
];

const changelog = [
  { tag: 'New', title: 'Webhook retries', desc: 'Automatic retries with exponential backoff and delivery signatures.', date: 'Dec 2025' },
  { tag: 'Improved', title: 'Listing pagination', desc: 'Cursor-based pagination available on popular endpoints.', date: 'Nov 2025' },
  { tag: 'Preview', title: 'Realtime events', desc: 'Streaming updates for votes and comments in select communities.', date: 'Oct 2025' }
];

function DeveloperPlatformPage() {
  return (
    <div className="dev-platform-page">
      <section className="dev-hero">
        <div className="hero-copy">
          <p className="eyebrow">Developer Platform</p>
          <h1>Build with Reddit</h1>
          <p className="hero-subtitle">
            Powerful APIs, webhooks, and SDKs to bring Reddit content and community features into your app.
            Start in minutes with sandbox keys and ship confidently with clear quotas and observability.
          </p>
          <div className="hero-actions">
            <button className="primary-btn">Get API keys</button>
            <button className="ghost-btn">View docs</button>
          </div>
          <div className="pillars">
            {pillars.map((item) => (
              <div key={item.title} className="pillar-card">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-header">
            <span className="chip chip-green">Sandbox</span>
            <span className="chip">Status: Up</span>
          </div>
          <div className="panel-body">
            <div className="panel-row">
              <span>Requests today</span>
              <strong>12,480</strong>
            </div>
            <div className="panel-row">
              <span>Error rate</span>
              <strong>0.08%</strong>
            </div>
            <div className="panel-row">
              <span>Webhook deliveries</span>
              <strong>2,310</strong>
            </div>
          </div>
          <button className="panel-btn">Open Developer Console →</button>
        </div>
      </section>

      <section className="resource-section">
        <div className="section-header">
          <h2>Start fast</h2>
          <p>Essential resources to get an integration live quickly.</p>
        </div>
        <div className="resource-grid">
          {resources.map((res) => (
            <div key={res.name} className="resource-card">
              <h3>{res.name}</h3>
              <p>{res.description}</p>
              <button className="text-btn">{res.action} →</button>
            </div>
          ))}
        </div>
      </section>

      <section className="tooling">
        <div className="section-header">
          <h2>Tools for every step</h2>
          <p>From prototyping to production, we have you covered.</p>
        </div>
        <div className="tool-grid">
          {tools.map((tool) => (
            <div key={tool.label} className="tool-card">
              <h3>{tool.label}</h3>
              <p>{tool.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="changelog-section">
        <div className="section-header">
          <h2>Changelog</h2>
          <p>Highlights from the latest platform updates.</p>
        </div>
        <div className="changelog-grid">
          {changelog.map((item) => (
            <div key={item.title} className="changelog-card">
              <div className="changelog-meta">
                <span className={`chip ${item.tag === 'New' ? 'chip-green' : item.tag === 'Preview' ? 'chip-purple' : ''}`}>
                  {item.tag}
                </span>
                <span className="date">{item.date}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DeveloperPlatformPage;
