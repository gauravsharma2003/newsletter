import React, { useRef, useState } from 'react';
import ImageDownloadButton from './ImageDownloadButton';
import PDFDownloadButton from './PDFDownloadButton';
import ImageWithText from './ImageWithText';

function View({ data, onRecreate }) {
  const [editableData, setEditableData] = useState(data);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef(null);

  const handleTextChange = (field, value) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStoryTextChange = (index, field, value) => {
    setEditableData(prev => ({
      ...prev,
      stories: prev.stories.map((story, i) => 
        i === index ? { ...story, [field]: value } : story
      )
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you can add any save functionality if needed
  };

  if (!editableData) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-900">
        Loading newsletter...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 md:p-8">
      <div className="w-full md:max-w-[700px] md:mx-auto text-left bg-white md:p-8 p-4 md:rounded-lg shadow-sm" ref={contentRef}>
        <div className="flex justify-between items-center mb-4">
          
          <div className="flex gap-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Content
                </button>
                <PDFDownloadButton 
                  newsletterData={editableData}
                  isExporting={isExporting}
                  setIsExporting={setIsExporting}
                />
              </>
            )}
          </div>
        </div>

        <header className="text-left mb-8 pb-6 border-b-2 border-gray-200">
          {isEditing ? (
            <input
              type="text"
              value={editableData.title}
              onChange={(e) => handleTextChange('title', e.target.value)}
              className="text-3xl mb-3 text-[#E3272A] font-bold w-full p-2 border rounded"
            />
          ) : (
            <h1 className="text-3xl mb-3 text-[#E3272A] font-bold">{editableData.title}</h1>
          )}
          
          <div className="text-sm text-gray-900 mb-4">
            {isEditing ? (
              <input
                type="text"
                value={editableData.subtitle}
                onChange={(e) => handleTextChange('subtitle', e.target.value)}
                className="w-full p-2 border rounded"
              />
            ) : (
              <span>{editableData.subtitle}</span>
            )}
            <span className="mx-4 opacity-50">|</span>
            <span>{editableData.date}</span>
          </div>

          {editableData.leadimage && (
            <ImageWithText imageUrl={editableData.leadimage} text={editableData.date} />
          )}

          {editableData.lede && (
            isEditing ? (
              <textarea
                value={editableData.lede}
                onChange={(e) => handleTextChange('lede', e.target.value)}
                className="text-base text-gray-900 leading-relaxed font-bold w-full p-2 border rounded"
                rows="3"
              />
            ) : (
              <p className="text-base text-gray-900 leading-relaxed font-bold">
                {editableData.lede}
              </p>
            )
          )}
        </header>

        <div className="flex flex-col gap-6 py-2">
          {editableData.stories.map((story, index) => (
            <article key={index} className="py-6 border-b border-gray-200 last:border-b-0">
              {isEditing ? (
                <input
                  type="text"
                  value={story.headline}
                  onChange={(e) => handleStoryTextChange(index, 'headline', e.target.value)}
                  className="text-xl mb-4 text-[#E3272A] font-semibold leading-tight w-full p-2 border rounded"
                />
              ) : (
                <h2 className="text-xl mb-4 text-[#E3272A] font-semibold leading-tight">{story.headline}</h2>
              )}

              {story.image && (
                <div className="w-full mb-4 relative group">
                  <img 
                    src={story.image} 
                    alt={story.headline}
                    className="w-full h-auto rounded-lg shadow-sm"
                  />
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ImageDownloadButton imageUrl={story.image} />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 text-left">
                <div className="mb-3">
                  <h3 className="text-sm mb-2 text-gray-900 font-bold uppercase tracking-wider">What happened:</h3>
                  {isEditing ? (
                    <textarea
                      value={story.what_happened}
                      onChange={(e) => handleStoryTextChange(index, 'what_happened', e.target.value)}
                      className="text-sm text-gray-900 leading-relaxed w-full p-2 border rounded"
                      rows="3"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 leading-relaxed">{story.what_happened}</p>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="text-sm mb-2 text-gray-900 font-bold uppercase tracking-wider">Why it matters:</h3>
                  {isEditing ? (
                    <textarea
                      value={story.why_it_matters}
                      onChange={(e) => handleStoryTextChange(index, 'why_it_matters', e.target.value)}
                      className="text-sm text-gray-900 leading-relaxed w-full p-2 border rounded"
                      rows="3"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 leading-relaxed">{story.why_it_matters}</p>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="text-sm mb-2 text-gray-900 font-bold uppercase tracking-wider">So what:</h3>
                  {isEditing ? (
                    <textarea
                      value={story.so_what}
                      onChange={(e) => handleStoryTextChange(index, 'so_what', e.target.value)}
                      className="text-sm text-gray-900 leading-relaxed w-full p-2 border rounded"
                      rows="3"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 leading-relaxed">{story.so_what}</p>
                  )}
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
        
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center gap-4">
          <button
            onClick={onRecreate}
            className="px-6 py-2 bg-[#E3272A] text-white rounded-lg hover:bg-[#B31F22] transition-colors"
          >
            Recreate Newsletter
          </button>
        </div>
      </div>
    </div>
  );
}

export default View;
