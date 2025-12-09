import React from 'react';
import './BlogPage.css';

const posts = [
  { title: 'Product updates', desc: 'New features, experiments, and performance wins.', tag: 'Update' },
  { title: 'Community stories', desc: 'Spotlights on creative mods and memorable threads.', tag: 'Story' },
  { title: 'Safety & policy', desc: 'How we handle reports, enforcement, and transparency.', tag: 'Policy' }
];

function BlogPage() {
  return (
    <div className="blog-page">
      <section className="blog-hero">
        <p className="eyebrow">Blog</p>
        <h1>News from the team and community</h1>
        <p className="subtitle">Stay current on product changes, policy updates, and stories from the moderators who keep conversations healthy.</p>
        <div className="post-grid">
          {posts.map((post) => (
            <div key={post.title} className="post-card">
              <span className="chip">{post.tag}</span>
              <h3>{post.title}</h3>
              <p>{post.desc}</p>
              <button className="text-btn">Read more →</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default BlogPage;
