import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';

/**
 * Props:
 * - emotion: 'idle' | 'surprised' | 'error' | 'success'
 * - inputFocused: boolean (optional) - if parent wants to indicate an input is focused
 * - className: optional extra classes for positioning
 */
const StarMascot = ({ emotion = 'idle', inputFocused = false, className = '' }) => {
  const rootRef = useRef(null);
  const faceRef = useRef(null);
  const leftArmRef = useRef(null);
  const rightArmRef = useRef(null);
  const tlRef = useRef(null);

  // mouse follow (for eyes)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const eyeX = useSpring(mouseX, { stiffness: 200, damping: 25 });
  const eyeY = useSpring(mouseY, { stiffness: 200, damping: 25 });

  // blinking
  const [isBlinking, setIsBlinking] = useState(false);

  // local emotion to run entrance/idle TLs only when changed
  const lastEmotion = useRef('idle');

  useEffect(() => {
    // Entrance animation using GSAP
    const el = rootRef.current;
    if (!el) return;

    const tl = gsap.timeline();
    tl.fromTo(
      el,
      { y: -40, scale: 0.9, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.6)' }
    )
      .to(el, { y: -6, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 'floating')
      .fromTo(
        [leftArmRef.current, rightArmRef.current],
        { rotate: -20, scale: 0.9, y: 4 },
        { rotate: 6, scale: 1, y: 0, duration: 1.2, stagger: 0.08, ease: 'sine.inOut', repeat: -1, yoyo: true },
        'floating+=0.1'
      );

    tlRef.current = tl;

    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, []);

  // mouse move handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!faceRef.current) return;
      const rect = faceRef.current.getBoundingClientRect();
      // center of face
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // scale down the look distance
      const lookMax = 6;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = Math.min(dist / 150, 1) * lookMax;

      const angle = Math.atan2(dy, dx);
      const x = Math.cos(angle) * factor;
      const y = Math.sin(angle) * factor;

      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // random blinking
  useEffect(() => {
    let mounted = true;
    const blinkLoop = () => {
      if (!mounted) return;
      const delay = 2000 + Math.random() * 3000;
      setTimeout(() => {
        if (!mounted) return;
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 120);
        blinkLoop();
      }, delay);
    };
    blinkLoop();
    return () => {
      mounted = false;
    };
  }, []);

  // reaction timeline for emotion changes
  useEffect(() => {
    const root = rootRef.current;
    const leftArm = leftArmRef.current;
    const rightArm = rightArmRef.current;

    if (!root) return;
    // avoid stacking many timelines
    gsap.killTweensOf([root, leftArm, rightArm]);

    // Idle — ensure floating (we keep base TL running from entrance)
    if (emotion === 'idle') {
      lastEmotion.current = 'idle';
      return;
    }

    // Surprise: little scale pop + widen eyes
    if (emotion === 'surprised') {
      const tl = gsap.timeline();
      tl.to(root, { scale: 1.08, duration: 0.12, ease: 'power2.out' })
        .to(root, { scale: 1, duration: 0.3, ease: 'back.out(1.2)' });
      // arms lift slightly
      gsap.to([leftArm, rightArm], { y: -6, duration: 0.18, yoyo: true, repeat: 1, ease: 'sine.out' });
      lastEmotion.current = 'surprised';
      return;
    }

    // Error: quick horizontal shake
    if (emotion === 'error') {
      const tl = gsap.timeline();
      tl.to(root, { x: -12, duration: 0.06, ease: 'power2.inOut', repeat: 6, yoyo: true })
        .to(root, { x: 0, duration: 0.12, ease: 'power2.out' });
      // arms clench inwards
      gsap.to([leftArm, rightArm], { rotate: (i) => (i ? -10 : 10), duration: 0.08, yoyo: true, repeat: 6 });
      lastEmotion.current = 'error';
      return;
    }

    // Success: vertical nod / little pop up and twinkle
    if (emotion === 'success') {
      const tl = gsap.timeline();
      tl.to(root, { y: -18, duration: 0.22, ease: 'power2.out' })
        .to(root, { y: 0, duration: 0.6, ease: 'bounce.out' });
      // arms wave up a bit
      gsap.to([leftArm, rightArm], { y: -8, duration: 0.24, rotate: (i) => (i ? 6 : -6), ease: 'power2.out', yoyo: true, repeat: 1 });
      lastEmotion.current = 'success';
      return;
    }
  }, [emotion]);

  // small CSS-friendly inline sizes so it's easy to tweak
  const size = 88;

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none select-none ${className}`}
      style={{
        width: size,
        height: size,
        position: 'absolute',
        left: '50%',
        top: '2.6rem', // tune relative to your form
        transform: 'translateX(-50%)',
        zIndex: 0,
      }}
      aria-hidden
    >
      {/* Shadow */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{
          width: size * 0.7,
          height: 8,
          borderRadius: 999,
          filter: 'blur(6px)',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.18), rgba(0,0,0,0.06))',
          transform: 'translateY(18px) scaleX(1.05)'
        }} />
      </div>

      {/* Body (SVG star-like soft blob) */}
      <div style={{ width: size, height: size, position: 'relative' }} ref={faceRef}>
        <svg viewBox="0 0 160 160" width={size} height={size} className="block">
          <defs>
            <radialGradient id="gradA" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#FFF7E6" />
              <stop offset="70%" stopColor="#FFE66D" />
              <stop offset="100%" stopColor="#FFD23F" />
            </radialGradient>
            <filter id="glow" x="-40%" y="-40%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* chubby star-like blob path (soft) */}
          <path
            d="M80 12 C88 12 96 16 104 24 L116 46 C120 50 126 54 132 54 L142 56 C148 56 152 60 152 66 C152 72 148 78 140 86 L124 102 C120 106 118 112 120 120 L126 140 C128 148 126 152 120 152 C114 152 106 148 96 140 L80 128 C76 126 72 126 68 128 L52 140 C40 148 32 152 26 152 C20 152 18 148 20 140 L28 120 C30 112 28 106 24 102 L8 86 C0 78 -4 72 -4 66 C-4 60 0 56 6 56 L16 54 C22 54 28 50 32 46 L44 24 C52 16 60 12 68 12 C72 12 76 12 80 12 Z"
            fill="url(#gradA)"
            filter="url(#glow)"
          />
        </svg>

        {/* Arms (absolute divs so we can animate easily) */}
        <div
          ref={leftArmRef}
          style={{
            position: 'absolute',
            left: 6,
            top: 42,
            width: 24,
            height: 18,
            borderRadius: 14,
            transformOrigin: 'right center',
          }}
        >
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 14,
              background: 'linear-gradient(180deg,#FFE9A8,#FFD676)',
              boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
            }}
          />
        </div>

        <div
          ref={rightArmRef}
          style={{
            position: 'absolute',
            right: 6,
            top: 42,
            width: 24,
            height: 18,
            borderRadius: 14,
            transformOrigin: 'left center',
          }}
        >
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 14,
              background: 'linear-gradient(180deg,#FFE9A8,#FFD676)',
              boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
            }}
          />
        </div>

        {/* Face: eyes & mouth */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0, top: '32%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', pointerEvents: 'none'
        }}>
          {/* eyes row */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center', transform: 'translateY(-4px)' }}>
            <motion.div style={{ width: 8, height: 8, borderRadius: 999, background: '#111', x: eyeX, y: eyeY, transformOrigin: 'center' }}>
              {/* eyelid for blink */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 999,
                background: '#111',
                transformOrigin: 'center',
                transform: isBlinking ? 'scaleY(0.18)' : 'scaleY(1)',
                transition: 'transform 90ms linear'
              }} />
            </motion.div>

            <motion.div style={{ width: 8, height: 8, borderRadius: 999, background: '#111', x: eyeX, y: eyeY, transformOrigin: 'center' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 999,
                background: '#111',
                transformOrigin: 'center',
                transform: isBlinking ? 'scaleY(0.18)' : 'scaleY(1)',
                transition: 'transform 90ms linear'
              }} />
            </motion.div>
          </div>

          {/* mouth (changes with emotion) */}
          <div style={{ marginTop: 8, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {emotion === 'surprised' && <div style={{ width: 8, height: 10, borderRadius: 8, background: '#111' }} />}
            {emotion === 'success' && <div style={{ width: 20, height: 6, borderRadius: 10, background: '#111' }} />}
            {emotion === 'error' && <div style={{ width: 18, height: 4, borderRadius: '6px 6px 0 0', background: '#111', transform: 'rotate(180deg)' }} />}
            {emotion === 'idle' && <div style={{ width: 6, height: 6, borderRadius: 8, background: '#111' }} />}
          </div>

          {/* blush */}
          <div style={{ position: 'absolute', left: '24%', top: '46%', width: 14, height: 8, borderRadius: 999, background: '#FFB3C1', opacity: 0.7 }} />
          <div style={{ position: 'absolute', right: '24%', top: '46%', width: 14, height: 8, borderRadius: 999, background: '#FFB3C1', opacity: 0.7 }} />
        </div>

      </div>
    </div>
  );
};

export default StarMascot;
