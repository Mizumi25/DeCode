// @/Components/Header/Head/RealTimeStackingAvatars.jsx
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePage } from '@inertiajs/react'
import { useFramePresenceStore } from '@/stores/useFramePresenceStore'

const RealTimeStackingAvatars = ({ frameId, currentMode = 'forge' }) => {
  const { props } = usePage()
  const user = props.auth?.user
  const [isHovered, setIsHovered] = useState(false)
  const mountedRef = useRef(true)

  // Zustand store
  const {
    getFrameState,
    getUsersByMode,
    initializeFramePresence,
    updateMode,
    cleanupFrame
  } = useFramePresenceStore()

  const frameState = getFrameState(frameId)
  const { isJoined, isConnected, error } = frameState

  // Initialize presence when component mounts
  useEffect(() => {
    if (!frameId || !user) return

    const initialize = async () => {
      await initializeFramePresence(frameId, currentMode, user)
    }

    initialize()

    return () => {
      mountedRef.current = false
      cleanupFrame(frameId)
    }
  }, [frameId, user, initializeFramePresence, cleanupFrame])

  // Handle mode changes
  useEffect(() => {
    if (isJoined) {
      updateMode(frameId, currentMode)
    }
  }, [currentMode, isJoined, updateMode, frameId])

  // Get users in current mode (excluding current user)
  const otherUsers = getUsersByMode(frameId, currentMode, user?.id)
  const displayUsers = otherUsers.slice(0, 4) // Show max 4 avatars
  const remainingCount = Math.max(0, otherUsers.length - 4)

  if (!isJoined || displayUsers.length === 0) {
    return null // Don't render if not joined or no other users
  }

  const containerVariants = {
    stacked: {
      transition: {
        staggerChildren: 0.05
      }
    },
    expanded: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  }

  const avatarVariants = {
    stacked: (index) => ({
      x: index * -4,
      y: 0,
      scale: 1,
      zIndex: displayUsers.length - index,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 400
      }
    }),
    expanded: (index) => ({
      x: index * 36,
      y: 50,
      scale: 1.1,
      zIndex: displayUsers.length - index,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    })
  }

  return (
    <div className="relative flex items-center">
      {/* Connection Status Debug (only show if error) */}
      {error && (
        <div className="absolute -top-8 left-0 text-xs text-red-500 whitespace-nowrap">
          {error}
        </div>
      )}

      <motion.div
        className="flex items-center cursor-pointer relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        variants={containerVariants}
        initial="stacked"
        animate={isHovered ? "expanded" : "stacked"}
        style={{ width: displayUsers.length * 4 + 16 }} // Dynamic width for stacked avatars
      >
        {displayUsers.map((collaborator, index) => (
          <motion.div
            key={collaborator.id}
            custom={index}
            variants={avatarVariants}
            className="absolute"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              scale: { type: "spring", damping: 25, stiffness: 400 },
              opacity: { duration: 0.2 }
            }}
          >
            {/* Avatar with mode indicator */}
            <div className="relative">
              <div 
                className={`w-4 h-4 rounded-full bg-gradient-to-br ${collaborator.color} text-white flex items-center justify-center font-semibold text-[10px] border-2 border-[var(--color-surface)] shadow-sm`}
                title={`${collaborator.name} (${collaborator.mode})`}
              >
                {collaborator.avatar ? (
                  <img 
                    src={collaborator.avatar} 
                    alt={collaborator.name}
                    className="w-full h-full object-cover rounded-full" 
                  />
                ) : (
                  collaborator.initials
                )}
              </div>
              
              {/* Mode indicator dot */}
              <div 
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[var(--color-surface)] ${
                  collaborator.mode === 'forge' 
                    ? 'bg-blue-500' 
                    : 'bg-green-500'
                }`}
                title={`${collaborator.mode} mode`}
              />
            </div>

            {/* Name label with mode - only shows when expanded */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.8 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50"
                >
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2 py-1 shadow-lg">
                    <div className="text-xs text-[var(--color-text)] font-medium whitespace-nowrap">
                      {collaborator.name}
                    </div>
                    <div className={`text-[10px] ${
                      collaborator.mode === 'forge' 
                        ? 'text-blue-500' 
                        : 'text-green-500'
                    } text-center`}>
                      {collaborator.mode}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Remaining count indicator */}
        {remainingCount > 0 && (
          <motion.div
            custom={displayUsers.length}
            variants={avatarVariants}
            className="absolute"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <div className="w-4 h-4 rounded-full bg-gray-500 text-white flex items-center justify-center font-semibold text-[8px] border-2 border-[var(--color-surface)] shadow-sm">
              +{remainingCount}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Total count badge with connection indicator */}
      <motion.div 
        className={`ml-2 px-1.5 py-0.5 border border-[var(--color-border)] rounded text-[10px] flex items-center gap-1 ${
          isConnected 
            ? 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
        }`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        key={otherUsers.length} // Re-animate when count changes
      >
        {/* Connection status dot */}
        <div 
          className={`w-1.5 h-1.5 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`}
        />
        {otherUsers.length}
      </motion.div>
    </div>
  )
}

export default RealTimeStackingAvatars