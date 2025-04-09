import React, { useEffect, useRef } from 'react';

const DownloadButton = ({ imageUrl, canvasRef }) => {
  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      if (canvasRef.current) {
        // Convert canvas to blob
        canvasRef.current.toBlob((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `image-${Date.now()}.jpg`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 'image/jpeg', 1.0);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all duration-200"
      title="Download image"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
    </button>
  );
};

const ImageWithText = ({ imageUrl, text }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Add text
      ctx.font = 'bold 64px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      
      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Draw text at bottom right with padding
      ctx.fillText(text, canvas.width - 30, canvas.height - 30);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };
    
    img.src = imageUrl;
  }, [imageUrl, text]);

  return (
    <div className="w-full mb-6 relative group">
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg shadow-sm"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <DownloadButton canvasRef={canvasRef} />
      </div>
    </div>
  );
};

function View({ data, onRecreate }) {
  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-900">
        Loading newsletter...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 md:p-8">
      <div className="w-full md:max-w-[700px] md:mx-auto text-left bg-white md:p-8 p-4 md:rounded-lg shadow-sm">
        <header className="text-left mb-8 pb-6 border-b-2 border-gray-200">
          <h1 className="text-3xl mb-3 text-[#E3272A] font-bold">{data.title}</h1>
          <div className="text-sm text-gray-900 mb-4">
            <span>{data.subtitle}</span>
            <span className="mx-4 opacity-50">|</span>
            <span>{data.date}</span>
          </div>
          {data.leadimage && (
            <ImageWithText imageUrl={data.leadimage} text={data.date} />
          )}
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
                <div className="w-full mb-4 relative group">
                  <img 
                    src={story.image} 
                    alt={story.headline}
                    className="w-full h-auto rounded-lg shadow-sm"
                  />
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <DownloadButton imageUrl={story.image} />
                  </div>
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
        
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
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
