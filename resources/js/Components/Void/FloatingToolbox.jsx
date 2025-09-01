import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useEditorStore } from '@/stores/useEditorStore'

export default function FloatingToolbox({ tools }) {
  const floatingToolsRef = useRef(null)
  
  // Subscribe to the store to trigger re-renders when panel states change
  const panelStates = useEditorStore(state => state.panelStates)
  const isPanelOpen = useEditorStore(state => state.isPanelOpen)

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

  const handleToolClick = (tool, e) => {
    e.stopPropagation()
    
    // Enhanced visual feedback animation for active states
    gsap.to(e.currentTarget, {
      scale: tool.isActive ? 0.95 : 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    })

    // Add a subtle pulse effect for panel toggles
    if (tool.isActive !== undefined) {
      gsap.to(e.currentTarget.querySelector('.tool-icon'), {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
      })
    }

    // Call the tool's action if it exists
    if (tool.action && typeof tool.action === 'function') {
      tool.action()
    }
  }

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
      <div 
        ref={floatingToolsRef}
        className="flex flex-col gap-2"
      >
        {tools.map((tool, index) => {
          const Icon = tool.icon
          
          // Determine active state directly from store instead of relying on passed prop
          let isActive = false
          if (tool.label === 'Frames') {
            isActive = isPanelOpen('frames-panel')
          } else if (tool.label === 'Project Files') {
            isActive = isPanelOpen('files-panel')
          } else if (tool.label === 'Code Handler') {
            isActive = isPanelOpen('code-panel')
          } else if (tool.label === 'Team Collaborations') {
            isActive = isPanelOpen('team-panel')
          }
          
          return (
            <div key={index} className="flex flex-col items-center group">
              {/* Floating Circle with enhanced active state support */}
              <button
                onClick={(e) => handleToolClick(tool, e)}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-300 ease-out
                  hover:scale-110 hover:-translate-y-1 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  relative overflow-hidden
                  ${tool.isPrimary 
                    ? 'shadow-md hover:shadow-lg' 
                    : 'shadow-sm hover:shadow-md'
                  }
                  ${isActive 
                    ? 'ring-2 ring-blue-400 ring-opacity-60' 
                    : ''
                  }
                `}
                style={{
                  backgroundColor: tool.isPrimary 
                    ? 'var(--color-primary)' 
                    : isActive
                      ? 'var(--color-primary)'
                      : 'var(--color-surface)',
                  boxShadow: tool.isPrimary 
                    ? 'var(--shadow-md), 0 0 15px rgba(160, 82, 255, 0.2)'
                    : isActive
                      ? 'var(--shadow-md), 0 0 10px rgba(59, 130, 246, 0.3)'
                      : 'var(--shadow-sm)',
                  border: tool.isPrimary || isActive
                    ? 'none' 
                    : `1px solid var(--color-border)`
                }}
                title={tool.label}
                aria-label={tool.label}
                aria-pressed={isActive}
              >
                {/* Active state indicator */}
                {isActive && !tool.isPrimary && (
                  <div 
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                      background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2))'
                    }}
                  />
                )}
                
                {/* Icon with enhanced styling */}
                <Icon 
                  className={`
                    tool-icon w-3.5 h-3.5 transition-all duration-300 relative z-10
                    ${tool.isPrimary || isActive ? 'text-white' : ''}
                  `}
                  style={{
                    color: tool.isPrimary || isActive ? 'white' : 'var(--color-text)',
                    filter: isActive && !tool.isPrimary ? 'drop-shadow(0 0 2px rgba(255,255,255,0.3))' : 'none'
                  }}
                />
              </button>
              
              {/* Floating Label with active state indicator */}
              <span 
                className={`
                  mt-1 text-xs font-medium transition-all duration-300 text-center max-w-[60px]
                  ${isActive ? 'opacity-90 font-semibold' : 'opacity-60 group-hover:opacity-100'}
                `}
                style={{
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  fontSize: '9px'
                }}
              >
                {tool.label}
                {isActive && (
                  <div 
                    className="w-1 h-1 rounded-full mx-auto mt-0.5 bg-blue-400 animate-pulse"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}