import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const StackingAvatars = () => {
  const [isHovered, setIsHovered] = useState(false)
  
  const collaborators = [
    { 
      id: 1, 
      color: 'bg-blue-500', 
      initial: 'A',
      name: 'Alice Johnson',
      status: 'online',
      avatar: null // Add avatar URL if available
    },
    { 
      id: 2, 
      color: 'bg-green-500', 
      initial: 'B',
      name: 'Bob Smith',
      status: 'editing',
      avatar: null
    },
    { 
      id: 3, 
      color: 'bg-purple-500', 
      initial: 'C',
      name: 'Carol Davis',
      status: 'viewing',
      avatar: null
    },
    { 
      id: 4, 
      color: 'bg-orange-500', 
      initial: 'D',
      name: 'David Wilson',
      status: 'idle',
      avatar: null
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-400'
      case 'editing': return 'bg-yellow-400'
      case 'viewing': return 'bg-blue-400'
      case 'idle': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const containerVariants = {
    stacked: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0
      }
    },
    expanded: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const avatarVariants = {
    stacked: (index) => ({
      x: index * -4, // Negative overlap in stacked state
      y: 0,
      scale: 1,
      rotate: 0,
      zIndex: collaborators.length - index,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
        duration: 0.3
      }
    }),
    expanded: (index) => ({
      x: index * 28, // Horizontal spacing when expanded
      y: 16, // Move down when expanded
      scale: 1.1,
      rotate: [0, -2, 2, 0][index] || 0, // Slight rotation for personality
      zIndex: collaborators.length - index,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 250,
        duration: 0.4
      }
    })
  }

  const tooltipVariants = {
    hidden: { 
      opacity: 0, 
      y: -8,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: -12,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 400,
        duration: 0.2
      }
    }
  }

  return (
    <div className="relative">
      <motion.div
        className="flex items-center cursor-pointer relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        variants={containerVariants}
        initial="stacked"
        animate={isHovered ? "expanded" : "stacked"}
        style={{ 
          width: isHovered ? `${collaborators.length * 28 + 16}px` : '48px',
          height: isHovered ? '48px' : '16px',
          transition: 'width 0.4s ease, height 0.4s ease'
        }}
      >
        {collaborators.map((collaborator, index) => (
          <motion.div
            key={collaborator.id}
            custom={index}
            variants={avatarVariants}
            className="absolute"
            style={{ 
              left: 0,
              top: 0
            }}
          >
            {/* Avatar Container */}
            <motion.div
              className={`w-4 h-4 rounded-full ${collaborator.color} text-white flex items-center justify-center font-bold text-[10px] border border-[var(--color-surface)] shadow-md relative overflow-hidden`}
              whileHover={{ 
                scale: isHovered ? 1.2 : 1.05,
                rotate: isHovered ? (index % 2 === 0 ? 5 : -5) : 0
              }}
              style={{
                zIndex: collaborators.length - index
              }}
            >
              {collaborator.avatar ? (
                <img 
                  src={collaborator.avatar} 
                  alt={collaborator.name}
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                collaborator.initial
              )}
              
              {/* Status Indicator */}
              <motion.div 
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 ${getStatusColor(collaborator.status)} rounded-full border border-white`}
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0.8 }}
                transition={{ delay: index * 0.05 + 0.2 }}
              />
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  variants={tooltipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute left-1/2 transform -translate-x-1/2 -top-8 z-50"
                  style={{ marginTop: '-8px' }}
                >
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                    <div className="font-medium">{collaborator.name}</div>
                    <div className="text-gray-300 capitalize">{collaborator.status}</div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Add Collaborator Button - Shows when hovered */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: collaborators.length * 28 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: collaborators.length * 28,
                y: 16
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                delay: 0.2,
                type: "spring",
                damping: 20,
                stiffness: 300
              }}
              className="absolute"
            >
              <motion.button
                whileHover={{ scale: 1.2, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                className="w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs font-bold border border-[var(--color-surface)] shadow-md transition-colors"
                title="Add collaborator"
              >
                +
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Collaboration Status Text - Shows when expanded */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-6 left-0 text-xs text-[var(--color-text-muted)] whitespace-nowrap"
          >
            {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''} active
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StackingAvatars