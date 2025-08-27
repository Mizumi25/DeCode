import React, { useState, useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'

export default function DeleteButton({ zoom = 1, onFrameDrop = () => {}, isDragActive = false }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFrameHovering, setIsFrameHovering] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const deleteButtonRef = useRef(null)

  // Check if a dragged frame is over the delete button
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragActive || !deleteButtonRef.current) return

      const rect = deleteButtonRef.current.getBoundingClientRect()
      const isOver = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      )

      if (isOver !== isDragOver) {
        setIsDragOver(isOver)
        setIsFrameHovering(isOver)
      }
    }

    if (isDragActive) {
      document.addEventListener('mousemove', handleMouseMove)
      return () => document.removeEventListener('mousemove', handleMouseMove)
    } else {
      setIsDragOver(false)
      setIsFrameHovering(false)
    }
  }, [isDragActive, isDragOver])

  // Handle frame drop
  useEffect(() => {
    const handleMouseUp = (e) => {
      if (isDragOver && isDragActive) {
        onFrameDrop(e)
      }
    }

    if (isDragActive) {
      document.addEventListener('mouseup', handleMouseUp)
      return () => document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragOver, isDragActive, onFrameDrop])

  const isActive = isHovered || isFrameHovering || isDragOver

  return (
    <div 
      className="fixed right-6 bottom-6 z-40" 
      style={{ transform: `scale(${1 / zoom})` }}
    >
      <div
        ref={deleteButtonRef}
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`relative transition-all duration-300 ease-out ${
            isActive ? 'scale-110' : 'scale-100'
          }`}
        >
          {/* Animated background glow */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-500 ${
              isActive 
                ? 'bg-red-500 opacity-20 scale-150 animate-pulse' 
                : 'bg-red-400 opacity-0 scale-100'
            }`}
          />
          
          {/* Main button */}
          <div
            className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              isActive
                ? 'bg-red-500 shadow-2xl'
                : 'bg-red-400 shadow-lg hover:shadow-xl'
            }`}
            style={{
              background: isActive
                ? 'linear-gradient(145deg, #ef4444, #dc2626)'
                : 'linear-gradient(145deg, #f87171, #ef4444)',
              boxShadow: isActive
                ? '0 20px 40px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.2)'
                : '0 10px 20px rgba(239, 68, 68, 0.2)'
            }}
          >
            {/* Trash icon with animation */}
            <div className="relative">
              <Trash2 
                className={`w-6 h-6 text-white transition-all duration-300 ${
                  isActive ? 'animate-bounce' : ''
                }`}
              />
              
              {/* Animated lid opening effect */}
              {isActive && (
                <div
                  className="absolute -top-1 left-1 w-4 h-0.5 bg-white rounded animate-pulse"
                  style={{
                    transform: `rotate(${isActive ? -15 : 0}deg)`,
                    transformOrigin: 'left center'
                  }}
                />
              )}
            </div>
            
            {/* Ripple effect on hover */}
            {isActive && (
              <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping" />
            )}
          </div>
          
          {/* Drop zone indicator */}
          {isDragOver && (
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-white animate-pulse" />
          )}
        </div>
        
        {/* Label with enhanced styling */}
        <div
          className={`absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
            isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="px-3 py-1 bg-black bg-opacity-80 text-white text-xs rounded-lg whitespace-nowrap backdrop-blur-sm">
            {isDragOver ? 'Release to Delete' : isActive ? 'Drop to Delete' : 'Delete'}
          </div>
        </div>
        
        {/* Particle effects */}
        {isActive && (
          <>
            <div className="absolute top-2 left-2 w-1 h-1 bg-red-300 rounded-full animate-bounce delay-100" />
            <div className="absolute top-3 right-3 w-1 h-1 bg-red-300 rounded-full animate-bounce delay-200" />
            <div className="absolute bottom-4 left-4 w-1 h-1 bg-red-300 rounded-full animate-bounce delay-300" />
          </>
        )}
      </div>
    </div>
  )
}