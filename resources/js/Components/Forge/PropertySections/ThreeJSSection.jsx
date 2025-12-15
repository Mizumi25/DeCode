// @/Components/Forge/PropertySections/ThreeJSSection.jsx
import React, { useState } from 'react';
import { Box, Sun, Move, RotateCw, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';

const ThreeJSSection = ({ 
  selectedComponentData, 
  handlePropertyChange, 
  effectiveStyles 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Only show for 3D model types
  if (!['3d-model', '3d', 'gltf', 'glb'].includes(selectedComponentData?.type)) {
    return null;
  }
  
  // Get current 3D props
  const threejsProps = selectedComponentData?.props?.threejs || {};
  
  const handleThreeJSChange = (prop, value) => {
    const currentProps = selectedComponentData?.props?.threejs || {};
    handlePropertyChange('threejs', { ...currentProps, [prop]: value }, 'props');
  };
  
  const handleVectorChange = (vectorName, axis, value) => {
    const currentProps = selectedComponentData?.props?.threejs || {};
    const currentVector = currentProps[vectorName] || { x: 0, y: 0, z: 0 };
    handleThreeJSChange(vectorName, { ...currentVector, [axis]: parseFloat(value) || 0 });
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
          <Box className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
          <span className="font-medium" style={{ color: 'var(--color-text)' }}>
            3D Model Settings
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
          
          {/* Camera Position */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Move className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Camera Position
              </label>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {['x', 'y', 'z'].map((axis) => (
                <div key={axis}>
                  <label className="text-xs uppercase mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                    {axis}
                  </label>
                  <input
                    type="number"
                    value={threejsProps.cameraPosition?.[axis] || (axis === 'z' ? 5 : 0)}
                    onChange={(e) => handleVectorChange('cameraPosition', axis, e.target.value)}
                    step="0.1"
                    className="w-full px-2 py-1 rounded text-sm border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Model Rotation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <RotateCw className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Model Rotation
              </label>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {['x', 'y', 'z'].map((axis) => (
                <div key={axis}>
                  <label className="text-xs uppercase mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                    {axis}
                  </label>
                  <input
                    type="number"
                    value={threejsProps.rotation?.[axis] || 0}
                    onChange={(e) => handleVectorChange('rotation', axis, e.target.value)}
                    step="0.1"
                    min="-3.14"
                    max="3.14"
                    className="w-full px-2 py-1 rounded text-sm border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Model Scale */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Maximize2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Model Scale
              </label>
            </div>
            
            <input
              type="range"
              value={threejsProps.scale || 1}
              onChange={(e) => handleThreeJSChange('scale', parseFloat(e.target.value))}
              min="0.1"
              max="5"
              step="0.1"
              className="w-full"
            />
            <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span>0.1x</span>
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                {threejsProps.scale || 1}x
              </span>
              <span>5x</span>
            </div>
          </div>

          {/* Lighting */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Lighting
              </label>
            </div>

            {/* Ambient Light */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                Ambient Light Intensity
              </label>
              <input
                type="range"
                value={threejsProps.ambientLightIntensity || 0.5}
                onChange={(e) => handleThreeJSChange('ambientLightIntensity', parseFloat(e.target.value))}
                min="0"
                max="2"
                step="0.1"
                className="w-full"
              />
              <div className="text-xs text-right mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {threejsProps.ambientLightIntensity || 0.5}
              </div>
            </div>

            {/* Directional Light */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                Directional Light Intensity
              </label>
              <input
                type="range"
                value={threejsProps.directionalLightIntensity || 1}
                onChange={(e) => handleThreeJSChange('directionalLightIntensity', parseFloat(e.target.value))}
                min="0"
                max="3"
                step="0.1"
                className="w-full"
              />
              <div className="text-xs text-right mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {threejsProps.directionalLightIntensity || 1}
              </div>
            </div>

            {/* Light Color */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                Light Color
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={threejsProps.lightColor || '#ffffff'}
                  onChange={(e) => handleThreeJSChange('lightColor', e.target.value)}
                  className="w-12 h-8 rounded border cursor-pointer"
                  style={{ borderColor: 'var(--color-border)' }}
                />
                <input
                  type="text"
                  value={threejsProps.lightColor || '#ffffff'}
                  onChange={(e) => handleThreeJSChange('lightColor', e.target.value)}
                  className="flex-1 px-2 py-1 rounded text-sm border"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Auto-Rotate */}
          <div className="flex items-center justify-between p-3 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--color-bg-muted)',
              borderColor: 'var(--color-border)'
            }}
          >
            <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Auto-Rotate
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={threejsProps.autoRotate || false}
                onChange={(e) => handleThreeJSChange('autoRotate', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Auto-Rotate Speed */}
          {threejsProps.autoRotate && (
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                Rotation Speed
              </label>
              <input
                type="range"
                value={threejsProps.autoRotateSpeed || 1}
                onChange={(e) => handleThreeJSChange('autoRotateSpeed', parseFloat(e.target.value))}
                min="0.1"
                max="5"
                step="0.1"
                className="w-full"
              />
              <div className="text-xs text-right mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {threejsProps.autoRotateSpeed || 1}x
              </div>
            </div>
          )}

          {/* Background Color */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
              Background Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={threejsProps.backgroundColor || '#f3f4f6'}
                onChange={(e) => handleThreeJSChange('backgroundColor', e.target.value)}
                className="w-12 h-8 rounded border cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              />
              <input
                type="text"
                value={threejsProps.backgroundColor || '#f3f4f6'}
                onChange={(e) => handleThreeJSChange('backgroundColor', e.target.value)}
                className="flex-1 px-2 py-1 rounded text-sm border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-2 p-3 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--color-bg-muted)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: 'var(--color-text)' }}>
                Enable Zoom
              </label>
              <input
                type="checkbox"
                checked={threejsProps.enableZoom !== false}
                onChange={(e) => handleThreeJSChange('enableZoom', e.target.checked)}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: 'var(--color-text)' }}>
                Enable Pan
              </label>
              <input
                type="checkbox"
                checked={threejsProps.enablePan !== false}
                onChange={(e) => handleThreeJSChange('enablePan', e.target.checked)}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: 'var(--color-text)' }}>
                Enable Rotate
              </label>
              <input
                type="checkbox"
                checked={threejsProps.enableRotate !== false}
                onChange={(e) => handleThreeJSChange('enableRotate', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ThreeJSSection;
