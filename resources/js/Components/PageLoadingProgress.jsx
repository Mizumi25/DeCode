import React, { useEffect, useState } from 'react';
import AnimatedBlackHoleLogo from './AnimatedBlackHoleLogo';

/**
 * PageLoadingProgress - A loading component with a circular progress ring
 * that shows real loading progress based on resource/component loading
 * 
 * @param {boolean} isLoading - Whether loading is active
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Optional loading message
 */
const PageLoadingProgress = ({ isLoading, progress = 0, message = 'Loading...' }) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  
  // Smooth progress animation
  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setDisplayProgress(prev => {
          const diff = progress - prev;
          if (Math.abs(diff) < 0.5) return progress;
          return prev + diff * 0.1; // Smooth easing
        });
      }, 16); // ~60fps
      
      return () => clearInterval(timer);
    }
  }, [progress, isLoading]);

  if (!isLoading) return null;

  // Calculate circle properties
  const size = 200;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayProgress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[var(--color-bg)] pointer-events-auto transition-opacity duration-300">
      <div className="relative flex flex-col items-center gap-6 animate-fadeIn">
        {/* Logo with circular progress */}
        <div className="relative" style={{ width: size, height: size }}>
          {/* Animated Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{ width: size * 0.6, height: size * 0.6 }}>
              <AnimatedBlackHoleLogo />
            </div>
          </div>
          
          {/* SVG Progress Circle */}
          <svg
            width={size}
            height={size}
            className="absolute inset-0 -rotate-90 transform"
            style={{ filter: 'drop-shadow(0 0 8px var(--color-primary))' }}
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--color-border)"
              strokeWidth={strokeWidth}
              fill="none"
              opacity="0.2"
            />
            
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--color-primary)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transition: 'stroke-dashoffset 0.3s ease-out',
              }}
            />
          </svg>
          
          {/* Progress percentage */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span 
              className="text-xs font-semibold text-[var(--color-primary)] mt-20"
              style={{ textShadow: '0 0 10px var(--color-primary)' }}
            >
              {Math.round(displayProgress)}%
            </span>
          </div>
        </div>
        
        {/* Loading message */}
        {message && (
          <p className="text-sm text-[var(--color-text-muted)] animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageLoadingProgress;
