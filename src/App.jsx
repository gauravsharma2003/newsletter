import React, { useState, useEffect } from 'react';
import './App.css';
import newsletterData from '../newsletter_output.json';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(newsletterData);
  }, []);

  if (!data) {
    return <div className="loading">Loading newsletter...</div>;
  }

  return (
    <div className="app">
      <div className="newsletter-container">
        <header className="newsletter-header">
          <h1>{data.title}</h1>
          <div className="subtitle-date">
            <span>{data.subtitle}</span>
            <span className="separator">|</span>
            <span>{data.date}</span>
          </div>
        </header>

        <div className="stories-grid">
          {data.stories.map((story, index) => (
            <article key={index} className="story-card">
              <h2>{story.headline}</h2>
              <div className="story-content">
                <div className="section">
                  <h3>What happened:</h3>
                  <p>{story.what_happened}</p>
                </div>
                <div className="section">
                  <h3>Why it matters:</h3>
                  <p>{story.why_it_matters}</p>
                </div>
                <div className="section">
                  <h3>So what:</h3>
                  <p>{story.so_what}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
