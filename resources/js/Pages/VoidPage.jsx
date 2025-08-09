import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import { Head } from '@inertiajs/react'
import { Plus, Layers, FolderOpen, Code, Users, Upload, Briefcase, Trash2 } from 'lucide-react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import Panel from '@/Components/Panel'
import PreviewFrame from '@/Components/Void/PreviewFrame'

export default function VoidPage({ isDark: initialIsDark }) {
  const starsRef = useRef(null)
  const cloudsRef = useRef(null)
  const floatingToolsRef = useRef(null)
  const canvasRef = useRef(null)
  const [isDark, setIsDark] = useState(initialIsDark || false)
  
  // Infinite scroll state - REDUCED scroll bounds and sensitivity
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 })
  const scrollBounds = { width: 2000, height: 1500 } // REDUCED from 4000x3000

  // Sample frames data - DISTRIBUTED across the scroll area
  const [frames] = useState([
    { id: 1, title: 'Frame1', fileName: 'File1', x: 200, y: 150 },
    { id: 2, title: 'Frame2', fileName: 'File2', x: 600, y: 200 },
    { id: 3, title: 'Frame3', fileName: 'File3', x: 400, y: 400 },
    { id: 4, title: 'Frame4', fileName: 'File4', x: 800, y: 300 },
    { id: 5, title: 'Frame5', fileName: 'File5', x: 300, y: 600 },
    { id: 6, title: 'Frame6', fileName: 'File6', x: 1200, y: 250 },
    { id: 7, title: 'Frame7', fileName: 'File7', x: 1000, y: 500 },
    { id: 8, title: 'Frame8', fileName: 'File8', x: 1500, y: 350 },
  ])
  
  // Infinite scroll handlers
  const handlePointerDown = (e) => {
    setIsDragging(true)
    setLastPointerPos({ 
      x: e.clientX || e.touches?.[0]?.clientX, 
      y: e.clientY || e.touches?.[0]?.clientY 
    })
    document.body.style.cursor = 'grabbing'
    e.preventDefault()
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    
    const currentX = e.clientX || e.touches?.[0]?.clientX
    const currentY = e.clientY || e.touches?.[0]?.clientY
    
    // REDUCED sensitivity - multiply by 0.3 to make it slower
    const deltaX = (currentX - lastPointerPos.x) * 0.3
    const deltaY = (currentY - lastPointerPos.y) * 0.3
    
    setScrollPosition(prev => {
      let newX = prev.x - deltaX
      let newY = prev.y - deltaY
      
      // IMPROVED Loop boundaries - use modulo for seamless wrapping
      newX = ((newX % scrollBounds.width) + scrollBounds.width) % scrollBounds.width
      newY = ((newY % scrollBounds.height) + scrollBounds.height) % scrollBounds.height
      
      return { x: newX, y: newY }
    })
    
    setLastPointerPos({ x: currentX, y: currentY })
    e.preventDefault()
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    document.body.style.cursor = ''
  }

  const handleWheel = (e) => {
    // REDUCED wheel sensitivity - multiply by 0.2 to make it much slower
    const deltaX = e.deltaX * 0.2
    const deltaY = e.deltaY * 0.2
    
    setScrollPosition(prev => {
      let newX = prev.x + deltaX
      let newY = prev.y + deltaY
      
      // IMPROVED Loop boundaries - use modulo for seamless wrapping
      newX = ((newX % scrollBounds.width) + scrollBounds.width) % scrollBounds.width
      newY = ((newY % scrollBounds.height) + scrollBounds.height) % scrollBounds.height
      
      return { x: newX, y: newY }
    })
    
    e.preventDefault()
  }

  // Attach scroll handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Mouse events
    canvas.addEventListener('mousedown', handlePointerDown)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    
    // Touch events
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false })
    
    // Global events
    document.addEventListener('mousemove', handlePointerMove)
    document.addEventListener('mouseup', handlePointerUp)
    document.addEventListener('touchmove', handlePointerMove, { passive: false })
    document.addEventListener('touchend', handlePointerUp)

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('mousemove', handlePointerMove)
      document.removeEventListener('mouseup', handlePointerUp)
      document.removeEventListener('touchmove', handlePointerMove)
      document.removeEventListener('touchend', handlePointerUp)
    }
  }, [isDragging, lastPointerPos])

  // Handle theme changes from the header
  const handleThemeChange = (darkMode) => {
    setIsDark(darkMode)
  }

  // Update parallax positions based on scroll
  useEffect(() => {
    const stars = starsRef.current
    const clouds = cloudsRef.current
    
    if (stars && clouds) {
      // Stars parallax (far background - slower movement)
      const starsOffsetX = (scrollPosition.x * 0.1) % 100
      const starsOffsetY = (scrollPosition.y * 0.1) % 100
      stars.style.transform = `translate3d(-${starsOffsetX}px, -${starsOffsetY}px, 0)`
      
      // Clouds parallax (mid background - medium movement)
      const cloudsOffsetX = (scrollPosition.x * 0.3) % 100
      const cloudsOffsetY = (scrollPosition.y * 0.3) % 100
      clouds.style.transform = `translate3d(-${cloudsOffsetX}px, -${cloudsOffsetY}px, 0)`
    }
  }, [scrollPosition])

  // Panel handlers
  const handlePanelClose = (panelId) => {
    console.log('Closing panel:', panelId)
    // You can implement panel close logic here
  }

  const handlePanelMaximize = (panelId) => {
    console.log('Maximizing panel:', panelId)
    // You can implement panel maximize logic here
  }

  // Floating tools configuration
  const floatingTools = [
    { icon: Plus, label: 'New Frame', isPrimary: true },
    { icon: Layers, label: 'Frames', isPrimary: false },
    { icon: FolderOpen, label: 'Project Files', isPrimary: false },
    { icon: Code, label: 'Code Handler', isPrimary: false },
    { icon: Users, label: 'Team Collaborations', isPrimary: false },
    { icon: Upload, label: 'Import', isPrimary: false },
    { icon: Briefcase, label: 'Project', isPrimary: false }
  ]

  // Memoize star positions for performance
  const starPositions = useMemo(() => {
    return Array.from({ length: 150 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.1,
      twinkleDelay: Math.random() * 2
    }))
  }, [])

  // Memoize cloud configurations for performance - with separate dark/light mode gradients
  const cloudConfigs = useMemo(() => {
    // Light mode gradients (more vibrant for visibility)
    const lightGradients = [
      'radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.12), transparent 70%)',
      'radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.15), rgba(59, 130, 246, 0.12), transparent 70%)',
      'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.12), rgba(59, 130, 246, 0.15), transparent 70%)',
      'radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.12), rgba(59, 130, 246, 0.10), transparent 70%)',
      'radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.12), rgba(236, 72, 153, 0.12), transparent 70%)',
      'radial-gradient(circle at 60% 40%, rgba(14, 165, 233, 0.15), rgba(168, 85, 247, 0.10), transparent 70%)'
    ]
    
    // Dark mode gradients (VERY SUBTLE - barely visible)
    const darkGradients = [
      'radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.02), rgba(147, 51, 234, 0.015), transparent 70%)',
      'radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.02), rgba(59, 130, 246, 0.015), transparent 70%)',
      'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.015), rgba(59, 130, 246, 0.02), transparent 70%)',
      'radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.015), rgba(59, 130, 246, 0.01), transparent 70%)',
      'radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.015), rgba(236, 72, 153, 0.015), transparent 70%)',
      'radial-gradient(circle at 60% 40%, rgba(14, 165, 233, 0.02), rgba(168, 85, 247, 0.01), transparent 70%)'
    ]
    
    return Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * 120 - 10,
      y: Math.random() * 120 - 10,
      size: Math.random() * 40 + 80,
      lightGradient: lightGradients[i],
      darkGradient: darkGradients[i],
      moveSpeed: Math.random() * 20 + 15,
      scaleSpeed: Math.random() * 1 + 0.5
    }))
  }, [])

  // Floating tools entrance animation
  useEffect(() => {
    const tools = floatingToolsRef.current?.children
    if (tools) {
      // Set initial state
      gsap.set(tools, { 
        x: -100, 
        opacity: 0,
        scale: 0.8
      })
      
      // Animate entrance
      gsap.to(tools, {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.5
      })

      // Add floating animation
      Array.from(tools).forEach((tool, i) => {
        gsap.to(tool, {
          y: Math.sin(i) * 3,
          duration: 2 + Math.random(),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.2
        })
      })
    }
  }, [])

  useEffect(() => {
    if (isDark) {
      // OPTIMIZED STAR MODE (dark) - with twinkling and subtle movement
      const stars = starsRef.current?.children
      if (stars) {
        Array.from(stars).forEach((star, i) => {
          const config = starPositions[i]
          
          // Initial fade in
          gsap.to(star, {
            opacity: 1,
            duration: 1,
            delay: i * 0.005,
            ease: "power2.out"
          })
          
          // Continuous twinkling
          gsap.to(star, {
            opacity: 0.3,
            duration: config.speed,
            repeat: -1,
            yoyo: true,
            delay: config.twinkleDelay,
            ease: "sine.inOut"
          })
          
          // Subtle floating movement
          gsap.to(star, {
            x: `+=${Math.random() * 4 - 2}`,
            y: `+=${Math.random() * 4 - 2}`,
            duration: 4 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 2
          })
        })
      }
      
      // VERY SUBTLE clouds in dark mode - barely visible
      const clouds = cloudsRef.current?.children
      if (clouds) {
        Array.from(clouds).forEach((cloud, i) => {
          const config = cloudConfigs[i]
          
          gsap.to(cloud, {
            opacity: 0.03, // MUCH MORE SUBTLE - from 0.08 to 0.03
            scale: 0.6,    // Smaller scale too
            duration: 2,
            delay: i * 0.1,
            ease: "power2.out"
          })
          
          // Gentle movement
          gsap.to(cloud, {
            x: `+=${config.moveSpeed * 0.2}`, // Less movement
            y: `+=${config.moveSpeed * 0.05}`, // Much less vertical movement
            duration: 15, // Slower movement
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 2
          })
        })
      }
    } else {
      // LIGHT MODE - subtle clouds, no stars
      const clouds = cloudsRef.current?.children
      if (clouds) {
        Array.from(clouds).forEach((cloud, i) => {
          const config = cloudConfigs[i]
          
          // Fade in with scale
          gsap.to(cloud, {
            opacity: 0.25,
            scale: 1,
            duration: 2,
            delay: i * 0.1,
            ease: "power2.out"
          })
          
          // Continuous floating movement
          gsap.to(cloud, {
            x: `+=${config.moveSpeed * 0.5}`,
            y: `+=${config.moveSpeed * 0.2}`,
            duration: 10,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 2
          })
          
          // Breathing scale animation
          gsap.to(cloud, {
            scale: 1.05,
            duration: config.scaleSpeed + 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random()
          })
        })
      }
      
      // Hide stars in light mode
      gsap.to(starsRef.current?.children || [], { 
        opacity: 0, 
        duration: 1 
      })
    }
  }, [isDark, starPositions, cloudConfigs])

  // Optimized star rendering with CSS transforms for hardware acceleration
  const renderStars = () => {
    return starPositions.map((config, i) => (
      <div
        key={i}
        className="absolute bg-white opacity-0 rounded-full"
        style={{
          top: `${config.y}%`,
          left: `${config.x}%`,
          width: `${config.size}px`,
          height: `${config.size}px`,
          boxShadow: `0 0 ${config.size * 3}px rgba(255, 255, 255, 0.8)`,
          transform: 'translate3d(0, 0, 0)',
          willChange: 'opacity, transform'
        }}
      />
    ))
  }

  // Optimized cloud rendering with theme-specific gradients
  const renderClouds = () => {
    return cloudConfigs.map((config, i) => (
      <div
        key={i}
        className="absolute rounded-full opacity-0"
        style={{
          width: `${config.size}vw`,
          height: `${config.size}vw`,
          top: `${config.y}%`,
          left: `${config.x}%`,
          background: isDark ? config.darkGradient : config.lightGradient,
          filter: 'blur(80px)',
          transform: 'translate3d(-50%, -50%, 0) scale(0.8)',
          willChange: 'opacity, transform, filter'
        }}
      />
    ))
  }

  return (
    <AuthenticatedLayout onThemeChange={handleThemeChange}>
      <Head title="VoidPage" />
      <div 
        ref={canvasRef}
        className={`relative w-full h-screen overflow-hidden transition-colors duration-1000 cursor-grab ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
            : 'bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50'
        }`}
        style={{
          backgroundColor: isDark ? 'var(--color-bg)' : 'var(--color-bg)',
          userSelect: 'none',
          touchAction: 'none'
        }}
      >
        {/* Stars layer with hardware acceleration */}
        <div 
          ref={starsRef} 
          className="absolute inset-0" 
          style={{ 
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden'
          }}
        >
          {renderStars()}
        </div>
        
        {/* Clouds layer with hardware acceleration */}
        <div 
          ref={cloudsRef} 
          className="absolute inset-0" 
          style={{ 
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden'
          }}
        >
          {renderClouds()}
        </div>

        {/* Floating Tools Panel */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20">
          <div 
            ref={floatingToolsRef}
            className="flex flex-col gap-4"
          >
            {floatingTools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <div key={index} className="flex flex-col items-center group">
                  {/* Floating Circle */}
                  <button
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      transition-all duration-300 ease-out
                      hover:scale-110 hover:-translate-y-1
                      ${tool.isPrimary 
                        ? 'shadow-lg hover:shadow-xl' 
                        : 'shadow-md hover:shadow-lg'
                      }
                    `}
                    style={{
                      backgroundColor: tool.isPrimary 
                        ? 'var(--color-primary)' 
                        : 'var(--color-surface)',
                      boxShadow: tool.isPrimary 
                        ? 'var(--shadow-lg), 0 0 20px rgba(160, 82, 255, 0.3)'
                        : 'var(--shadow-md)',
                      border: tool.isPrimary 
                        ? 'none' 
                        : `1px solid var(--color-border)`
                    }}
                  >
                    <Icon 
                      className={`w-5 h-5 transition-colors duration-300 ${
                        tool.isPrimary ? 'text-white' : ''
                      }`}
                      style={{
                        color: tool.isPrimary ? 'white' : 'var(--color-text)'
                      }}
                    />
                  </button>
                  
                  {/* Floating Label */}
                  <span 
                    className="mt-2 text-xs font-medium opacity-70 group-hover:opacity-100 transition-opacity duration-300 text-center max-w-[80px]"
                    style={{
                      color: 'var(--color-text)',
                      fontSize: 'var(--fs-sm)'
                    }}
                  >
                    {tool.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Floating Trash Can - positioned at the bottom left of the left panel */}
        <div className="absolute left-8 bottom-8 z-20">
          <div className="flex flex-col items-center group">
            <button
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-1"
              style={{
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
              }}
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
            <span 
              className="mt-2 text-xs font-medium opacity-70 group-hover:opacity-100 transition-opacity duration-300 text-center"
              style={{
                color: 'var(--color-text)',
                fontSize: 'var(--fs-sm)'
              }}
            >
              Delete
            </span>
          </div>
        </div>
        
        {/* Preview Frames Layer - IMPROVED infinite scroll */}
        <div 
          className="absolute z-15"
          style={{
            // Create a repeating pattern by using multiple transforms
            width: `${scrollBounds.width * 3}px`,
            height: `${scrollBounds.height * 3}px`,
            left: '-50%',
            top: '-50%',
            transform: `translate3d(-${scrollPosition.x}px, -${scrollPosition.y}px, 0)`,
            willChange: 'transform'
          }}
        >
          {/* Render frames in a 3x3 grid pattern for seamless infinite scroll */}
          {[-1, 0, 1].map(xOffset => 
            [-1, 0, 1].map(yOffset => 
              frames.map((frame, index) => (
                <PreviewFrame
                  key={`${frame.id}-${xOffset}-${yOffset}`}
                  title={frame.title}
                  fileName={frame.fileName}
                  index={index}
                  x={frame.x + (xOffset * scrollBounds.width)}
                  y={frame.y + (yOffset * scrollBounds.height)}
                />
              ))
            )
          )}
        </div>
        

        
        {/* Dockable Panel - RIGHT SIDE ONLY with 2 stacked panels */}
        <Panel
          isOpen={true}
          panels={[
            {
              id: 'files-panel', 
              title: 'Project Files',
              content: (
                <div>
                  <h4 className="font-semibold mb-4 text-[var(--color-text)]">File Explorer</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 p-2 hover:bg-[var(--color-bg-hover)] rounded cursor-pointer">
                      <FolderOpen className="w-4 h-4 text-[var(--color-primary)]" />
                      <span className="text-sm text-[var(--color-text)]">src/</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-[var(--color-bg-hover)] rounded cursor-pointer ml-4">
                      <Code className="w-4 h-4 text-[var(--color-text-muted)]" />
                      <span className="text-sm text-[var(--color-text)]">components/</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-[var(--color-bg-hover)] rounded cursor-pointer ml-4">
                      <Code className="w-4 h-4 text-[var(--color-text-muted)]" />
                      <span className="text-sm text-[var(--color-text)]">pages/</span>
                    </div>
                  </div>
                </div>
              ),
              closable: true
            },
            {
              id: 'frames-panel',
              title: 'Frames',
              content: (
                <div>
                  <h4 className="font-semibold mb-4 text-[var(--color-text)]">Frame Manager</h4>
                  <div className="space-y-2">
                    {frames.map((frame) => (
                      <div key={frame.id} className="p-3 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border)]">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[var(--color-primary)]" />
                          <span className="text-sm text-[var(--color-text)]">{frame.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
              closable: true
            }
          ]}
          allowedDockPositions={['right']} // ONLY RIGHT SIDE DOCKING
          onPanelClose={handlePanelClose}
          onPanelMaximize={handlePanelMaximize}
        />
      </div>
    </AuthenticatedLayout>
  )
}