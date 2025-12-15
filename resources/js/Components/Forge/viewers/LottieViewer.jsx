import React, { useEffect, useRef } from 'react';

const LottieViewer = ({ src, alt }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Load Lottie player script if not already loaded
    if (!window.LottiePlayer) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="bg-gray-50 rounded-lg p-4">
        <lottie-player
          src={src}
          background="transparent"
          speed="1"
          style={{ width: '400px', height: '400px' }}
          loop
          autoplay
          controls
        />
      </div>
      
      <div className="text-center text-sm text-gray-600">
        <p className="font-medium">{alt}</p>
        <p className="text-xs">Lottie Animation</p>
      </div>
    </div>
  );
};

export default LottieViewer;
