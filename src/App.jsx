import React, { useState, useEffect } from 'react';
import newsletterData from '../newsletter_output.json';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(newsletterData);
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-900">
        Loading newsletter...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-[700px] mx-auto text-left bg-white p-8 rounded-lg shadow-sm">
        <header className="text-left mb-8 pb-6 border-b-2 border-gray-200">
          <h1 className="text-3xl mb-3 text-[#E3272A] font-bold">{data.title}</h1>
          <div className="text-sm text-gray-900 mb-4">
            <span>{data.subtitle}</span>
            <span className="mx-4 opacity-50">|</span>
            <span>{data.date}</span>
          </div>
          {data.lede && (
            <p className="text-base text-gray-900 leading-relaxed font-bold">
              {data.lede}
            </p>
          )}
        </header>

        <div className="flex flex-col gap-6 py-2">
          {data.stories.map((story, index) => (
            <article key={index} className="py-6 border-b border-gray-200 last:border-b-0">
              <h2 className="text-xl mb-4 text-[#E3272A] font-semibold leading-tight">{story.headline}</h2>
              {story.image && (
                <div className="w-4/5 mb-4">
                  <img 
                    src={story.image} 
                    alt={story.headline}
                    className="w-full h-auto rounded-lg shadow-sm"
                  />
                </div>
              )}
              <div className="flex flex-col gap-4 text-left">
                <div className="mb-3">
                  <h3 className="text-sm mb-2 text-gray-900 font-bold uppercase tracking-wider">What happened:</h3>
                  <p className="text-sm text-gray-900 leading-relaxed">{story.what_happened}</p>
                </div>
                <div className="mb-3">
                  <h3 className="text-sm mb-2 text-gray-900 font-bold uppercase tracking-wider">Why it matters:</h3>
                  <p className="text-sm text-gray-900 leading-relaxed">{story.why_it_matters}</p>
                </div>
                <div className="mb-3">
                  <h3 className="text-sm mb-2 text-gray-900 font-bold uppercase tracking-wider">So what:</h3>
                  <p className="text-sm text-gray-900 leading-relaxed">{story.so_what}</p>
                </div>
                {story.url && (
                  <div className="mt-4 text-right">
                    <a 
                      href={story.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#E3272A] hover:text-[#B31F22] hover:underline text-sm font-medium transition-colors"
                    >
                      Read full article →
                    </a>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
