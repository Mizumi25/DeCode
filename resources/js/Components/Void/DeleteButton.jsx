import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'

export default function DeleteButton({ zoom = 1 }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFrameHovering, setIsFrameHovering] = useState(false)

  return (
    <div className="fixed left-6 bottom-8 z-40">
      <div 
        className="flex flex-col items-center group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          {/* Animated background glow */}
          <div 
            className={`absolute inset-0 rounded-full bg-red-500 transition-all duration-500 ${
              isHovered || isFrameHovering ? 'scale-150 opacity-20' : 'scale-100 opacity-0'
            }`}
          />
          
          {/* Main button */}
          <button
            className={`relative w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center shadow-xl transition-all duration-300 ease-out ${
              isHovered ? 'scale-110 -translate-y-2' : 'hover:scale-105 hover:-translate-y-1'
            }`}
            style={{
              boxShadow: isHovered 
                ? '0 20px 40px -10px rgba(239, 68, 68, 0.5), 0 10px 20px -5px rgba(0, 0, 0, 0.2)' 
                : '0 10px 25px -5px rgba(239, 68, 68, 0.4), 0 4px 10px -2px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Trash icon with animation */}
            <div className="relative">
              <Trash2 
                className={`w-5 h-5 text-white transition-all duration-300 ${
                  isHovered || isFrameHovering ? 'scale-110 rotate-12' : ''
                }`} 
              />
              
              {/* Animated lid opening effect */}
              {(isHovered || isFrameHovering) && (
                <div className="absolute -top-1 left-1 w-3 h-0.5 bg-white rounded-full transform -rotate-12 origin-left animate-pulse" />
              )}
            </div>
            
            {/* Ripple effect on hover */}
            {isHovered && (
              <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-30" />
            )}
          </button>
          
          {/* Drop zone indicator */}
          <div 
            className={`absolute -inset-4 rounded-full border-2 border-dashed border-red-400 transition-all duration-300 ${
              isFrameHovering ? 'scale-110 opacity-100 border-red-300' : 'scale-100 opacity-0'
            }`}
          />
        </div>
        
        {/* Label with enhanced styling */}
        <div 
          className={`mt-3 px-3 py-1 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isHovered 
              ? 'bg-red-500 bg-opacity-90 text-white scale-105' 
              : 'bg-black bg-opacity-70 text-white'
          }`}
        >
          <span 
            className={`text-xs font-semibold transition-all duration-300 ${
              isHovered ? 'tracking-wider' : ''
            }`}
          >
            {isHovered ? 'Drop to Delete' : 'Delete'}
          </span>
        </div>
        
        {/* Particle effects */}
        {isHovered && (
          <>
            <div className="absolute top-2 left-2 w-1 h-1 bg-red-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0ms' }} />
            <div className="absolute top-3 right-3 w-1 h-1 bg-red-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '200ms' }} />
            <div className="absolute bottom-2 left-3 w-1 h-1 bg-red-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '400ms' }} />
          </>
        )}
      </div>
    </div>
  )
}