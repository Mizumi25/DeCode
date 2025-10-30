import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

const CustomCursor = () => {
  const [cursorState, setCursorState] = useState('default');
  const [isTouch, setIsTouch] = useState(false);
  const [touchPoint, setTouchPoint] = useState(null);
  const [isIdle, setIsIdle] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [cssVariables, setCssVariables] = useState({});
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  
  const idleTimeoutRef = useRef(null);
  const rippleIdRef = useRef(0);
  const touchTimeoutRef = useRef(null);

  // Get CSS variables from document
  useEffect(() => {
    const getCssVariable = (name) => {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    };

    const updateCssVariables = () => {
      try {
        const primary = getCssVariable('--color-primary') || '#a052f3';
        const primaryHover = getCssVariable('--color-primary-hover') || '#8a3ffb';
        
        setCssVariables({
          primary,
          primaryHover,
          // Fallback colors if variables aren't found
          blue: '#3b82f6',
          green: '#22c55e',
          red: '#ef4444',
          yellow: '#f59e0b',
          purple: '#a855f7',
          pink: '#ec4899'
        });
      } catch (error) {
        console.warn('Could not load CSS variables, using fallbacks');
        setCssVariables({
          primary: '#a052f3',
          primaryHover: '#8a3ffb',
          blue: '#3b82f6',
          green: '#22c55e',
          red: '#ef4444',
          yellow: '#f59e0b',
          purple: '#a855f7',
          pink: '#ec4899'
        });
      }
    };

    updateCssVariables();
    window.addEventListener('resize', updateCssVariables);
    
    return () => window.removeEventListener('resize', updateCssVariables);
  }, []);

  // Enhanced touch detection with multiple methods
  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0 ||
        (window.DocumentTouch && document instanceof DocumentTouch) ||
        window.matchMedia('(pointer: coarse)').matches
      );
      
      setIsTouch(hasTouch);
      
      if (hasTouch) {
        document.documentElement.classList.add('touch-device');
        document.documentElement.classList.remove('mouse-device');
      } else {
        document.documentElement.classList.add('mouse-device');
        document.documentElement.classList.remove('touch-device');
      }
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    
    return () => {
      window.removeEventListener('resize', checkTouch);
    };
  }, []);

  // Touch interaction handlers
  useEffect(() => {
    if (!isTouch) return;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const id = rippleIdRef.current++;
      
      setTouchPoint({
        id,
        x: touch.clientX,
        y: touch.clientY,
        visible: true,
        timestamp: Date.now()
      });

      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      updateCursorStateForElement(target);

      setRipples(prev => [...prev, { 
        id: rippleIdRef.current++, 
        x: touch.clientX, 
        y: touch.clientY,
        type: 'touch'
      }]);

      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      touchTimeoutRef.current = setTimeout(() => {
        setTouchPoint(prev => prev ? { ...prev, visible: false } : null);
      }, 300);

      setIsIdle(false);
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 2000);
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      
      setTouchPoint(prev => prev ? {
        ...prev,
        x: touch.clientX,
        y: touch.clientY,
        visible: true
      } : null);

      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      updateCursorStateForElement(target);

      setIsIdle(false);
      clearTimeout(idleTimeoutRef.current);
      clearTimeout(touchTimeoutRef.current);
    };

    const handleTouchEnd = () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      touchTimeoutRef.current = setTimeout(() => {
        setTouchPoint(prev => prev ? { ...prev, visible: false } : null);
      }, 500);

      if (cursorState === 'grabbing') {
        setCursorState('grab');
      }
      setIsDragging(false);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(touchTimeoutRef.current);
    };
  }, [isTouch, cursorState]);

  // Mouse tracking (only for non-touch devices)
  useEffect(() => {
    if (isTouch) return;

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        setIsIdle(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isTouch, cursorX, cursorY]);

  // Click ripple effect for both mouse and touch
  useEffect(() => {
    const handleClick = (e) => {
      const id = rippleIdRef.current++;
      setRipples(prev => [...prev, { 
        id, 
        x: e.clientX || (e.touches?.[0]?.clientX), 
        y: e.clientY || (e.touches?.[0]?.clientY),
        type: isTouch ? 'touch' : 'mouse'
      }]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    };

    const eventType = isTouch ? 'touchstart' : 'click';
    window.addEventListener(eventType, handleClick);
    
    return () => window.removeEventListener(eventType, handleClick);
  }, [isTouch]);

  // Enhanced cursor state detection
  const updateCursorStateForElement = (target) => {
    if (!target) return;
    
    if (target.matches('button, a, [role="button"], .cursor-pointer')) {
      setCursorState('pointer');
    } else if (target.matches('input[type="text"], textarea, [contenteditable]')) {
      setCursorState('text');
    } else if (target.matches('[draggable="true"], .cursor-grab')) {
      setCursorState(isDragging ? 'grabbing' : 'grab');
    } else if (target.matches('.cursor-move')) {
      setCursorState('move');
    } else if (target.matches('.cursor-zoom-in')) {
      setCursorState('zoom-in');
    } else if (target.matches('.cursor-zoom-out')) {
      setCursorState('zoom-out');
    } else if (target.matches('.cursor-help')) {
      setCursorState('help');
    } else if (target.matches('.cursor-wait')) {
      setCursorState('wait');
    } else if (target.matches('.cursor-not-allowed, :disabled')) {
      setCursorState('not-allowed');
    } else {
      setCursorState('default');
    }
  };

  useEffect(() => {
    if (isTouch) return;

    const handleMouseOver = (e) => {
      updateCursorStateForElement(e.target);
    };

    const handleMouseDown = (e) => {
      const target = e.target;
      if (target.matches('[draggable="true"], .cursor-grab')) {
        setCursorState('grabbing');
        setIsDragging(true);
      }
    };

    const handleMouseUp = () => {
      if (cursorState === 'grabbing') {
        setCursorState('grab');
      }
      setIsDragging(false);
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isTouch, cursorState]);

  // Idle detection for both device types
  useEffect(() => {
    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, isTouch ? 1500 : 3000);
    };

    const events = isTouch 
      ? ['touchstart', 'touchmove'] 
      : ['mousemove', 'mousedown', 'keydown', 'scroll'];

    events.forEach(event => {
      window.addEventListener(event, resetIdle);
    });

    resetIdle();

    return () => {
      clearTimeout(idleTimeoutRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetIdle);
      });
    };
  }, [isTouch]);

  // Get cursor config based on state with actual colors
  const getCursorConfig = () => {
    const colors = {
      default: cssVariables.primary || '#a052f3',
      pointer: cssVariables.primary || '#a052f3',
      grab: cssVariables.yellow || '#f59e0b',
      grabbing: cssVariables.yellow || '#f59e0b',
      move: cssVariables.purple || '#a855f7',
      'zoom-in': cssVariables.green || '#22c55e',
      'zoom-out': cssVariables.red || '#ef4444',
      help: cssVariables.blue || '#3b82f6',
      wait: cssVariables.purple || '#a855f7',
      'not-allowed': cssVariables.red || '#ef4444',
      text: '#ffffff'
    };

    const configs = {
      default: { 
        size: isTouch ? 44 : 32, 
        blur: isTouch ? 20 : 16, 
        opacity: isTouch ? 0.7 : 0.6, 
        color: `rgba(160, 82, 243, 0.8)`,
        innerSize: 0
      },
      idle: { 
        size: isTouch ? 40 : 28, 
        blur: isTouch ? 22 : 18, 
        opacity: isTouch ? 0.4 : 0.3, 
        color: `rgba(160, 82, 243, 0.5)`,
        innerSize: 0
      },
      pointer: { 
        size: isTouch ? 48 : 36, 
        blur: isTouch ? 22 : 18, 
        opacity: isTouch ? 0.9 : 0.85, 
        color: colors.pointer ? `rgba(${hexToRgb(colors.pointer).r}, ${hexToRgb(colors.pointer).g}, ${hexToRgb(colors.pointer).b}, 0.9)` : 'rgba(160, 82, 243, 0.9)',
        innerSize: 0,
        pulse: true
      },
      text: { 
        size: isTouch ? 44 : 32, 
        blur: isTouch ? 18 : 14, 
        opacity: isTouch ? 0.8 : 0.7, 
        color: 'rgba(255, 255, 255, 0.7)',
        innerSize: isTouch ? 4 : 2,
        innerHeight: isTouch ? 24 : 20
      },
      grab: { 
        size: isTouch ? 50 : 38, 
        blur: isTouch ? 24 : 20, 
        opacity: isTouch ? 0.8 : 0.75, 
        color: colors.grab ? `rgba(${hexToRgb(colors.grab).r}, ${hexToRgb(colors.grab).g}, ${hexToRgb(colors.grab).b}, 0.8)` : 'rgba(245, 158, 11, 0.8)',
        innerSize: 0
      },
      grabbing: { 
        size: isTouch ? 54 : 42, 
        blur: isTouch ? 28 : 24, 
        opacity: isTouch ? 1 : 0.9, 
        color: colors.grabbing ? `rgba(${hexToRgb(colors.grabbing).r}, ${hexToRgb(colors.grabbing).g}, ${hexToRgb(colors.grabbing).b}, 1)` : 'rgba(245, 158, 11, 1)',
        innerSize: 0,
        trail: true
      },
      move: { 
        size: isTouch ? 48 : 36, 
        blur: isTouch ? 22 : 18, 
        opacity: isTouch ? 0.9 : 0.8, 
        color: colors.move ? `rgba(${hexToRgb(colors.move).r}, ${hexToRgb(colors.move).g}, ${hexToRgb(colors.move).b}, 0.8)` : 'rgba(168, 85, 247, 0.8)',
        innerSize: 0,
        crosshair: true
      },
      'zoom-in': { 
        size: isTouch ? 52 : 40, 
        blur: isTouch ? 24 : 20, 
        opacity: isTouch ? 0.9 : 0.85, 
        color: colors['zoom-in'] ? `rgba(${hexToRgb(colors['zoom-in']).r}, ${hexToRgb(colors['zoom-in']).g}, ${hexToRgb(colors['zoom-in']).b}, 0.8)` : 'rgba(34, 197, 94, 0.8)',
        innerSize: 0,
        icon: '+'
      },
      'zoom-out': { 
        size: isTouch ? 52 : 40, 
        blur: isTouch ? 24 : 20, 
        opacity: isTouch ? 0.9 : 0.85, 
        color: colors['zoom-out'] ? `rgba(${hexToRgb(colors['zoom-out']).r}, ${hexToRgb(colors['zoom-out']).g}, ${hexToRgb(colors['zoom-out']).b}, 0.8)` : 'rgba(239, 68, 68, 0.8)',
        innerSize: 0,
        icon: '−'
      },
      help: { 
        size: isTouch ? 48 : 36, 
        blur: isTouch ? 22 : 18, 
        opacity: isTouch ? 0.9 : 0.8, 
        color: colors.help ? `rgba(${hexToRgb(colors.help).r}, ${hexToRgb(colors.help).g}, ${hexToRgb(colors.help).b}, 0.9)` : 'rgba(59, 130, 246, 0.9)',
        innerSize: 0,
        icon: '?'
      },
      wait: { 
        size: isTouch ? 46 : 34, 
        blur: isTouch ? 22 : 18, 
        opacity: isTouch ? 0.9 : 0.8, 
        color: colors.wait ? `rgba(${hexToRgb(colors.wait).r}, ${hexToRgb(colors.wait).g}, ${hexToRgb(colors.wait).b}, 0.8)` : 'rgba(160, 82, 243, 0.8)',
        innerSize: 0,
        spinner: true
      },
      'not-allowed': { 
        size: isTouch ? 48 : 36, 
        blur: isTouch ? 22 : 18, 
        opacity: isTouch ? 1 : 0.9, 
        color: colors['not-allowed'] ? `rgba(${hexToRgb(colors['not-allowed']).r}, ${hexToRgb(colors['not-allowed']).g}, ${hexToRgb(colors['not-allowed']).b}, 0.9)` : 'rgba(239, 68, 68, 0.9)',
        innerSize: 0,
        icon: '✕'
      }
    };

    return configs[isIdle ? 'idle' : cursorState] || configs.default;
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    // Remove the hash if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex values
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  const config = getCursorConfig();

  // Hide on touch when idle
  if (isTouch && isIdle && !touchPoint?.visible) return null;

  return (
    <>
      <style>{`
        .mouse-device * {
          cursor: none !important;
        }
        
        .mouse-device body {
          cursor: none !important;
        }

        .touch-device * {
          cursor: default !important;
          -webkit-tap-highlight-color: transparent;
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes touch-pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        .cursor-trail {
          filter: blur(${config.blur * 1.5}px);
          opacity: 0.3;
        }
      `}</style>

      {/* Mouse Cursor (only for non-touch devices) */}
      {!isTouch && (
        <>
          {/* Main Cursor Blob */}
          <motion.div
            style={{
              left: cursorXSpring,
              top: cursorYSpring,
              x: '-50%',
              y: '-50%',
              width: config.size,
              height: config.size,
              opacity: config.opacity,
              background: config.color,
              filter: `blur(${config.blur}px)`,
              boxShadow: `0 0 ${config.blur * 2}px ${config.color}`,
              animation: config.pulse ? 'pulse-glow 2s ease-in-out infinite' : 'none'
            }}
            animate={{
              width: config.size,
              height: config.size,
              opacity: config.opacity,
            }}
            transition={{
              width: { type: 'spring', damping: 20, stiffness: 300 },
              height: { type: 'spring', damping: 20, stiffness: 300 },
              opacity: { duration: 0.2 }
            }}
            className="fixed pointer-events-none z-[99999] rounded-full"
          />

          {/* Inner Cursor (for text mode) */}
          <AnimatePresence>
            {config.innerSize > 0 && (
              <motion.div
                style={{
                  left: cursorXSpring,
                  top: cursorYSpring,
                  x: '-50%',
                  y: '-50%',
                  width: config.innerSize,
                  height: config.innerHeight || config.innerSize,
                  background: 'white',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed pointer-events-none z-[100000] rounded-full"
              />
            )}
          </AnimatePresence>

          {/* Icon/Text Overlay */}
          <AnimatePresence>
            {config.icon && (
              <motion.div
                style={{
                  left: cursorXSpring,
                  top: cursorYSpring,
                  x: '-50%',
                  y: '-50%',
                  fontSize: '14px',
                  textShadow: '0 0 4px rgba(0, 0, 0, 0.5)'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed pointer-events-none z-[100001] flex items-center justify-center text-white font-bold"
              >
                {config.icon}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spinner for wait state */}
          <AnimatePresence>
            {config.spinner && (
              <motion.div
                style={{
                  left: cursorXSpring,
                  top: cursorYSpring,
                  x: '-50%',
                  y: '-50%',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed pointer-events-none z-[100001]"
              >
                <div 
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  style={{ animation: 'spin 0.8s linear infinite' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Crosshair for move state */}
          <AnimatePresence>
            {config.crosshair && (
              <motion.div
                style={{
                  left: cursorXSpring,
                  top: cursorYSpring,
                  x: '-50%',
                  y: '-50%',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="fixed pointer-events-none z-[100001]"
              >
                <div className="absolute w-8 h-0.5 bg-white blur-sm" style={{ left: '-16px', top: 0 }} />
                <div className="absolute w-0.5 h-8 bg-white blur-sm" style={{ left: 0, top: '-16px' }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trail effect for grabbing */}
          {config.trail && (
            <motion.div
              style={{
                left: cursorXSpring,
                top: cursorYSpring,
                x: '-50%',
                y: '-50%',
                width: config.size * 1.2,
                height: config.size * 1.2,
                background: config.color,
                filter: `blur(${config.blur * 1.5}px)`,
                opacity: 0.3
              }}
              className="fixed pointer-events-none z-[99997] rounded-full cursor-trail"
            />
          )}
        </>
      )}

      {/* Touch Point (only for touch devices) */}
      {isTouch && touchPoint?.visible && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed pointer-events-none z-[99999] rounded-full"
          style={{
            left: touchPoint.x,
            top: touchPoint.y,
            width: config.size,
            height: config.size,
            background: config.color,
            filter: `blur(${config.blur}px)`,
            boxShadow: `0 0 ${config.blur * 2}px ${config.color}`,
            transform: 'translate(-50%, -50%)',
            animation: 'touch-pulse 0.8s ease-in-out infinite'
          }}
        />
      )}

      {/* Ripples for both device types */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            initial={{ 
              scale: 0, 
              opacity: 0.8,
              left: ripple.x,
              top: ripple.y,
              x: '-50%',
              y: '-50%'
            }}
            animate={{ 
              scale: ripple.type === 'touch' ? 2.5 : 3, 
              opacity: 0 
            }}
            transition={{ 
              duration: ripple.type === 'touch' ? 0.4 : 0.6,
              ease: 'easeOut'
            }}
            className="fixed pointer-events-none z-[99998] rounded-full border-2 border-white"
            style={{
              width: ripple.type === 'touch' ? 50 : 40,
              height: ripple.type === 'touch' ? 50 : 40,
            }}
          />
        ))}
      </AnimatePresence>
    </>
  );
};

export default CustomCursor;