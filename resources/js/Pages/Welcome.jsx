import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  ArrowRight, 
  Code2, 
  Sparkles, 
  Layers3,
  Zap,
  Eye,
  Box,
  Terminal
} from 'lucide-react';
import AnimatedBlackHoleLogo from '@/Components/AnimatedBlackHoleLogo';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Welcome({ auth }) {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  });

  useEffect(() => {
    // Mouse parallax effect
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // GSAP ScrollTrigger animations
    const ctx = gsap.context(() => {
      // Hero title animation with split text effect
      const heroTitle = document.querySelector('.hero-main-title');
      if (heroTitle) {
        const words = heroTitle.textContent.split(' ');
        heroTitle.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
        
        gsap.from('.word', {
          opacity: 0,
          y: 100,
          rotationX: -90,
          stagger: 0.1,
          duration: 1.2,
          ease: 'power4.out',
          delay: 0.3
        });
      }

      // Hero subtitle fade in
      gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 1,
        ease: 'power3.out'
      });

      // Hero CTA buttons
      gsap.from('.hero-cta', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 1.3,
        stagger: 0.2,
        ease: 'power3.out'
      });

      // Floating orbs parallax
      gsap.to('.orb-1', {
        y: -100,
        x: 50,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });

      gsap.to('.orb-2', {
        y: -150,
        x: -80,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });

      gsap.to('.orb-3', {
        y: -80,
        x: 30,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });

      // Feature cards with stagger and 3D effect
      gsap.utils.toArray('.feature-item').forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          y: 100,
          rotationY: 30,
          scale: 0.8,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom-=100',
            end: 'top center',
            toggleActions: 'play none none none'
          }
        });
      });

      // Process section with horizontal scroll reveal
      gsap.utils.toArray('.process-step').forEach((step, index) => {
        gsap.from(step, {
          opacity: 0,
          x: index % 2 === 0 ? -100 : 100,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            start: 'top bottom-=50',
            toggleActions: 'play none none none'
          }
        });
      });

      // Showcase items smooth reveal
      gsap.utils.toArray('.showcase-item').forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          scale: 0.95,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom-=100',
            toggleActions: 'play none none none'
          }
        });
      });

      // Final CTA section scale effect
      gsap.from('.final-cta', {
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.final-cta',
          start: 'top bottom-=100',
          toggleActions: 'play none none none'
        }
      });

    }, containerRef);

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const features = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Visual Builder",
      description: "Craft pixel-perfect interfaces with an intuitive drag-and-drop canvas"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Code Generation",
      description: "Clean, production-ready code generated from your designs instantly"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Preview",
      description: "See changes instantly across all devices and breakpoints"
    },
    {
      icon: <Layers3 className="w-6 h-6" />,
      title: "Component Library",
      description: "Extensive collection of pre-built, customizable components"
    },
    {
      icon: <Box className="w-6 h-6" />,
      title: "Design System",
      description: "Build consistent designs with tokens, variables, and styles"
    },
    {
      icon: <Terminal className="w-6 h-6" />,
      title: "Export Anywhere",
      description: "Export to React, Vue, HTML, or deploy with one click"
    }
  ];

  const processSteps = [
    {
      number: "01",
      title: "Design",
      description: "Start with a blank canvas or choose from beautiful templates"
    },
    {
      number: "02",
      title: "Customize",
      description: "Drag, drop, and style components to match your vision"
    },
    {
      number: "03",
      title: "Generate",
      description: "Get production-ready code with clean architecture"
    },
    {
      number: "04",
      title: "Deploy",
      description: "Launch your project to the web instantly"
    }
  ];

  return (
    <>
      <Head title="DeCode - Website Builder with Code Generation" />
      
      {/* Custom Styles - Inspired by Akari Art & Botanist */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        body {
          background: #0a0a0a;
          color: #ffffff;
          overflow-x: hidden;
        }
        
        .word {
          display: inline-block;
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        
        .minimal-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-nav {
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .orb-1, .orb-2, .orb-3 {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          pointer-events: none;
        }
        
        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #667eea 0%, transparent 70%);
          top: 10%;
          right: 10%;
        }
        
        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #764ba2 0%, transparent 70%);
          bottom: 20%;
          left: 5%;
        }
        
        .orb-3 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, #f093fb 0%, transparent 70%);
          top: 50%;
          left: 50%;
        }
        
        .feature-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }
        
        .feature-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(102, 126, 234, 0.3);
          transform: translateY(-8px);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .btn-primary:hover::before {
          left: 100%;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .process-step {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }
        
        .showcase-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          overflow: hidden;
        }
        
        .final-cta {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border: 1px solid rgba(102, 126, 234, 0.2);
          backdrop-filter: blur(20px);
        }
        
        .nav-link {
          position: relative;
          color: rgba(255, 255, 255, 0.7);
          transition: color 0.3s ease;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: #667eea;
          transition: width 0.3s ease;
        }
        
        .nav-link:hover {
          color: #ffffff;
        }
        
        .nav-link:hover::after {
          width: 100%;
        }
        
        .scroll-indicator {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transform-origin: 0%;
          z-index: 9999;
        }
        
        @media (max-width: 768px) {
          .orb-1, .orb-2, .orb-3 {
            filter: blur(60px);
          }
        }
      `}</style>

      <div ref={containerRef} className="min-h-screen bg-black text-white">
        
        {/* Scroll Progress Indicator */}
        <motion.div 
          className="scroll-indicator" 
          style={{ scaleX: smoothProgress }}
        />
        
        {/* Minimal Navigation */}
        <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3">
                <div 
                  className="relative"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(102, 126, 234, 0.6))'
                  }}
                >
                  <AnimatedBlackHoleLogo size={32} />
                </div>
                <span className="text-xl font-semibold tracking-tight">DeCode</span>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="nav-link text-sm">Features</a>
                <a href="#process" className="nav-link text-sm">Process</a>
                <a href="#showcase" className="nav-link text-sm">Showcase</a>
              </div>
              
              {/* Auth Buttons */}
              <div className="flex items-center space-x-4">
                {auth.user ? (
                  <Link
                    href="/projects"
                    className="btn-primary px-6 py-2.5 rounded-full text-sm font-medium flex items-center space-x-2"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="hidden md:block text-sm nav-link px-4 py-2"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="btn-primary px-6 py-2.5 rounded-full text-sm font-medium"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Minimalist & Powerful */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Floating Orbs */}
          <div className="orb-1"></div>
          <div className="orb-2"></div>
          <div className="orb-3"></div>
          
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-8"
                style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.2)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-200">Website Builder with Code Generation</span>
              </motion.div>
              
              {/* Main Heading */}
              <h1 className="hero-main-title text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-none tracking-tighter">
                Build Visually Export Code
              </h1>
              
              {/* Subtitle */}
              <p className="hero-subtitle text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                The professional website builder that generates clean, production-ready code. 
                No AI guesswork—just pure design-to-code precision.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="hero-cta btn-primary px-8 py-4 rounded-full font-medium text-base flex items-center space-x-2"
                >
                  <span>Start Building Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <a
                  href="#showcase"
                  className="hero-cta btn-secondary px-8 py-4 rounded-full font-medium text-base"
                >
                  View Showcase
                </a>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 mt-16 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Free forever plan</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-gray-700 rounded-full flex items-start justify-center p-2">
              <motion.div 
                className="w-1.5 h-1.5 bg-gray-500 rounded-full"
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section - Minimalist Grid */}
        <section id="features" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Everything you need
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Powerful tools for professional web development
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="feature-item p-8 rounded-3xl group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 minimal-gradient">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section - Horizontal Steps */}
        <section id="process" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Simple <span className="text-gradient">workflow</span>
              </h2>
              <p className="text-xl text-gray-400">
                From concept to code in four easy steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  className="process-step p-8 rounded-3xl"
                >
                  <div className="text-6xl font-bold text-gradient mb-6">{step.number}</div>
                  <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Showcase Section - Visual Examples */}
        <section id="showcase" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Built with DeCode
              </h2>
              <p className="text-xl text-gray-400">
                Real projects created by our community
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="showcase-item aspect-video relative group cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎨</div>
                      <div className="text-xl font-semibold">Project {item}</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">Beautiful Design</h3>
                      <p className="text-gray-300">Created in minutes, not hours</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 relative">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="final-cta p-16 rounded-[40px] text-center">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Ready to build?
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Join thousands of developers and designers creating amazing websites with DeCode
              </p>
              
              <Link
                href="/register"
                className="btn-primary px-10 py-5 rounded-full text-lg font-medium inline-flex items-center space-x-2"
              >
                <span>Start Building for Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <div className="mt-8 text-sm text-gray-500">
                No credit card required • Free forever plan
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Minimal */}
        <footer className="py-16 border-t border-gray-900">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-3">
                <AnimatedBlackHoleLogo size={24} />
                <span className="text-lg font-semibold">DeCode</span>
              </div>
              
              <div className="flex items-center gap-8 text-sm text-gray-500">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
              
              <div className="text-sm text-gray-500">
                © 2024 DeCode. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
