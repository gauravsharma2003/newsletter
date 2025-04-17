import React, { useEffect, useRef } from 'react';
import ImageDownloadButton from './ImageDownloadButton';

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
        <ImageDownloadButton canvasRef={canvasRef} />
      </div>
    </div>
  );
};

export default ImageWithText; 