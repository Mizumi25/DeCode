import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const AnimateBlackHoleLogo = ({ className = '', size = 120 }) => {
  const logoRef = useRef(null);
  const verticalDiskRef = useRef(null);
  const horizontalDiskRef = useRef(null);
  const planet1Ref = useRef(null);
  const planet2Ref = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const logo = logoRef.current;
    const verticalDisk = verticalDiskRef.current;
    const horizontalDisk = horizontalDiskRef.current;
    const planet1 = planet1Ref.current;
    const planet2 = planet2Ref.current;
    const glow = glowRef.current;

    if (!logo) return;

    // Timeline for coordinated animations
    const tl = gsap.timeline({ repeat: -1 });

    // Glow pulsing animation
    gsap.to(glow, {
      opacity: 0.3,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });

    // Vertical disk gradient animation (up and down movement)
    gsap.to(verticalDisk.querySelector('defs linearGradient'), {
      attr: { y1: "100%", y2: "0%" },
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });

    // Horizontal disk gradient animation (left to right movement)
    gsap.to(horizontalDisk.querySelector('defs linearGradient'), {
      attr: { x1: "100%", x2: "0%" },
      duration: 2.5,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });

    // Planet 1 orbital animation (horizontal movement)
    tl.to(planet1, {
      x: size * 0.8,
      duration: 4,
      ease: "none"
    })
    .to(planet1, {
      opacity: 0,
      duration: 0.1,
      ease: "none"
    }, "-=2")
    .to(planet1, {
      x: -size * 0.8,
      duration: 0.1,
      ease: "none"
    })
    .to(planet1, {
      opacity: 1,
      duration: 0.1,
      ease: "none"
    })
    .to(planet1, {
      x: 0,
      duration: 4,
      ease: "none"
    });

    // Planet 2 orbital animation (opposite direction, larger orbit)
    gsap.to(planet2, {
      x: -size * 1.2,
      duration: 6,
      ease: "none",
      repeat: -1,
      yoyo: true,
      onRepeat: () => {
        // Hide planet when behind black hole
        gsap.to(planet2, {
          opacity: 0,
          duration: 0.2,
          ease: "none",
          delay: 2.8
        });
        gsap.to(planet2, {
          opacity: 1,
          duration: 0.2,
          ease: "none",
          delay: 3.2
        });
      }
    });

    return () => {
      tl.kill();
      gsap.killTweensOf([glow, verticalDisk, horizontalDisk, planet1, planet2]);
    };
  }, [size]);

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      {/* Glow effect */}
      <div 
        ref={glowRef}
        className="absolute inset-0 rounded-full opacity-60"
        style={{
          background: `radial-gradient(circle, var(--color-primary) 0%, transparent 70%)`,
          filter: 'blur(20px)',
          transform: 'scale(1.5)'
        }}
      />
      
      <motion.div
        ref={logoRef}
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          filter: 'drop-shadow(0 0 20px var(--color-primary))'
        }}
      >
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 675 675" 
          className="overflow-visible"
        >
          <defs>
            {/* Gradients for the disks */}
            <linearGradient id="verticalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.8" />
              <stop offset="30%" stopColor="var(--color-primary)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="1" />
              <stop offset="70%" stopColor="var(--color-primary)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.8" />
            </linearGradient>
            
            <linearGradient id="horizontalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.8" />
              <stop offset="30%" stopColor="var(--color-primary)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="1" />
              <stop offset="70%" stopColor="var(--color-primary)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.8" />
            </linearGradient>

            <radialGradient id="planetGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
              <stop offset="70%" stopColor="var(--color-primary)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.6" />
            </radialGradient>
          </defs>

          {/* Vertical/Bent Disk (Up and Down) */}
          <g ref={verticalDiskRef}>
            <defs>
              <linearGradient id="verticalAnimated" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.8" />
                <stop offset="30%" stopColor="var(--color-primary)" stopOpacity="0.6" />
                <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="1" />
                <stop offset="70%" stopColor="var(--color-primary)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#verticalAnimated)"
              d="m308 136-7 1c-5 0-7 0-8 2l-5 1-7 2-6 3c-3 0-7 1-9 3l-8 3a276 276 0 0 0-45 22c-3 4-4 9-1 11 2 2 5 2 6 0l3-1 4-3 5-3 3-2 3-1 3-2 3-1 4-3 5-3 3-2 4-1c3 0 4-1 5-2l4-1c3 0 4-1 5-2l4-1c3 0 4-1 5-2l4-1c3 0 4-1 5-2l9-1c6 0 8 0 9-2l29-1 28 1c1 2 3 2 9 2l9 1c1 1 2 2 5 2l4 1c1 1 2 2 5 2l4 1c1 1 2 2 5 2l4 1c1 1 2 2 5 2l4 1 3 2 3 1 3 2 5 3c1 2 3 3 5 3l2 1 3 2 3 1c1 1 2 2 5 2 2 0 3 0 3-2l2-3c1-1 1-2-4-6-2-3-5-5-7-5l-2-2-3-1c-2 0-3-1-3-2l-3-1c-2 0-3-1-3-2l-3-1c-2 0-3-1-3-2l-3-1c-2 0-3-1-3-2l-3-1c-2 0-3-1-3-2l-6-1c-4 0-6 0-6-2l-5-1-4-2-5-1-4-2-11-1c-8 0-10 0-10-2l-27-1-27 1z"
            />
            <path 
              fill="url(#verticalAnimated)"
              d="m320 157-10 1c-8 0-10 0-11 2l-6 1c-3 0-5 0-6 2l-6 1c-3 0-5 0-6 2l-3 1-3 2-4 1c-3 0-4 1-5 2l-3 1-3 2-3 1-3 2-3 1-3 2-2 1c-2 0-4 1-5 3l-5 3c-1 0-4 2-6 5l-5 4a254 254 0 0 0-42 45l-1 2-2 3-3 5-3 4-1 3-2 3-1 3c-1 1-2 2-2 5l-1 4-2 3-1 3c-1 1-2 2-2 5l-1 4c-2 1-2 2-2 6l-1 6c-2 1-2 2-2 6l-1 6c-2 1-2 4-2 18l-1 18c-2 1-2 3-2 14l-1 13c-2 1-2 2-2 6l-1 6-2 3-1 3c-1 1-2 2-2 5l-1 4-2 3-3 5c-3 2-4 4-2 6 1 1 2 1 7-2l6-3a134 134 0 0 0 14-9 199 199 0 0 0 17-9l10-6a384 384 0 0 1 30-18l8-4a609 609 0 0 0 83-59 990 990 0 0 0-57 28l-5 2-4 1-3 1-2 2c-2 0-4 1-5 3l-4 3c-3-1-3-16 0-16l1-8c0-5 0-7 2-7l1-5 2-4 1-5 2-4 1-3c0-2 1-3 2-3l1-3c0-1 2-4 5-6l4-6a136 136 0 0 1 34-31l3-2 3-1 3-2 3-1 3-2 4-1c3 0 4-1 5-2l6-1c4 0 5 0 6-2l23-1 22 1c1 2 3 2 6 2l6 1c1 1 2 2 5 2l4 1 3 2 3 1 4 2 2 1c0 1 7 0 9-2l2-1 11-7-6-4c-6-3-13-9-13-12 0-4 7-8 9-5l2 1 5 3 4 3 3 1 3 2 3 1c2 2 4 2 6 1 4-4 30-17 33-17 6 0 8-3 4-5l-3-2-3-1-5-3-4-3-5-3-4-3-5-3c-1-2-3-3-5-3l-2-2-3-1c-2 0-3-1-3-2l-3-1c-2 0-3-1-3-2l-3-1c-2 0-3-1-3-2l-5-1-4-2-5-1-4-2-5-1-4-2-6-1c-4 0-6 0-6-2l-11-1c-8 0-10 0-10-2l-17-1-16 1zm32 41 9 1c6 0 8 0 9 2l6 1 6 2 3 1 4 3c4 3 4 7 0 9l-3 2h-3l-5-2-6-1c-1-1-3-2-7-2l-8-1c-1-2-5-2-20-2-16 0-20 0-21 2l-7 1c-5 0-7 1-8 2l-6 1-6 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1c-1 0-4 2-6 5l-6 4c-2 0-17 15-17 17l-4 6-5 6-3 4-7 12c-5 12-9 14-14 10-2-2-3-5-1-6l1-4c0-3 1-4 3-6l3-5 2-3 1-3 3-4 3-5a310 310 0 0 1 46-43l3-1 3-2 3-1 3-2 3-1 5-2 4-1 3-2 3-1 6-2 6-1c1-2 3-2 9-2l9-1c3-3 29-3 31 0zM202 309c3 2 4 5 2 7l-1 11-1 12c-2 2-2 11-1 14 1 2 1 3-1 6l-3 4c-3 0-6-3-6-5l-1-3c-2-1-2-4-2-18 0-16 0-17 2-22 2-2 3-5 2-5l2-1 3-1c1-2 3-1 5 1zm-13-116-10 12-11 12-4 6-5 6-1 3-2 3-3 5-3 4-1 3-2 3-1 3-2 3-1 3-2 3-1 3c-1 1-2 2-2 5l-1 4c-1 1-2 2-2 5l-1 4c-3 1-2 4 0 6 4 4 11 1 11-4l2-2 1-5 2-4 1-3c0-2 1-3 2-3l1-3c0-2 1-3 2-3l1-3c0-2 1-3 2-3l1-3c0-2 1-3 2-3l1-3 3-5c2-1 3-3 3-5l2-2 1-3 6-8 6-7 9-11c5-4 9-9 9-10 0-3-3-5-8-5-4 0-5 0-5 2zm428 15v2c2 0 3-2 3-4 0-1-3 0-3 2zm18 0-3 1-3 2-2 1c-4 0-9 6-9 10s6 8 8 4l3-1 3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2 4 0 7-8 3-11-2-2-8-3-9-1zm-25 2-4 1-3 2-3 1-5 1-10 5-8 4-3 2-3 1-3 2a212 212 0 0 0-27 13l-6 3a225 225 0 0 0-25 14l-3 1-7 4-13 7a1169 1169 0 0 1-61 33c-3 0-5 3-4 4s1 1 3-1l3-1 3-1 2-2 4-2c3-3 6-1 7 2l2 4 1 4c0 3 1 4 2 5l1 6c0 5 1 7 2 8l1 16-1 15c-2 1-2 2-2 7 0 7-2 17-4 17-1 1-2 2-2 5l-1 4-2 3-6 12-2 2a264 264 0 0 1-44 40l-5 2-5 2c-2 2-13 5-21 7a217 217 0 0 1-51-2c-6-1-11-3-13-5l-3-1-14-7-4-2c-5-3-32-30-32-33 0-4-4-2-17 5l-13 8-3 2a225 225 0 0 0-17 9c-2 1-4 5-3 5l1 3c0 2 2 4 5 7l4 6a176 176 0 0 0 38 35l5 3c1 2 3 3 5 3l2 1 3 2 5 3c2 2 3 3 6 3l4 1 3 2 3 1c1 1 2 2 5 2l4 1c1 1 2 2 5 2l4 1c1 2 3 2 8 2l7 1c1 3 38 2 54 0l17-1c5 0 6 0 7-2l4-1c3 0 4-1 5-2l4-1c3 0 4-1 5-2l3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 4-3 5-3 4-3 5-3a176 176 0 0 0 53-70l2-4 1-3c0-2 1-3 2-3l1-5 2-4 1-6c0-4 0-6 2-6l1-9c0-7 0-9 2-9l1-20-1-19c-2 0-2-2-2-9l-1-9c-2 0-2-2-2-6l-1-6c-2 0-2-2-2-6l-1-6c-1 0-2-1-2-3l-1-3c-1 0-2-1-2-3l-2-3c-2-1-1-4 2-4l4-2 3-1 4-3c3-2 4-3 7-3l6-3 4-3 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1c2 0 4-3 3-4h-4z"
            />
            <path 
              fill="url(#verticalAnimated)"
              d="m590 232-3 1c-2 0-5 3-5 7 0 6 8 8 12 3l5-3c2 0 2-1 2-5v-5h-5c-4 0-5 0-6 2zm-24 12-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1c-4 0-7 8-3 11 2 2 8 3 9 1 0-1 1-2 3-2l3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2l3-1 2-2c5 0 8-8 4-11-2-2-8-3-9-1zm-51 45c-2 2-2 8 0 9l1 7c0 5 0 7 2 8l1 5c0 4 1 6 2 7 2 2 7 2 9 0s2-8 0-9l-1-9-1-9-2-4-2-5c-2-3-7-2-9 0zm-386 14-1 4c-3 1-2 7 0 9s7 2 9 0c2-1 2-4 2-9v-8h-10v4zm288 7v2l1-1c1-2 0-2-1-1zm17 5-3 2c-2 0-2 1-2 7 0 4 0 6 2 7s3 9 2 24c0 11 0 12 2 13 6 1 8-4 8-22 0-21-1-25-5-29-3-4-3-4-4-2zm90 22c-2 1-2 4-2 10l-1 8c-2 1-2 3-2 12l-1 12c-2 1-2 3-2 8l-1 7c-1 1-2 2-2 5l-1 4c-1 1-2 2-2 5l-1 4-2 3-1 3c-1 1-2 2-2 5l-1 4-2 3-3 5-3 4-1 3-2 3-3 5-3 4-7 9c-5 5-8 8-8 10l-2 2-1 5c0 3 1 3 4 4 3 0 4-1 12-8l9-10 3-5 3-4 3-5 3-4 1-3 2-3 1-3 2-3 1-3 2-3c0-2 1-3 2-3l1-3c0-2 1-3 2-3l1-5 2-4 1-5 2-4 1-3 2-13c3-19 4-24 4-36 0-11 0-13-2-14-2-3-4-2-6 0zm-201 22 1 1 1-1-1-2-1 2zm-7 1-3 1-3 1-3 3c-3 1-4 4-2 4l3-2 3-1 3-2 3-1c2 0 4-3 3-4h-4zm-16 10c-1 2 0 3 1 1v-3l-1 2zm115 34c-9 9-10 13-6 16 2 2 3 1 8-4 8-8 9-13 2-14-2 0-3 0-4 2zm-157 14c0 4 0 5 4 7l8 6c5 4 9 5 11 3 3-3 3-5 0-8l-8-7c-6-6-6-6-11-6h-4v5zm118 17-2 1-5 2-5 1-3 1-7 2-8 1h-19l-7-1c-6 0-6 0-7 3s0 6 4 6l8 2a107 107 0 0 0 57-10c5-2 7-5 5-8-1-2-9-3-11 0zm-217 21-3 1-2 1-8 5c-15 7-17 10-15 13 2 2 11 2 12 0l2-2c2 0 4-1 5-3l5-3 3-1 4-3c4-2 5-5 2-7-3-3-4-3-5-1zm26 7c-4 4-3 7 7 17 8 7 10 9 13 9s6-3 6-5l-4-6c-3-2-5-5-5-6s-2-4-5-6c-5-6-9-7-12-3zm-71 17a125 125 0 0 0-12 7 225 225 0 0 0-21 12l-5 3-6 3-4 3c-2 0-13 8-13 10s4 2 6 0l3-2 3-1 3-2 3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2l3-2c3-2 3-8 0-8-2-1-1-1-5 1zm344 6-3 2-4 3-5 3-6 4c-2 3-5 5-6 5l-3 1c0 1-1 2-3 2l-3 1c0 1-1 2-3 2l-3 1c0 1-1 2-3 2l-3 1c0 1-1 2-3 2l-3 2-4 1c-3 0-4 1-5 2l-3 1-3 2-6 1-6 1c-1 2-7 4-13 4l-6 1-20 1c-20 1-29 0-30-3l-9-1-9-1c-1-2-3-2-6-2l-6-1-3-2-3-1c-1-1-2-2-5-2l-4-1-3-2-3-1-3-2-3-1-3-2-3-1-3-2-3-1-3-2-5-3-4-3-5-3c-3-4-5-4-9 0l-3 4 6 6 8 6 5 3c1 2 3 3 5 3l2 2 3 1c2 0 3 1 3 2l3 1c2 0 3 1 3 2l3 1c2 0 3 1 3 2l3 1c2 0 3 1 3 2l5 1 4 2 5 1 4 2 6 1c4 0 6 0 6 2l9 1c7 0 9 0 9 2l8 1a757 757 0 0 1 44-3l24-3 5-1 4-2 5-1 4-2 5-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2l3-1 2-2 5-2 13-9c7-4 21-15 22-17l-3-8-2-2-1 2z"
            />
          </g>

          {/* Horizontal Disk */}
          <g ref={horizontalDiskRef}>
            <defs>
              <linearGradient id="horizontalAnimated" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.8" />
                <stop offset="30%" stopColor="var(--color-primary)" stopOpacity="0.6" />
                <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="1" />
                <stop offset="70%" stopColor="var(--color-primary)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#horizontalAnimated)"
              d="m662 172-3 1-3 2-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-3 1-3 2-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-3 1-3 2-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-6 1c-4 0-5 0-6 2l-24 1h-24l-8 4a519 519 0 0 1-56 31c-21 10-24 12-44 25a904 904 0 0 1-142 78l-50 21c-32 12-57 23-57 25l-2 4-3 3-3 5-3 4-4 6c-3 2-5 5-5 6 0 2-11 13-13 13l-6 4c-2 3-5 5-6 5l-6 4c-2 3-5 5-6 5l-4 3-5 3-4 3-5 3-4 3-5 3-4 3-5 3-4 3-5 3-4 3-5 3-6 4c-2 3-5 5-6 5l-4 3-5 3c-3 0-5 4-5 8v5h5c4 0 5 0 6-2l3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 2-1c2 0 4-1 5-3l3-2 4-2 4-2 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 2-1 3-2 4-2 10-5 12-7 10-5 3-2 3-1 3-2 3-1 3-2 3-1 7-4 7-4 5-2 12-4 25-12c14-5 16-7 18-10 1-2 3-3 5-3l3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 4-3 5-3 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 4-3 5-3 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 4-1c2 0 3 1 3 3 1 8 8 5 37-15 16-11 16-11 16-14s0-4 2-4l4-2 3-1 4-3 6-3 6-3 5-3 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 4-3 5-3 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 2-1c2 0 2-1 2-4 0-2 0-3-2-3l-2-2-4-1-5 1zm-174 72c2 1 3 4 3 5 0 2-5 7-7 7l-3 2-3 1-2 1c-2 3-9-1-9-5 0-3 8-11 10-11l3-1c2-3 5-2 8 1zm-30 15c2 1 3 4 3 5 0 2-5 7-7 7l-2 1c-2 3-9-1-9-5 0-3 8-11 11-11l4 3zm-21 11 2 3c0 3-7 9-12 11l-7 5-4 3-5 2-7 3-2 2-3 1-3 1-3 2-3 1-3 2a376 376 0 0 1-38 19l-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-4 3-5 3-3 1c-1 2-11 3-13 1v-9l9-5 10-5 2-1 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 5-3 4-3 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1c2-3 5-2 8 0zm-150 76c4 2 4 6-1 11l-6 4-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-2 1-7 3c-7 4-10 4-13 1-5-4-4-7 6-11l7-4 2-1 5-3 4-3 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 2-1c1-2 2-2 3-1l3 2zm-84 45c5 5 4 6-4 10l-7 4-6 5c-6 2-7 2-11-2-2-3-2-3-1-6 1-2 5-4 11-7l10-6c2-2 5-1 8 2zm432-183-3 1-3 2-2 1c-4 0-9 6-9 10s6 8 8 4l3-1 3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2 4 0 7-8 3-11-2-2-8-3-9-1zm-45 24-3 1c-2 0-5 3-5 7 0 5 8 7 12 3l5-3c2 0 2-1 2-5v-5h-5c-4 0-5 0-6 2zm-24 12-2 1-4 2-3 2c-2 0-4 3-2 4 0 1 11 0 17-2 3 0 4-4 3-7-1-2-8-3-9 0zM74 497l-4 2-3 2-5 2-3 2-3 1-3 2-2 1c-3 0-6 3-6 5l2 3c1 2 3 2 6 1l6-3 3-2c2 0 16-15 16-17-1-2-2-2-4 1z"
            />
          </g>

          {/* Planet 1 (smaller) */}
          <g ref={planet1Ref} style={{ transformOrigin: '337.5px 337.5px' }}>
            <path 
              fill="url(#planetGradient)"
              d="m47 346-4 1c-3 0-4 1-11 8-8 7-8 8-8 13l-1 5c-2 1-2 5 0 6l1 5c0 5 0 6 6 12 4 3 7 6 9 6l2 1c1 2 3 2 12 2 10 0 10 0 13-3 6-4 11-9 11-10l3-4c2-3 2-4 2-13l-1-11-2-2c0-3-9-12-12-12l-2-2-5-1-4-2-4-1-5 1zm12 12 4 2c2 0 3 1 3 3l2 4 1 8v9l-4 4-6 4-3 2-3 1-3-1-4-2c-4 0-9-4-9-7l-1-3c-2 0-2-2-2-6s0-6 2-6l1-3c0-2 5-7 7-7l3-1c0-3 12-3 12-1z"
            />
          </g>

          {/* Planet 2 (larger) */}
          <g ref={planet2Ref} style={{ transformOrigin: '337.5px 337.5px' }}>
            <path 
              fill="url(#planetGradient)"
              d="m629 409-5 1c-5 0-6 0-8 3l-5 3c-2 0-11 9-11 12l-1 2c-2 1-2 2-2 6l-1 6-2 4c0 3 1 4 2 5l1 4c0 3 1 4 2 5l1 3 2 3 1 2c0 3 6 9 9 9l2 2 3 1c2 0 3 1 3 2l14 1 13-1 2-2c3 0 18-15 18-18l2-2 1-13-1-14-2-2c0-2-1-4-3-5l-3-5c0-2-3-5-6-5l-2-1-3-2-3-1c-1-2-2-2-6-2l-6-1-3-2-3 2z"
            />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};

export default AnimateBlackHoleLogo;