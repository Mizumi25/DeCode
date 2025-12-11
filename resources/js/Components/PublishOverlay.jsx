// @/Components/PublishOverlay.jsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { usePublishStore } from '@/stores/usePublishStore';
import { CheckCircle, XCircle, ExternalLink, X } from 'lucide-react';
import globeLottie from '/public/lottie/globe-solid-black.json';

export default function PublishOverlay() {
  const { 
    isPublishing, 
    publishProgress, 
    publishMessage, 
    publishedUrl,
    publishError,
    resetPublish 
  } = usePublishStore();
  
  const lottieRef = useRef();
  const isComplete = publishProgress === 100 && !isPublishing;
  const hasFailed = publishError !== null;
  const showOverlay = isPublishing || isComplete || hasFailed;
  
  // Only load Lottie when actively publishing for performance
  const shouldRenderLottie = isPublishing && !hasFailed && !isComplete;

  // Control Lottie playback based on progress
  useEffect(() => {
    if (lottieRef.current && isPublishing) {
      lottieRef.current.play();
    }
  }, [isPublishing]);

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background with CSS variable */}
          <div className="absolute inset-0 bg-[var(--color-bg)] opacity-95" />
          
          {/* Content */}
          <motion.div
            className="relative flex flex-col items-center gap-8 p-12 max-w-2xl w-full mx-4"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Lottie Animation Container */}
            <div className="relative w-64 h-64">
              {shouldRenderLottie && (
                <div style={{ 
                  filter: 'hue-rotate(0deg) saturate(150%)',
                  color: 'var(--color-primary)'
                }}>
                  <Lottie
                    lottieRef={lottieRef}
                    animationData={globeLottie}
                    loop={true}
                    autoplay={true}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    rendererSettings={{
                      preserveAspectRatio: 'xMidYMid slice',
                      className: 'publish-lottie',
                    }}
                  />
                </div>
              )}
              
              {/* Success Icon */}
              {isComplete && !hasFailed && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <CheckCircle className="w-40 h-40 text-green-500" strokeWidth={1.5} />
                </motion.div>
              )}
              
              {/* Error Icon */}
              {hasFailed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <XCircle className="w-40 h-40 text-red-500" strokeWidth={1.5} />
                </motion.div>
              )}
            </div>

            {/* Status Text */}
            <div className="text-center space-y-4 w-full">
              <motion.h2
                className="text-4xl font-bold text-[var(--color-text)]"
                key={hasFailed ? 'failed' : isComplete ? 'complete' : 'publishing'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {hasFailed 
                  ? 'Publishing Failed' 
                  : isComplete 
                    ? 'Published Successfully!' 
                    : 'Building Your Site...'
                }
              </motion.h2>
              
              <motion.p
                className="text-lg text-[var(--color-text-muted)]"
                key={`${hasFailed ? 'failed' : isComplete ? 'complete' : 'publishing'}-${publishMessage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {hasFailed ? publishError : publishMessage}
              </motion.p>
            </div>

            {/* Progress Bar - Only show during publishing */}
            {isPublishing && (
              <div className="w-full space-y-3">
                <div className="relative w-full h-2 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, var(--color-primary) 0%, #8b5cf6 50%, #3b82f6 100%)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${publishProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  
                  {/* Animated shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5, 
                      ease: "linear" 
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                  <span className="font-medium">{publishProgress}%</span>
                  <span>Please wait, this may take a moment...</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {(isComplete || hasFailed) && (
              <motion.div
                className="flex gap-3 w-full max-w-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {isComplete && publishedUrl && (
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors font-medium shadow-lg"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Live Site
                  </a>
                )}
                
                <button
                  onClick={resetPublish}
                  className="flex-1 px-6 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors font-medium"
                >
                  {hasFailed ? 'Try Again' : 'Close'}
                </button>
              </motion.div>
            )}

            {/* Cancel Button - Only during publishing */}
            {isPublishing && (
              <button
                onClick={resetPublish}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-sm underline"
              >
                Cancel Publishing
              </button>
            )}

            {/* Decorative particles during publishing */}
            {isPublishing && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
