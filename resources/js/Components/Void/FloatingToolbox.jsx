import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useEditorStore } from '@/stores/useEditorStore'

export default function FloatingToolbox({ tools }) {
  const floatingToolsRef = useRef(null)
  // map index -> label element for GSAP control
  const labelRefs = useRef(new Map())

  // Subscribe to the store to trigger re-renders when panel states change
  const panelStates = useEditorStore(state => state.panelStates)
  const isPanelOpen = useEditorStore(state => state.isPanelOpen)

  // Floating tools entrance animation + hover typing animation setup
  useEffect(() => {
    const toolElements = floatingToolsRef.current?.children
    if (toolElements) {
      // Existing entrance animation (kept)
      gsap.set(toolElements, { 
        x: -100, 
        opacity: 0,
        scale: 0.8
      })
      
      gsap.to(toolElements, {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.5
      })
      
      // Floating animation (kept)
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

      // Add hover listeners to animate the label "typing" to the right.
      Array.from(toolElements).forEach((wrapper) => {
        const idx = wrapper.getAttribute('data-tool-index')
        const labelEl = labelRefs.current.get(idx)
        if (!labelEl) return

        const onEnter = () => {
          // kill any running tweens
          gsap.killTweensOf(labelEl)
          // measure full width needed
          const full = labelEl.scrollWidth
          // prepare
          gsap.set(labelEl, { width: 0, opacity: 1 })
          // animate typing (width from 0 -> full)
          gsap.to(labelEl, { width: full, duration: 0.45, ease: 'power2.out' })
          // add blinking cursor class (CSS handles blink)
          labelEl.classList.add('ftb-cursor')
        }

        const onLeave = () => {
          gsap.killTweensOf(labelEl)
          // collapse
          gsap.to(labelEl, { width: 0, duration: 0.28, ease: 'power2.in', onComplete: () => {
            // hide visually but keep accessible attributes
            gsap.set(labelEl, { opacity: 0 })
            labelEl.classList.remove('ftb-cursor')
          }})
        }

        wrapper.addEventListener('mouseenter', onEnter)
        wrapper.addEventListener('mouseleave', onLeave)
        // touch fallback to show on touchstart, hide on touchend
        wrapper.addEventListener('touchstart', onEnter, { passive: true })
        wrapper.addEventListener('touchend', onLeave)

        // cleanup listeners on unmount
        return () => {
          wrapper.removeEventListener('mouseenter', onEnter)
          wrapper.removeEventListener('mouseleave', onLeave)
          wrapper.removeEventListener('touchstart', onEnter)
          wrapper.removeEventListener('touchend', onLeave)
        }
      })
    }
  }, [])

  const handleToolClick = (tool, e) => {
    console.log('🔥 FloatingToolbox: Button clicked!', tool.label, e);
    e.preventDefault();
    e.stopPropagation();
    
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
      console.log('🎯 Calling tool action:', tool.label);
      tool.action();
    } else {
      console.warn('⚠️ No action defined for tool:', tool.label);
    }
  }

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 pointer-events-auto">
      <div 
        ref={floatingToolsRef}
        className="flex flex-col gap-2 pointer-events-auto"
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
            // wrapper now carries data-tool-index so the effect can hook it
            <div key={index} className="relative group pointer-events-auto" data-tool-index={String(index)}>
              {/* Floating Circle with enhanced active state support (unchanged) */}
              <button
                onClick={(e) => handleToolClick(tool, e)}
                data-tutorial={tool.isPrimary ? "add-frame" : undefined}
                className={`
                  relative w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-300 ease-out
                  hover:scale-110 hover:-translate-y-1 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  overflow-hidden pointer-events-auto cursor-pointer
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
                {/* Badge for notifications (unchanged) */}
                {tool.badge && (
                  <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white px-1">
                      {tool.badge > 9 ? '9+' : tool.badge}
                    </span>
                  </div>
                )}

                {/* Active state indicator (unchanged) */}
                {isActive && !tool.isPrimary && (
                  <div 
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                      background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2))'
                    }}
                  />
                )}
                
                {/* Icon with enhanced styling (unchanged) */}
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
              
              {/* MOVED: label is now an absolutely-positioned element to the right */}
              <div
                className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs font-medium bg-black text-white pointer-events-none"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  width: 0,
                  opacity: 0,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  transition: 'opacity 0.12s linear'
                }}
              >
                <span
                  ref={(el) => {
                    if (!el) return
                    labelRefs.current.set(String(index), el)
                  }}
                  className="ftb-label"
                  style={{
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    verticalAlign: 'middle',
                    // width animated via GSAP; keep border for cursor effect but hidden by default
                    borderRight: '2px solid rgba(255,255,255,0)',
                    boxSizing: 'content-box',
                  }}
                >
                  {tool.label}
                </span>
              </div>

              {/* ...existing helper markers removed: no label under the button anymore... */}
            </div>
          )
        })}
      </div>

      {/* CSS for blinking cursor and small utility (kept inside component for minimal footprint) */}
      <style>{`
        .ftb-label.ftb-cursor {
          border-right-color: rgba(255,255,255,0.95); /* visible cursor while active */
          animation: ftb-blink 0.8s steps(1,start) infinite;
        }
        @keyframes ftb-blink {
          50% { border-right-color: transparent; }
        }
      `}</style>
    </div>
  )
}