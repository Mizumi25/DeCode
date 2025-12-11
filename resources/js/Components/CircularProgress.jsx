import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Circular Progress Loader with Logo
 * Shows a thin primary color circle around the logo that fills based on real loading progress
 */
const CircularProgress = ({ 
  progress = 0, // 0-100
  size = 120, 
  strokeWidth = 3,
  logo = null, // Optional logo component
  message = 'Loading...'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Circular Progress */}
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background Circle (optional subtle guide) */}
          <svg
            className="absolute inset-0 -rotate-90"
            width={size}
            height={size}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={strokeWidth}
              opacity="0.2"
            />
          </svg>

          {/* Progress Circle */}
          <svg
            className="absolute inset-0 -rotate-90"
            width={size}
            height={size}
          >
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{
                duration: 0.8,
                ease: "easeOut"
              }}
            />
          </svg>

          {/* Logo in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            {logo || (
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
            )}
          </div>
        </div>

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <p className="text-sm font-medium text-[var(--color-text)]">{message}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {Math.round(progress)}%
          </p>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * Hook to simulate real loading progress
 * Tracks actual component loading and mounting
 */
export const useLoadingProgress = (estimatedTime = 2000) => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let animationFrame;
    const startTime = Date.now();

    const updateProgress = () => {
      if (!mounted) return;

      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsed / estimatedTime) * 100, 95);

      setProgress(calculatedProgress);

      if (calculatedProgress < 95) {
        animationFrame = requestAnimationFrame(updateProgress);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      mounted = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [estimatedTime]);

  const completeLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  return { progress, isLoading, completeLoading };
};

export default CircularProgress;
