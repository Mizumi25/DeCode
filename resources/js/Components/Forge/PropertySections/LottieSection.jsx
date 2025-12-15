// @/Components/Forge/PropertySections/LottieSection.jsx
import React, { useState } from 'react';
import { Sparkles, Play, Pause, RotateCcw, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const LottieSection = ({ 
  selectedComponentData, 
  handlePropertyChange, 
  effectiveStyles 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Only show for Lottie animation types
  if (!['lottie', 'json'].includes(selectedComponentData?.type)) {
    return null;
  }
  
  // Get current Lottie props
  const lottieProps = selectedComponentData?.props || {};
  
  const handleLottieChange = (prop, value) => {
    handlePropertyChange(prop, value, 'props');
  };

  return (
    <div 
      className="border-b"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-50 transition-colors"
        style={{ backgroundColor: 'var(--color-bg-muted)' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
          <span className="font-medium" style={{ color: 'var(--color-text)' }}>
            Lottie Animation
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        ) : (
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          
          {/* Animation Source */}
          <div className="space-y-2">
            <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
              Animation Source
            </label>
            <input
              type="text"
              value={lottieProps.src || ''}
              onChange={(e) => handleLottieChange('src', e.target.value)}
              placeholder="/storage/assets/animation.json"
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          {/* Playback Controls */}
          <div className="space-y-3 p-3 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--color-bg-muted)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Playback
              </label>
            </div>

            {/* Autoplay */}
            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: 'var(--color-text)' }}>
                Autoplay
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={lottieProps.autoplay !== false}
                  onChange={(e) => handleLottieChange('autoplay', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Loop */}
            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: 'var(--color-text)' }}>
                Loop
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={lottieProps.loop !== false}
                  onChange={(e) => handleLottieChange('loop', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: 'var(--color-text)' }}>
                Show Controls
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={lottieProps.controls || false}
                  onChange={(e) => handleLottieChange('controls', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Animation Speed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Animation Speed
              </label>
            </div>
            
            <input
              type="range"
              value={lottieProps.speed || 1}
              onChange={(e) => handleLottieChange('speed', parseFloat(e.target.value))}
              min="0.1"
              max="3"
              step="0.1"
              className="w-full"
            />
            <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span>0.1x (Slow)</span>
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                {lottieProps.speed || 1}x
              </span>
              <span>3x (Fast)</span>
            </div>
          </div>

          {/* Direction */}
          <div className="space-y-2">
            <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
              Direction
            </label>
            <select
              value={lottieProps.direction || 1}
              onChange={(e) => handleLottieChange('direction', parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              <option value={1}>Forward</option>
              <option value={-1}>Reverse</option>
            </select>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
              Play Mode
            </label>
            <select
              value={lottieProps.mode || 'normal'}
              onChange={(e) => handleLottieChange('mode', e.target.value)}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              <option value="normal">Normal</option>
              <option value="bounce">Bounce</option>
            </select>
          </div>

          {/* Renderer */}
          <div className="space-y-2">
            <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
              Renderer
            </label>
            <select
              value={lottieProps.renderer || 'svg'}
              onChange={(e) => handleLottieChange('renderer', e.target.value)}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              <option value="svg">SVG (Best Quality)</option>
              <option value="canvas">Canvas (Better Performance)</option>
              <option value="html">HTML</option>
            </select>
          </div>

          {/* Background */}
          <div className="space-y-2">
            <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
              Background
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={lottieProps.background || 'transparent'}
                onChange={(e) => handleLottieChange('background', e.target.value)}
                className="w-12 h-8 rounded border cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              />
              <input
                type="text"
                value={lottieProps.background || 'transparent'}
                onChange={(e) => handleLottieChange('background', e.target.value)}
                placeholder="transparent"
                className="flex-1 px-2 py-1 rounded text-sm border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
          </div>

          {/* Intermission */}
          <div className="space-y-2">
            <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
              Intermission (ms)
            </label>
            <input
              type="number"
              value={lottieProps.intermission || 0}
              onChange={(e) => handleLottieChange('intermission', parseInt(e.target.value) || 0)}
              min="0"
              step="100"
              placeholder="0"
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Delay between loops (milliseconds)
            </p>
          </div>

          {/* Hover to Play */}
          <div className="flex items-center justify-between p-3 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--color-bg-muted)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div>
              <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
                Hover to Play
              </label>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Play animation on mouse hover
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={lottieProps.hover || false}
                onChange={(e) => handleLottieChange('hover', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Description/Alt */}
          <div className="space-y-2">
            <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
              Description (Alt Text)
            </label>
            <input
              type="text"
              value={lottieProps.alt || ''}
              onChange={(e) => handleLottieChange('alt', e.target.value)}
              placeholder="Animation description for accessibility"
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>

        </div>
      )}
    </div>
  );
};

export default LottieSection;
