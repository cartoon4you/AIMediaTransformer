
import React from 'react';
import { MediaType } from '../types';

interface MediaDisplayProps {
  url: string;
  type: MediaType;
  isTransformed?: boolean;
}

export const MediaDisplay: React.FC<MediaDisplayProps> = ({ url, type, isTransformed = false }) => {
  if (!url) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `transformed_${type === MediaType.IMAGE ? 'image.png' : 'video.mp4'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
      {type === MediaType.IMAGE ? (
        <img src={url} alt="Media content" className="w-full h-full object-contain" />
      ) : (
        <video src={url} controls autoPlay loop muted className="w-full h-full object-contain" />
      )}
      {isTransformed && (
         <button 
            onClick={handleDownload}
            className="absolute bottom-4 right-4 bg-gray-900/70 text-white py-2 px-4 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 hover:bg-gray-800"
          >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
           </svg>
            Download
         </button>
      )}
    </div>
  );
};
