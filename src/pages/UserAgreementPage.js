import React from 'react';
import './UserAgreementPage.css';

const terms = [
  { title: 'Your account', desc: 'Keep credentials secure and comply with age requirements.' },
  { title: 'Content rights', desc: 'You own your content; you give us permission to host and display it.' },
  { title: 'Community rules', desc: 'Follow Reddit Rules and each community’s guidelines.' },
  { title: 'Termination', desc: 'Violations may result in limits or removal of access.' }
];

function UserAgreementPage() {
  return (
    <div className="ua-page">
      <section className="ua-hero">
        <h1>User Agreement</h1>
        <p className="subtitle">Key terms for using Reddit Clone. This is a simplified summary; full terms apply.</p>
      </section>

      <div className="terms-grid">
        {terms.map((term) => (
          <div key={term.title} className="term-card">
            <h3>{term.title}</h3>
            <p>{term.desc}</p>
          </div>
        ))}
      </div>

      <div className="footer-note">
        <p>For complete wording or questions, contact legal@reddit-clone.test.</p>
      </div>
    </div>
  );
}

export default UserAgreementPage;
