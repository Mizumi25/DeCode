import React, { useRef, useEffect, useMemo } from 'react'
import gsap from 'gsap'

export default function BackgroundLayers({ isDark, scrollPosition }) {
  const starsRef = useRef(null)
  const cloudsRef = useRef(null)

  // Memoize star positions for performance - REDUCED count
  const starPositions = useMemo(() => {
    return Array.from({ length: 75 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.1,
      twinkleDelay: Math.random() * 2
    }))
  }, [])

  // Memoize cloud configurations for performance - REDUCED count
  const cloudConfigs = useMemo(() => {
    // Light mode gradients (more vibrant for visibility)
    const lightGradients = [
      'radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.12), transparent 70%)',
      'radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.15), rgba(59, 130, 246, 0.12), transparent 70%)',
      'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.12), rgba(59, 130, 246, 0.15), transparent 70%)',
    ]
    
    // Dark mode gradients (VERY SUBTLE - barely visible)
    const darkGradients = [
      'radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.02), rgba(147, 51, 234, 0.015), transparent 70%)',
      'radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.02), rgba(59, 130, 246, 0.015), transparent 70%)',
      'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.015), rgba(59, 130, 246, 0.02), transparent 70%)',
    ]
    
    return Array.from({ length: 3 }, (_, i) => ({
      x: Math.random() * 120 - 10,
      y: Math.random() * 120 - 10,
      size: Math.random() * 40 + 80,
      lightGradient: lightGradients[i],
      darkGradient: darkGradients[i],
      moveSpeed: Math.random() * 20 + 15,
      scaleSpeed: Math.random() * 1 + 0.5
    }))
  }, [])

  // Update parallax positions based on scroll - OPTIMIZED
  useEffect(() => {
    const stars = starsRef.current
    const clouds = cloudsRef.current
    
    if (stars && clouds) {
      // REDUCED parallax calculations for better performance
      const starsOffsetX = (scrollPosition.x * 0.05) % 50
      const starsOffsetY = (scrollPosition.y * 0.05) % 50
      stars.style.transform = `translate3d(-${starsOffsetX}px, -${starsOffsetY}px, 0)`
      
      const cloudsOffsetX = (scrollPosition.x * 0.15) % 50
      const cloudsOffsetY = (scrollPosition.y * 0.15) % 50
      clouds.style.transform = `translate3d(-${cloudsOffsetX}px, -${cloudsOffsetY}px, 0)`
    }
  }, [scrollPosition])

  // Theme-based animations
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
            opacity: 0.03,
            scale: 0.6,
            duration: 2,
            delay: i * 0.1,
            ease: "power2.out"
          })
          
          // Gentle movement
          gsap.to(cloud, {
            x: `+=${config.moveSpeed * 0.2}`,
            y: `+=${config.moveSpeed * 0.05}`,
            duration: 15,
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
    <>
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
    </>
  )
}