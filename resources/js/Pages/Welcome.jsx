import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Code2, 
  Palette, 
  Zap, 
  Sparkles, 
  Globe, 
  Layers3,
  MousePointer2,
  Star,
  ArrowUpRight,
  Play,
  Check
} from 'lucide-react';
import AnimatedBlackHoleLogo from '@/Components/AnimatedBlackHoleLogo';

export default function Welcome({ auth }) {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // GSAP animations with ScrollTrigger
    if (typeof window !== 'undefined') {
      // Hero animations
      const tl = {
        set: (target, props) => {
          const elements = typeof target === 'string' ? document.querySelectorAll(target) : [target];
          elements.forEach(el => {
            Object.assign(el.style, props);
          });
        },
        to: (target, props) => {
          const elements = typeof target === 'string' ? document.querySelectorAll(target) : [target];
          elements.forEach(el => {
            const duration = props.duration || 1;
            const delay = props.delay || 0;
            
            setTimeout(() => {
              Object.keys(props).forEach(key => {
                if (key !== 'duration' && key !== 'delay' && key !== 'ease') {
                  el.style.transition = `${key} ${duration}s ease-out`;
                  el.style[key] = props[key];
                }
              });
            }, delay * 1000);
          });
        }
      };

      // Initial states
      tl.set('.hero-title', { opacity: '0', transform: 'translateY(50px)' });
      tl.set('.hero-subtitle', { opacity: '0', transform: 'translateY(30px)' });
      tl.set('.hero-buttons', { opacity: '0', transform: 'translateY(20px)' });
      tl.set('.feature-card', { opacity: '0', transform: 'translateY(40px)' });
      tl.set('.stat-item', { opacity: '0', transform: 'translateY(30px)' });

      // Hero animations
      setTimeout(() => {
        tl.to('.hero-title', { opacity: '1', transform: 'translateY(0)', duration: 0.8, delay: 0.2 });
        tl.to('.hero-subtitle', { opacity: '1', transform: 'translateY(0)', duration: 0.8, delay: 0.4 });
        tl.to('.hero-buttons', { opacity: '1', transform: 'translateY(0)', duration: 0.8, delay: 0.6 });
      }, 100);

      // Scroll-triggered animations
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '-50px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('feature-card')) {
              const cards = document.querySelectorAll('.feature-card');
              cards.forEach((card, index) => {
                setTimeout(() => {
                  card.style.transition = 'all 0.6s ease-out';
                  card.style.opacity = '1';
                  card.style.transform = 'translateY(0)';
                }, index * 100);
              });
            }
            
            if (entry.target.classList.contains('stats-section')) {
              const stats = document.querySelectorAll('.stat-item');
              stats.forEach((stat, index) => {
                setTimeout(() => {
                  stat.style.transition = 'all 0.6s ease-out';
                  stat.style.opacity = '1';
                  stat.style.transform = 'translateY(0)';
                }, index * 150);
              });
            }
          }
        });
      }, observerOptions);

      // Observe elements
      document.querySelectorAll('.feature-card').forEach(el => observer.observe(el));
      const statsSection = document.querySelector('.stats-section');
      if (statsSection) observer.observe(statsSection);

      return () => observer.disconnect();
    }
  }, []);

  const features = [
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Visual Builder",
      description: "Drag and drop components to build stunning websites without coding"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Smart Design System",
      description: "AI-powered design suggestions that adapt to your brand"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Generate production-ready code in seconds with our AI engine"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Responsive by Default",
      description: "Every design automatically works perfectly on all devices"
    },
    {
      icon: <Layers3 className="w-6 h-6" />,
      title: "Component Library",
      description: "Access thousands of pre-built components and templates"
    },
    {
      icon: <MousePointer2 className="w-6 h-6" />,
      title: "One-Click Deploy",
      description: "Deploy your websites instantly to the cloud with zero configuration"
    }
  ];

  const stats = [
    { number: "50K+", label: "Websites Created" },
    { number: "99.9%", label: "Uptime" },
    { number: "< 2s", label: "Load Time" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <>
      <Head title="DeCode - Visual Frontend Builder" />
      
      {/* Custom Styles */}
      <style>{`
        body {
          background: var(--color-bg);
          color: var(--color-text);
        }
        
        .gradient-bg {
          background: linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%);
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .feature-hover {
          transition: all 0.3s ease;
        }
        
        .feature-hover:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
        }
        
        .btn-primary {
          background: var(--color-primary);
          color: white;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          background: var(--color-primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(160, 82, 255, 0.3);
        }
        
        .floating-shapes {
          position: absolute;
          pointer-events: none;
          z-index: -1;
        }
        
        .shape-1 {
          width: 100px;
          height: 100px;
          background: linear-gradient(45deg, var(--color-primary), var(--color-accent));
          border-radius: 50%;
          top: 10%;
          left: 80%;
          animation: float 6s ease-in-out infinite;
        }
        
        .shape-2 {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #7c3aed, var(--color-primary));
          border-radius: var(--radius-lg);
          top: 60%;
          left: 10%;
          animation: float 8s ease-in-out infinite reverse;
        }
        
        .shape-3 {
          width: 80px;
          height: 80px;
          background: linear-gradient(45deg, var(--color-accent), var(--color-primary));
          border-radius: 30%;
          top: 30%;
          left: 5%;
          animation: float 7s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .hero-gradient {
          background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-muted) 100%);
        }
      `}</style>

      <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
        
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
               {/* Animated Logo with Glow Wrapper */}
                <div 
                  className="relative flex items-center justify-center"
                  style={{
                    filter: `
                      drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))
                      drop-shadow(0 0 16px rgba(139, 92, 246, 0.4))
                      drop-shadow(0 0 24px rgba(147, 51, 234, 0.3))
                    `
                  }}
                >
                  <AnimatedBlackHoleLogo size={30} />
                </div>
                <span className="text-xl font-bold">DeCode</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="hover:text-purple-600 transition-colors">Features</a>
                <a href="#about" className="hover:text-purple-600 transition-colors">About</a>
                <a href="#pricing" className="hover:text-purple-600 transition-colors">Pricing</a>
              </div>
              
              <div className="flex items-center space-x-4">
                {auth.user ? (
                  <Link
                    href="/projects"
                    className="btn-primary px-6 py-2 rounded-lg font-medium flex items-center space-x-2"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="btn-primary px-6 py-2 rounded-lg font-medium"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
          <div className="floating-shapes">
            <div className="shape-1"></div>
            <div className="shape-2"></div>
            <div className="shape-3"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI-Powered Frontend Builder</span>
              </div>
              
              <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Build Websites
                <span className="block gradient-bg bg-clip-text text-transparent">
                  Visually
                </span>
              </h1>
              
              <p className="hero-subtitle text-xl md:text-2xl mb-12 max-w-3xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                Create stunning, responsive websites without code. Our AI-powered visual builder 
                transforms your ideas into production-ready web applications.
              </p>
              
              <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  href="/register"
                  className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2"
                >
                  <span>Start Building Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <button className="flex items-center space-x-2 px-6 py-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} id="features" className="py-24" style={{ background: 'var(--color-bg-muted)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Everything you need to
                <span className="block gradient-bg bg-clip-text text-transparent">build amazing websites</span>
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                Powerful features that make web development accessible to everyone, 
                from beginners to professionals.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="feature-card feature-hover p-8 rounded-2xl"
                  style={{ 
                    background: 'var(--color-surface)', 
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p style={{ color: 'var(--color-text-muted)' }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="stats-section grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item text-center">
                  <div className="text-4xl md:text-5xl font-bold gradient-bg bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24" style={{ background: 'var(--color-bg-muted)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Loved by creators worldwide</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="p-8 rounded-2xl"
                  style={{ 
                    background: 'var(--color-surface)', 
                    border: '1px solid var(--color-border)' 
                  }}
                >
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
                    "DeCode transformed how I build websites. What used to take weeks now takes hours."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 gradient-bg rounded-full"></div>
                    <div>
                      <div className="font-semibold">Alex Johnson</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Frontend Developer
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to build something
              <span className="block gradient-bg bg-clip-text text-transparent">amazing?</span>
            </h2>
            <p className="text-xl mb-12" style={{ color: 'var(--color-text-muted)' }}>
              Join thousands of creators who are already building the future with DeCode.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                href="/register"
                className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2"
              >
                <span>Start Building Today</span>
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-6 mt-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DeCode</span>
              </div>
              
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                © 2024 DeCode. Built with love for creators.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}