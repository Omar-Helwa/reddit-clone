import React from 'react';
import './PressPage.css';

const pressKits = [
  { title: 'Logos & brand', desc: 'Download marks, usage guidelines, and color specs.' },
  { title: 'Product facts', desc: 'Key metrics, feature overviews, and screenshots.' },
  { title: 'Leadership bios', desc: 'Background on the people building Reddit Clone.' }
];

const contacts = [
  'press@reddit-clone.test',
  'For urgent matters, include "Time-sensitive" in the subject.',
  'Share publication, deadline, and questions to speed a response.'
];

function PressPage() {
  return (
    <div className="press-page">
      <section className="press-hero">
        <div>
          <p className="eyebrow">Press</p>
          <h1>Press resources</h1>
          <p className="subtitle">Brand assets, facts, and contacts for media requests.</p>
          <div className="kit-grid">
            {pressKits.map((kit) => (
              <div key={kit.title} className="kit-card">
                <h3>{kit.title}</h3>
                <p>{kit.desc}</p>
                <button className="text-btn">Download →</button>
              </div>
            ))}
          </div>
        </div>
        <div className="contact-card">
          <h3>Contact</h3>
          <ul>
            {contacts.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default PressPage;
