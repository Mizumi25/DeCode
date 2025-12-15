// @/Components/Forge/PropertySections/MediaSection.jsx
import React, { useState } from 'react';
import { Film, Image, Music, Volume2, Play, Settings, ChevronDown, ChevronUp } from 'lucide-react';

const MediaSection = ({ 
  selectedComponentData, 
  handlePropertyChange, 
  effectiveStyles 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Only show for media types (image, video, audio, gif)
  const mediaTypes = ['image', 'img', 'video', 'audio', 'gif'];
  if (!mediaTypes.includes(selectedComponentData?.type)) {
    return null;
  }
  
  // Get current media props
  const mediaProps = selectedComponentData?.props || {};
  const componentType = selectedComponentData?.type;
  
  const handleMediaChange = (prop, value) => {
    handlePropertyChange(prop, value, 'props');
  };

  // Get icon based on type
  const getIcon = () => {
    if (['video'].includes(componentType)) return <Film className="w-4 h-4" />;
    if (['audio'].includes(componentType)) return <Music className="w-4 h-4" />;
    return <Image className="w-4 h-4" />;
  };

  // Get section title based on type
  const getTitle = () => {
    if (componentType === 'video') return 'Video Settings';
    if (componentType === 'audio') return 'Audio Settings';
    return 'Image Settings';
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
          {getIcon()}
          <span className="font-medium" style={{ color: 'var(--color-text)' }}>
            {getTitle()}
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
          
          {/* Source URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
              Source URL
            </label>
            <input
              type="text"
              value={mediaProps.src || ''}
              onChange={(e) => handleMediaChange('src', e.target.value)}
              placeholder={`/storage/assets/${componentType === 'video' ? 'video.mp4' : componentType === 'audio' ? 'audio.mp3' : 'image.jpg'}`}
              className="w-full px-3 py-2 rounded border text-sm font-mono"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          {/* Alt Text (for images and videos) */}
          {['image', 'img', 'video', 'gif'].includes(componentType) && (
            <div className="space-y-2">
              <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
                Alt Text
              </label>
              <input
                type="text"
                value={mediaProps.alt || ''}
                onChange={(e) => handleMediaChange('alt', e.target.value)}
                placeholder="Describe this media for accessibility"
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
          )}

          {/* Video/Audio Specific Controls */}
          {['video', 'audio'].includes(componentType) && (
            <>
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

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <label className="text-sm" style={{ color: 'var(--color-text)' }}>
                    Show Controls
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mediaProps.controls !== false}
                      onChange={(e) => handleMediaChange('controls', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                      checked={mediaProps.autoplay || false}
                      onChange={(e) => handleMediaChange('autoplay', e.target.checked)}
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
                      checked={mediaProps.loop || false}
                      onChange={(e) => handleMediaChange('loop', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Muted */}
                <div className="flex items-center justify-between">
                  <label className="text-sm" style={{ color: 'var(--color-text)' }}>
                    Muted
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mediaProps.muted || false}
                      onChange={(e) => handleMediaChange('muted', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Playback Speed */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Playback Speed
                  </label>
                </div>
                
                <input
                  type="range"
                  value={mediaProps.playbackRate || 1}
                  onChange={(e) => handleMediaChange('playbackRate', parseFloat(e.target.value))}
                  min="0.25"
                  max="2"
                  step="0.25"
                  className="w-full"
                />
                <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>0.25x</span>
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {mediaProps.playbackRate || 1}x
                  </span>
                  <span>2x</span>
                </div>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Volume
                  </label>
                </div>
                
                <input
                  type="range"
                  value={mediaProps.volume !== undefined ? mediaProps.volume : 1}
                  onChange={(e) => handleMediaChange('volume', parseFloat(e.target.value))}
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full"
                  disabled={mediaProps.muted}
                />
                <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>0%</span>
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {Math.round((mediaProps.volume !== undefined ? mediaProps.volume : 1) * 100)}%
                  </span>
                  <span>100%</span>
                </div>
              </div>

              {/* Preload */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
                  Preload
                </label>
                <select
                  value={mediaProps.preload || 'metadata'}
                  onChange={(e) => handleMediaChange('preload', e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  <option value="none">None</option>
                  <option value="metadata">Metadata Only</option>
                  <option value="auto">Auto (Full)</option>
                </select>
              </div>
            </>
          )}

          {/* Video Specific */}
          {componentType === 'video' && (
            <>
              {/* Poster Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
                  Poster Image (Thumbnail)
                </label>
                <input
                  type="text"
                  value={mediaProps.poster || ''}
                  onChange={(e) => handleMediaChange('poster', e.target.value)}
                  placeholder="/storage/assets/thumbnail.jpg"
                  className="w-full px-3 py-2 rounded border text-sm font-mono"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>

              {/* Picture in Picture */}
              <div className="flex items-center justify-between p-3 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--color-bg-muted)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div>
                  <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
                    Picture in Picture
                  </label>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Allow users to watch in floating window
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mediaProps.disablePictureInPicture !== true}
                    onChange={(e) => handleMediaChange('disablePictureInPicture', !e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </>
          )}

          {/* Image Specific */}
          {['image', 'img', 'gif'].includes(componentType) && (
            <>
              {/* Object Fit */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
                  Object Fit
                </label>
                <select
                  value={effectiveStyles.objectFit || 'cover'}
                  onChange={(e) => handlePropertyChange('objectFit', e.target.value, 'style')}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  <option value="contain">Contain</option>
                  <option value="cover">Cover</option>
                  <option value="fill">Fill</option>
                  <option value="none">None</option>
                  <option value="scale-down">Scale Down</option>
                </select>
              </div>

              {/* Loading */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>
                  Loading Strategy
                </label>
                <select
                  value={mediaProps.loading || 'lazy'}
                  onChange={(e) => handleMediaChange('loading', e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  <option value="lazy">Lazy (Load when visible)</option>
                  <option value="eager">Eager (Load immediately)</option>
                </select>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};

export default MediaSection;