import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Code2, 
  Sparkles, 
  Layers3,
  Zap,
  Eye,
  Box,
  Terminal,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
  ArrowUpRight,
  Play,
  Palette,
  Grid3x3,
  MousePointer2,
  Smartphone,
  Monitor,
  Download
} from 'lucide-react';
import AnimatedBlackHoleLogo from '@/Components/AnimatedBlackHoleLogo';
import EpicBlackHole from '@/Components/EpicBlackHole';
import CustomCursor from '@/Components/CustomCursor';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Welcome({ auth }) {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const blackholeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    const ctx = gsap.context(() => {
      
      // Hero animations
      gsap.from('.hero-content', {
        opacity: 0,
        y: 60,
        duration: 1.8,
        ease: 'power2.out',
        delay: 0.3
      });

      gsap.utils.toArray('.reveal-line').forEach((line, i) => {
        gsap.from(line, {
          opacity: 0,
          y: 40,
          duration: 1.2,
          ease: 'power2.out',
          delay: 0.5 + (i * 0.15),
        });
      });

      // Multi-layer parallax
      gsap.to('.parallax-slow', {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
        ease: 'none',
        scrollTrigger: {
          start: 0,
          end: 'max',
          invalidateOnRefresh: true,
          scrub: 0.5
        }
      });

      // Image reveals with mask and scale
      gsap.utils.toArray('.image-reveal').forEach((elem) => {
        const img = elem.querySelector('img, .image-content');
        
        gsap.set(elem, { clipPath: 'inset(100% 0% 0% 0%)' });
        
        gsap.to(elem, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: elem,
            start: 'top 80%',
            end: 'top 40%',
            toggleActions: 'play none none none'
          }
        });

        if (img) {
          gsap.fromTo(img, 
            { scale: 1.3 },
            {
              scale: 1,
              duration: 1.6,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: elem,
                start: 'top 80%',
                end: 'top 40%',
                toggleActions: 'play none none none'
              }
            }
          );
        }
      });

      // Section reveals
      gsap.utils.toArray('.section-reveal').forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 100,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Feature reveals with stagger
      gsap.utils.toArray('.feature-reveal').forEach((item, i) => {
        gsap.from(item, {
          opacity: 0,
          y: 60,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          delay: i * 0.1
        });
      });

      // Rotate animations
      gsap.utils.toArray('.rotate-reveal').forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          rotation: -15,
          scale: 0.8,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Horizontal slide animations
      gsap.utils.toArray('.slide-left').forEach((item) => {
        gsap.from(item, {
          x: -100,
          opacity: 0,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      });

      gsap.utils.toArray('.slide-right').forEach((item) => {
        gsap.from(item, {
          x: 100,
          opacity: 0,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Scale animations
      gsap.utils.toArray('.scale-reveal').forEach((item) => {
        gsap.from(item, {
          scale: 0.5,
          opacity: 0,
          duration: 1.6,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Stagger grid items
      gsap.utils.toArray('.grid-item').forEach((item, i) => {
        gsap.from(item, {
          y: 80,
          opacity: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          delay: (i % 3) * 0.15
        });
      });

      // Parallax images
      gsap.utils.toArray('.parallax-image').forEach((img) => {
        gsap.to(img, {
          y: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: img,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      });

      // Counter animations
      gsap.utils.toArray('.counter').forEach((counter) => {
        const target = parseInt(counter.dataset.count);
        gsap.from(counter, {
          innerText: 0,
          duration: 2,
          ease: 'power1.out',
          snap: { innerText: 1 },
          scrollTrigger: {
            trigger: counter,
            start: 'top 80%',
            toggleActions: 'play none none none'
          },
          onUpdate: function() {
            counter.innerText = Math.ceil(counter.innerText);
          }
        });
      });

      // Horizontal scroll section
      const horizontalSection = document.querySelector('.horizontal-scroll');
      if (horizontalSection) {
        const items = gsap.utils.toArray('.horizontal-item');
        
        gsap.to(items, {
          xPercent: -100 * (items.length - 1),
          ease: 'none',
          scrollTrigger: {
            trigger: horizontalSection,
            pin: true,
            scrub: 1,
            snap: 1 / (items.length - 1),
            end: () => '+=' + horizontalSection.offsetWidth * 2
          }
        });
      }

      // Sticky reveal sections
      gsap.utils.toArray('.sticky-reveal').forEach((section) => {
        const items = section.querySelectorAll('.sticky-item');
        
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          pin: '.sticky-content',
          pinSpacing: true
        });

        items.forEach((item, i) => {
          gsap.from(item, {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: `top+=${i * 200} top`,
              toggleActions: 'play none none reverse'
            }
          });
        });
      });

      // Text split and reveal
      gsap.utils.toArray('.text-reveal').forEach((text) => {
        const words = text.textContent.split(' ');
        text.innerHTML = words.map(word => `<span class="word-wrap">${word}</span>`).join(' ');
        
        gsap.from(text.querySelectorAll('.word-wrap'), {
          opacity: 0,
          y: 20,
          stagger: 0.05,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: text,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Fade up with blur animations
      gsap.utils.toArray('.fade-up-blur').forEach((item) => {
        gsap.from(item, {
          y: 80,
          opacity: 0,
          filter: 'blur(10px)',
          duration: 1.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Skew scroll effect
      gsap.utils.toArray('.skew-scroll').forEach((item) => {
        gsap.from(item, {
          skewY: 5,
          y: 100,
          opacity: 0,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Elastic bounce animations
      gsap.utils.toArray('.bounce-reveal').forEach((item) => {
        gsap.from(item, {
          scale: 0,
          opacity: 0,
          duration: 1.2,
          ease: 'elastic.out(1, 0.5)',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Magnetic hover effect on cards
      document.querySelectorAll('.magnetic-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          gsap.to(card, {
            x: x * 0.1,
            y: y * 0.1,
            duration: 0.5,
            ease: 'power2.out'
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'power2.out'
          });
        });
      });

      // Split text reveal character by character
      gsap.utils.toArray('.char-reveal').forEach((text) => {
        const chars = text.textContent.split('');
        text.innerHTML = chars.map(char => `<span class="char-wrap" style="display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
        
        gsap.from(text.querySelectorAll('.char-wrap'), {
          opacity: 0,
          y: 50,
          rotateX: -90,
          stagger: 0.02,
          duration: 0.8,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: text,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Perspective tilt reveal
      gsap.utils.toArray('.tilt-reveal').forEach((item) => {
        gsap.from(item, {
          rotateX: 45,
          opacity: 0,
          scale: 0.8,
          transformOrigin: 'center bottom',
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      });

    }, containerRef);

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <Head title="DeCode - Website Builder with Code Generation" />
      <CustomCursor />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        body {
          background: #0a0a0a;
          color: #e8e8e8;
          overflow-x: hidden;
          transition: background-color 1.2s ease;
        }
        
        .nav-minimal {
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          transition: all 0.6s ease;
          z-index: 1000;
        }
        
        .nav-link-minimal {
          color: rgba(232, 232, 232, 0.6);
          transition: color 0.4s ease;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 400;
        }
        
        .nav-link-minimal:hover {
          color: rgba(232, 232, 232, 1);
        }
        
        .mobile-menu {
          background: rgba(10, 10, 10, 0.98);
          backdrop-filter: blur(30px);
        }
        
        .hamburger-line {
          width: 24px;
          height: 2px;
          background: #e8e8e8;
          transition: all 0.3s ease;
          display: block;
        }
        
        .hamburger-open .hamburger-line:nth-child(1) {
          transform: rotate(45deg) translateY(8px);
        }
        
        .hamburger-open .hamburger-line:nth-child(2) {
          opacity: 0;
        }
        
        .hamburger-open .hamburger-line:nth-child(3) {
          transform: rotate(-45deg) translateY(-8px);
        }
        
        .btn-minimal {
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.2);
          color: #e8e8e8;
          padding: 0.75rem 2rem;
          border-radius: 2px;
          font-size: 0.875rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all 0.6s ease;
          font-weight: 400;
          display: inline-block;
        }
        
        .btn-minimal:hover {
          background: #e8e8e8;
          color: #0a0a0a;
          border-color: #e8e8e8;
        }
        
        .btn-primary-minimal {
          background: #e8e8e8;
          color: #0a0a0a;
          border: 1px solid #e8e8e8;
        }
        
        .btn-primary-minimal:hover {
          background: transparent;
          color: #e8e8e8;
        }
        
        .hero-title-large {
          font-size: clamp(3rem, 10vw, 9rem);
          font-weight: 200;
          line-height: 1.05;
          letter-spacing: -0.03em;
        }
        
        .section-title {
          font-size: clamp(2.5rem, 7vw, 6rem);
          font-weight: 200;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        /* Animated Gradient Border Button */
        .animated-gradient-border-btn {
          position: relative;
          isolation: isolate;
        }
        
        .animated-gradient-border-btn::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 0.75rem;
          padding: 2px;
          background: linear-gradient(
            90deg,
            var(--color-primary),
            var(--color-accent, #a855f7),
            var(--color-primary)
          );
          background-size: 200% 100%;
          animation: gradientShift 3s linear infinite;
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: -1;
        }
        
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        
        .view-work-btn {
          position: relative;
          background: transparent;
          text-align: center;
        }
        
        .text-minimal {
          font-size: 1.125rem;
          line-height: 1.8;
          letter-spacing: 0.02em;
          color: rgba(232, 232, 232, 0.7);
          font-weight: 300;
        }
        
        .feature-card-minimal {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .feature-card-minimal:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.08);
          transform: translateY(-8px);
        }
        
        .image-reveal {
          overflow: hidden;
          will-change: clip-path;
        }
        
        .image-content {
          will-change: transform;
        }
        
        .parallax-slow {
          will-change: transform;
        }
        
        .showcase-placeholder {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        }
        
        .section-padding {
          padding: clamp(8rem, 18vh, 16rem) 0;
        }
        
        .section-padding-lg {
          padding: clamp(10rem, 22vh, 20rem) 0;
        }
        
        .minimal-spacing {
          margin-bottom: clamp(2rem, 5vh, 4rem);
        }
        
        .horizontal-scroll {
          overflow: hidden;
        }
        
        .horizontal-item {
          min-width: 100vw;
          height: 100%;
        }
        
        .word-wrap {
          display: inline-block;
          margin-right: 0.25em;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .grid-showcase {
          display: grid;
          gap: 2px;
          background: rgba(255, 255, 255, 0.05);
        }
        
        @media (max-width: 768px) {
          .hero-title-large {
            font-size: clamp(2.5rem, 12vw, 4rem);
          }
          
          .section-title {
            font-size: clamp(2rem, 9vw, 3.5rem);
          }
          
          .section-padding {
            padding: clamp(5rem, 12vh, 8rem) 0;
          }
        }
      `}</style>

      <div ref={containerRef} className="min-h-screen bg-black text-white overflow-x-hidden">
        
        {/* Enhanced Navigation with Animations - Transparent to see blackhole */}
        <nav className="nav-minimal fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-sm z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex items-center justify-between h-20 lg:h-24">
              {/* Logo with hover animation */}
              <Link href="/" className="flex items-center space-x-3 group z-50">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div style={{ filter: 'drop-shadow(0 0 12px rgba(102, 126, 234, 0.4))' }} className="relative transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <AnimatedBlackHoleLogo size={28} />
                  </div>
                </div>
                <span className="text-sm lg:text-base font-light tracking-widest group-hover:tracking-wider transition-all duration-500">DECODE</span>
              </Link>
              
              {/* Desktop Navigation - Enhanced with animations */}
              <div className="hidden lg:flex items-center space-x-8 xl:space-x-12">
                {['Features', 'Capabilities', 'Work', 'Process'].map((item, i) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase()}`} 
                    className="nav-link-minimal relative group"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <span className="relative z-10">{item}</span>
                    <span className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-purple-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                    <span className="absolute inset-0 bg-purple-600/5 rounded scale-0 group-hover:scale-100 transition-transform duration-500"></span>
                  </a>
                ))}
              </div>
              
              {/* Desktop Auth Buttons - Enhanced */}
              <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                {auth.user ? (
                  <Link href="/projects" className="btn-primary-minimal relative overflow-hidden group">
                    <span className="relative z-10">Dashboard</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="nav-link-minimal relative group">
                      <span className="relative z-10">Sign In</span>
                      <span className="absolute inset-0 bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-500 rounded"></span>
                    </Link>
                    <Link href="/register" className="btn-minimal relative overflow-hidden group">
                      <span className="relative z-10">Get Started</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
                      <span className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 absolute inset-0 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </span>
                    </Link>
                  </>
                )}
              </div>
              
              {/* Mobile/Tablet Hamburger */}
              <button 
                className={`lg:hidden flex flex-col justify-center space-y-1.5 z-50 group ${menuOpen ? 'hamburger-open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="hamburger-line group-hover:bg-purple-400 transition-colors"></span>
                <span className="hamburger-line group-hover:bg-purple-400 transition-colors"></span>
                <span className="hamburger-line group-hover:bg-purple-400 transition-colors"></span>
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu with Enhanced Animations */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              className="mobile-menu fixed inset-0 z-40 lg:hidden"
            >
              <div className="flex flex-col items-center justify-center h-full space-y-8 px-8">
                {['Features', 'Capabilities', 'Work', 'Process'].map((item, i) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                    className="text-2xl font-light tracking-widest hover:text-purple-400 transition-colors relative group"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.toUpperCase()}
                    <motion.span 
                      className="absolute left-0 -bottom-2 h-px bg-gradient-to-r from-purple-500 to-blue-500"
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.a>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="pt-8 flex flex-col space-y-4 w-full max-w-xs"
                >
                  {auth.user ? (
                    <Link href="/projects" className="btn-primary-minimal text-center" onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" className="btn-minimal text-center" onClick={() => setMenuOpen(false)}>
                        Sign In
                      </Link>
                      <Link href="/register" className="btn-primary-minimal text-center" onClick={() => setMenuOpen(false)}>
                        Get Started
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section - Epic 3D Blackhole Style */}
        <section className="relative min-h-screen flex items-center justify-center section-padding pt-32">
          
          {/* Epic Black Hole with Gravitational Lensing */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <EpicBlackHole className="w-full h-full" />
          </div>
          {/* Subtle background layers with parallax */}
          <div 
            className="parallax-slow absolute inset-0 opacity-20 pointer-events-none"
            data-speed="0.3"
            style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%)',
            }}
          />
          
          <div 
            className="parallax-slow absolute inset-0 opacity-15 pointer-events-none"
            data-speed="0.5"
            style={{
              background: 'radial-gradient(circle at 70% 60%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)',
            }}
          />
          
          <div className="hero-content max-w-7xl mx-auto px-8 lg:px-16 relative z-10 w-full">
            {/* Centered Column Layout */}
            <div className="flex flex-col items-center justify-center text-center">
              {/* Top Section - Text Content */}
              <div className="max-w-5xl mb-16">
                <div className="minimal-spacing">
                  <div className="reveal-line inline-block mb-8">
                    <div className="flex items-center justify-center space-x-3 text-sm tracking-widest text-gray-500">
                      <div className="w-12 h-px bg-gray-700"></div>
                      <span>WEBSITE BUILDER</span>
                      <div className="w-12 h-px bg-gray-700"></div>
                    </div>
                  </div>
                </div>
                
                <h1 className="hero-title-large minimal-spacing">
                  <div className="reveal-line char-reveal">Build</div>
                  <div className="reveal-line char-reveal">Visually</div>
                  <div className="reveal-line char-reveal opacity-50">Export Code</div>
                </h1>
                
                <div className="reveal-line max-w-2xl minimal-spacing mx-auto">
                  <p className="text-minimal">
                    A free visual website builder that generates clean, production-ready code.
                    Design with precision, export React, HTML, CSS, and Tailwind — no AI, just pure code generation.
                  </p>
                </div>
              </div>


              {/* Buttons at the bottom */}
              <div className="reveal-line flex flex-row gap-6 items-center justify-center">
                <Link 
                  href="/register" 
                  className="animated-gradient-border-btn group relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10">Start Building</span>
                  <div className="absolute inset-0 bg-[var(--color-bg)] rounded-xl"></div>
                  <div className="animated-gradient-border"></div>
                </Link>
                
                <a 
                  href="#showcase" 
                  className="view-work-btn group relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300 hover:scale-105"
                  style={{
                    color: 'var(--color-text)',
                  }}
                >
                  <span className="relative z-10">View Work</span>
                </a>
              </div>
            </div>
          </div>
          
          {/* Scroll indicator - Akari style */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center space-y-2 opacity-40">
              <div className="text-xs tracking-widest">SCROLL</div>
              <div className="w-px h-12 bg-white animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Features Grid - Different Animation Per Item */}
        <section id="features" className="section-padding-lg">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <div className="section-reveal mb-24">
              <div className="text-xs tracking-widest text-gray-500 mb-8">— CORE FEATURES</div>
              <h2 className="section-title max-w-4xl">
                Build faster, smarter, better
              </h2>
            </div>
            
            <div className="grid-showcase md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: <Eye className="w-6 h-6" />, title: "Visual Canvas", desc: "Drag, drop, and design with pixel-perfect precision", anim: "slide-left" },
                { icon: <Code2 className="w-6 h-6" />, title: "Code Export", desc: "Generate clean React, HTML, CSS, and Tailwind instantly", anim: "slide-right" },
                { icon: <Zap className="w-6 h-6" />, title: "Real-time Preview", desc: "See changes instantly across all breakpoints", anim: "scale-reveal" },
                { icon: <Layers3 className="w-6 h-6" />, title: "Component Library", desc: "Hundreds of pre-built, customizable components", anim: "rotate-reveal" },
                { icon: <Box className="w-6 h-6" />, title: "Design Tokens", desc: "Consistent design system with variables", anim: "slide-left" },
                { icon: <Terminal className="w-6 h-6" />, title: "Free Forever", desc: "No hidden costs, completely free to use", anim: "slide-right" }
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`${feature.anim} feature-card-minimal p-12 lg:p-16 bg-black`}
                >
                  <div className="mb-8 opacity-60">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl mb-6 font-light">{feature.title}</h3>
                  <p className="text-base text-gray-500 leading-relaxed font-light">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section with Counter Animation */}
        <section className="section-padding">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
              {[
                { count: 50000, suffix: "+", label: "Websites Created" },
                { count: 120, suffix: "K+", label: "Active Users" },
                { count: 99, suffix: "%", label: "Satisfaction Rate" },
                { count: 24, suffix: "/7", label: "Support Available" }
              ].map((stat, i) => (
                <div key={i} className="fade-up-blur text-center">
                  <div className="text-6xl lg:text-7xl font-extralight mb-4 gradient-text">
                    <span className="counter" data-count={stat.count}>0</span>{stat.suffix}
                  </div>
                  <div className="text-sm tracking-widest text-gray-500 uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities Section - Grid Items */}
        <section id="capabilities" className="section-padding-lg">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <div className="section-reveal mb-24">
              <div className="text-xs tracking-widest text-gray-500 mb-8">— CAPABILITIES</div>
              <h2 className="section-title max-w-4xl">
                Professional tools for modern web development
              </h2>
            </div>
            
            <div className="space-y-32">
              {/* Capability 1 - Slide from left */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="slide-left skew-scroll space-y-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-sm bg-purple-600/10 flex items-center justify-center bounce-reveal">
                      <Palette className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-4xl lg:text-5xl font-extralight">Design System</h3>
                  </div>
                  <p className="text-minimal max-w-xl">
                    Build consistent interfaces with a powerful design system. Define colors, typography, 
                    spacing, and more—all synchronized across your entire project.
                  </p>
                  <ul className="space-y-4 text-gray-400">
                    <li className="flex items-center space-x-3">
                      <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                      <span>Global style tokens</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                      <span>Theme variations</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                      <span>Component variants</span>
                    </li>
                  </ul>
                </div>
                <div className="image-reveal aspect-[4/3] rounded-sm overflow-hidden relative">
                  <img src="/images/welcome/mockup1.png" alt="Design System" className="image-content w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Capability 2 - Slide from right */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="image-reveal aspect-[4/3] rounded-sm overflow-hidden relative lg:order-1">
                  <img src="/images/welcome/mockup2.png" alt="Interactions" className="image-content w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
                </div>
                <div className="slide-right space-y-8 lg:order-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-sm bg-blue-600/10 flex items-center justify-center">
                      <MousePointer2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-4xl lg:text-5xl font-extralight">Interactions</h3>
                  </div>
                  <p className="text-minimal max-w-xl">
                    Create stunning animations and interactions without writing code. 
                    Add hover effects, transitions, and micro-interactions visually.
                  </p>
                  <ul className="space-y-4 text-gray-400">
                    <li className="flex items-center space-x-3">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      <span>Hover & click states</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      <span>Page transitions</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      <span>Scroll animations</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Capability 3 - Scale reveal */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="scale-reveal space-y-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-sm bg-green-600/10 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-4xl lg:text-5xl font-extralight">Responsive</h3>
                  </div>
                  <p className="text-minimal max-w-xl">
                    Design for every device with powerful responsive controls. 
                    Preview and adjust layouts for mobile, tablet, and desktop instantly.
                  </p>
                  <ul className="space-y-4 text-gray-400">
                    <li className="flex items-center space-x-3">
                      <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                      <span>Breakpoint system</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                      <span>Device previews</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                      <span>Responsive typography</span>
                    </li>
                  </ul>
                </div>
                <div className="image-reveal aspect-[4/3] rounded-sm">
                  <div className="image-content showcase-placeholder w-full h-full flex items-center justify-center">
                    <Monitor className="w-24 h-24 opacity-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Showcase Section - Image Reveals */}
        <section id="showcase" className="section-padding-lg">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <div className="section-reveal mb-24">
              <div className="text-xs tracking-widest text-gray-500 mb-8">— SELECTED WORK</div>
              <h2 className="section-title max-w-4xl">Projects built with DeCode</h2>
              <p className="text-minimal mt-8 max-w-2xl">
                From startups to enterprises, see how teams are building beautiful websites with our platform.
              </p>
            </div>
            
            <div className="space-y-32 lg:space-y-48">
              {/* Project 1 */}
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                <div className="lg:col-span-7 image-reveal tilt-reveal aspect-[16/10] rounded-sm overflow-hidden group cursor-pointer">
                  <div className="image-content showcase-placeholder w-full h-full flex items-center justify-center transition-all duration-700 group-hover:scale-105">
                    <div className="text-center opacity-30 group-hover:opacity-50 transition-opacity duration-700">
                      <div className="text-7xl mb-4">◇</div>
                      <div className="text-sm tracking-widest">E-COMMERCE</div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-5 fade-up-blur space-y-8">
                  <div className="text-xs tracking-widest text-gray-500">
                    RETAIL / 2025
                  </div>
                  <h3 className="text-4xl lg:text-5xl font-extralight">Minimal Store</h3>
                  <p className="text-minimal">
                    A refined e-commerce experience built with DeCode's visual builder. 
                    Clean architecture, smooth animations, perfect code.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">REACT</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">TAILWIND</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">RESPONSIVE</span>
                  </div>
                  <a href="#" className="inline-flex items-center space-x-2 text-sm tracking-widest hover:text-purple-400 transition-colors">
                    <span>VIEW CASE STUDY</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Project 2 - Reversed */}
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                <div className="lg:col-span-5 fade-up-blur space-y-8 lg:order-1">
                  <div className="text-xs tracking-widest text-gray-500">
                    SAAS / 2025
                  </div>
                  <h3 className="text-4xl lg:text-5xl font-extralight">Dashboard Pro</h3>
                  <p className="text-minimal">
                    Data-driven analytics platform with real-time updates and beautiful visualizations.
                    Built for scale, designed for clarity.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">REACT</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">TAILWIND</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">CHARTS</span>
                  </div>
                  <a href="#" className="inline-flex items-center space-x-2 text-sm tracking-widest hover:text-purple-400 transition-colors">
                    <span>VIEW CASE STUDY</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
                
                <div className="lg:col-span-7 image-reveal tilt-reveal aspect-[16/10] rounded-sm overflow-hidden lg:order-2 group cursor-pointer">
                  <div className="image-content showcase-placeholder w-full h-full flex items-center justify-center transition-all duration-700 group-hover:scale-105">
                    <div className="text-center opacity-30 group-hover:opacity-50 transition-opacity duration-700">
                      <div className="text-7xl mb-4">◆</div>
                      <div className="text-sm tracking-widest">SAAS</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project 3 */}
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                <div className="lg:col-span-7 image-reveal tilt-reveal aspect-[16/10] rounded-sm overflow-hidden group cursor-pointer">
                  <div className="image-content showcase-placeholder w-full h-full flex items-center justify-center transition-all duration-700 group-hover:scale-105">
                    <div className="text-center opacity-30 group-hover:opacity-50 transition-opacity duration-700">
                      <div className="text-7xl mb-4">◈</div>
                      <div className="text-sm tracking-widest">PORTFOLIO</div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-5 fade-up-blur space-y-8">
                  <div className="text-xs tracking-widest text-gray-500">
                    CREATIVE / 2025
                  </div>
                  <h3 className="text-4xl lg:text-5xl font-extralight">Artist Portfolio</h3>
                  <p className="text-minimal">
                    Stunning portfolio website showcasing creative work with smooth page transitions
                    and gallery interactions.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">HTML</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">CSS</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">ANIMATIONS</span>
                  </div>
                  <a href="#" className="inline-flex items-center space-x-2 text-sm tracking-widest hover:text-purple-400 transition-colors">
                    <span>VIEW CASE STUDY</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Project 4 - Reversed */}
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                <div className="lg:col-span-5 section-reveal space-y-8 lg:order-1">
                  <div className="text-xs tracking-widest text-gray-500">
                    STARTUP / 2025
                  </div>
                  <h3 className="text-4xl lg:text-5xl font-extralight">Tech Landing</h3>
                  <p className="text-minimal">
                    High-converting landing page for a tech startup. Optimized for performance
                    and designed for conversion.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">REACT</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">SEO</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">OPTIMIZED</span>
                  </div>
                  <a href="#" className="inline-flex items-center space-x-2 text-sm tracking-widest hover:text-purple-400 transition-colors">
                    <span>VIEW CASE STUDY</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
                
                <div className="lg:col-span-7 image-reveal aspect-[16/10] rounded-sm overflow-hidden lg:order-2">
                  <div className="image-content showcase-placeholder w-full h-full flex items-center justify-center">
                    <div className="text-center opacity-30">
                      <div className="text-7xl mb-4">◉</div>
                      <div className="text-sm tracking-widest">LANDING</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="section-padding">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <div className="section-reveal mb-24 text-center">
              <div className="text-xs tracking-widest text-gray-500 mb-8">— THE TEAM</div>
              <h2 className="section-title max-w-4xl mx-auto">
                Built by passionate developers
              </h2>
              <p className="text-minimal mt-8 max-w-2xl mx-auto">
                Meet the team behind DeCode — dedicated to creating the best visual website builder
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: "James Rafty Libago", role: "Technical Lead", desc: "Full-stack architect and sole developer of DeCode's core systems", image: "/images/welcome/devs/mizumi.jpg", link: "https://mizumi.vercel.app" },
                { name: "Krislyn Ramoso", role: "Research Lead", desc: "Research coordinator and technical documentation specialist", image: "/images/welcome/devs/kris.jpg" },
                { name: "Christian Cesar", role: "Documentation Lead", desc: "Documentation architect and content strategist", image: "/images/welcome/devs/shan.jpg" },
                { name: "Jay Obdencio", role: "Project Manager", desc: "Project coordination and strategic planning", image: "/images/welcome/devs/jay.jpg" }
              ].map((member, i) => {
                const CardContent = (
                  <>
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 flex items-center justify-center bounce-reveal transition-all duration-500 hover:scale-110 hover:border-purple-500/50 overflow-hidden">
                      {member.image ? (
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-3xl font-light">{member.name.charAt(0)}</div>
                      )}
                    </div>
                    <div>
                      <div className="font-light text-xl mb-2">{member.name}</div>
                      <div className="text-sm text-purple-400 mb-4 tracking-wider">{member.role}</div>
                      <p className="text-minimal text-sm leading-relaxed">
                        {member.desc}
                      </p>
                    </div>
                  </>
                );

                return member.link ? (
                  <a 
                    key={i} 
                    href={member.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="magnetic-card grid-item feature-card-minimal p-8 lg:p-10 space-y-6 text-center block hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                  >
                    {CardContent}
                  </a>
                ) : (
                  <div key={i} className="magnetic-card grid-item feature-card-minimal p-8 lg:p-10 space-y-6 text-center">
                    {CardContent}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Horizontal Scroll Section */}
        <section className="horizontal-scroll section-padding-lg overflow-hidden">
          <div className="flex">
            {[
              { icon: <Code2 className="w-12 h-12" />, title: "Write Less Code", desc: "Focus on design, we handle the code" },
              { icon: <Zap className="w-12 h-12" />, title: "Ship Faster", desc: "From idea to production in hours" },
              { icon: <Layers3 className="w-12 h-12" />, title: "Scale Better", desc: "Built for teams of all sizes" },
              { icon: <Terminal className="w-12 h-12" />, title: "Stay Flexible", desc: "Export and customize anywhere" }
            ].map((item, i) => (
              <div key={i} className="horizontal-item flex items-center justify-center px-6 lg:px-16">
                <div className="max-w-2xl text-center space-y-8">
                  <div className="flex justify-center opacity-60">
                    {item.icon}
                  </div>
                  <h3 className="text-5xl lg:text-7xl font-extralight">{item.title}</h3>
                  <p className="text-minimal text-xl">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="section-padding-lg">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <div className="section-reveal mb-24">
              <div className="text-xs tracking-widest text-gray-500 mb-8">— HOW IT WORKS</div>
              <h2 className="section-title max-w-4xl">From concept to code in four steps</h2>
            </div>
            
            <div className="space-y-0">
              {[
                { 
                  num: "01", 
                  title: "Design Visually", 
                  desc: "Start with a blank canvas or choose from hundreds of templates. Drag, drop, and arrange components to build your perfect layout.",
                  features: ["Component Library", "Templates", "Grid System"]
                },
                { 
                  num: "02", 
                  title: "Customize Everything", 
                  desc: "Fine-tune every detail with our intuitive property panel. Adjust colors, typography, spacing, and more with precision controls.",
                  features: ["Style Editor", "Responsive Design", "Interactions"]
                },
                { 
                  num: "03", 
                  title: "Generate Code", 
                  desc: "Export clean, production-ready code in your preferred format. React, HTML, CSS, Tailwind—precise code generation without AI.",
                  features: ["React Export", "HTML/CSS", "Tailwind CSS"]
                },
                { 
                  num: "04", 
                  title: "Download & Deploy", 
                  desc: "Download your code and deploy anywhere you want. Full control, complete ownership—your code, your way.",
                  features: ["Code Download", "Full Ownership", "Deploy Anywhere"]
                }
              ].map((step, i) => (
                <div key={i} className="section-reveal grid lg:grid-cols-12 gap-8 lg:gap-16 items-start border-t border-white/5 py-16 lg:py-24">
                  <div className="lg:col-span-2">
                    <div className="text-7xl lg:text-8xl font-extralight opacity-20">{step.num}</div>
                  </div>
                  <div className="lg:col-span-10 space-y-8">
                    <h3 className="text-4xl lg:text-5xl font-extralight">{step.title}</h3>
                    <p className="text-minimal max-w-3xl text-lg">{step.desc}</p>
                    <div className="flex flex-wrap gap-3">
                      {step.features.map((feature, j) => (
                        <span key={j} className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-xs tracking-wider">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="section-padding">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <div className="section-reveal mb-24 text-center">
              <div className="text-xs tracking-widest text-gray-500 mb-8">— CODE GENERATION</div>
              <h2 className="section-title max-w-4xl mx-auto">
                Export clean, production-ready code
              </h2>
              <p className="text-minimal mt-8 max-w-2xl mx-auto">
                Generate code for modern web frameworks — no AI, just pure code generation
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["React", "HTML", "CSS", "Tailwind"].map((tech, i) => (
                <div key={i} className="scale-reveal feature-card-minimal p-8 text-center">
                  <div className="text-2xl font-light">{tech}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-padding">
          <div className="max-w-4xl mx-auto px-6 lg:px-16">
            <div className="section-reveal mb-24 text-center">
              <div className="text-xs tracking-widest text-gray-500 mb-8">— FAQ</div>
              <h2 className="section-title">Common questions</h2>
            </div>
            
            <div className="space-y-8">
              {[
                { q: "Do I need coding experience?", a: "No! DeCode is designed for both designers and developers. Build visually and export code when ready." },
                { q: "Can I export the code?", a: "Yes! Export clean React, HTML, CSS, and Tailwind code. You own your code completely." },
                { q: "What frameworks do you support?", a: "We support React, HTML, CSS, and Tailwind CSS. Our code generation is pure and precise — no AI involved." },
                { q: "Is DeCode really free?", a: "Yes! DeCode is completely free to use with no hidden costs. Build unlimited projects and export code freely." },
                { q: "Does DeCode use AI?", a: "No. DeCode generates code through precise algorithms, not AI. You get clean, predictable, production-ready code every time." },
                { q: "How does code generation work?", a: "DeCode translates your visual design directly into code. What you see is exactly what you get — no surprises, no AI interpretation." }
              ].map((faq, i) => (
                <div key={i} className="section-reveal border-b border-white/5 pb-8 last:border-0">
                  <h3 className="text-2xl font-light mb-4">{faq.q}</h3>
                  <p className="text-minimal">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA - Minimal */}
        <section className="section-padding">
          <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
            <div className="section-reveal space-y-12">
              <h2 className="section-title">Ready to build?</h2>
              <p className="text-minimal max-w-2xl mx-auto">
                Join thousands of developers creating beautiful websites with clean code — completely free
              </p>
              <div>
                <Link href="/register" className="btn-primary-minimal inline-block">
                  Start Building Free
                </Link>
              </div>
              <div className="text-xs tracking-widest text-gray-600">
                100% FREE • NO CREDIT CARD • NO AI
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Minimal */}
        <footer className="border-t border-white/5 py-16">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="flex flex-col items-center justify-center gap-8 text-center">
              <div className="flex items-center space-x-3 opacity-60">
                <AnimatedBlackHoleLogo size={20} />
                <span className="text-sm font-light tracking-widest">DECODE</span>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="text-xs tracking-widest text-gray-500">DEVELOPED BY</div>
                <div className="text-sm font-light text-gray-400">
                  <div className="mb-2">James Rafty Libago • Technical Lead</div>
                  <div className="text-xs text-gray-600">
                    With Krislyn Ramoso • Christian Cesar • Jay Obdencio
                  </div>
                </div>
              </div>
              
              <div className="flex gap-12 text-xs tracking-widest text-gray-600">
                <a href="#" className="hover:text-white transition-colors duration-500">PRIVACY</a>
                <a href="#" className="hover:text-white transition-colors duration-500">TERMS</a>
                <a href="#" className="hover:text-white transition-colors duration-500">CONTACT</a>
              </div>
              
              <div className="text-xs text-gray-600">© 2025 DeCode. All rights reserved.</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
