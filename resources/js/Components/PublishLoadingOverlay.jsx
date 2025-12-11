import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBlackHoleLogo from '@/Components/AnimatedBlackHoleLogo';
import { usePublishStore } from '@/stores/usePublishStore';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export default function PublishLoadingOverlay() {
  const { 
    isPublishing, 
    publishProgress, 
    publishMessage, 
    publishedUrl,
    publishError,
    resetPublish 
  } = usePublishStore();
  
  const isComplete = publishProgress === 100 && !isPublishing;
  const hasFailed = publishError !== null;

  return (
    <AnimatePresence>
      {(isPublishing || isComplete || hasFailed) && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="relative flex flex-col items-center gap-8 p-12 bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] max-w-lg w-full mx-4"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Black Hole Animation */}
            <div className="relative w-48 h-48">
              {!hasFailed && (
                <AnimatedBlackHoleLogo 
                  width={192} 
                  height={192}
                  className="animate-pulse"
                />
              )}
              
              {hasFailed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-48 h-48 flex items-center justify-center"
                >
                  <XCircle className="w-32 h-32 text-red-500" />
                </motion.div>
              )}
              
              {isComplete && !hasFailed && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <CheckCircle className="w-32 h-32 text-green-500" />
                </motion.div>
              )}
            </div>

            {/* Status Text */}
            <div className="text-center space-y-4 w-full">
              <motion.h2
                className="text-3xl font-bold text-[var(--color-text)]"
                key={publishMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {hasFailed ? 'Publishing Failed' : isComplete ? 'Published!' : 'Building...'}
              </motion.h2>
              
              <motion.p
                className="text-lg text-[var(--color-text-muted)]"
                key={publishMessage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {hasFailed ? publishError : publishMessage}
              </motion.p>
            </div>

            {/* Progress Bar */}
            {isPublishing && (
              <div className="w-full space-y-2">
                <div className="relative w-full h-3 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
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
                  <span>{publishProgress}%</span>
                  <span>Please wait...</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {(isComplete || hasFailed) && (
              <motion.div
                className="flex gap-3 w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {isComplete && publishedUrl && (
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors font-medium"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Site
                  </a>
                )}
                
                <button
                  onClick={resetPublish}
                  className="flex-1 px-6 py-3 bg-[var(--color-bg-muted)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors font-medium"
                >
                  Close
                </button>
              </motion.div>
            )}

            {/* Decorative particles */}
            {isPublishing && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-500 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
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
