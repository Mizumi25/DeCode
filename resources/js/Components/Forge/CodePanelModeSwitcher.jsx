import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  PanelBottom, 
  PanelRight, 
  Layers,
  X,
  Check,
  Maximize2
} from 'lucide-react';

const CodePanelModeSwitcher = ({
  currentMode = 'bottom', // 'modal', 'bottom', 'sidebar'
  onModeChange,
  isOpen = false,
  onToggle,
  isMobile = false,
  showCodePanel = false,
  position = 'bottom-right' // Where to position the switcher: 'top-right', 'bottom-right', etc.
}) => {
  const modes = [
    {
      id: 'modal',
      name: 'Modal Mode',
      icon: Maximize2,
      description: 'Floating draggable window',
      benefits: ['Draggable & resizable', 'Always on top', 'Free positioning', 'Maximum flexibility'],
      disabled: false,
      color: '#8B5CF6' // Purple
    },
    {
      id: 'bottom',
      name: 'Bottom Panel',
      icon: PanelBottom,
      description: 'Docked to bottom of screen',
      benefits: ['Full width view', 'Resizable height', 'Mobile optimized', 'Integrated layout'],
      disabled: false,
      color: '#3B82F6' // Blue
    },
    {
      id: 'sidebar',
      name: 'Right Sidebar',
      icon: PanelRight,
      description: 'Docked to right side',
      benefits: ['Side-by-side view', 'Integrated panels', 'Compact design', 'Desktop optimized'],
      disabled: isMobile,
      color: '#10B981' // Green
    }
  ];

  const handleModeSelect = (modeId) => {
    if (modes.find(m => m.id === modeId)?.disabled) return;
    
    onModeChange(modeId);
    onToggle(false);
  };

  const currentModeInfo = modes.find(m => m.id === currentMode);

  // Position classes for the switcher button
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-[60]`}>
      {/* Toggle Button with Mode Indicator */}
      <button
        onClick={() => onToggle(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl group"
        style={{
          backgroundColor: isOpen ? 'var(--color-primary)' : 'var(--color-surface)',
          color: isOpen ? 'white' : 'var(--color-text)',
          border: `2px solid ${isOpen ? 'var(--color-primary)' : currentModeInfo?.color || 'var(--color-border)'}`,
        }}
        title={`Current: ${currentModeInfo?.name || 'Unknown'} - Click to switch`}
      >
        {/* Mode Icon */}
        {currentModeInfo?.icon && (
          <div className="relative">
            <currentModeInfo.icon className="w-5 h-5" />
            {showCodePanel && (
              <div 
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: '#22c55e' }}
              />
            )}
          </div>
        )}
        
        {/* Mode Name (hidden on mobile) */}
        <span className="hidden sm:inline">
          {currentModeInfo?.name || 'Code Panel'}
        </span>
        
        {/* Chevron/Settings Icon */}
        <Layers className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Mode Switcher Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-[58]" 
              onClick={() => onToggle(false)}
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: position.includes('bottom') ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: position.includes('bottom') ? 10 : -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`absolute ${position.includes('bottom') ? 'bottom-full mb-2' : 'top-full mt-2'} ${position.includes('right') ? 'right-0' : 'left-0'} z-[59] w-[380px] max-w-[calc(100vw-2rem)]`}
            >
              <div 
                className="rounded-2xl border-2 shadow-2xl overflow-hidden backdrop-blur-md"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Header */}
                <div 
                  className="flex items-center justify-between px-5 py-4 border-b-2"
                  style={{ 
                    backgroundColor: 'var(--color-bg-muted)', 
                    borderColor: 'var(--color-border)' 
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
                      <Code2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
                        Code Panel Mode
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Choose your preferred layout
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggle(false)}
                    className="p-2 rounded-lg transition-colors hover:bg-[var(--color-border)]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mode Options */}
                <div className="p-3">
                  {modes.map((mode) => {
                    const IconComponent = mode.icon;
                    const isSelected = currentMode === mode.id;
                    const isDisabled = mode.disabled;
                    
                    return (
                      <motion.button
                        key={mode.id}
                        onClick={() => handleModeSelect(mode.id)}
                        disabled={isDisabled}
                        className="w-full p-4 rounded-xl text-left transition-all duration-200 mb-2 last:mb-0 relative overflow-hidden"
                        style={{
                          backgroundColor: isSelected 
                            ? 'var(--color-primary-soft)' 
                            : isDisabled
                              ? 'var(--color-bg-muted)'
                              : 'var(--color-surface)',
                          border: `2px solid ${isSelected ? mode.color : 'var(--color-border)'}`,
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isDisabled ? 'not-allowed' : 'pointer'
                        }}
                        whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                      >
                        {/* Gradient overlay for selected mode */}
                        {isSelected && (
                          <div 
                            className="absolute inset-0 opacity-10"
                            style={{
                              background: `linear-gradient(135deg, ${mode.color} 0%, transparent 100%)`
                            }}
                          />
                        )}
                        
                        <div className="relative z-10 flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Icon */}
                            <div 
                              className="p-2.5 rounded-xl flex-shrink-0"
                              style={{ 
                                backgroundColor: isSelected 
                                  ? mode.color
                                  : isDisabled
                                    ? 'var(--color-border)'
                                    : 'var(--color-primary-soft)'
                              }}
                            >
                              <IconComponent 
                                className="w-5 h-5" 
                                style={{ 
                                  color: isSelected 
                                    ? 'white' 
                                    : isDisabled
                                      ? 'var(--color-text-muted)'
                                      : mode.color
                                }} 
                              />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 
                                  className="font-bold text-sm"
                                  style={{ 
                                    color: isSelected 
                                      ? mode.color
                                      : isDisabled
                                        ? 'var(--color-text-muted)'
                                        : 'var(--color-text)'
                                  }}
                                >
                                  {mode.name}
                                </h4>
                                {isDisabled && (
                                  <span 
                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
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
                                className="text-xs mb-3"
                                style={{ 
                                  color: isDisabled 
                                    ? 'var(--color-text-muted)' 
                                    : 'var(--color-text-muted)'
                                }}
                              >
                                {mode.description}
                              </p>
                              
                              {/* Benefits */}
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
                                          ? mode.color
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
                              className="flex-shrink-0 p-1.5 rounded-full ml-2"
                              style={{ backgroundColor: mode.color }}
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer with Status */}
                <div 
                  className="px-5 py-3 border-t-2 text-xs"
                  style={{ 
                    backgroundColor: 'var(--color-bg-muted)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>Code Panel Status</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${showCodePanel ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
                      />
                      <span className="font-medium" style={{ 
                        color: showCodePanel ? '#22c55e' : 'var(--color-text-muted)' 
                      }}>
                        {showCodePanel ? 'Active' : 'Inactive'}
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

// Demo Component
export default function Demo() {
  const [currentMode, setCurrentMode] = useState('modal');
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [showCodePanel, setShowCodePanel] = useState(true);
  const [isMobile] = useState(window.innerWidth < 768);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Demo Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Code Panel Mode Switcher
          </h1>
          <p className="text-gray-600">
            Switch between Modal, Bottom Panel, and Sidebar modes with ease
          </p>
        </div>

        {/* Current Mode Display */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 mb-4">
              <span className="text-sm font-medium text-gray-700">Current Mode:</span>
              <span className="text-lg font-bold text-purple-600">{currentMode.toUpperCase()}</span>
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setShowCodePanel(!showCodePanel)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  showCodePanel
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {showCodePanel ? 'Panel Active' : 'Panel Inactive'}
              </button>
            </div>
          </div>
        </div>

        {/* Mode Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              mode: 'modal',
              title: 'Modal Mode',
              color: '#8B5CF6',
              icon: Maximize2,
              description: 'Free-floating draggable window that can be positioned anywhere on screen'
            },
            {
              mode: 'bottom',
              title: 'Bottom Panel',
              color: '#3B82F6',
              icon: PanelBottom,
              description: 'Fixed panel docked to bottom with adjustable height and full width'
            },
            {
              mode: 'sidebar',
              title: 'Right Sidebar',
              color: '#10B981',
              icon: PanelRight,
              description: 'Integrated sidebar on the right for side-by-side code viewing'
            }
          ].map((item) => {
            const IconComp = item.icon;
            const isActive = currentMode === item.mode;
            
            return (
              <button
                key={item.mode}
                onClick={() => setCurrentMode(item.mode)}
                className={`p-6 rounded-2xl text-left transition-all ${
                  isActive ? 'shadow-xl scale-105' : 'shadow-md hover:shadow-lg'
                }`}
                style={{
                  backgroundColor: isActive ? item.color : 'white',
                  color: isActive ? 'white' : '#1f2937',
                  border: `2px solid ${isActive ? item.color : '#e5e7eb'}`
                }}
              >
                <IconComp className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm opacity-90">{item.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* The actual mode switcher component */}
      <CodePanelModeSwitcher
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        isOpen={isSwitcherOpen}
        onToggle={setIsSwitcherOpen}
        isMobile={isMobile}
        showCodePanel={showCodePanel}
        position="bottom-right"
      />
    </div>
  );
}