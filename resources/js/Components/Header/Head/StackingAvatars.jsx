import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const StackingAvatars = () => {
  const [isHovered, setIsHovered] = useState(false)
  
  const collaborators = [
    { 
      id: 1, 
      color: 'from-blue-500 to-blue-600', 
      initial: 'A',
      name: 'Alice',
      avatar: null
    },
    { 
      id: 2, 
      color: 'from-emerald-500 to-emerald-600', 
      initial: 'B',
      name: 'Bob',
      avatar: null
    },
    { 
      id: 3, 
      color: 'from-purple-500 to-purple-600', 
      initial: 'C',
      name: 'Carol',
      avatar: null
    },
    { 
      id: 4, 
      color: 'from-orange-500 to-orange-600', 
      initial: 'D',
      name: 'David',
      avatar: null
    }
  ]

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
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 400
      }
    }),
    expanded: (index) => ({
      x: index * 36,
      y: 60, // Just below header
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    })
  }

  return (
    <div className="relative flex items-center">
      <motion.div
        className="flex items-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        variants={containerVariants}
        initial="stacked"
        animate={isHovered ? "expanded" : "stacked"}
      >
        {collaborators.map((collaborator, index) => (
          <motion.div
            key={collaborator.id}
            custom={index}
            variants={avatarVariants}
            className="absolute"
          >
            {/* Avatar */}
            <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${collaborator.color} text-white flex items-center justify-center font-semibold text-[10px] border border-[var(--color-surface)] shadow-sm`}>
              {collaborator.avatar ? (
                <img 
                  src={collaborator.avatar} 
                  alt={collaborator.name}
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                collaborator.initial
              )}
            </div>

            {/* Name label - only shows when expanded */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  className="absolute top-6 left-1/2 transform -translate-x-1/2"
                >
                  <span className="text-xs text-[var(--color-text)] font-medium whitespace-nowrap">
                    {collaborator.name}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default StackingAvatars