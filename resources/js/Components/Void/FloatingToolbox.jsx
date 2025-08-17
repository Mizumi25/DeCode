import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

export default function FloatingToolbox({ tools }) {
  const floatingToolsRef = useRef(null)

  // Floating tools entrance animation
  useEffect(() => {
    const toolElements = floatingToolsRef.current?.children
    if (toolElements) {
      // Set initial state
      gsap.set(toolElements, { 
        x: -100, 
        opacity: 0,
        scale: 0.8
      })
      
      // Animate entrance
      gsap.to(toolElements, {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.5
      })
      
      // Add floating animation
      Array.from(toolElements).forEach((tool, i) => {
        gsap.to(tool, {
          y: Math.sin(i) * 2,
          duration: 2 + Math.random(),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.2
        })
      })
    }
  }, [])

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
      <div 
        ref={floatingToolsRef}
        className="flex flex-col gap-2"
      >
        {tools.map((tool, index) => {
          const Icon = tool.icon
          return (
            <div key={index} className="flex flex-col items-center group">
              {/* Floating Circle - Made much smaller */}
              <button
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-300 ease-out
                  hover:scale-110 hover:-translate-y-1
                  ${tool.isPrimary 
                    ? 'shadow-md hover:shadow-lg' 
                    : 'shadow-sm hover:shadow-md'
                  }
                `}
                style={{
                  backgroundColor: tool.isPrimary 
                    ? 'var(--color-primary)' 
                    : 'var(--color-surface)',
                  boxShadow: tool.isPrimary 
                    ? 'var(--shadow-md), 0 0 15px rgba(160, 82, 255, 0.2)'
                    : 'var(--shadow-sm)',
                  border: tool.isPrimary 
                    ? 'none' 
                    : `1px solid var(--color-border)`
                }}
              >
                <Icon 
                  className={`w-3.5 h-3.5 transition-colors duration-300 ${
                    tool.isPrimary ? 'text-white' : ''
                  }`}
                  style={{
                    color: tool.isPrimary ? 'white' : 'var(--color-text)'
                  }}
                />
              </button>
              
              {/* Floating Label - Made smaller */}
              <span 
                className="mt-1 text-xs font-medium opacity-60 group-hover:opacity-100 transition-opacity duration-300 text-center max-w-[60px]"
                style={{
                  color: 'var(--color-text)',
                  fontSize: '9px'
                }}
              >
                {tool.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}