import React from 'react';
import './AccessibilityPage.css';

const commitments = [
  {
    title: 'WCAG-aligned experience',
    detail: 'Building toward WCAG 2.1 AA support across navigation, color contrast, and focus states.'
  },
  {
    title: 'Screen reader friendly',
    detail: 'ARIA labels on interactive elements and predictable heading structure for faster scans.'
  },
  {
    title: 'Keyboard first',
    detail: 'Full keyboard traversal with visible focus rings and skip links for key regions.'
  }
];

const features = [
  'Semantic headings, landmarks, and labeled form controls',
  'Reduced motion preference respected on animations',
  'Color contrast checked against WCAG AA targets',
  'Keyboard shortcuts for common actions (vote, open, save)',
  'Alt text requirements for image uploads',
  'Adjustable text size and compact/comfortable layouts'
];

const shortcuts = [
  { key: 'J / K', action: 'Next / previous post' },
  { key: 'O or Enter', action: 'Open selected post' },
  { key: 'A / Z', action: 'Upvote / downvote selected' },
  { key: 'S', action: 'Save or unsave' },
  { key: 'C', action: 'Open comments' },
  { key: '?', action: 'Keyboard help' }
];

const supportChannels = [
  {
    label: 'Report an accessibility issue',
    desc: 'Tell us what broke, your browser, OS, and assistive tech so we can reproduce quickly.',
    action: 'Open report form'
  },
  {
    label: 'Request a feature',
    desc: 'Suggest improvements to shortcuts, focus order, or screen reader text.',
    action: 'Share feedback'
  },
  {
    label: 'Contact support',
    desc: 'Need assistance now? Reach the support team for account or content issues.',
    action: 'Contact support'
  }
];

function AccessibilityPage() {
  return (
    <div className="accessibility-page">
      <section className="accessibility-hero">
        <div className="hero-text">
          <p className="eyebrow">Accessibility</p>
          <h1>Inclusive by design</h1>
          <p className="subtitle">
            A fast, keyboard-friendly Reddit experience that respects assistive technologies, clear contrast,
            and user preferences like reduced motion.
          </p>
          <div className="hero-actions">
            <button className="primary-btn">Report an issue</button>
            <button className="ghost-btn">View accessibility docs</button>
          </div>
          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-value">2.1 AA</span>
              <span className="stat-label">WCAG target</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">100%</span>
              <span className="stat-label">Keyboard coverage goal</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">Live</span>
              <span className="stat-label">Reduced motion support</span>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <h3>Current focus</h3>
          <ul>
            <li>Audit focus order across nav, feed, and mod tools</li>
            <li>Improve color contrast on badges and buttons</li>
            <li>Expand keyboard shortcuts to comments and mod queues</li>
          </ul>
          <div className="badge-row">
            <span className="badge">Updated weekly</span>
            <span className="badge badge-green">Feedback welcomed</span>
          </div>
        </div>
      </section>

      <section className="commitments">
        <div className="section-header">
          <h2>Our commitments</h2>
          <p>Concrete areas we maintain and monitor every release.</p>
        </div>
        <div className="commitment-grid">
          {commitments.map((item) => (
            <div key={item.title} className="commitment-card">
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="feature-list">
        <div className="section-header">
          <h2>Built-in accessibility features</h2>
          <p>Highlights of what is available today in the Reddit clone experience.</p>
        </div>
        <ul className="feature-items">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>

      <section className="shortcut-section">
        <div className="section-header">
          <h2>Keyboard shortcuts</h2>
          <p>Navigate faster without leaving the keyboard.</p>
        </div>
        <div className="shortcut-grid">
          {shortcuts.map((item) => (
            <div key={item.key} className="shortcut-card">
              <span className="shortcut-key">{item.key}</span>
              <span className="shortcut-action">{item.action}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="support-section">
        <div className="section-header">
          <h2>Support & feedback</h2>
          <p>Three simple ways to reach us about accessibility.</p>
        </div>
        <div className="support-grid">
          {supportChannels.map((channel) => (
            <div key={channel.label} className="support-card">
              <h3>{channel.label}</h3>
              <p>{channel.desc}</p>
              <button className="text-btn">{channel.action} →</button>
            </div>
          ))}
        </div>
      </section>

      <section className="roadmap">
        <div className="section-header">
          <h2>Roadmap</h2>
          <p>Upcoming accessibility milestones.</p>
        </div>
        <div className="roadmap-grid">
          <div className="roadmap-card">
            <span className="chip">In progress</span>
            <h3>Mod tools accessibility</h3>
            <p>Ensuring moderation queues, approvals, and reports are fully keyboard and screen reader friendly.</p>
          </div>
          <div className="roadmap-card">
            <span className="chip chip-green">Planned</span>
            <h3>Caption prompts</h3>
            <p>Require captions and alt text for media uploads with gentle prompts and templates.</p>
          </div>
          <div className="roadmap-card">
            <span className="chip chip-gray">Research</span>
            <h3>High-contrast theme</h3>
            <p>Add a dedicated high-contrast palette for low-vision users alongside the default theme.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AccessibilityPage;
