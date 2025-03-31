import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [newsletterData, setNewsletterData] = useState(null);

  useEffect(() => {
    // Fetch newsletter data
    fetch('/newsletter_output.json')
      .then(response => response.json())
      .then(data => setNewsletterData(data))
      .catch(error => console.error('Error loading newsletter:', error));
  }, []);

  if (!newsletterData) {
    return <div className="loading">Loading newsletter...</div>;
  }

  return (
    <div className="app">
      <div className="newsletter-container">
        <header className="newsletter-header">
          <h1>{newsletterData.title}</h1>
          <div className="subtitle-date">
            <span>{newsletterData.subtitle}</span>
            <span className="separator">|</span>
            <span>{newsletterData.date}</span>
          </div>
        </header>

        <div className="stories-grid">
          {newsletterData.stories.map((story, index) => (
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
