// @/Components/Forge/CanvasSettingsDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Eye, X, RotateCw, Maximize2, Grid, Layers, Move } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCanvasOverlayStore } from '@/stores/useCanvasOverlayStore';




const CanvasSettingsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  
  // Get from Zustand store
  const { overlays, toggleOverlay, resetOverlays, getActiveCount } = useCanvasOverlayStore();
  const activeCount = getActiveCount();

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle dropdown with Shift + I (Inspection)
      if (e.shiftKey && e.key === 'I') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Quick toggles when dropdown is open
      if (isOpen) {
        if (e.key === '1') {
          e.preventDefault();
          toggleOverlay('showSelectionBorders');
        }
        if (e.key === '2') {
          e.preventDefault();
          toggleOverlay('showLabel');
        }
        if (e.key === '3') {
          e.preventDefault();
          toggleOverlay('showSnapGuides');
        }
        if (e.key === '4') {
          e.preventDefault();
          toggleOverlay('showSpacingIndicators');
        }
        if (e.key === '5') {
          e.preventDefault();
          toggleOverlay('showGridLines');
        }
        if (e.key === '6') {
          e.preventDefault();
          toggleOverlay('enableComponentReflow');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleOverlay]);

  // Setting configurations with icons and descriptions
  const settingConfigs = [
    {
      key: 'showSelectionBorders',
      label: 'Selection Borders',
      description: 'Blue borders around selected components',
      icon: Maximize2,
      color: '#3b82f6',
      shortcut: '1',
    },
    {
      key: 'showLabel',
      label: 'Selection Label',
      description: 'Labels and Element info',
      icon: Maximize2,
      color: '#3b82f6',
      shortcut: '1',
    },
    {
      key: 'showSnapGuides',
      label: 'Snap Guides',
      description: 'Alignment guides when dragging',
      icon: Grid,
      color: '#8b5cf6',
      shortcut: '2',
    },
    {
      key: 'showSpacingIndicators',
      label: 'Spacing Indicators',
      description: 'Padding and margin visualization',
      icon: Maximize2,
      color: '#10b981',
      shortcut: '3',
    },
    {
      key: 'showComponentFrames',
      label: 'Component Frames',
      description: 'Outlines around all components',
      icon: Layers,
      color: '#f59e0b',
      shortcut: null,
    },
    {
      key: 'showGridLines',
      label: 'Grid Lines',
      description: 'Background grid for alignment',
      icon: Grid,
      color: '#6366f1',
      shortcut: '4',
    },
    {
      key: 'showDistanceMeasurements',
      label: 'Distance Measurements',
      description: 'Pixel distances between elements',
      icon: Maximize2,
      color: '#ec4899',
      shortcut: null,
    },
    {
      key: 'showDropZones',
      label: 'Drop Zones',
      description: 'Highlight valid drop targets',
      icon: Layers,
      color: '#14b8a6',
      shortcut: null,
    },
    {
      key: 'showNestedHighlight',
      label: 'Nested Highlight',
      description: 'Show nested component borders',
      icon: Layers,
      color: '#a855f7',
      shortcut: null,
    },
    // NEW: Component Reflow Toggle
    {
      key: 'enableComponentReflow',
      label: 'Component Reflow',
      description: 'Other components adjust when dragging',
      icon: Move,
      color: '#f43f5e',
      shortcut: '5',
      isCritical: true, // Mark as important setting
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-all duration-200 group"
        style={{ 
          backgroundColor: isOpen ? 'var(--color-primary-soft)' : 'transparent',
          color: isOpen ? 'var(--color-primary)' : 'var(--color-text-muted)'
        }}
        onMouseEnter={(e) => !isOpen && (e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)')}
        onMouseLeave={(e) => !isOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
        title="Canvas Settings (Shift+I)"
      >
        <Eye className="w-5 h-5" />
        
        {/* Active count badge */}
        {activeCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'white'
            }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden z-50"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          {/* Header */}
          <div 
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ 
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg-muted)'
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary-soft)' }}
              >
                <Eye className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                   Canvas Settings
                </h4>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {activeCount} of {settingConfigs.length} active
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
          
          {/* Settings List */}
          <div className="max-h-96 overflow-y-auto">
            <div className="p-2 space-y-1">
              {settingConfigs.map((config) => {
                const Icon = config.icon;
                const isActive = overlays[config.key];
                
                return (
                  <label 
                    key={config.key}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                      config.isCritical ? 'ring-2 ring-offset-2 ring-offset-white' : ''
                    }`}
                    style={{ 
                      backgroundColor: isActive ? `${config.color}10` : 'transparent',
                      ringColor: config.isCritical && isActive ? config.color : 'transparent'
                    }}
                    onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)')}
                    onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleOverlay(config.key)}
                      className="w-5 h-5 rounded transition-all cursor-pointer"
                      style={{ 
                        accentColor: config.color,
                        flexShrink: 0
                      }}
                    />
                    
                    {/* Icon */}
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ 
                        backgroundColor: isActive ? `${config.color}20` : 'var(--color-bg-muted)',
                        color: isActive ? config.color : 'var(--color-text-muted)'
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    {/* Label and Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-sm font-medium"
                          style={{ 
                            color: isActive ? config.color : 'var(--color-text)'
                          }}
                        >
                          {config.label}
                        </span>
                        
                        {config.shortcut && (
                          <kbd 
                            className="px-1.5 py-0.5 text-[10px] font-mono rounded"
                            style={{ 
                              backgroundColor: 'var(--color-bg-muted)',
                              color: 'var(--color-text-muted)',
                              border: '1px solid var(--color-border)'
                            }}
                          >
                            {config.shortcut}
                          </kbd>
                        )}
                        
                        {config.isCritical && (
                          <span 
                            className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ 
                              backgroundColor: `${config.color}20`,
                              color: config.color
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                      <p 
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {config.description}
                      </p>
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: config.color }}
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
          
          {/* Footer with actions */}
          <div 
            className="p-3 border-t flex items-center justify-between"
            style={{ 
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg-muted)'
            }}
          >
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Press <kbd className="px-1 py-0.5 rounded bg-gray-200 text-gray-700 font-mono">Shift+I</kbd> to toggle
            </div>
            
            <button
              onClick={resetOverlays}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-soft)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-surface)'}
            >
              <RotateCw className="w-3 h-3 inline mr-1" />
              Reset to Defaults
            </button>
          </div>
          
          {/* Keyboard shortcuts hint */}
          <div 
            className="px-3 py-2 text-xs border-t"
            style={{ 
              backgroundColor: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)'
            }}
          >
            <div className="font-semibold mb-1">Quick Toggles:</div>
            <div className="grid grid-cols-2 gap-1">
              <div><kbd className="text-[10px]">1</kbd> Selection</div>
              <div><kbd className="text-[10px]">2</kbd> Snap Guides</div>
              <div><kbd className="text-[10px]">3</kbd> Spacing</div>
              <div><kbd className="text-[10px]">4</kbd> Grid</div>
              <div><kbd className="text-[10px]">5</kbd> Reflow</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};


export default CanvasSettingsDropdown;