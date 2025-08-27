import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Plug, Lock, Unlock, MoreHorizontal } from 'lucide-react'

const sizes = [
  { w: 80, h: 56 },
  { w: 64, h: 96 },
  { w: 72, h: 72 },
  { w: 52, h: 40 },
  { w: 96, h: 64 },
]

export default function PreviewFrame({ 
  title = 'Untitled', 
  index = 0, 
  x = 0, 
  y = 0, 
  fileName = 'File1',
  frameId,
  frame = null, // Full frame object for navigation
  isDragging = false,
  isLoading = false,
  onDragStart,
  onDrag,
  onDragEnd,
  onFrameClick, // New prop for handling frame clicks
  zoom = 1,
  isDraggable = true,
  isDark = false
}) {
  const size = sizes[index % sizes.length]
  const [isLocked, setIsLocked] = useState(true)
  const [showLoadingContent, setShowLoadingContent] = useState(isLoading)
  const frameRef = useRef(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [hasDragged, setHasDragged] = useState(false)
  
  // Dummy avatar colors for stacked avatars
  const avatarColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500']

  // Simulate loading completion after 2-4 seconds
  useEffect(() => {
    if (isLoading) {
      const loadingTime = 2000 + Math.random() * 2000 // 2-4 seconds
      const timer = setTimeout(() => {
        setShowLoadingContent(false)
      }, loadingTime)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  const handleFrameClick = (e) => {
    // Prevent navigation if:
    // 1. Clicking on interactive elements
    // 2. Currently dragging
    // 3. Mouse was dragged (not a click)
    if (e.target.closest('.lock-button') || 
        e.target.closest('.more-button') || 
        e.target.closest('.avatar') ||
        isDragging || 
        isMouseDown ||
        hasDragged) {
      return
    }
    
    // Call the frame click handler if provided
    if (onFrameClick && frame) {
      onFrameClick(frame)
    }
  }

  const handleLockToggle = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsLocked(!isLocked)
  }

  // Drag functionality
  const handleMouseDown = useCallback((e) => {
    // Only allow dragging if not clicking on interactive elements
    if (e.target.closest('.lock-button') || 
        e.target.closest('.more-button') || 
        e.target.closest('.avatar') ||
        !isDraggable) {
      return
    }
    
    e.stopPropagation()
    e.preventDefault()
    
    const startX = e.clientX
    const startY = e.clientY
    const startFrameX = x
    const startFrameY = y
    
    setDragOffset({ 
      x: startX - startFrameX * zoom, 
      y: startY - startFrameY * zoom 
    })
    setIsMouseDown(true)
    setHasDragged(false) // Reset drag state
    
    if (onDragStart) {
      onDragStart(frameId)
    }
  }, [isDraggable, frameId, x, y, onDragStart, zoom])

  const handleMouseMove = useCallback((e) => {
    if (!isMouseDown || !isDraggable) return
    
    e.preventDefault()
    e.stopPropagation()
    
    // Mark as dragged if moved more than a threshold
    if (!hasDragged) {
      const threshold = 5 // pixels
      const deltaX = Math.abs(e.clientX - (x * zoom + dragOffset.x))
      const deltaY = Math.abs(e.clientY - (y * zoom + dragOffset.y))
      
      if (deltaX > threshold || deltaY > threshold) {
        setHasDragged(true)
      }
    }
    
    // Calculate new position
    const newX = (e.clientX - dragOffset.x) / zoom
    const newY = (e.clientY - dragOffset.y) / zoom
    
    if (onDrag) {
      onDrag(frameId, Math.max(0, newX), Math.max(0, newY))
    }
  }, [isMouseDown, isDraggable, dragOffset, zoom, frameId, onDrag, x, y, hasDragged])

  const handleMouseUp = useCallback(() => {
    if (isMouseDown) {
      setIsMouseDown(false)
      if (onDragEnd) {
        onDragEnd(frameId)
      }
      
      // Reset drag state after a short delay to allow click detection
      setTimeout(() => {
        setHasDragged(false)
      }, 10)
    }
  }, [isMouseDown, frameId, onDragEnd])

  // Attach global mouse events for dragging
  useEffect(() => {
    if (isMouseDown) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isMouseDown, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={frameRef}
      className={`preview-frame absolute rounded-xl p-3 cursor-pointer transition-all duration-300 ease-out flex flex-col group ${
        isDragging ? 'shadow-2xl scale-105 z-50' : 'shadow-lg hover:shadow-xl hover:-translate-y-1'
      } ${isLocked ? '' : 'ring-2 ring-blue-400 ring-opacity-50'}`}
      style={{
        top: y,
        left: x,
        width: `${size.w * 4}px`,
        height: `${size.h * 4}px`,
        backgroundColor: 'var(--color-surface)',
        borderColor: 'transparent',
        boxShadow: isDragging 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
          : '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(10px)',
        background: isDark 
          ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' 
          : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      onClick={handleFrameClick}
      onMouseDown={handleMouseDown}
    >
      {/* Top Header with Frame Info and Controls */}
      <div className="flex items-center justify-between mb-3 -mt-1">
        {/* Left: Frame name and file connection */}
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span className="font-semibold text-sm">{title}</span>
          <span className="opacity-60">•</span>
          <span className="opacity-80">({fileName})</span>
          <Plug className="w-3.5 h-3.5 opacity-60" />
        </div>
        
        {/* Right: Lock, Avatars, and More options */}
        <div className="flex items-center gap-2">
          {/* Lock/Unlock toggle button */}
          <button 
            className="lock-button p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-500 ease-out hover:scale-110 group relative overflow-hidden"
            onClick={handleLockToggle}
            title={isLocked ? 'Unlock frame' : 'Lock frame'}
            style={{
              background: isLocked 
                ? 'transparent' 
                : 'linear-gradient(145deg, #3b82f6, #1d4ed8)',
              transform: `rotate(${isLocked ? 0 : -15}deg)`,
              boxShadow: isLocked 
                ? 'none' 
                : '0 4px 15px rgba(59, 130, 246, 0.3)',
            }}
          >
            <div className="relative z-10">
              <div 
                className="transition-all duration-500 ease-out"
                style={{
                  transform: `scale(${isLocked ? 1 : 1.1}) rotate(${isLocked ? 0 : 10}deg)`
                }}
              >
                {isLocked ? (
                  <Lock className="w-3.5 h-3.5 transition-all duration-500" 
                        style={{ color: 'var(--color-text-muted)' }} />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-white transition-all duration-500" />
                )}
              </div>
              
              {/* Animated unlock effect */}
              {!isLocked && (
                <>
                  <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-30 animate-pulse"
                    style={{ animationDuration: '2s' }}
                  ></div>
                </>
              )}
              
              {/* Smooth background transition */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500 ease-out ${
                  isLocked ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                }`}
                style={{ zIndex: -1 }}
              ></div>
            </div>
          </button>
          
          {/* Stacked avatars */}
          <div className="flex -space-x-1.5">
            {avatarColors.map((color, i) => (
              <div
                key={i}
                className={`avatar w-5 h-5 rounded-full border-2 border-white ${color} flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-200 cursor-pointer`}
                style={{ fontSize: '9px', color: 'white', fontWeight: 'bold' }}
                onClick={(e) => e.stopPropagation()}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          
          {/* More options */}
          <button 
            className="more-button p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 hover:scale-110"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="rounded-lg mb-3 flex-1 relative overflow-hidden">
        {showLoadingContent ? (
          /* Loading State */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <svg className="w-8 h-8 animate-spin mb-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <div className="text-xs opacity-60 font-medium">Loading preview...</div>
          </div>
        ) : (
          /* Static Preview Content */
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg overflow-hidden relative">
            {/* Mock webpage content */}
            <div className="absolute inset-0 p-3">
              {/* Mock header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              
              {/* Mock content blocks */}
              <div className="space-y-2">
                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-6 bg-blue-200 dark:bg-blue-800 rounded mt-3"></div>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom mock lines - only show when not loading */}
      {!showLoadingContent && (
        <div className="space-y-2">
          <div
            className="rounded-full transition-all duration-300 group-hover:bg-blue-300"
            style={{
              height: '4px',
              width: '70%',
              backgroundColor: 'var(--color-border)',
            }}
          />
          <div
            className="rounded-full transition-all duration-300 group-hover:bg-blue-300"
            style={{
              height: '4px',
              width: '50%',
              backgroundColor: 'var(--color-border)',
            }}
          />
        </div>
      )}
      
      {/* Drag indicator */}
      {isDragging && (
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
      )}
    </div>
  )
}