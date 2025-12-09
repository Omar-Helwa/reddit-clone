import React from 'react';
import './CareersPage.css';

const teams = [
  { name: 'Engineering', desc: 'Build features, scale systems, and ship delightful performance.' },
  { name: 'Product & Design', desc: 'Shape community-first experiences with research-led decisions.' },
  { name: 'Trust & Safety', desc: 'Keep conversations healthy with policy, tooling, and signals.' }
];

const benefits = [
  'Remote-friendly roles with flexible hours',
  'Learning budget and mentorship programs',
  'Wellness support and generous leave',
  'Inclusive communities for every background'
];

function CareersPage() {
  return (
    <div className="careers-page">
      <section className="careers-hero">
        <div>
          <p className="eyebrow">Careers</p>
          <h1>Work on community at scale</h1>
          <p className="subtitle">Join teams that ship fast, listen to communities, and keep the platform safe.</p>
          <div className="hero-actions">
            <button className="primary-btn">View open roles</button>
            <button className="ghost-btn">Meet the team</button>
          </div>
        </div>
        <div className="benefits-card">
          <h3>Benefits</h3>
          <ul>
            {benefits.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="teams">
        <h2>Teams hiring</h2>
        <div className="team-grid">
          {teams.map((team) => (
            <div key={team.name} className="team-card">
              <h3>{team.name}</h3>
              <p>{team.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CareersPage;
