import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Trash2, 
  Code, 
  Move, 
  Lock, 
  Unlock, 
  Palette, 
  Layout, 
  Type, 
  Box,
  Layers,
  Eye,
  MousePointer,
  Zap,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const PropertiesPanel = ({ 
  canvasComponents, 
  selectedComponent, 
  onPropertyUpdate, 
  onComponentDelete, 
  onGenerateCode,
  componentLibraryService
}) => {
  const [selectedComponentData, setSelectedComponentData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    layout: true,
    appearance: true,
    typography: false,
    effects: false,
    animation: false,
    interactions: false
  });

  useEffect(() => {
    if (selectedComponent && canvasComponents) {
      const component = canvasComponents.find(c => c.id === selectedComponent);
      setSelectedComponentData(component);
    } else {
      setSelectedComponentData(null);
    }
  }, [selectedComponent, canvasComponents]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePropertyChange = (propName, value, category = 'props') => {
    if (!selectedComponent) return;
    
    if (category === 'style') {
      // Handle CSS style properties
      const currentStyles = selectedComponentData?.style || {};
      const newStyles = { ...currentStyles, [propName]: value };
      onPropertyUpdate(selectedComponent, 'style', newStyles);
    } else if (category === 'animation') {
      // Handle animation properties
      const currentAnimation = selectedComponentData?.animation || {};
      const newAnimation = { ...currentAnimation, [propName]: value };
      onPropertyUpdate(selectedComponent, 'animation', newAnimation);
    } else if (propName === 'position') {
      // Handle position updates
      onPropertyUpdate(selectedComponent, 'position', value);
    } else {
      // Handle regular props
      onPropertyUpdate(selectedComponent, propName, value);
    }
  };

  const handlePositionChange = (axis, value) => {
    if (!selectedComponentData) return;
    const newPosition = {
      ...selectedComponentData.position,
      [axis]: parseFloat(value) || 0
    };
    handlePropertyChange('position', newPosition);
  };

  const renderPropertySection = (title, Icon, sectionKey, children) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <div className="border rounded-lg" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <span className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
              {title}
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          )}
        </button>
        {isExpanded && (
          <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  const renderInputField = (label, value, onChange, type = 'text', options = {}) => {
    const baseInputClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm";
    
    return (
      <div className="space-y-1">
        <label className="block text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </label>
        {type === 'select' ? (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
          >
            <option value="">Default</option>
            {options.values?.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        ) : type === 'color' ? (
          <div className="flex gap-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-10 border rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={`${baseInputClasses} flex-1`}
              placeholder="#000000"
            />
          </div>
        ) : type === 'range' ? (
          <div className="space-y-2">
            <input
              type="range"
              min={options.min || 0}
              max={options.max || 100}
              step={options.step || 1}
              value={value || options.min || 0}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
              {value || options.min || 0}{options.unit || ''}
            </div>
          </div>
        ) : type === 'textarea' ? (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInputClasses} resize-vertical min-h-[80px]`}
            rows={3}
          />
        ) : type === 'checkbox' ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label className="ml-2 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {label}
            </label>
          </div>
        ) : (
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            className={baseInputClasses}
            step={type === 'number' ? (options.step || 1) : undefined}
            min={type === 'number' ? options.min : undefined}
            max={type === 'number' ? options.max : undefined}
            placeholder={options.placeholder}
          />
        )}
      </div>
    );
  };

  if (!selectedComponent || !selectedComponentData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Properties</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Select a component to edit</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No component selected.<br />
            Click on a component to see its properties.
          </p>
        </div>
      </div>
    );
  }

  const componentDefinition = componentLibraryService.getComponentDefinition(selectedComponentData.type);
  const currentStyles = selectedComponentData.style || {};
  const currentAnimation = selectedComponentData.animation || {};

  return (
    <div className="space-y-4 max-h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
          <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Properties</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {componentDefinition?.name || selectedComponentData.type} #{selectedComponent.split('_').pop()}
          </p>
        </div>
      </div>

      {/* Component Info */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium" style={{ color: 'var(--color-text)' }}>
            {componentDefinition?.name || selectedComponentData.type}
          </span>
          <span className="text-xs px-2 py-1 rounded-full" style={{ 
            backgroundColor: 'var(--color-primary-soft)', 
            color: 'var(--color-primary)' 
          }}>
            {componentDefinition?.category || 'Component'}
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {componentDefinition?.description || 'No description available'}
        </p>
      </div>

      {/* Layout & Position */}
      {renderPropertySection('Layout & Position', Move, 'layout', (
        <div className="space-y-4">
          {/* Position */}
          <div>
            <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Position</h5>
            <div className="grid grid-cols-2 gap-3">
              {renderInputField('X', selectedComponentData.position.x, (value) => handlePositionChange('x', value), 'number', { step: 1 })}
              {renderInputField('Y', selectedComponentData.position.y, (value) => handlePositionChange('y', value), 'number', { step: 1 })}
            </div>
          </div>

          {/* Size */}
          <div>
            <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Size</h5>
            <div className="grid grid-cols-2 gap-3">
              {renderInputField('Width', currentStyles.width, (value) => handlePropertyChange('width', value, 'style'), 'text', { placeholder: 'auto' })}
              {renderInputField('Height', currentStyles.height, (value) => handlePropertyChange('height', value, 'style'), 'text', { placeholder: 'auto' })}
            </div>
          </div>

          {/* Display & Position Type */}
          <div className="grid grid-cols-2 gap-3">
            {renderInputField('Display', currentStyles.display, (value) => handlePropertyChange('display', value, 'style'), 'select', {
              values: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none']
            })}
            {renderInputField('Position', currentStyles.position, (value) => handlePropertyChange('position', value, 'style'), 'select', {
              values: ['static', 'relative', 'absolute', 'fixed', 'sticky']
            })}
          </div>

          {/* Z-Index */}
          {renderInputField('Z-Index', currentStyles.zIndex, (value) => handlePropertyChange('zIndex', value, 'style'), 'number')}
        </div>
      ))}

      {/* Appearance */}
      {renderPropertySection('Appearance', Palette, 'appearance', (
        <div className="space-y-4">
          {/* Colors */}
          <div>
            <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Colors</h5>
            <div className="space-y-3">
              {renderInputField('Background Color', currentStyles.backgroundColor, (value) => handlePropertyChange('backgroundColor', value, 'style'), 'color')}
              {renderInputField('Text Color', currentStyles.color, (value) => handlePropertyChange('color', value, 'style'), 'color')}
              {renderInputField('Border Color', currentStyles.borderColor, (value) => handlePropertyChange('borderColor', value, 'style'), 'color')}
            </div>
          </div>

          {/* Background */}
          <div>
            <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Background</h5>
            <div className="space-y-3">
              {renderInputField('Background Image', currentStyles.backgroundImage, (value) => handlePropertyChange('backgroundImage', value, 'style'), 'text', { placeholder: 'url() or none' })}
              {renderInputField('Background Size', currentStyles.backgroundSize, (value) => handlePropertyChange('backgroundSize', value, 'style'), 'select', {
                values: ['auto', 'cover', 'contain']
              })}
              {renderInputField('Background Position', currentStyles.backgroundPosition, (value) => handlePropertyChange('backgroundPosition', value, 'style'), 'select', {
                values: ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right']
              })}
              {renderInputField('Background Repeat', currentStyles.backgroundRepeat, (value) => handlePropertyChange('backgroundRepeat', value, 'style'), 'select', {
                values: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y']
              })}
            </div>
          </div>

          {/* Border */}
          <div>
            <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Border</h5>
            <div className="grid grid-cols-2 gap-3">
              {renderInputField('Border Width', currentStyles.borderWidth, (value) => handlePropertyChange('borderWidth', value, 'style'), 'text', { placeholder: '0px' })}
              {renderInputField('Border Style', currentStyles.borderStyle, (value) => handlePropertyChange('borderStyle', value, 'style'), 'select', {
                values: ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset']
              })}
            </div>
            {renderInputField('Border Radius', currentStyles.borderRadius, (value) => handlePropertyChange('borderRadius', value, 'style'), 'text', { placeholder: '0px' })}
          </div>

          {/* Opacity */}
          {renderInputField('Opacity', currentStyles.opacity, (value) => handlePropertyChange('opacity', value, 'style'), 'range', { min: 0, max: 1, step: 0.1 })}
        </div>
      ))}

      {/* Typography */}
      {renderPropertySection('Typography', Type, 'typography', (
        <div className="space-y-4">
          {renderInputField('Font Family', currentStyles.fontFamily, (value) => handlePropertyChange('fontFamily', value, 'style'), 'select', {
            values: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'monospace', 'sans-serif', 'serif']
          })}
          
          <div className="grid grid-cols-2 gap-3">
            {renderInputField('Font Size', currentStyles.fontSize, (value) => handlePropertyChange('fontSize', value, 'style'), 'text', { placeholder: '16px' })}
            {renderInputField('Font Weight', currentStyles.fontWeight, (value) => handlePropertyChange('fontWeight', value, 'style'), 'select', {
              values: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder', 'lighter']
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {renderInputField('Line Height', currentStyles.lineHeight, (value) => handlePropertyChange('lineHeight', value, 'style'), 'text', { placeholder: 'normal' })}
            {renderInputField('Letter Spacing', currentStyles.letterSpacing, (value) => handlePropertyChange('letterSpacing', value, 'style'), 'text', { placeholder: 'normal' })}
          </div>

          {renderInputField('Text Align', currentStyles.textAlign, (value) => handlePropertyChange('textAlign', value, 'style'), 'select', {
            values: ['left', 'center', 'right', 'justify']
          })}

          {renderInputField('Text Transform', currentStyles.textTransform, (value) => handlePropertyChange('textTransform', value, 'style'), 'select', {
            values: ['none', 'uppercase', 'lowercase', 'capitalize']
          })}

          {renderInputField('Text Decoration', currentStyles.textDecoration, (value) => handlePropertyChange('textDecoration', value, 'style'), 'select', {
            values: ['none', 'underline', 'overline', 'line-through']
          })}
        </div>
      ))}

      {/* Effects */}
      {renderPropertySection('Effects', Sparkles, 'effects', (
        <div className="space-y-4">
          {/* Shadow */}
          <div>
            <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Shadow</h5>
            {renderInputField('Box Shadow', currentStyles.boxShadow, (value) => handlePropertyChange('boxShadow', value, 'style'), 'select', {
              values: [
                'none',
                '0 1px 3px rgba(0, 0, 0, 0.1)',
                '0 4px 6px rgba(0, 0, 0, 0.1)',
                '0 10px 15px rgba(0, 0, 0, 0.1)',
                '0 20px 25px rgba(0, 0, 0, 0.1)',
                '0 25px 50px rgba(0, 0, 0, 0.25)'
              ]
            })}
            {renderInputField('Text Shadow', currentStyles.textShadow, (value) => handlePropertyChange('textShadow', value, 'style'), 'text', { placeholder: 'none' })}
          </div>

          {/* Transform */}
          <div>
            <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Transform</h5>
            <div className="grid grid-cols-2 gap-3">
              {renderInputField('Scale', currentStyles.scale, (value) => handlePropertyChange('scale', value, 'style'), 'range', { min: 0, max: 3, step: 0.1 })}
              {renderInputField('Rotate', currentStyles.rotate, (value) => handlePropertyChange('rotate', value, 'style'), 'range', { min: -360, max: 360, step: 1, unit: 'deg' })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderInputField('Translate X', currentStyles.translateX, (value) => handlePropertyChange('translateX', value, 'style'), 'text', { placeholder: '0px' })}
              {renderInputField('Translate Y', currentStyles.translateY, (value) => handlePropertyChange('translateY', value, 'style'), 'text', { placeholder: '0px' })}
            </div>
          </div>

          {/* Filter Effects */}
          <div>
            <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Filters</h5>
            <div className="grid grid-cols-2 gap-3">
              {renderInputField('Blur', currentStyles.filter?.blur, (value) => {
                const currentFilter = currentStyles.filter || {};
                handlePropertyChange('filter', { ...currentFilter, blur: value }, 'style');
              }, 'range', { min: 0, max: 20, step: 1, unit: 'px' })}
              {renderInputField('Brightness', currentStyles.filter?.brightness, (value) => {
                const currentFilter = currentStyles.filter || {};
                handlePropertyChange('filter', { ...currentFilter, brightness: value }, 'style');
              }, 'range', { min: 0, max: 2, step: 0.1 })}
            </div>
          </div>

          {/* Backdrop Filter */}
          {renderInputField('Backdrop Blur', currentStyles.backdropFilter, (value) => handlePropertyChange('backdropFilter', value ? `blur(${value}px)` : 'none', 'style'), 'range', { min: 0, max: 20, step: 1, unit: 'px' })}
        </div>
      ))}

      {/* Animation */}
      {renderPropertySection('Animation & Interactions', Zap, 'animation', (
        <div className="space-y-4">
          {/* Framer Motion Animations */}
          <div>
            <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Framer Motion</h5>
            {renderInputField('Animation Type', currentAnimation.type, (value) => handlePropertyChange('type', value, 'animation'), 'select', {
              values: ['none', 'fadeIn', 'slideIn', 'bounce', 'scale', 'rotate', 'flip']
            })}
            
            {currentAnimation.type && currentAnimation.type !== 'none' && (
              <div className="space-y-3 mt-3">
                {renderInputField('Duration', currentAnimation.duration, (value) => handlePropertyChange('duration', value, 'animation'), 'range', { min: 0.1, max: 5, step: 0.1, unit: 's' })}
                {renderInputField('Delay', currentAnimation.delay, (value) => handlePropertyChange('delay', value, 'animation'), 'range', { min: 0, max: 3, step: 0.1, unit: 's' })}
                {renderInputField('Ease', currentAnimation.ease, (value) => handlePropertyChange('ease', value, 'animation'), 'select', {
                  values: ['linear', 'easeIn', 'easeOut', 'easeInOut', 'circIn', 'circOut', 'circInOut', 'backIn', 'backOut', 'anticipate']
                })}
              </div>
            )}
          </div>

          {/* Scroll Trigger */}
          <div>
            <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Scroll Trigger</h5>
            {renderInputField('Enable Scroll Trigger', currentAnimation.scrollTrigger?.enabled, (value) => {
              const scrollTrigger = currentAnimation.scrollTrigger || {};
              handlePropertyChange('scrollTrigger', { ...scrollTrigger, enabled: value }, 'animation');
            }, 'checkbox')}
            
            {currentAnimation.scrollTrigger?.enabled && (
              <div className="space-y-3 mt-3">
                {renderInputField('Trigger Point', currentAnimation.scrollTrigger.start, (value) => {
                  const scrollTrigger = currentAnimation.scrollTrigger || {};
                  handlePropertyChange('scrollTrigger', { ...scrollTrigger, start: value }, 'animation');
                }, 'range', { min: 0, max: 100, step: 5, unit: '%' })}
                
                {renderInputField('Animation on Scroll', currentAnimation.scrollTrigger.animation, (value) => {
                  const scrollTrigger = currentAnimation.scrollTrigger || {};
                  handlePropertyChange('scrollTrigger', { ...scrollTrigger, animation: value }, 'animation');
                }, 'select', {
                  values: ['fadeIn', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'scaleUp', 'rotateIn']
                })}
              </div>
            )}
          </div>

          {/* Hover Effects */}
          <div>
            <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Hover Effects</h5>
            {renderInputField('Hover Animation', currentAnimation.hover?.type, (value) => {
              const hover = currentAnimation.hover || {};
              handlePropertyChange('hover', { ...hover, type: value }, 'animation');
            }, 'select', {
              values: ['none', 'scale', 'rotate', 'lift', 'glow', 'shake']
            })}
            
            {currentAnimation.hover?.type && currentAnimation.hover.type !== 'none' && (
              <div className="space-y-3 mt-3">
                {renderInputField('Hover Scale', currentAnimation.hover.scale, (value) => {
                  const hover = currentAnimation.hover || {};
                  handlePropertyChange('hover', { ...hover, scale: value }, 'animation');
                }, 'range', { min: 0.8, max: 1.5, step: 0.05 })}
              </div>
            )}
          </div>

          {/* CSS Transitions */}
          <div>
            <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>CSS Transitions</h5>
            {renderInputField('Transition Property', currentStyles.transitionProperty, (value) => handlePropertyChange('transitionProperty', value, 'style'), 'select', {
              values: ['all', 'transform', 'opacity', 'background-color', 'border-color', 'color']
            })}
            {renderInputField('Transition Duration', currentStyles.transitionDuration, (value) => handlePropertyChange('transitionDuration', value, 'style'), 'text', { placeholder: '0.3s' })}
            {renderInputField('Transition Timing', currentStyles.transitionTimingFunction, (value) => handlePropertyChange('transitionTimingFunction', value, 'style'), 'select', {
              values: ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out']
            })}
          </div>
        </div>
      ))}

      {/* Component Name */}
      <div className="space-y-2">
        {renderInputField('Component Name', selectedComponentData.name, (value) => onPropertyUpdate(selectedComponent, 'name', value))}
      </div>

      {/* Component-specific Properties */}
      {componentDefinition?.prop_definitions && Object.keys(componentDefinition.prop_definitions).length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Box className="w-4 h-4" />
            Component Properties
          </h4>
          
          <div className="space-y-3">
            {Object.entries(componentDefinition.prop_definitions).map(([propName, propDef]) => {
              const currentValue = selectedComponentData.props[propName];
              
              return (
                <div key={propName}>
                  {propDef.type === 'string' && renderInputField(
                    propDef.label || propName.charAt(0).toUpperCase() + propName.slice(1),
                    currentValue,
                    (value) => handlePropertyChange(propName, value),
                    'text',
                    { placeholder: propDef.default || '' }
                  )}
                  
                  {propDef.type === 'textarea' && renderInputField(
                    propDef.label || propName.charAt(0).toUpperCase() + propName.slice(1),
                    currentValue,
                    (value) => handlePropertyChange(propName, value),
                    'textarea'
                  )}
                  
                  {propDef.type === 'number' && renderInputField(
                    propDef.label || propName.charAt(0).toUpperCase() + propName.slice(1),
                    currentValue,
                    (value) => handlePropertyChange(propName, value),
                    'number',
                    { 
                      step: propDef.step || 1, 
                      min: propDef.min, 
                      max: propDef.max 
                    }
                  )}
                  
                  {propDef.type === 'boolean' && renderInputField(
                    propDef.label || propName.charAt(0).toUpperCase() + propName.slice(1),
                    currentValue,
                    (value) => handlePropertyChange(propName, value),
                    'checkbox'
                  )}
                  
                  {propDef.type === 'select' && renderInputField(
                    propDef.label || propName.charAt(0).toUpperCase() + propName.slice(1),
                    currentValue,
                    (value) => handlePropertyChange(propName, value),
                    'select',
                    { values: propDef.options }
                  )}
                  
                  {propDef.type === 'color' && renderInputField(
                    propDef.label || propName.charAt(0).toUpperCase() + propName.slice(1),
                    currentValue,
                    (value) => handlePropertyChange(propName, value),
                    'color'
                  )}
                  
                  {propDef.type === 'range' && renderInputField(
                    propDef.label || propName.charAt(0).toUpperCase() + propName.slice(1),
                    currentValue,
                    (value) => handlePropertyChange(propName, value),
                    'range',
                    { 
                      min: propDef.min || 0, 
                      max: propDef.max || 100, 
                      step: propDef.step || 1 
                    }
                  )}
                  
                  {propDef.description && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {propDef.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => onGenerateCode([selectedComponentData])}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Code className="w-4 h-4" />
          Generate Code
        </button>
        
        <button
          onClick={() => onComponentDelete(selectedComponent)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Component
        </button>
        
        <button
          onClick={() => handlePropertyChange('reset', true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Styles
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;