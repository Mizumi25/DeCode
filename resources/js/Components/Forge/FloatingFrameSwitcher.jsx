import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { router } from '@inertiajs/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Eye, 
  Grid3X3, 
  Layers, 
  Settings, 
  Plus,
  Clock,
  Users,
  Loader2,
  ExternalLink
} from 'lucide-react';

import Modal from '@/Components/Modal'; // Add this import
import FrameCreator from '@/Components/Void/FrameCreator';

const FloatingFrameSwitcher = ({ 
  currentFrame, 
  onFrameSwitch, 
  isMobile, 
  projectFrames = [], 
  projectId,
  isFrameSwitching = false,
  frameTransitionPhase = 'idle'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredFrame, setHoveredFrame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [showFrameCreator, setShowFrameCreator] = useState(false); // ADD THIS STATE
  const panelRef = useRef(null);
  const searchInputRef = useRef(null);
  const triggerRef = useRef(null); // ADD REF FOR TRIGGER BUTTON

  // Animation values
  const panelWidth = useMotionValue(0);
  const triggerRotation = useSpring(0, { stiffness: 300, damping: 30 });

  // Filter frames to only show frames from the current project
  const frames = useMemo(() => {
    if (projectFrames && projectFrames.length > 0) {
      return projectFrames.map(frame => ({
        ...frame,
        isActive: frame.id === currentFrame || frame.uuid === currentFrame,
        uuid: frame.uuid || frame.id
      }));
    }

    return [
      {
        id: currentFrame,
        name: 'Current Frame',
        type: 'desktop',
        icon: Monitor,
        thumbnail: '/api/placeholder/200/120',
        lastModified: 'Now',
        components: 0,
        isActive: true,
        status: 'active',
        collaborators: 1
      }
    ];
  }, [projectFrames, currentFrame]);

  // Filter frames based on search
  const filteredFrames = useMemo(() => {
    if (!searchTerm.trim()) return frames;
    
    return frames.filter(frame => 
      frame.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      frame.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [frames, searchTerm]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both panel AND trigger button
      if (panelRef.current && !panelRef.current.contains(event.target) && 
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  // Focus search input when panel expands
  useEffect(() => {
    if (isExpanded && searchInputRef.current && !isMobile) {
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [isExpanded, isMobile]);

  // Update trigger rotation based on state
  useEffect(() => {
    triggerRotation.set(isExpanded ? 180 : 0);
  }, [isExpanded, triggerRotation]);

  // Enhanced frame selection with real URL navigation
  const handleFrameSelect = useCallback((frameId) => {
    if (frameId === currentFrame || isFrameSwitching || isNavigating) return;
    
    setIsNavigating(true);
    
    const targetFrame = frames.find(f => f.id === frameId || f.uuid === frameId);
    const frameUuid = targetFrame?.uuid || frameId;
    
    if (!projectId || !frameUuid) {
      setIsNavigating(false);
      return;
    }
    
    const targetUrl = `/void/${projectId}/frame=${frameUuid}/modeForge`;
    
    router.get(targetUrl, {}, {
      preserveState: false,
      preserveScroll: false,
      replace: true,
      onFinish: () => setIsNavigating(false)
    });
    
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [frames, currentFrame, projectId, isFrameSwitching, isNavigating, isMobile]);

  // Toggle panel with smooth animation - FIXED POSITIONING
  const togglePanel = () => {
    if (isFrameSwitching || isNavigating) return;
    
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setSearchTerm('');
    }
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

  // Get status color and label
  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { color: 'var(--color-success)', label: 'Active' };
      case 'draft':
        return { color: 'var(--color-warning)', label: 'Draft' };
      case 'review':
        return { color: 'var(--color-info)', label: 'Review' };
      default:
        return { color: 'var(--color-text-muted)', label: 'Unknown' };
    }
  };

  // ADD: Handle create new frame - show modal instead of navigating
  const handleCreateNewFrame = () => {
    console.log('Opening frame creator modal for project:', projectId);
    setShowFrameCreator(true);
    setIsExpanded(false); // Close the switcher panel
  };

  // ADD: Handle frame creation success
  const handleFrameCreated = (newFrame) => {
    setShowFrameCreator(false);
    // The parent component (ForgePage) should handle refreshing the frame list
    // You might want to add a callback prop for this
    console.log('Frame created, should refresh frame list');
  };

  const isActivelyChanging = isFrameSwitching || isNavigating;

  // Animation variants
  const panelVariants = {
    closed: {
      x: '100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: 0.1,
        duration: 0.2 
      }
    }
  };

  const searchVariants = {
    closed: { opacity: 0, scale: 0.95 },
    open: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 0.05,
        duration: 0.2 
      }
    }
  };

  return (
    <>
      <div 
        ref={panelRef}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
        style={{
          filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))'
        }}
      >
        <div className="relative">
          {/* FIXED Trigger Button - Added ref and fixed positioning */}
            <motion.button
              ref={triggerRef}
              onClick={togglePanel}
              whileHover={{ scale: isActivelyChanging ? 1 : 1.05 }}
              whileTap={{ scale: isActivelyChanging ? 1 : 0.95 }}
              disabled={isActivelyChanging}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 group"
              style={{
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '56px' : '64px',
                backgroundColor: isActivelyChanging ? 'var(--color-text-muted)' : 'var(--color-primary)',
                borderRadius: isMobile ? '8px 0 0 8px' : '12px 0 0 12px',
                color: 'white',
                border: 'none',
                cursor: isActivelyChanging ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                transformOrigin: 'center center'
              }}
              aria-label={isExpanded ? 'Close frame switcher' : 'Open frame switcher'}
            >
            {isActivelyChanging ? (
              <Loader2 className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <motion.div style={{ rotate: triggerRotation }}>
                <ChevronLeft className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
              </motion.div>
            )}
            
            {/* Active frame indicator */}
            <div 
              className="absolute left-1 top-1/2 -translate-y-1/2 w-1 rounded-full transition-all duration-200"
              style={{
                height: '20px',
                backgroundColor: isActivelyChanging ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                opacity: frameTransitionPhase === 'loading' ? 0.5 : 1
              }}
            />
          </motion.button>

          {/* Enhanced Panel Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={panelVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="border backdrop-blur-xl"
                style={{
                  width: isMobile ? 320 : 400,
                  maxHeight: isMobile ? '70vh' : '80vh',
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  borderRadius: isMobile ? '12px 0 0 12px' : '16px 0 0 12px',
                  marginRight: isMobile ? '28px' : '32px',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                {/* Enhanced Header with Search */}
                <motion.div 
                  variants={itemVariants}
                  className={`${isMobile ? 'p-4 pb-3' : 'p-5 pb-4'} border-b space-y-3`}
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 
                        className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold mb-1`}
                        style={{ 
                          color: 'var(--color-text)',
                          fontSize: isMobile ? 'var(--fs-sm)' : 'var(--fs-base)'
                        }}
                      >
                        Project Frames
                      </h3>
                      <p 
                        className={`${isMobile ? 'text-xs' : 'text-sm'}`}
                        style={{ 
                          color: 'var(--color-text-muted)',
                          fontSize: isMobile ? '0.75rem' : 'var(--fs-sm)'
                        }}
                      >
                        {filteredFrames.length} of {frames.length} frames
                      </p>
                    </div>
                    
                    {isActivelyChanging && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--color-primary)' }} />
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {isNavigating ? 'Loading...' : 'Switching...'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Search Input */}
                  {!isMobile && frames.length > 1 && (
                    <motion.div variants={searchVariants}>
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search frames..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                        style={{
                          backgroundColor: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                          '&:focus': {
                            borderColor: 'var(--color-primary)',
                            boxShadow: `0 0 0 2px var(--color-primary-soft)`
                          }
                        }}
                        disabled={isActivelyChanging}
                      />
                    </motion.div>
                  )}
                </motion.div>

                {/* Enhanced Frame List */}
                <motion.div 
                  variants={itemVariants}
                  className={`${isMobile ? 'p-2' : 'p-3'} custom-scrollbar flex-1 overflow-y-auto`}
                  style={{ maxHeight: isMobile ? '50vh' : '60vh' }}
                >
                  {filteredFrames.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <Layers className="w-8 h-8 mx-auto opacity-50" />
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {searchTerm ? 'No frames match your search' : 'No frames available'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <AnimatePresence mode="popLayout">
                        {filteredFrames.map((frame, index) => {
                          const FrameIcon = frame.icon && typeof frame.icon === 'function' ? frame.icon : Globe;
                          const TypeIcon = getFrameTypeIcon(frame.type);
                          const isActive = frame.isActive || currentFrame === frame.id;
                          const isHovered = hoveredFrame === frame.id;
                          const statusInfo = getStatusInfo(frame.status);

                          return (
                            <motion.div
                              key={frame.id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <motion.button
                                onClick={() => handleFrameSelect(frame.id)}
                                onMouseEnter={() => setHoveredFrame(frame.id)}
                                onMouseLeave={() => setHoveredFrame(null)}
                                whileHover={{ scale: isActivelyChanging ? 1 : 1.02 }}
                                whileTap={{ scale: isActivelyChanging ? 1 : 0.98 }}
                                disabled={isActivelyChanging || isActive}
                                className={`
                                  w-full ${isMobile ? 'p-3' : 'p-4'} relative overflow-hidden
                                  border transition-all duration-200 group
                                  ${isActivelyChanging && !isActive ? 'opacity-50 cursor-not-allowed' : ''}
                                  ${isActive ? 'cursor-default' : 'cursor-pointer'}
                                `}
                                style={{
                                  backgroundColor: isActive 
                                    ? 'var(--color-primary-soft)' 
                                    : isHovered && !isActivelyChanging
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
                                  
                                  {/* Enhanced Frame Preview */}
                                  <div 
                                    className={`
                                      ${isMobile ? 'w-12 h-8' : 'w-16 h-10'}
                                      overflow-hidden flex-shrink-0 relative group
                                    `}
                                    style={{
                                      backgroundColor: 'var(--color-bg-muted)',
                                      borderRadius: 'var(--radius-md)',
                                      border: isActive ? `2px solid var(--color-primary)` : `1px solid var(--color-border)`
                                    }}
                                  >
                                    {(() => {
                                      const thumbPath = frame.settings?.thumbnail_path;
                                      const thumbVer = frame.settings?.thumbnail_version || frame.settings?.thumbnail_generated_at || Date.now();
                                      const thumbUrl = thumbPath ? `/storage/${thumbPath}?v=${thumbVer}` : null;
                                      if (thumbUrl) {
                                        return (
                                          <img
                                            src={thumbUrl}
                                            alt={`${frame.name || frame.title || 'Frame'} thumbnail`}
                                            className="absolute inset-0 w-full h-full object-cover"
                                          />
                                        );
                                      }
                                      return (
                                        <>
                                          <div 
                                            className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                                            style={{
                                              background: `linear-gradient(135deg, ${statusInfo.color} 0%, var(--color-accent) 100%)`
                                            }}
                                          />
                                          <div 
                                            className="absolute inset-2 rounded opacity-80"
                                            style={{ backgroundColor: 'var(--color-surface)' }}
                                          />
                                        </>
                                      );
                                    })()}
                                    <div className="absolute bottom-1 right-1">
                                      <TypeIcon 
                                        className="w-2.5 h-2.5" 
                                        style={{ color: 'var(--color-text-muted)' }}
                                      />
                                    </div>
                                    
                                    {/* Loading overlay for current frame during navigation */}
                                    {isNavigating && isActive && (
                                      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                                        <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--color-primary)' }} />
                                      </div>
                                    )}
                                  </div>

                                  {/* Enhanced Frame Info */}
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
                                      
                                      {/* Status Badge */}
                                      <div 
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: statusInfo.color }}
                                        title={statusInfo.label}
                                      />
                                    </div>
                                    
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <span 
                                          className={isMobile ? 'text-xs' : 'text-sm'}
                                          style={{ 
                                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                            fontSize: isMobile ? '0.75rem' : 'var(--fs-sm)'
                                          }}
                                        >
                                          {frame.components || 0} components
                                        </span>
                                        
                                        {frame.collaborators > 0 && (
                                          <div className="flex items-center gap-1">
                                            <Users 
                                              className="w-3 h-3" 
                                              style={{ color: 'var(--color-text-muted)' }}
                                            />
                                            <span 
                                              className="text-xs"
                                              style={{ color: 'var(--color-text-muted)' }}
                                            >
                                              {frame.collaborators}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <Clock className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
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
                                  </div>

                                  {/* Active Indicator & Switch Icon */}
                                  <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
                                    {isActive ? (
                                      <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                      />
                                    ) : !isActivelyChanging ? (
                                      <ExternalLink 
                                        className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity"
                                        style={{ color: 'var(--color-text-muted)' }}
                                      />
                                    ) : null}
                                  </div>
                                </div>
                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>

                {/* Enhanced Footer */}
                <motion.div 
                  variants={itemVariants}
                  className={`${isMobile ? 'p-3 pt-2' : 'p-4 pt-3'} border-t space-y-3`}
                  style={{ 
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg-muted)'
                  }}
                >
                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <div className="flex items-center gap-3">
                      <span>Active: {frames.filter(f => f.status === 'active').length}</span>
                      <span>Draft: {frames.filter(f => f.status === 'draft').length}</span>
                      <span>Review: {frames.filter(f => f.status === 'review').length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{frames.reduce((sum, f) => sum + (f.collaborators || 0), 0)}</span>
                    </div>
                  </div>

                  {/* Create New Frame Button */}
                  <motion.button 
                    whileHover={{ scale: isActivelyChanging ? 1 : 1.02 }}
                    whileTap={{ scale: isActivelyChanging ? 1 : 0.98 }}
                    className={`
                      w-full ${isMobile ? 'py-2 px-3' : 'py-2.5 px-4'} 
                      font-medium text-white
                      flex items-center justify-center gap-2
                      transition-all duration-200
                      ${isActivelyChanging ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
                    `}
                    style={{
                      backgroundColor: isActivelyChanging ? 'var(--color-text-muted)' : 'var(--color-primary)',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: isMobile ? '0.75rem' : 'var(--fs-sm)',
                      border: 'none',
                      cursor: isActivelyChanging ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleCreateNewFrame}
                    disabled={isActivelyChanging}
                  >
                    {isActivelyChanging ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create New Frame
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

     {/* ADD: Frame Creator Modal */}
    {showFrameCreator && (
      <Modal
        show={showFrameCreator}
        onClose={() => setShowFrameCreator(false)}
        title="Create New Frame"
        maxWidth="lg"
        closeable={true}
        blurBackground={true}
      >
        <FrameCreator
          project={{ id: projectId, uuid: projectId, name: 'Current Project' }}
          onFrameCreated={(newFrame) => {
            setShowFrameCreator(false);
            // Navigate to the newly created frame
            if (newFrame && newFrame.uuid) {
              handleFrameSelect(newFrame.uuid);
            }
          }}
          onClose={() => setShowFrameCreator(false)}
        />
      </Modal>
    )}
    </>
  );
};

export default FloatingFrameSwitcher;