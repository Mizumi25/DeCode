import React, { useState, useCallback, useEffect } from 'react';
import { 
  Move, Layout, Columns, Grid3X3, Maximize, Square, MousePointer, Layers, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Box, Container,
  Rows, Columns3, WrapText, Eye, EyeOff, RectangleHorizontal, Smartphone, 
  Monitor, Tv, Film, Instagram, Youtube, Twitter, Facebook
} from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader, ButtonGrid } from '../PropertyUtils';

const LayoutSection = ({ 
  currentStyles, 
  onPropertyChange, 
  expandedSections, 
  setExpandedSections, 
  selectedComponentData,
  searchTerm = ''
}) => {
 

 

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

 // REPLACE the SpacingControl useEffect (around line 350)
useEffect(() => {
  if (!isTyping && value && typeof value === 'string') { // ✅ Only update when NOT typing
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
      setAllValue('');
    }
  }
}, [value]); // ✅ Only depend on value prop

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
                borderColor: (currentStyles.display) === 'grid' ? 'var(--color-primary)' : 'var(--color-border)',
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
          value={currentStyles.position || 'static'}
          onChange={(value) => onPropertyChange('position', value, 'style')}
          options={['static', 'relative', 'absolute', 'fixed', 'sticky']}
        />

       <VisualButtonGroup
          label="Display Type"
          value={currentStyles.display || 'block'}
          onChange={(value) => {
            console.log('🔄 Display type changed to:', value);
            onPropertyChange('display', value, 'style');
            
            // Force re-render after 100ms to ensure update
            setTimeout(() => {
              console.log('✅ Display type should now be:', value);
            }, 100);
          }}
          options={['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none', 'contents']}
          icons={{
            'block': Box,
            'inline': WrapText,
            'inline-block': Container,
            'flex': Columns,
            'inline-flex': Columns,
            'grid': Grid3X3,
            'inline-grid': Grid3X3,
            'none': EyeOff,
            'contents': Layers
          }}
        />

        {(currentStyles.position && currentStyles.position !== 'static') && (
          <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: 'var(--color-primary-soft)', border: '1px solid var(--color-border)' }}>
            <SubsectionHeader title="Position Offset Values" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Top</label>
                <input
                  type="text"
                  value={currentStyles.top || ''}
                  onChange={(e) => onPropertyChange('top', e.target.value)}
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
                  value={currentStyles.right || ''}
                  onChange={(e) => onPropertyChange('right', e.target.value)}
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
                  value={currentStyles.bottom || ''}
                  onChange={(e) => onPropertyChange('bottom', e.target.value)}
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
                  value={currentStyles.left || ''}
                  onChange={(e) => onPropertyChange('left', e.target.value)}
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


        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Z-Index (Layer Order)</label>
          <input
            type="number"
            value={currentStyles.zIndex || '0'}
            onChange={(e) => onPropertyChange('zIndex', e.target.value)}
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
            value={currentStyles.flexDirection || 'row'}
            onChange={(value) => {
                console.log('🔧 Setting flexDirection:', value);
                onPropertyChange('flexDirection', value, 'style');
                
                // 🔥 Force immediate re-render by triggering a state update
                setTimeout(() => {
                    console.log('✅ flexDirection should now be:', value);
                }, 50);
            }}
            options={['row', 'column', 'row-reverse', 'column-reverse']}
        />

          <VisualButtonGroup
            label="Justify Content (Main Axis)"
            value={currentStyles.justifyContent || 'flex-start'}
            onChange={(value) => 
              onPropertyChange('justifyContent', value, 'style')
            }
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
            value={currentStyles.alignItems || 'stretch'}
            onChange={(value) => 
              onPropertyChange('alignItems', value, 'style')
            }
            options={['stretch', 'flex-start', 'center', 'flex-end', 'baseline']}
          />

          <VisualButtonGroup
            label="Flex Wrap"
            value={currentStyles.flexWrap || 'nowrap'}
            onChange={(value) => 
              onPropertyChange('flexWrap', value, 'style')
            }
            options={['nowrap', 'wrap', 'wrap-reverse']}
          />

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Gap Between Items</label>
            <input
              type="text"
              value={currentStyles.gap || ''}
              onChange={(e) => onPropertyChange('gap', e.target.value)}
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
                  value={currentStyles.flexGrow || '0'}
                  onChange={(e) => onPropertyChange('flexGrow', e.target.value)}
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
                  value={currentStyles.flexShrink || '1'}
                  onChange={(e) => onPropertyChange('flexShrink', e.target.value)}
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
                  value={currentStyles.flexBasis || 'auto'}
                  onChange={(e) => onPropertyChange('flexBasis', e.target.value)}
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
                value={currentStyles.gridTemplateColumns || ''}
                onChange={(e) => onPropertyChange('gridTemplateColumns', e.target.value)}
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
                value={currentStyles.gridTemplateRows || ''}
                onChange={(e) => onPropertyChange('gridTemplateRows', e.target.value)}
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
                value={currentStyles.columnGap || ''}
                onChange={(e) => onPropertyChange('columnGap', e.target.value)}
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
                value={currentStyles.rowGap || ''}
                onChange={(e) => onPropertyChange('rowGap', e.target.value)}
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
                  values={currentStyles.gridColumn || ''}
                  onChange={(e) => onPropertyChange('gridColumn', e.target.value)}
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
                  value={currentStyles.gridRow || ''}
                  onChange={(e) => onPropertyChange('gridRow', e.target.value)}
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
              value={currentStyles.width || ''}
              onChange={(e) => onPropertyChange('width', e.target.value)}
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
              value={currentStyles.height || ''}
              onChange={(e) => onPropertyChange('height', e.target.value)}
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
                value={currentStyles.minWidth || ''}
                onChange={(e) => onPropertyChange('minWidth', e.target.value)}
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
                value={currentStyles.maxWidth || ''}
                onChange={(e) => onPropertyChange('maxWidth', e.target.value)}
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
                value={currentStyles.minHeight || ''}
                onChange={(e) => onPropertyChange('minHeight', e.target.value)}
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
                value={currentStyles.maxHeight || ''}
                onChange={(e) => onPropertyChange('maxHeight', e.target.value)}
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
          value={currentStyles.boxSizing || 'content-box'}
          onChange={(value) => 
            onPropertyChange('boxSizing', value, 'style')
          }
          options={['content-box', 'border-box']}
        />
        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          • content-box: padding/border adds to size • border-box: includes padding/border in size
        </div>

        {/* Aspect Ratio Controls */}
        <div className="space-y-3 mt-3">
          <SubsectionHeader title="Aspect Ratio" />
          
          {/* Common Aspect Ratios */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Common Ratios</label>
            <ButtonGrid
              columns={3}
              buttons={[
                {
                  label: '1:1',
                  onClick: () => onPropertyChange('aspectRatio', '1 / 1', 'style'),
                  className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium'
                },
                {
                  label: '4:3',
                  onClick: () => onPropertyChange('aspectRatio', '4 / 3', 'style'),
                  className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 font-medium'
                },
                {
                  label: '3:2',
                  onClick: () => onPropertyChange('aspectRatio', '3 / 2', 'style'),
                  className: 'bg-purple-100 text-purple-800 hover:bg-purple-200 font-medium'
                },
                {
                  label: '16:9',
                  onClick: () => onPropertyChange('aspectRatio', '16 / 9', 'style'),
                  className: 'bg-pink-100 text-pink-800 hover:bg-pink-200 font-medium'
                },
                {
                  label: '21:9',
                  onClick: () => onPropertyChange('aspectRatio', '21 / 9', 'style'),
                  className: 'bg-red-100 text-red-800 hover:bg-red-200 font-medium'
                },
                {
                  label: '9:16',
                  onClick: () => onPropertyChange('aspectRatio', '9 / 16', 'style'),
                  className: 'bg-orange-100 text-orange-800 hover:bg-orange-200 font-medium'
                }
              ]}
            />
          </div>

          {/* Device Ratios */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Device Ratios</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onPropertyChange('aspectRatio', '19.5 / 9', 'style')}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <Smartphone className="w-4 h-4" />
                <span>iPhone (19.5:9)</span>
              </button>
              <button
                onClick={() => onPropertyChange('aspectRatio', '16 / 10', 'style')}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <Monitor className="w-4 h-4" />
                <span>Laptop (16:10)</span>
              </button>
              <button
                onClick={() => onPropertyChange('aspectRatio', '16 / 9', 'style')}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <Tv className="w-4 h-4" />
                <span>Monitor (16:9)</span>
              </button>
              <button
                onClick={() => onPropertyChange('aspectRatio', '2.39 / 1', 'style')}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <Film className="w-4 h-4" />
                <span>Cinema (2.39:1)</span>
              </button>
            </div>
          </div>

          {/* Social Media Ratios */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Social Media</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onPropertyChange('aspectRatio', '1 / 1', 'style')}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <Instagram className="w-4 h-4" />
                <span>IG Post (1:1)</span>
              </button>
              <button
                onClick={() => onPropertyChange('aspectRatio', '9 / 16', 'style')}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <Instagram className="w-4 h-4" />
                <span>IG Story (9:16)</span>
              </button>
              <button
                onClick={() => onPropertyChange('aspectRatio', '16 / 9', 'style')}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <Youtube className="w-4 h-4" />
                <span>YouTube (16:9)</span>
              </button>
              <button
                onClick={() => onPropertyChange('aspectRatio', '3 / 1', 'style')}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <Twitter className="w-4 h-4" />
                <span>Twitter (3:1)</span>
              </button>
            </div>
          </div>

          {/* Custom Ratio */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Custom Ratio</label>
            <input
              type="text"
              value={currentStyles.aspectRatio || ''}
              onChange={(e) => onPropertyChange('aspectRatio', e.target.value, 'style')}
              placeholder="e.g., 16 / 9 or auto"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const current = currentStyles.aspectRatio;
                if (current && typeof current === 'string' && current.includes('/')) {
                  const [width, height] = current.split('/').map(s => s.trim());
                  onPropertyChange('aspectRatio', `${height} / ${width}`, 'style');
                }
              }}
              className="flex-1 px-3 py-2 text-xs rounded-lg border transition-all hover:shadow-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              Flip Ratio
            </button>
            <button
              onClick={() => onPropertyChange('aspectRatio', 'auto', 'style')}
              className="flex-1 px-3 py-2 text-xs rounded-lg border transition-all hover:shadow-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              Reset
            </button>
          </div>

          {/* Live Preview */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Live Preview</label>
            <div className="flex justify-center items-center p-6 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
              <div
                className="bg-gradient-to-br from-blue-500 to-purple-500 transition-all duration-300"
                style={{
                  aspectRatio: currentStyles.aspectRatio || 'auto',
                  width: '100%',
                  maxWidth: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {currentStyles.aspectRatio || 'auto'}
              </div>
            </div>
            <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Preview shows actual aspect ratio
            </p>
          </div>
        </div>
      </PropertySection>

      {/* Container Queries Section */}
      <PropertySection
        title="Container Queries"
        Icon={Container}
        sectionKey="containerQueries"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        {/* Container Type */}
        <div>
          <SubsectionHeader title="Container Type" />
          <VisualButtonGroup
            label="Container Type"
            value={currentStyles.containerType || 'normal'}
            onChange={(value) => onPropertyChange('containerType', value, 'style')}
            options={['normal', 'size', 'inline-size', 'block-size']}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Makes this element a container for child query breakpoints
          </p>
        </div>

        {/* Container Name */}
        <div>
          <SubsectionHeader title="Container Name" />
          <input
            type="text"
            value={currentStyles.containerName || ''}
            onChange={(e) => onPropertyChange('containerName', e.target.value, 'style')}
            placeholder="e.g., sidebar, card, hero"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Give this container a name to reference in @container queries
          </p>
        </div>

        {/* Quick Presets */}
        <div>
          <SubsectionHeader title="Quick Setup" />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onPropertyChange('containerType', 'inline-size', 'style');
              }}
              className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-95"
              style={{
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)'
              }}
            >
              <Box className="w-5 h-5 mx-auto mb-1" />
              <div>Basic Container</div>
              <div className="text-xs opacity-70 mt-1">inline-size</div>
            </button>
            
            <button
              onClick={() => {
                onPropertyChange('containerType', 'size', 'style');
              }}
              className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-95"
              style={{
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)'
              }}
            >
              <Maximize className="w-5 h-5 mx-auto mb-1" />
              <div>Size Container</div>
              <div className="text-xs opacity-70 mt-1">width + height</div>
            </button>
            
            <button
              onClick={() => {
                onPropertyChange('containerType', 'inline-size', 'style');
              }}
              className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-95"
              style={{
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)'
              }}
            >
              <RectangleHorizontal className="w-5 h-5 mx-auto mb-1" />
              <div>Inline Container</div>
              <div className="text-xs opacity-70 mt-1">width only</div>
            </button>
            
            <button
              onClick={() => {
                onPropertyChange('containerType', 'normal', 'style');
                onPropertyChange('containerName', '', 'style');
              }}
              className="px-4 py-3 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-95"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)'
              }}
            >
              <EyeOff className="w-5 h-5 mx-auto mb-1" />
              <div>Disable</div>
              <div className="text-xs opacity-70 mt-1">normal</div>
            </button>
          </div>
        </div>

        {/* Named Container Presets */}
        <div>
          <SubsectionHeader title="Common Container Names" />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onPropertyChange('containerType', 'inline-size', 'style');
                onPropertyChange('containerName', 'card', 'style');
              }}
              className="px-3 py-2 rounded-lg text-sm transition-all hover:shadow-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              Card
            </button>
            <button
              onClick={() => {
                onPropertyChange('containerType', 'inline-size', 'style');
                onPropertyChange('containerName', 'sidebar', 'style');
              }}
              className="px-3 py-2 rounded-lg text-sm transition-all hover:shadow-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              Sidebar
            </button>
            <button
              onClick={() => {
                onPropertyChange('containerType', 'size', 'style');
                onPropertyChange('containerName', 'hero', 'style');
              }}
              className="px-3 py-2 rounded-lg text-sm transition-all hover:shadow-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              Hero
            </button>
            <button
              onClick={() => {
                onPropertyChange('containerType', 'inline-size', 'style');
                onPropertyChange('containerName', 'article', 'style');
              }}
              className="px-3 py-2 rounded-lg text-sm transition-all hover:shadow-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              Article
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-start gap-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
              <Container className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                How Container Queries Work
              </p>
              <ul className="text-xs space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                <li>• Set a container type on parent elements</li>
                <li>• Child elements can respond to container size</li>
                <li>• Use @container in CSS instead of @media</li>
                <li>• More powerful than traditional media queries</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Example Code */}
        <div>
          <SubsectionHeader title="Example Usage" />
          <div className="p-3 rounded-lg font-mono text-xs" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border)' }}>
            <div style={{ color: 'var(--color-text-muted)' }}>
              <span style={{ color: '#22c55e' }}>/* Parent element */</span><br/>
              <span style={{ color: '#3b82f6' }}>.container</span> {'{'}<br/>
              &nbsp;&nbsp;container-type: inline-size;<br/>
              &nbsp;&nbsp;container-name: {currentStyles.containerName || 'myContainer'};<br/>
              {'}'}<br/><br/>
              
              <span style={{ color: '#22c55e' }}>/* Child responds to container */</span><br/>
              <span style={{ color: '#f59e0b' }}>@container</span> <span style={{ color: '#3b82f6' }}>{currentStyles.containerName || 'myContainer'}</span> (min-width: 400px) {'{'}<br/>
              &nbsp;&nbsp;<span style={{ color: '#3b82f6' }}>.child</span> {'{'}<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;font-size: 1.5rem;<br/>
              &nbsp;&nbsp;{'}'}<br/>
              {'}'}
            </div>
          </div>
        </div>

        {/* Visual Status */}
        <div>
          <SubsectionHeader title="Current Status" />
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--color-bg-muted)', border: '2px solid var(--color-border)' }}>
            {currentStyles.containerType && currentStyles.containerType !== 'normal' ? (
              <>
                <div className="flex justify-center mb-2">
                  <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-success-soft)' }}>
                    <Container className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                  </div>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Container Active
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Type: <span className="font-mono font-bold">{currentStyles.containerType}</span>
                  {currentStyles.containerName && (
                    <>
                      <br/>Name: <span className="font-mono font-bold">{currentStyles.containerName}</span>
                    </>
                  )}
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-2">
                  <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-bg)' }}>
                    <EyeOff className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  No Container Set
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Click a preset above to enable
                </p>
              </>
            )}
          </div>
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
          value={currentStyles.margin}
          onChange={onPropertyChange}
        />

        <SpacingControl
          label="Padding (Inside Spacing)"
          property="padding"
          value={currentStyles.padding}
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
          value={currentStyles.overflow || 'visible'}
          onChange={(value) => 
            onPropertyChange('overflow', value, 'style')
          }
          options={['visible', 'hidden', 'scroll', 'auto']}
        />
        
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <VisualButtonGroup
              label="Overflow X"
              value={currentStyles.overflowX || 'visible'}
              onChange={(value) => 
                onPropertyChange('overflowX', value, 'style')
              }
              options={['visible', 'hidden', 'scroll', 'auto']}
            />
          </div>
          <div>
            <VisualButtonGroup
              label="Overflow Y"
              value={currentStyles.overflowY || 'visible'}
              onChange={(value) => 
                onPropertyChange('overflowY', value, 'style')
              }
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