// FloatingFrameSwitcher.jsx - Modern minimalist frame switcher with proper animations
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Monitor, Smartphone, Tablet, Globe, Eye, Grid3X3, Layers, Settings } from 'lucide-react';

const FloatingFrameSwitcher = ({ currentFrame, onFrameSwitch, isMobile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredFrame, setHoveredFrame] = useState(null);
  const panelRef = useRef(null);

  // Mock frame data - replace with your actual frame data (STATIC for now)
  const frames = [
    {
      id: 'frame-1',
      name: 'Landing Page',
      type: 'desktop',
      icon: Monitor,
      preview: '/api/placeholder/200/120',
      lastModified: '2m ago',
      components: 12
    },
    {
      id: 'frame-2', 
      name: 'Mobile View',
      type: 'mobile',
      icon: Smartphone,
      preview: '/api/placeholder/200/120',
      lastModified: '5m ago',
      components: 8
    },
    {
      id: 'frame-3',
      name: 'Dashboard',
      type: 'desktop',
      icon: Grid3X3,
      preview: '/api/placeholder/200/120',
      lastModified: '1h ago',
      components: 24
    },
    {
      id: 'frame-4',
      name: 'Settings',
      type: 'tablet',
      icon: Settings,
      preview: '/api/placeholder/200/120',
      lastModified: '2h ago',
      components: 6
    },
    {
      id: 'frame-5',
      name: 'Profile',
      type: 'mobile',
      icon: Eye,
      preview: '/api/placeholder/200/120',
      lastModified: '3h ago',
      components: 15
    }
  ];

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  // Handle frame selection (STATIC - just console log for now)
  const handleFrameSelect = (frameId) => {
    console.log('Frame selected (STATIC):', frameId);
    onFrameSwitch?.(frameId);
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  // Toggle panel
  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  // Get icon for frame type
  const getFrameTypeIcon = (type) => {
    switch (type) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      case 'desktop': return Monitor;
      default: return Globe;
    }
  };

  // Animation variants
  const panelVariants = {
    closed: {
      width: 'auto',
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        when: "afterChildren"
      }
    },
    open: {
      width: isMobile ? 320 : 380,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        when: "beforeChildren"
      }
    }
  };

  const contentVariants = {
    closed: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay: 0.1,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    closed: { rotate: 0 },
    open: { rotate: 180 },
    hover: { scale: 1.05 }
  };

  return (
    <div 
      ref={panelRef}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
      style={{
        filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))'
      }}
    >
      <motion.div 
        variants={panelVariants}
        animate={isExpanded ? "open" : "closed"}
        initial="closed"
        className="relative"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: isMobile ? '12px 0 0 12px' : '16px 0 0 16px'
        }}
      >
        {/* Trigger Button - Always visible */}
        <motion.button
          onClick={togglePanel}
          variants={buttonVariants}
          animate={isExpanded ? "open" : "closed"}
          whileHover="hover"
          whileTap={{ scale: 0.95 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
          style={{
            width: isMobile ? '28px' : '32px',
            height: isMobile ? '56px' : '64px',
            backgroundColor: 'var(--color-primary)',
            borderRadius: isMobile ? '8px 0 0 8px' : '12px 0 0 12px',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label={isExpanded ? 'Close frame switcher' : 'Open frame switcher'}
        >
          <ChevronLeft 
            className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} 
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </motion.button>

        {/* Panel Content - Only rendered when expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              variants={contentVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="border backdrop-blur-xl"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: isMobile ? '12px 0 0 12px' : '16px 0 0 16px',
                marginRight: isMobile ? '28px' : '32px',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {/* Header */}
              <div 
                className={`${isMobile ? 'p-4 pb-3' : 'p-5 pb-4'} border-b`}
                style={{ borderColor: 'var(--color-border)' }}
              >
                <h3 
                  className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold mb-1`}
                  style={{ 
                    color: 'var(--color-text)',
                    fontSize: isMobile ? 'var(--fs-sm)' : 'var(--fs-base)'
                  }}
                >
                  Frame Switcher
                </h3>
                <p 
                  className={`${isMobile ? 'text-xs' : 'text-sm'}`}
                  style={{ 
                    color: 'var(--color-text-muted)',
                    fontSize: isMobile ? '0.75rem' : 'var(--fs-sm)'
                  }}
                >
                  {frames.length} frames available
                </p>
              </div>

              {/* Frame List */}
              <div 
                className={`${isMobile ? 'p-2' : 'p-3'} custom-scrollbar`}
                style={{ maxHeight: '60vh', overflowY: 'auto' }}
              >
                <div className="space-y-1">
                  {frames.map((frame) => {
                    const FrameIcon = frame.icon;
                    const TypeIcon = getFrameTypeIcon(frame.type);
                    const isActive = currentFrame === frame.id;
                    const isHovered = hoveredFrame === frame.id;

                    return (
                      <motion.button
                        key={frame.id}
                        onClick={() => handleFrameSelect(frame.id)}
                        onMouseEnter={() => setHoveredFrame(frame.id)}
                        onMouseLeave={() => setHoveredFrame(null)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          w-full ${isMobile ? 'p-3' : 'p-4'} relative overflow-hidden
                          border transition-all duration-200
                        `}
                        style={{
                          backgroundColor: isActive 
                            ? 'var(--color-primary-soft)' 
                            : isHovered 
                              ? 'var(--color-bg-muted)'
                              : 'transparent',
                          borderColor: isActive 
                            ? 'var(--color-primary)' 
                            : 'var(--color-border)',
                          borderRadius: 'var(--radius-lg)',
                          color: 'var(--color-text)'
                        }}
                      >
                        <div className="flex items-start gap-3">
                          
                          {/* Frame Preview */}
                          <div 
                            className={`
                              ${isMobile ? 'w-12 h-8' : 'w-16 h-10'}
                              overflow-hidden flex-shrink-0 relative
                            `}
                            style={{
                              backgroundColor: 'var(--color-bg-muted)',
                              borderRadius: 'var(--radius-md)',
                              border: isActive ? `2px solid var(--color-primary)` : `1px solid var(--color-border)`
                            }}
                          >
                            <div 
                              className="absolute inset-0 opacity-20"
                              style={{
                                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)'
                              }}
                            />
                            <div 
                              className="absolute inset-2 rounded opacity-80"
                              style={{ backgroundColor: 'var(--color-surface)' }}
                            />
                            <div className="absolute bottom-1 right-1">
                              <TypeIcon 
                                className="w-2.5 h-2.5" 
                                style={{ color: 'var(--color-text-muted)' }}
                              />
                            </div>
                          </div>

                          {/* Frame Info */}
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FrameIcon 
                                className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} flex-shrink-0`} 
                                style={{ color: 'var(--color-text-muted)' }}
                              />
                              <h4 
                                className={`
                                  ${isMobile ? 'text-sm' : 'text-base'} font-medium truncate
                                `}
                                style={{ 
                                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                                  fontSize: isMobile ? 'var(--fs-sm)' : 'var(--fs-base)'
                                }}
                              >
                                {frame.name}
                              </h4>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span 
                                className={isMobile ? 'text-xs' : 'text-sm'}
                                style={{ 
                                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                  fontSize: isMobile ? '0.75rem' : 'var(--fs-sm)'
                                }}
                              >
                                {frame.components} components
                              </span>
                              <span 
                                className={isMobile ? 'text-xs' : 'text-sm'}
                                style={{ 
                                  color: 'var(--color-text-muted)',
                                  fontSize: isMobile ? '0.75rem' : 'var(--fs-sm)'
                                }}
                              >
                                {frame.lastModified}
                              </span>
                            </div>
                          </div>

                          {/* Active Indicator */}
                          {isActive && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                              />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div 
                className={`${isMobile ? 'p-3 pt-2' : 'p-4 pt-3'} border-t`}
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-muted)'
                }}
              >
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full ${isMobile ? 'py-2 px-3' : 'py-2.5 px-4'} 
                    font-medium text-white
                    flex items-center justify-center gap-2
                  `}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: isMobile ? '0.75rem' : 'var(--fs-sm)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => console.log('Create New Frame (STATIC)')}
                >
                  <Layers className="w-4 h-4" />
                  Create New Frame
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--color-text-muted) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--color-text-muted);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: var(--color-text);
        }
      `}</style>
    </div>
  );
};

export default FloatingFrameSwitcher;