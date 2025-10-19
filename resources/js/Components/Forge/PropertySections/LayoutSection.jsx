import React, { useState, useCallback, useEffect } from 'react';
import { Move, Layout, Columns, Grid3X3, Maximize, Square, MousePointer, Layers, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader } from '../PropertyUtils';

const LayoutSection = ({ 
  currentStyles, 
  onPropertyChange, 
  expandedSections, 
  setExpandedSections, 
  selectedComponentData,
  searchTerm = ''
}) => {
  // Local state to prevent input reset issues during typing
  const [localValues, setLocalValues] = useState({});
  const [typingTimeouts, setTypingTimeouts] = useState({});

  // Sync local values only when component ID changes
  useEffect(() => {
    if (selectedComponentData?.id) {
      setLocalValues(currentStyles || {});
    }
  }, [selectedComponentData?.id]);

  // Debounced update to database
  const debouncedUpdate = useCallback((property, value, category = 'style') => {
    // Clear existing timeout for this property
    if (typingTimeouts[property]) {
      clearTimeout(typingTimeouts[property]);
    }

    // Set new timeout to save after user stops typing
    const timeoutId = setTimeout(() => {
      onPropertyChange(property, value, category);
    }, 500); // 500ms delay

    setTypingTimeouts(prev => ({
      ...prev,
      [property]: timeoutId
    }));
  }, [onPropertyChange, typingTimeouts]);

  const handleInputChange = useCallback((property, value, category = 'style') => {
    // Update local state immediately for responsive UI
    setLocalValues(prev => ({
      ...prev,
      [property]: value
    }));

    // Debounce database update
    debouncedUpdate(property, value, category);
  }, [debouncedUpdate]);

  const handleInputBlur = useCallback((property, value, category = 'style') => {
    // Force immediate save on blur
    if (typingTimeouts[property]) {
      clearTimeout(typingTimeouts[property]);
    }
    onPropertyChange(property, value, category);
  }, [onPropertyChange, typingTimeouts]);

  const VisualButtonGroup = ({ label, value, onChange, options, icons = {} }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</label>
      <div className="overflow-x-auto overflow-y-hidden pb-2" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex gap-1 p-1 rounded-lg min-w-max" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          {options.map((option) => {
            const Icon = icons[option];
            const isActive = value === option;
            return (
              <button
                key={option}
                onClick={() => onChange(option)}
                className="flex-shrink-0 px-3 py-2 text-xs rounded-md transition-all font-medium hover:opacity-90 whitespace-nowrap"
                style={isActive ? {
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                } : {
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)'
                }}
              >
                {Icon ? (
                  <div className="flex items-center justify-center gap-1">
                    <Icon className="w-3 h-3" />
                    <span className="capitalize text-xs">{option.replace(/-/g, ' ')}</span>
                  </div>
                ) : (
                  <span className="capitalize text-xs">{option.replace(/-/g, ' ')}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const SpacingControl = ({ label, property, value, onChange }) => {
  const [allValue, setAllValue] = useState('');
  const [individualValues, setIndividualValues] = useState({
    top: '',
    right: '',
    bottom: '',
    left: ''
  });
  const [isTyping, setIsTyping] = useState(false);

  // Parse current value when value prop changes OR when user stops typing
  useEffect(() => {
    if (value && typeof value === 'string') {
      const parts = value.split(' ').map(v => v.replace(/px|rem|em|%/g, ''));
      
      if (parts.length === 1) {
        const val = parts[0];
        setAllValue(val);
        setIndividualValues({
          top: val,
          right: val,
          bottom: val,
          left: val
        });
      } else if (parts.length === 4) {
        setIndividualValues({
          top: parts[0],
          right: parts[1],
          bottom: parts[2],
          left: parts[3]
        });
        setAllValue(''); // Clear all value when using individual values
      }
    } else {
      // Reset if value is empty
      setAllValue('');
      setIndividualValues({
        top: '',
        right: '',
        bottom: '',
        left: ''
      });
    }
  }, [value]); // Remove isTyping from dependencies

  const handleAllChange = (val) => {
    setIsTyping(true);
    setAllValue(val);
    // Update individual values immediately for better UX
    setIndividualValues({
      top: val,
      right: val,
      bottom: val,
      left: val
    });
  };

  const handleAllBlur = () => {
    setIsTyping(false);
    if (allValue === '' || allValue === '0') {
      onChange(property, '0px');
    } else {
      onChange(property, `${allValue}px`);
    }
  };

  const handleIndividualChange = (side, val) => {
    setIsTyping(true);
    setIndividualValues(prev => ({
      ...prev,
      [side]: val
    }));
    // Clear all value when using individual inputs
    setAllValue('');
  };

  const handleIndividualBlur = () => {
    setIsTyping(false);
    const newValue = `${individualValues.top || 0}px ${individualValues.right || 0}px ${individualValues.bottom || 0}px ${individualValues.left || 0}px`;
    onChange(property, newValue);
  };

  // Add immediate save on Enter key
  const handleKeyPress = (e, callback) => {
    if (e.key === 'Enter') {
      callback();
      e.target.blur();
    }
  };

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border)' }}>
      <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>{label}</label>
      <div className="grid grid-cols-3 gap-3">
        {/* All Sides Control */}
        <div className="text-center">
          <div className="text-xs mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>All Sides</div>
          <input
            type="number"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
            placeholder="0"
            value={allValue}
            onChange={(e) => handleAllChange(e.target.value)}
            onBlur={handleAllBlur}
            onKeyPress={(e) => handleKeyPress(e, handleAllBlur)}
            onFocus={() => setIsTyping(true)}
            min="0"
            step="1"
          />
          <div className="text-xs mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>pixels</div>
        </div>
        
        {/* Individual Sides */}
        <div className="col-span-2 grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs mb-1 font-medium text-center" style={{ color: 'var(--color-text-muted)' }}>Top</div>
            <input
              type="number"
              className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="0"
              value={individualValues.top}
              onChange={(e) => handleIndividualChange('top', e.target.value)}
              onBlur={handleIndividualBlur}
              onKeyPress={(e) => handleKeyPress(e, handleIndividualBlur)}
              onFocus={() => setIsTyping(true)}
              min="0"
              step="1"
            />
          </div>
          <div>
            <div className="text-xs mb-1 font-medium text-center" style={{ color: 'var(--color-text-muted)' }}>Right</div>
            <input
              type="number"
              className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="0"
              value={individualValues.right}
              onChange={(e) => handleIndividualChange('right', e.target.value)}
              onBlur={handleIndividualBlur}
              onKeyPress={(e) => handleKeyPress(e, handleIndividualBlur)}
              onFocus={() => setIsTyping(true)}
              min="0"
              step="1"
            />
          </div>
          <div>
            <div className="text-xs mb-1 font-medium text-center" style={{ color: 'var(--color-text-muted)' }}>Bottom</div>
            <input
              type="number"
              className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="0"
              value={individualValues.bottom}
              onChange={(e) => handleIndividualChange('bottom', e.target.value)}
              onBlur={handleIndividualBlur}
              onKeyPress={(e) => handleKeyPress(e, handleIndividualBlur)}
              onFocus={() => setIsTyping(true)}
              min="0"
              step="1"
            />
          </div>
          <div>
            <div className="text-xs mb-1 font-medium text-center" style={{ color: 'var(--color-text-muted)' }}>Left</div>
            <input
              type="number"
              className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="0"
              value={individualValues.left}
              onChange={(e) => handleIndividualChange('left', e.target.value)}
              onBlur={handleIndividualBlur}
              onKeyPress={(e) => handleKeyPress(e, handleIndividualBlur)}
              onFocus={() => setIsTyping(true)}
              min="0"
              step="1"
            />
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Current: {value || '0px'}
      </div>
    </div>
  );
};

  return (
    <>
      {/* Position & Display Section */}
      <PropertySection
        title="Position & Display"
        Icon={MousePointer}
        sectionKey="position-display"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        defaultExpanded={true}
        searchTerm={searchTerm}
      >
        <div className="rounded-lg border-2 p-4 mb-4" style={{ 
          background: 'linear-gradient(135deg, var(--color-primary-soft) 0%, transparent 100%)',
          borderColor: 'var(--color-border)'
        }}>
          <SubsectionHeader title="Quick Layout Conversion" />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                onPropertyChange('display', 'flex', 'style');
                onPropertyChange('flexDirection', 'row', 'style');
                onPropertyChange('gap', '16px', 'style');
              }}
              className="px-4 py-3 rounded-lg border-2 transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: (localValues.display || currentStyles.display) === 'grid' ? 'var(--color-primary)' : 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              <Grid3X3 className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
              <div className="text-sm font-semibold">Grid</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>2D grid system</div>
            </button>
          </div>
        </div>

        <VisualButtonGroup
          label="Position Type"
          value={localValues.position || currentStyles.position || 'static'}
          onChange={(value) => {
            handleInputChange('position', value);
            onPropertyChange('position', value, 'style');
          }}
          options={['static', 'relative', 'absolute', 'fixed', 'sticky']}
        />

        <VisualButtonGroup
          label="Display Type"
          value={localValues.display || currentStyles.display || 'block'}
          onChange={(value) => {
            handleInputChange('display', value);
            onPropertyChange('display', value, 'style');
          }}
          options={['block', 'inline-block', 'flex', 'grid', 'none']}
        />

        {(currentStyles.position && currentStyles.position !== 'static') && (
          <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: 'var(--color-primary-soft)', border: '1px solid var(--color-border)' }}>
            <SubsectionHeader title="Position Offset Values" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Top</label>
                <input
                  type="text"
                  value={localValues.top || currentStyles.top || ''}
                  onChange={(e) => handleInputChange('top', e.target.value)}
                  onBlur={(e) => handleInputBlur('top', e.target.value)}
                  placeholder="auto, 0px, 10%, 2rem"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Right</label>
                <input
                  type="text"
                  value={localValues.right || currentStyles.right || ''}
                  onChange={(e) => handleInputChange('right', e.target.value)}
                  onBlur={(e) => handleInputBlur('right', e.target.value)}
                  placeholder="auto, 0px, 10%, 2rem"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Bottom</label>
                <input
                  type="text"
                  value={localValues.bottom || currentStyles.bottom || ''}
                  onChange={(e) => handleInputChange('bottom', e.target.value)}
                  onBlur={(e) => handleInputBlur('bottom', e.target.value)}
                  placeholder="auto, 0px, 10%, 2rem"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Left</label>
                <input
                  type="text"
                  value={localValues.left || currentStyles.left || ''}
                  onChange={(e) => handleInputChange('left', e.target.value)}
                  onBlur={(e) => handleInputBlur('left', e.target.value)}
                  placeholder="auto, 0px, 10%, 2rem"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border)' }}>
          <SubsectionHeader title="Canvas Absolute Position" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>X Position (px)</label>
              <input
                type="number"
                value={selectedComponentData?.position?.x || 0}
                onChange={(e) => onPropertyChange('position', { 
                  ...selectedComponentData.position, 
                  x: parseFloat(e.target.value) || 0 
                })}
                step="1"
                min="0"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Y Position (px)</label>
              <input
                type="number"
                value={selectedComponentData?.position?.y || 0}
                onChange={(e) => onPropertyChange('position', { 
                  ...selectedComponentData.position, 
                  y: parseFloat(e.target.value) || 0 
                })}
                step="1"
                min="0"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
          </div>
          <div className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Absolute positioning on canvas (top-left origin)
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Z-Index (Layer Order)</label>
          <input
            type="number"
            value={localValues.zIndex || currentStyles.zIndex || '0'}
            onChange={(e) => handleInputChange('zIndex', e.target.value)}
            onBlur={(e) => handleInputBlur('zIndex', e.target.value)}
            min="-1000"
            max="1000"
            step="1"
            placeholder="0"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
          />
          <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Higher values appear in front (-1000 to 1000)
          </div>
        </div>
      </PropertySection>

      {/* Flexbox Section */}
      {(currentStyles.display === 'flex' || currentStyles.display === 'inline-flex') && (
        <PropertySection
          title="Flexbox Layout"
          Icon={Columns}
          sectionKey="flexbox"
          expandedSections={expandedSections}
          setExpandedSections={setExpandedSections}
          defaultExpanded={true}
          searchTerm={searchTerm}
        >
          <VisualButtonGroup
            label="Flex Direction"
            value={localValues.flexDirection || currentStyles.flexDirection || 'row'}
            onChange={(value) => {
              handleInputChange('flexDirection', value);
              onPropertyChange('flexDirection', value, 'style');
            }}
            options={['row', 'column', 'row-reverse', 'column-reverse']}
          />

          <VisualButtonGroup
            label="Justify Content (Main Axis)"
            value={localValues.justifyContent || currentStyles.justifyContent || 'flex-start'}
            onChange={(value) => {
              handleInputChange('justifyContent', value);
              onPropertyChange('justifyContent', value, 'style');
            }}
            options={['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']}
            icons={{
              'flex-start': AlignLeft,
              'center': AlignCenter,
              'flex-end': AlignRight,
              'space-between': AlignJustify
            }}
          />

          <VisualButtonGroup
            label="Align Items (Cross Axis)"
            value={localValues.alignItems || currentStyles.alignItems || 'stretch'}
            onChange={(value) => {
              handleInputChange('alignItems', value);
              onPropertyChange('alignItems', value, 'style');
            }}
            options={['stretch', 'flex-start', 'center', 'flex-end', 'baseline']}
          />

          <VisualButtonGroup
            label="Flex Wrap"
            value={localValues.flexWrap || currentStyles.flexWrap || 'nowrap'}
            onChange={(value) => {
              handleInputChange('flexWrap', value);
              onPropertyChange('flexWrap', value, 'style');
            }}
            options={['nowrap', 'wrap', 'wrap-reverse']}
          />

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Gap Between Items</label>
            <input
              type="text"
              value={localValues.gap || currentStyles.gap || ''}
              onChange={(e) => handleInputChange('gap', e.target.value)}
              onBlur={(e) => handleInputBlur('gap', e.target.value)}
              placeholder="0px, 8px, 16px, 1rem, 2rem"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
            <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Space between flex items (supports px, rem, em, %)
            </div>
          </div>

          <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: 'var(--color-primary-soft)', border: '1px solid var(--color-border)' }}>
            <SubsectionHeader title="Flex Item Properties" />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Grow</label>
                <input
                  type="number"
                  value={localValues.flexGrow || currentStyles.flexGrow || '0'}
                  onChange={(e) => handleInputChange('flexGrow', e.target.value)}
                  onBlur={(e) => handleInputBlur('flexGrow', e.target.value)}
                  min="0"
                  step="1"
                  placeholder="0"
                  className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Shrink</label>
                <input
                  type="number"
                  value={localValues.flexShrink || currentStyles.flexShrink || '1'}
                  onChange={(e) => handleInputChange('flexShrink', e.target.value)}
                  onBlur={(e) => handleInputBlur('flexShrink', e.target.value)}
                  min="0"
                  step="1"
                  placeholder="1"
                  className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Basis</label>
                <input
                  type="text"
                  value={localValues.flexBasis || currentStyles.flexBasis || 'auto'}
                  onChange={(e) => handleInputChange('flexBasis', e.target.value)}
                  onBlur={(e) => handleInputBlur('flexBasis', e.target.value)}
                  placeholder="auto, 100px"
                  className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              • Grow: Expansion factor • Shrink: Shrink factor • Basis: Initial size
            </div>
          </div>
        </PropertySection>
      )}

      {/* Grid Section */}
      {(currentStyles.display === 'grid' || currentStyles.display === 'inline-grid') && (
        <PropertySection
          title="Grid Layout"
          Icon={Grid3X3}
          sectionKey="grid"
          expandedSections={expandedSections}
          setExpandedSections={setExpandedSections}
          defaultExpanded={true}
          searchTerm={searchTerm}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Grid Template Columns</label>
              <input
                type="text"
                value={localValues.gridTemplateColumns || currentStyles.gridTemplateColumns || ''}
                onChange={(e) => handleInputChange('gridTemplateColumns', e.target.value)}
                onBlur={(e) => handleInputBlur('gridTemplateColumns', e.target.value)}
                placeholder="repeat(3, 1fr), 200px 1fr 1fr, auto"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
              <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Define column structure (use fr, px, %, auto, minmax())
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Grid Template Rows</label>
              <input
                type="text"
                value={localValues.gridTemplateRows || currentStyles.gridTemplateRows || ''}
                onChange={(e) => handleInputChange('gridTemplateRows', e.target.value)}
                onBlur={(e) => handleInputBlur('gridTemplateRows', e.target.value)}
                placeholder="repeat(2, 1fr), auto, 100px"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
              <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Define row structure (use fr, px, %, auto, minmax())
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Column Gap</label>
              <input
                type="text"
                value={localValues.columnGap || currentStyles.columnGap || ''}
                onChange={(e) => handleInputChange('columnGap', e.target.value)}
                onBlur={(e) => handleInputBlur('columnGap', e.target.value)}
                placeholder="0px, 16px, 1rem, 2rem"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Row Gap</label>
              <input
                type="text"
                value={localValues.rowGap || currentStyles.rowGap || ''}
                onChange={(e) => handleInputChange('rowGap', e.target.value)}
                onBlur={(e) => handleInputBlur('rowGap', e.target.value)}
                placeholder="0px, 16px, 1rem, 2rem"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
          </div>

          <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: 'var(--color-primary-soft)', border: '1px solid var(--color-border)' }}>
            <SubsectionHeader title="Grid Item Position" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Grid Column</label>
                <input
                  type="text"
                  value={localValues.gridColumn || currentStyles.gridColumn || ''}
                  onChange={(e) => handleInputChange('gridColumn', e.target.value)}
                  onBlur={(e) => handleInputBlur('gridColumn', e.target.value)}
                  placeholder="1 / 3, span 2, 1 / -1"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Grid Row</label>
                <input
                  type="text"
                  value={localValues.gridRow || currentStyles.gridRow || ''}
                  onChange={(e) => handleInputChange('gridRow', e.target.value)}
                  onBlur={(e) => handleInputBlur('gridRow', e.target.value)}
                  placeholder="1 / 2, span 1, 1 / -1"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Position grid items: start/end lines, span count, or -1 for last
            </div>
          </div>
        </PropertySection>
      )}

      {/* Size & Dimensions Section */}
      <PropertySection
        title="Size & Dimensions"
        Icon={Maximize}
        sectionKey="sizing"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Width</label>
            <input
              type="text"
              value={localValues.width || currentStyles.width || ''}
              onChange={(e) => handleInputChange('width', e.target.value)}
              onBlur={(e) => handleInputBlur('width', e.target.value)}
              placeholder="auto, 100%, 300px, 50vw"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Height</label>
            <input
              type="text"
              value={localValues.height || currentStyles.height || ''}
              onChange={(e) => handleInputChange('height', e.target.value)}
              onBlur={(e) => handleInputBlur('height', e.target.value)}
              placeholder="auto, 100%, 300px, 50vh"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>
        </div>
        
        <div className="space-y-3 mt-3">
          <SubsectionHeader title="Size Constraints" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Min Width</label>
              <input
                type="text"
                value={localValues.minWidth || currentStyles.minWidth || ''}
                onChange={(e) => handleInputChange('minWidth', e.target.value)}
                onBlur={(e) => handleInputBlur('minWidth', e.target.value)}
                placeholder="0, 100px, 50%, min-content"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Max Width</label>
              <input
                type="text"
                value={localValues.maxWidth || currentStyles.maxWidth || ''}
                onChange={(e) => handleInputChange('maxWidth', e.target.value)}
                onBlur={(e) => handleInputBlur('maxWidth', e.target.value)}
                placeholder="none, 1200px, 100%, max-content"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Min Height</label>
              <input
                type="text"
                value={localValues.minHeight || currentStyles.minHeight || ''}
                onChange={(e) => handleInputChange('minHeight', e.target.value)}
                onBlur={(e) => handleInputBlur('minHeight', e.target.value)}
                placeholder="0, 100px, 50vh, min-content"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Max Height</label>
              <input
                type="text"
                value={localValues.maxHeight || currentStyles.maxHeight || ''}
                onChange={(e) => handleInputChange('maxHeight', e.target.value)}
                onBlur={(e) => handleInputBlur('maxHeight', e.target.value)}
                placeholder="none, 800px, 100vh, max-content"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
          </div>
        </div>

        <VisualButtonGroup
          label="Box Sizing Model"
          value={localValues.boxSizing || currentStyles.boxSizing || 'content-box'}
          onChange={(value) => {
            handleInputChange('boxSizing', value);
            onPropertyChange('boxSizing', value, 'style');
          }}
          options={['content-box', 'border-box']}
        />
        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          • content-box: padding/border adds to size • border-box: includes padding/border in size
        </div>
      </PropertySection>

      {/* Spacing Section */}
      <PropertySection
        title="Spacing (Margin & Padding)"
        Icon={Square}
        sectionKey="spacing"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        <SpacingControl
          label="Margin (Outside Spacing)"
          property="margin"
          value={localValues.margin || currentStyles.margin}
          onChange={onPropertyChange}
        />

        <SpacingControl
          label="Padding (Inside Spacing)"
          property="padding"
          value={localValues.padding || currentStyles.padding}
          onChange={onPropertyChange}
        />
      </PropertySection>

      {/* Overflow Section */}
      <PropertySection
        title="Overflow & Scrolling"
        Icon={Layers}
        sectionKey="overflow"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        <VisualButtonGroup
          label="Overflow (Both Axes)"
          value={localValues.overflow || currentStyles.overflow || 'visible'}
          onChange={(value) => {
            handleInputChange('overflow', value);
            onPropertyChange('overflow', value, 'style');
          }}
          options={['visible', 'hidden', 'scroll', 'auto']}
        />
        
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <VisualButtonGroup
              label="Overflow X"
              value={localValues.overflowX || currentStyles.overflowX || 'visible'}
              onChange={(value) => {
                handleInputChange('overflowX', value);
                onPropertyChange('overflowX', value, 'style');
              }}
              options={['visible', 'hidden', 'scroll', 'auto']}
            />
          </div>
          <div>
            <VisualButtonGroup
              label="Overflow Y"
              value={localValues.overflowY || currentStyles.overflowY || 'visible'}
              onChange={(value) => {
                handleInputChange('overflowY', value);
                onPropertyChange('overflowY', value, 'style');
              }}
              options={['visible', 'hidden', 'scroll', 'auto']}
            />
          </div>
        </div>
        
        <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          • visible: content not clipped • hidden: content clipped • scroll: always show scrollbar • auto: scrollbar when needed
        </div>
      </PropertySection>

      {/* Layout Presets Section */}
      <PropertySection
        title="Quick Layout Presets"
        Icon={Layout}
        sectionKey="presets"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onPropertyChange('display', 'flex', 'style');
              onPropertyChange('justifyContent', 'center', 'style');
              onPropertyChange('alignItems', 'center', 'style');
            }}
            className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="text-base mb-1">⊡</div>
            <div>Center Content</div>
            <div className="text-xs opacity-70 mt-1">Flex center</div>
          </button>
          
          <button
            onClick={() => {
              onPropertyChange('display', 'flex', 'style');
              onPropertyChange('justifyContent', 'space-between', 'style');
              onPropertyChange('alignItems', 'center', 'style');
            }}
            className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="text-base mb-1">⊞⊟⊞</div>
            <div>Space Between</div>
            <div className="text-xs opacity-70 mt-1">Flex justify</div>
          </button>
          
          <button
            onClick={() => {
              onPropertyChange('display', 'grid', 'style');
              onPropertyChange('gridTemplateColumns', 'repeat(auto-fit, minmax(200px, 1fr))', 'style');
              onPropertyChange('gap', '20px', 'style');
            }}
            className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="text-base mb-1">⊞⊞⊞</div>
            <div>Auto Grid</div>
            <div className="text-xs opacity-70 mt-1">Responsive grid</div>
          </button>
          
          <button
            onClick={() => {
              onPropertyChange('display', 'flex', 'style');
              onPropertyChange('flexDirection', 'column', 'style');
              onPropertyChange('gap', '16px', 'style');
            }}
            className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="text-base mb-1">⊟<br/>⊟<br/>⊟</div>
            <div>Stack Vertical</div>
            <div className="text-xs opacity-70 mt-1">Flex column</div>
          </button>
          
          <button
            onClick={() => {
              onPropertyChange('width', '100%', 'style');
              onPropertyChange('maxWidth', '1200px', 'style');
              onPropertyChange('margin', '0 auto', 'style');
              onPropertyChange('padding', '0 24px', 'style');
            }}
            className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="text-base mb-1">[ ⊞ ]</div>
            <div>Container</div>
            <div className="text-xs opacity-70 mt-1">Max-width centered</div>
          </button>
          
          <button
            onClick={() => {
              onPropertyChange('position', 'absolute', 'style');
              onPropertyChange('top', '0', 'style');
              onPropertyChange('left', '0', 'style');
              onPropertyChange('width', '100%', 'style');
              onPropertyChange('height', '100%', 'style');
            }}
            className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="text-base mb-1">⊡</div>
            <div>Full Overlay</div>
            <div className="text-xs opacity-70 mt-1">Absolute fill</div>
          </button>
        </div>
      </PropertySection>
    </>
  );
};

export default LayoutSection; 