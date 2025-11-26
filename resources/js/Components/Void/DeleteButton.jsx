import React, { useState, useEffect, useRef } from 'react'
import { Trash2, Trash } from 'lucide-react'

export default function DeleteButton({ zoom = 1, onFrameDrop = () => {}, isDragActive = false }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFrameHovering, setIsFrameHovering] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isNearby, setIsNearby] = useState(false)
  const [vibrationIntensity, setVibrationIntensity] = useState(0)
  const deleteButtonRef = useRef(null)

  // Enhanced frame hover detection with proximity zones and vibration
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragActive || !deleteButtonRef.current) return

      const rect = deleteButtonRef.current.getBoundingClientRect()
      
      // Calculate distance from mouse to delete button center
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + 
        Math.pow(e.clientY - centerY, 2)
      )
      
      // Proximity zones
      const HOVER_ZONE = 100 // Direct hover zone
      const NEARBY_ZONE = 250 // "Near" detection zone
      const VIBRATION_START = 200 // Start vibrating
      
      // Check if directly over delete button
      const isDirectlyOver = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      )
      
      // Check if in hover zone
      const isInHoverZone = distance < HOVER_ZONE
      
      // Check if nearby
      const isInNearbyZone = distance < NEARBY_ZONE
      
      // Calculate vibration intensity (0-1) based on distance
      let vibration = 0
      if (distance < VIBRATION_START && distance > HOVER_ZONE) {
        vibration = 1 - ((distance - HOVER_ZONE) / (VIBRATION_START - HOVER_ZONE))
      }
      
      setIsDragOver(isDirectlyOver)
      setIsFrameHovering(isInHoverZone || isDirectlyOver)
      setIsNearby(isInNearbyZone)
      setVibrationIntensity(vibration)
      
      // Dispatch event for frames to listen to
      if (isInNearbyZone) {
        window.dispatchEvent(new CustomEvent('deleteButtonProximity', {
          detail: {
            distance,
            isNearby: isInNearbyZone,
            isHovering: isInHoverZone || isDirectlyOver,
            isDragOver: isDirectlyOver,
            vibrationIntensity: vibration,
            buttonRect: rect
          }
        }))
      }
    }

    // Listen for frame hover events from frames
    const handleFrameHover = (e) => {
      if (e.detail?.isHoveringDelete) {
        setIsFrameHovering(true)
      }
    }

    const handleFrameLeave = (e) => {
      if (e.detail?.isHoveringDelete === false) {
        setIsFrameHovering(false)
      }
    }

    if (isDragActive) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('frameHoverDelete', handleFrameHover)
      document.addEventListener('frameLeaveDelete', handleFrameLeave)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('frameHoverDelete', handleFrameHover)
        document.removeEventListener('frameLeaveDelete', handleFrameLeave)
      }
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

  const isActive = isHovered || isFrameHovering || isDragOver || isNearby
  const showOpenTrash = isFrameHovering || isDragOver
  
  // Calculate scale based on state
  const getScale = () => {
    if (isDragOver) return 1.3 // Largest when hovering
    if (isFrameHovering) return 1.2
    if (isNearby) return 1.1
    return 1
  }
  
  // Calculate vibration offset
  const getVibrationOffset = () => {
    if (vibrationIntensity > 0 && !isDragOver) {
      const maxOffset = 3
      const offsetX = (Math.random() - 0.5) * maxOffset * vibrationIntensity
      const offsetY = (Math.random() - 0.5) * maxOffset * vibrationIntensity
      return { x: offsetX, y: offsetY }
    }
    return { x: 0, y: 0 }
  }
  
  const vibrationOffset = getVibrationOffset()

  return (
    <div 
      className="fixed right-6 bottom-6 z-50 pointer-events-auto" // Ensure it's clickable
      style={{ 
        transform: `scale(${getScale()}) translate(${vibrationOffset.x}px, ${vibrationOffset.y}px)`, 
        transformOrigin: 'bottom right',
        transition: vibrationIntensity > 0 ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      <div
        ref={deleteButtonRef}
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`relative transition-all duration-300 ease-out`}
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
            {/* Dynamic trash icon - changes when frame is hovering */}
            <div className="relative">
              {showOpenTrash ? (
                // Open trash icon when frame is hovering
                <div className="relative">
                  <Trash 
                    className={`w-6 h-6 text-white transition-all duration-300 ${
                      isActive ? 'animate-bounce' : ''
                    }`}
                  />
                  {/* Animated lid opening effect */}
                  <div
                    className="absolute -top-2 -left-1 w-8 h-1 bg-white rounded transform -rotate-12 transition-all duration-300"
                    style={{
                      transform: `rotate(-15deg) translateY(-2px)`
                    }}
                  />
                </div>
              ) : (
                // Closed trash icon normally
                <Trash2 
                  className={`w-6 h-6 text-white transition-all duration-300 ${
                    isActive ? 'animate-bounce' : ''
                  }`}
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