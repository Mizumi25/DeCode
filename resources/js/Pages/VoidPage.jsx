import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import { Head } from '@inertiajs/react'
import { Plus, Layers, FolderOpen, Code, Users, Upload, Briefcase } from 'lucide-react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'

export default function VoidPage({ isDark: initialIsDark }) {
  const starsRef = useRef(null)
  const cloudsRef = useRef(null)
  const floatingToolsRef = useRef(null)
  const [isDark, setIsDark] = useState(initialIsDark || false)
  
  // Handle theme changes from the header
  const handleThemeChange = (darkMode) => {
    setIsDark(darkMode)
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

  // Memoize cloud configurations for performance  
  const cloudConfigs = useMemo(() => {
    const gradients = [
      'radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.12), transparent 70%)',
      'radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.15), rgba(59, 130, 246, 0.12), transparent 70%)',
      'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.12), rgba(59, 130, 246, 0.15), transparent 70%)',
      'radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.12), rgba(59, 130, 246, 0.10), transparent 70%)',
      'radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.12), rgba(236, 72, 153, 0.12), transparent 70%)',
      'radial-gradient(circle at 60% 40%, rgba(14, 165, 233, 0.15), rgba(168, 85, 247, 0.10), transparent 70%)'
    ]
    
    return Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * 120 - 10,
      y: Math.random() * 120 - 10,
      size: Math.random() * 40 + 80,
      gradient: gradients[i],
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
      
      // Subtle clouds in dark mode
      const clouds = cloudsRef.current?.children
      if (clouds) {
        Array.from(clouds).forEach((cloud, i) => {
          const config = cloudConfigs[i]
          
          gsap.to(cloud, {
            opacity: 0.08,
            scale: 0.8,
            duration: 2,
            delay: i * 0.1,
            ease: "power2.out"
          })
          
          // Gentle movement
          gsap.to(cloud, {
            x: `+=${config.moveSpeed * 0.3}`,
            y: `+=${config.moveSpeed * 0.1}`,
            duration: 12,
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

  // Optimized cloud rendering with modern gradients
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
          background: config.gradient,
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
        className={`relative w-full h-screen overflow-hidden transition-colors duration-1000 ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
            : 'bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50'
        }`}
        style={{
          backgroundColor: isDark ? 'var(--color-bg)' : 'var(--color-bg)'
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
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <h1 className={`text-5xl font-bold mb-4 transition-all duration-1000 ${
              isDark 
                ? 'bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent'
            }`}>
              {isDark ? 'Starry Void' : 'Dream Cloud'}
            </h1>
            <p 
              className="text-lg transition-colors duration-1000"
              style={{
                color: isDark ? 'var(--color-text-muted)' : 'var(--color-text-muted)'
              }}
            >
              {isDark ? 'Watch the stars dance in the cosmic void' : 'Floating through subtle dreams'}
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}