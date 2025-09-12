import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

const InfiniteGrid = ({ 
  isVisible = false,
  scrollPosition = { x: 0, y: 0 },
  zoom = 1,
  isDark = false,
  scrollBounds = { width: 8000, height: 6000 }
}) => {
  // Grid configuration
  const gridConfig = useMemo(() => {
    const baseSize = 40 // Base grid size in pixels
    const minSize = 20  // Minimum visible grid size
    const maxSize = 200 // Maximum visible grid size
    
    // Calculate adaptive grid size based on zoom
    let gridSize = baseSize * zoom
    
    // Ensure grid size stays within reasonable bounds
    gridSize = Math.max(minSize, Math.min(maxSize, gridSize))
    
    // Calculate opacity based on zoom level for better UX
    let opacity = 1
    if (zoom < 0.5) {
      opacity = Math.max(0.1, zoom * 2)
    } else if (zoom > 2) {
      opacity = Math.max(0.3, 1 / (zoom * 0.5))
    }
    
    return {
      size: gridSize,
      opacity,
      strokeWidth: Math.max(0.5, Math.min(2, zoom))
    }
  }, [zoom])

  // Calculate grid lines positions
  const gridLines = useMemo(() => {
    if (!isVisible) return { vertical: [], horizontal: [] }
    
    const { size } = gridConfig
    const lines = { vertical: [], horizontal: [] }
    
    // Calculate visible area with some buffer for smooth scrolling
    const buffer = size * 2
    const startX = Math.floor((scrollPosition.x - buffer) / size) * size
    const endX = Math.ceil((scrollPosition.x + window.innerWidth / zoom + buffer) / size) * size
    const startY = Math.floor((scrollPosition.y - buffer) / size) * size
    const endY = Math.ceil((scrollPosition.y + window.innerHeight / zoom + buffer) / size) * size
    
    // Generate vertical lines
    for (let x = startX; x <= endX; x += size) {
      if (x >= 0 && x <= scrollBounds.width) {
        lines.vertical.push(x)
      }
    }
    
    // Generate horizontal lines
    for (let y = startY; y <= endY; y += size) {
      if (y >= 0 && y <= scrollBounds.height) {
        lines.horizontal.push(y)
      }
    }
    
    return lines
  }, [isVisible, scrollPosition, zoom, gridConfig.size, scrollBounds])

  // Grid colors based on theme
  const gridColors = useMemo(() => {
    if (isDark) {
      return {
        primary: 'rgba(148, 163, 184, 0.15)',   // slate-400 with opacity
        secondary: 'rgba(148, 163, 184, 0.08)', // slate-400 with lower opacity
        accent: 'rgba(139, 92, 246, 0.2)'       // purple accent for major lines
      }
    } else {
      return {
        primary: 'rgba(71, 85, 105, 0.12)',     // slate-600 with opacity
        secondary: 'rgba(71, 85, 105, 0.06)',   // slate-600 with lower opacity
        accent: 'rgba(99, 102, 241, 0.15)'      // indigo accent for major lines
      }
    }
  }, [isDark])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="absolute inset-0 pointer-events-none"
      style={{
        transform: `translate(${-scrollPosition.x}px, ${-scrollPosition.y}px)`,
        zIndex: 5
      }}
    >
      <svg
        width={scrollBounds.width}
        height={scrollBounds.height}
        className="absolute inset-0"
        style={{ 
          opacity: gridConfig.opacity,
          transition: 'opacity 0.2s ease-in-out'
        }}
      >
        <defs>
          {/* Grid patterns for different line types */}
          <pattern
            id={`grid-pattern-${isDark ? 'dark' : 'light'}`}
            width={gridConfig.size}
            height={gridConfig.size}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridConfig.size} 0 L 0 0 0 ${gridConfig.size}`}
              fill="none"
              stroke={gridColors.primary}
              strokeWidth={gridConfig.strokeWidth}
              opacity="0.6"
            />
          </pattern>
          
          {/* Subtle dot pattern for intersection points */}
          <pattern
            id={`dot-pattern-${isDark ? 'dark' : 'light'}`}
            width={gridConfig.size}
            height={gridConfig.size}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={0}
              cy={0}
              r={Math.max(0.5, gridConfig.strokeWidth * 0.8)}
              fill={gridColors.secondary}
              opacity="0.4"
            />
          </pattern>
        </defs>
        
        {/* Main grid lines */}
        <rect
          width="100%"
          height="100%"
          fill={`url(#grid-pattern-${isDark ? 'dark' : 'light'})`}
        />
        
        {/* Major grid lines (every 5th line) */}
        {gridLines.vertical.map((x, index) => {
          const isMajor = (x / gridConfig.size) % 5 === 0
          if (!isMajor) return null
          
          return (
            <motion.line
              key={`v-major-${x}`}
              x1={x}
              y1={0}
              x2={x}
              y2={scrollBounds.height}
              stroke={gridColors.accent}
              strokeWidth={gridConfig.strokeWidth * 1.5}
              opacity="0.8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.02,
                ease: 'easeOut'
              }}
            />
          )
        })}
        
        {gridLines.horizontal.map((y, index) => {
          const isMajor = (y / gridConfig.size) % 5 === 0
          if (!isMajor) return null
          
          return (
            <motion.line
              key={`h-major-${y}`}
              x1={0}
              y1={y}
              x2={scrollBounds.width}
              y2={y}
              stroke={gridColors.accent}
              strokeWidth={gridConfig.strokeWidth * 1.5}
              opacity="0.8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.02,
                ease: 'easeOut'
              }}
            />
          )
        })}
        
        {/* Intersection dots for visual enhancement */}
        <rect
          width="100%"
          height="100%"
          fill={`url(#dot-pattern-${isDark ? 'dark' : 'light'})`}
        />
        
        {/* Origin indicator (0,0 point) */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, type: 'spring' }}
        >
          <circle
            cx={0}
            cy={0}
            r={6}
            fill={gridColors.accent}
            opacity="0.6"
          />
          <circle
            cx={0}
            cy={0}
            r={3}
            fill={isDark ? '#fff' : '#000'}
            opacity="0.8"
          />
        </motion.g>
        
        {/* Subtle gradient overlay for depth */}
        <defs>
          <radialGradient 
            id={`grid-gradient-${isDark ? 'dark' : 'light'}`}
            cx="50%" 
            cy="50%" 
            r="50%"
          >
            <stop 
              offset="0%" 
              stopColor="transparent" 
            />
            <stop 
              offset="100%" 
              stopColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'} 
            />
          </radialGradient>
        </defs>
        
        <rect
          width="100%"
          height="100%"
          fill={`url(#grid-gradient-${isDark ? 'dark' : 'light'})`}
          opacity="0.3"
        />
      </svg>
      
      {/* Grid info indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="fixed bottom-4 right-4 bg-black bg-opacity-30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-mono opacity-60 hover:opacity-90 transition-opacity duration-200 pointer-events-auto"
      >
        Grid: {Math.round(gridConfig.size)}px
      </motion.div>
    </motion.div>
  )
}

export default InfiniteGrid