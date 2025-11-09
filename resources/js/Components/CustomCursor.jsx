import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  // Reimplemented custom cursor:
  const [isTouch, setIsTouch] = useState(false);
  const [cursorState, setCursorState] = useState('default'); // pointer, text, grab, grabbing, move, etc.
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Immediate dot follows pointer exactly
  const dotX = cursorX;
  const dotY = cursorY;

  // Chasing ring uses springs for smooth delayed follow
  const chaseX = useSpring(cursorX, { damping: 40, stiffness: 60 });
  const chaseY = useSpring(cursorY, { damping: 40, stiffness: 60 });


  // Sizes
  const DOT_SIZE = 8; // px, desktop
  const DOT_SIZE_TOUCH = 12;
  const RING_SIZE = 30;
  const RING_SIZE_COMPACT = 20;
  const RING_BORDER = 2;

  // Detect touch devices
  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0 ||
        window.matchMedia?.('(pointer: coarse)')?.matches
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
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Update cursor position (instant for dot) - Also listen to drag events
  useEffect(() => {
    if (isTouch) return;
    const handleMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    
    // 🔥 FIX: Listen to pointermove during drag (not just mousemove)
    const handlePointerMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointermove', handlePointerMove); // During drag
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isTouch, cursorX, cursorY]);

  // Basic element-based cursor state detection (preserves previous behavior)
  const updateCursorStateForElement = (target) => {
    if (!target) {
      setCursorState('default');
      return;
    }
    if (target.matches('input[type="text"], textarea, [contenteditable]')) {
      setCursorState('text');
    } else if (target.matches('[draggable="true"], .cursor-grab')) {
      setCursorState('grab');
    } else if (target.matches('button, a, [role="button"], .cursor-pointer')) {
      setCursorState('pointer');
    } else if (target.matches('.cursor-move')) {
      setCursorState('move');
    } else {
      setCursorState('default');
    }
  };

  // Track hover / down events to detect grabbing - Also listen to drag events
  useEffect(() => {
    if (isTouch) return;

    const handleOver = (e) => updateCursorStateForElement(e.target);
    const handleDown = (e) => {
      const target = e.target;
      if (target.matches('[draggable="true"], .cursor-grab, [data-component-id]')) {
        setCursorState('grabbing');
      }
    };
    const handleUp = () => {
      // revert to pointer/text depending on element under cursor
      const el = document.elementFromPoint(cursorX.get(), cursorY.get());
      updateCursorStateForElement(el);
    };
    
    // 🔥 FIX: Listen to drag events to keep cursor state
    const handleDragStart = () => {
      setCursorState('grabbing');
    };
    const handleDragEnd = () => {
      const el = document.elementFromPoint(cursorX.get(), cursorY.get());
      updateCursorStateForElement(el);
    };

    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('pointerdown', handleDown);
    document.addEventListener('pointerup', handleUp);
    window.addEventListener('element-drag-start', handleDragStart);
    window.addEventListener('element-drag-end', handleDragEnd);
    
    return () => {
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('pointerdown', handleDown);
      document.removeEventListener('pointerup', handleUp);
      window.removeEventListener('element-drag-start', handleDragStart);
      window.removeEventListener('element-drag-end', handleDragEnd);
    };
  }, [isTouch, cursorX, cursorY]);

  // Compact ring condition: hovering (pointer), typing (text) or dragging (grabbing)
  const isRingCompact = ['pointer', 'text', 'grabbing'].includes(cursorState);

  // Hide entirely on touch devices (use native touch interactions)
  if (isTouch) return null;

  return (
    <>
      {/* hide native cursor for mouse devices */}
      <style>{`
        .mouse-device * { cursor: none !important; }
        .mouse-device body { cursor: none !important; }
        /* ring transition helper */
        .custom-cursor-ring { transition: width 220ms ease, height 220ms ease, transform 220ms ease; }
      `}</style>

      {/* Instant small filled dot (no delay) - Visible on white canvas */}
      <motion.div
        className="fixed pointer-events-none z-[99999] rounded-full"
        style={{
          left: dotX,
          top: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: DOT_SIZE,
          height: DOT_SIZE,
          background: 'var(--color-text)',
          pointerEvents: 'none',
          // 🔥 FIX: Add shadow/outline for visibility on white
          boxShadow: '0 0 0 1px rgba(255,255,255,0.8), 0 0 4px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)',
          filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))'
        }}
      />

      {/* Chasing thin-ring (delayed) - Visible on white canvas */}
      <motion.div
        className="fixed pointer-events-none z-[99998] rounded-full custom-cursor-ring"
        style={{
          left: chaseX,
          top: chaseY,
          translateX: '-50%',
          translateY: '-50%',
          width: isRingCompact ? RING_SIZE_COMPACT : RING_SIZE,
          height: isRingCompact ? RING_SIZE_COMPACT : RING_SIZE,
          borderRadius: '50%',
          border: `${RING_BORDER}px solid var(--color-primary)`,
          background: 'transparent',
          // 🔥 FIX: Add stronger shadow for visibility on white
          boxShadow: '0 0 0 1px rgba(255,255,255,0.9), 0 6px 18px rgba(0,0,0,0.15), 0 0 12px rgba(59, 130, 246, 0.3)',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        }}
      />
    </>
  );
};

export default CustomCursor;