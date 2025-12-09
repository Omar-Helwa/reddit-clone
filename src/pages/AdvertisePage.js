import React from 'react';
import './AdvertisePage.css';

const objectives = [
  { title: 'Drive awareness', desc: 'Headline placements and rich cards to introduce your brand.' },
  { title: 'Engage communities', desc: 'Target interests, locations, and devices with safety controls.' },
  { title: 'Measure outcomes', desc: 'Dashboards for reach, CTR, and conversions with exportable reports.' }
];

const formats = [
  'Promoted posts with images or video',
  'Conversation ads that encourage comments',
  'Takeover placements for launches',
  'Self-serve boosts for smaller campaigns'
];

function AdvertisePage() {
  return (
    <div className="advertise-page">
      <section className="ad-hero">
        <div>
          <p className="eyebrow">Advertise</p>
          <h1>Reach the right communities</h1>
          <p className="subtitle">Plan, launch, and measure campaigns with brand-safe tools.</p>
          <div className="hero-actions">
            <button className="primary-btn">Create a campaign</button>
            <button className="ghost-btn">View ad specs</button>
          </div>
          <div className="objective-grid">
            {objectives.map((item) => (
              <div key={item.title} className="objective-card">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="ad-card">
          <h3>Best practices</h3>
          <ul>
            <li>Use concise headlines and clear calls to action.</li>
            <li>Target by interest plus device for efficient spend.</li>
            <li>Iterate creatives weekly based on engagement.</li>
          </ul>
          <button className="text-btn">Download playbook →</button>
        </div>
      </section>

      <section className="formats">
        <h2>Ad formats</h2>
        <div className="format-list">
          {formats.map((item) => (
            <div key={item} className="format-card">{item}</div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdvertisePage;
