import React from 'react';
import './PrivacyPolicyPage.css';

const sections = [
  { title: 'Data we collect', items: ['Account details you provide', 'Content you post and actions you take', 'Technical data like device, browser, and approximate location'] },
  { title: 'Why we use data', items: ['Operate the service and personalize feeds', 'Prevent abuse, fraud, and spam', 'Improve performance and reliability'] },
  { title: 'Your controls', items: ['Update profile and preferences', 'Download or delete your data on request', 'Adjust notifications and ad personalization'] }
];

function PrivacyPolicyPage() {
  return (
    <div className="privacy-page">
      <section className="privacy-hero">
        <h1>Privacy Policy</h1>
        <p className="subtitle">How we handle data, why we use it, and the controls you have.</p>
      </section>

      <div className="policy-grid">
        {sections.map((section) => (
          <div key={section.title} className="policy-card">
            <h3>{section.title}</h3>
            <ul>
              {section.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-note">
        <p>Questions or requests about your data? Contact privacy@reddit-clone.test.</p>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
