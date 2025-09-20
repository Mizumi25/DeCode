// @/Components/Forge/CodePanelModeSwitcher.jsx - Switch between Modal, Bottom, and Sidebar modes
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  PanelRight, 
  Settings,
  X,
  Check
} from 'lucide-react';

const CodePanelModeSwitcher = ({
  currentMode = 'bottom', // 'modal', 'bottom', 'sidebar'
  onModeChange,
  isOpen = false,
  onToggle,
  isMobile = false,
  showCodePanel = false
}) => {
  const modes = [
    {
      id: 'modal',
      name: 'Modal Mode',
      icon: Settings,
      description: 'Draggable floating window',
      benefits: ['Draggable & resizable', 'Always on top', 'Free positioning'],
      disabled: false
    },
    {
      id: 'bottom',
      name: 'Bottom Panel',
      icon: Settings,
      description: 'Docked to bottom of screen',
      benefits: ['Full width', 'Resizable height', 'Mobile optimized'],
      disabled: false
    },
    {
      id: 'sidebar',
      name: 'Right Sidebar',
      icon: PanelRight,
      description: 'Docked to right side',
      benefits: ['Side-by-side view', 'Integrated panels', 'Compact'],
      disabled: isMobile // Disabled on mobile
    }
  ];

  const handleModeSelect = (modeId) => {
    if (modes.find(m => m.id === modeId)?.disabled) return;
    
    onModeChange(modeId);
    onToggle(false); // Close the switcher
  };

  const currentModeInfo = modes.find(m => m.id === currentMode);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => onToggle(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${isOpen ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-muted)] text-[var(--color-text)]'}
          hover:scale-105 active:scale-95
        `}
        title={`Current: ${currentModeInfo?.name || 'Unknown'} - Click to switch`}
      >
        {currentModeInfo?.icon && <currentModeInfo.icon className="w-4 h-4" />}
        <span className="hidden sm:inline">{currentModeInfo?.name || 'Code Panel'}</span>
        <Settings className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* Mode Switcher Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-[998]" 
              onClick={() => onToggle(false)}
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute top-full right-0 mt-2 z-[999] min-w-[320px] max-w-[400px]"
            >
              <div 
                className="rounded-xl border shadow-2xl overflow-hidden backdrop-blur-md"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Header */}
                <div 
                  className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ 
                    backgroundColor: 'var(--color-bg-muted)', 
                    borderColor: 'var(--color-border)' 
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
                      <Code2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                        Code Panel Mode
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Choose how to display the code panel
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggle(false)}
                    className="p-1 rounded-md transition-colors hover:bg-[var(--color-border)]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mode Options */}
                <div className="p-2">
                  {modes.map((mode) => {
                    const IconComponent = mode.icon;
                    const isSelected = currentMode === mode.id;
                    const isDisabled = mode.disabled;
                    
                    return (
                      <motion.button
                        key={mode.id}
                        onClick={() => handleModeSelect(mode.id)}
                        disabled={isDisabled}
                        className={`
                          w-full p-3 rounded-lg text-left transition-all duration-200 mb-2 last:mb-0
                          ${isSelected 
                            ? 'bg-[var(--color-primary-soft)] border-2 border-[var(--color-primary)]' 
                            : isDisabled
                              ? 'bg-[var(--color-bg-muted)] border-2 border-transparent opacity-50 cursor-not-allowed'
                              : 'bg-[var(--color-bg-muted)] border-2 border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                          }
                        `}
                        whileHover={!isDisabled ? { scale: 1.02 } : {}}
                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div 
                              className="p-2 rounded-lg flex-shrink-0 mt-0.5"
                              style={{ 
                                backgroundColor: isSelected 
                                  ? 'var(--color-primary)' 
                                  : isDisabled
                                    ? 'var(--color-border)'
                                    : 'var(--color-primary-soft)'
                              }}
                            >
                              <IconComponent 
                                className="w-4 h-4" 
                                style={{ 
                                  color: isSelected 
                                    ? 'white' 
                                    : isDisabled
                                      ? 'var(--color-text-muted)'
                                      : 'var(--color-primary)'
                                }} 
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 
                                  className="font-semibold text-sm"
                                  style={{ 
                                    color: isSelected 
                                      ? 'var(--color-primary)' 
                                      : isDisabled
                                        ? 'var(--color-text-muted)'
                                        : 'var(--color-text)'
                                  }}
                                >
                                  {mode.name}
                                </h4>
                                {isDisabled && (
                                  <span 
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ 
                                      backgroundColor: 'var(--color-border)',
                                      color: 'var(--color-text-muted)'
                                    }}
                                  >
                                    Mobile N/A
                                  </span>
                                )}
                              </div>
                              
                              <p 
                                className="text-xs mb-2"
                                style={{ 
                                  color: isDisabled 
                                    ? 'var(--color-text-muted)' 
                                    : 'var(--color-text-muted)'
                                }}
                              >
                                {mode.description}
                              </p>
                              
                              <div className="space-y-1">
                                {mode.benefits.map((benefit, index) => (
                                  <div 
                                    key={index} 
                                    className="flex items-center gap-2 text-xs"
                                    style={{ 
                                      color: isDisabled 
                                        ? 'var(--color-text-muted)' 
                                        : 'var(--color-text-muted)'
                                    }}
                                  >
                                    <div 
                                      className="w-1 h-1 rounded-full flex-shrink-0"
                                      style={{ 
                                        backgroundColor: isSelected 
                                          ? 'var(--color-primary)' 
                                          : isDisabled
                                            ? 'var(--color-text-muted)'
                                            : 'var(--color-text-muted)'
                                      }}
                                    />
                                    <span>{benefit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Selection Indicator */}
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex-shrink-0 p-1 rounded-full ml-2"
                              style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div 
                  className="px-4 py-3 border-t text-xs"
                  style={{ 
                    backgroundColor: 'var(--color-bg-muted)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>Code Panel: {showCodePanel ? 'Active' : 'Inactive'}</span>
                    <div className="flex items-center gap-1">
                      <div 
                        className={`w-2 h-2 rounded-full ${showCodePanel ? 'bg-green-500' : 'bg-gray-400'}`}
                      />
                      <span className="text-xs">
                        {showCodePanel ? 'Live' : 'Closed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodePanelModeSwitcher;