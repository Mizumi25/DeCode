import React from 'react';
import { Palette, Box, Circle, Sparkles, Filter, Paintbrush } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader, ButtonGrid, presetValues } from '../PropertyUtils';

const StylingSection = ({ currentStyles, onPropertyChange, expandedSections, setExpandedSections, searchTerm }) => {
  
  
  
  // ADD this helper at the TOP of StylingSection component
const parseCurrentGradient = (backgroundImage) => {
  if (!backgroundImage || typeof backgroundImage !== 'string') {
    return { type: 'none', direction: '45deg', colors: ['#667eea', '#764ba2'] };
  }
  
  const hasGradient = backgroundImage.includes('gradient');
  if (!hasGradient) return { type: 'none', direction: '45deg', colors: ['#667eea', '#764ba2'] };
  
  const type = backgroundImage.includes('linear-gradient') ? 'linear-gradient' :
               backgroundImage.includes('radial-gradient') ? 'radial-gradient' :
               backgroundImage.includes('conic-gradient') ? 'conic-gradient' : 'none';
  
  const colorMatches = backgroundImage.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
  const colors = colorMatches && colorMatches.length >= 2 ? [colorMatches[0], colorMatches[1]] : ['#667eea', '#764ba2'];
  
  const dirMatch = backgroundImage.match(/gradient\(([^,]+),/);
  const direction = dirMatch ? dirMatch[1].trim() : '45deg';
  
  return { type, direction, colors };
};
  
  
  
  // Helper function to safely get filter value
  const getFilterValue = (filterName, defaultValue) => {
    const filterStr = currentStyles.filter || '';
    if (typeof filterStr !== 'string') return defaultValue;
    
    const patterns = {
      blur: /blur\(([^)]+)\)/,
      brightness: /brightness\(([^)]+)\)/,
      contrast: /contrast\(([^)]+)\)/,
      saturate: /saturate\(([^)]+)\)/,
      'hue-rotate': /hue-rotate\(([^)]+)\)/,
      invert: /invert\(([^)]+)\)/,
      sepia: /sepia\(([^)]+)\)/,
      grayscale: /grayscale\(([^)]+)\)/
    };
    
    const match = filterStr.match(patterns[filterName]);
    if (!match) return defaultValue;
    
    const value = match[1];
    if (filterName === 'blur' || filterName === 'hue-rotate') {
      return parseInt(value.replace(/px|deg/g, '')) || defaultValue;
    }
    return parseFloat(value) || defaultValue;
  };
  
  // Helper function to safely get backdrop filter value
  const getBackdropFilterValue = (filterName, defaultValue) => {
    const filterStr = currentStyles.backdropFilter || '';
    if (typeof filterStr !== 'string') return defaultValue;
    
    const patterns = {
      blur: /blur\(([^)]+)\)/,
      brightness: /brightness\(([^)]+)\)/
    };
    
    const match = filterStr.match(patterns[filterName]);
    if (!match) return defaultValue;
    
    const value = match[1];
    if (filterName === 'blur') {
      return parseInt(value.replace('px', '')) || defaultValue;
    }
    return parseFloat(value) || defaultValue;
  };
  
  return (
    <>
      {/* COLORS */}
      <PropertySection
        title="Colors"
        Icon={Palette}
        sectionKey="colors"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        <InputField
          label="Text Color"
          value={currentStyles.color}
          onChange={(value) => onPropertyChange('color', value, 'style')}
          type="color"
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Background Color"
          value={currentStyles.backgroundColor}
          onChange={(value) => onPropertyChange('backgroundColor', value, 'style')}
          type="color"
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Border Color"
          value={currentStyles.borderColor}
          onChange={(value) => onPropertyChange('borderColor', value, 'style')}
          type="color"
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Outline Color"
          value={currentStyles.outlineColor}
          onChange={(value) => onPropertyChange('outlineColor', value, 'style')}
          type="color"
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Accent Color"
          value={currentStyles.accentColor}
          onChange={(value) => onPropertyChange('accentColor', value, 'style')}
          type="color"
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Caret Color"
          value={currentStyles.caretColor}
          onChange={(value) => onPropertyChange('caretColor', value, 'style')}
          type="color"
          searchTerm={searchTerm}
        />
        
        {/* Opacity */}
        <InputField
          label="Opacity"
          value={currentStyles.opacity}
          onChange={(value) => onPropertyChange('opacity', value, 'style')}
          type="range"
          options={{ min: 0, max: 1, step: 0.01 }}
          searchTerm={searchTerm}
        />
      </PropertySection>

      {/* BACKGROUND */}
      <PropertySection
        title="Background"
        Icon={Paintbrush}
        sectionKey="background"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        <InputField
          label="Background Image"
          value={currentStyles.backgroundImage}
          onChange={(value) => onPropertyChange('backgroundImage', value, 'style')}
          options={{ placeholder: 'url() or none' }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Background Size"
          value={currentStyles.backgroundSize}
          onChange={(value) => onPropertyChange('backgroundSize', value, 'style')}
          type="select"
          options={{
            values: ['auto', 'cover', 'contain', '100%', '50%']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Background Position"
          value={currentStyles.backgroundPosition}
          onChange={(value) => onPropertyChange('backgroundPosition', value, 'style')}
          type="select"
          options={{
            values: ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Background Repeat"
          value={currentStyles.backgroundRepeat}
          onChange={(value) => onPropertyChange('backgroundRepeat', value, 'style')}
          type="select"
          options={{
            values: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'space', 'round']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Background Attachment"
          value={currentStyles.backgroundAttachment}
          onChange={(value) => onPropertyChange('backgroundAttachment', value, 'style')}
          type="select"
          options={{
            values: ['scroll', 'fixed', 'local']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Background Origin"
          value={currentStyles.backgroundOrigin}
          onChange={(value) => onPropertyChange('backgroundOrigin', value, 'style')}
          type="select"
          options={{
            values: ['border-box', 'padding-box', 'content-box']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Background Clip"
          value={currentStyles.backgroundClip}
          onChange={(value) => onPropertyChange('backgroundClip', value, 'style')}
          type="select"
          options={{
            values: ['border-box', 'padding-box', 'content-box', 'text']
          }}
          searchTerm={searchTerm}
        />
        
               {/* Gradient Support - FIXED */}
        <div>
          <SubsectionHeader title="Gradients" />
          
          {(() => {
            const backgroundImage = currentStyles.backgroundImage || '';
            const hasGradient = typeof backgroundImage === 'string' && backgroundImage.includes('gradient');
            
            let gradientType = 'none';
            let direction = '45deg';
            let color1 = '#667eea';
            let color2 = '#764ba2';
            
            if (hasGradient) {
              gradientType = backgroundImage.includes('linear-gradient') ? 'linear-gradient' :
                            backgroundImage.includes('radial-gradient') ? 'radial-gradient' :
                            backgroundImage.includes('conic-gradient') ? 'conic-gradient' : 'none';
              
              const colorMatches = backgroundImage.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
              if (colorMatches && colorMatches.length >= 2) {
                color1 = colorMatches[0];
                color2 = colorMatches[1];
              }
              
              const dirMatch = backgroundImage.match(/gradient\(([^,]+),/);
              if (dirMatch) {
                direction = dirMatch[1].trim();
              }
            }
            
            return (
              <>
                <InputField
                  label="Gradient Type"
                  value={gradientType}
                  onChange={(value) => {
                    if (value === 'none') {
                      onPropertyChange('backgroundImage', 'none', 'style');
                    } else {
                      const newGradient = `${value}(45deg, #667eea 0%, #764ba2 100%)`;
                      onPropertyChange('backgroundImage', newGradient, 'style');
                    }
                  }}
                  type="select"
                  options={{
                    values: ['none', 'linear-gradient', 'radial-gradient', 'conic-gradient']
                  }}
                  searchTerm={searchTerm}
                />
                
                {gradientType !== 'none' && (
                  <div className="space-y-3 mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border)' }}>
                    <InputField
                      label="Gradient Direction"
                      value={direction}
                      onChange={(value) => {
                        const newGradient = `${gradientType}(${value}, ${color1} 0%, ${color2} 100%)`;
                        onPropertyChange('backgroundImage', newGradient, 'style');
                      }}
                      type="select"
                      options={{
                        values: ['45deg', '90deg', '135deg', '180deg', '225deg', '270deg', 'to right', 'to left', 'to top', 'to bottom']
                      }}
                      searchTerm={searchTerm}
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Start Color</label>
                        <input
                          type="color"
                          value={color1}
                          onChange={(e) => {
                            const newGradient = `${gradientType}(${direction}, ${e.target.value} 0%, ${color2} 100%)`;
                            onPropertyChange('backgroundImage', newGradient, 'style');
                          }}
                          className="w-full h-10 border rounded cursor-pointer"
                          style={{ borderColor: 'var(--color-border)' }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>End Color</label>
                        <input
                          type="color"
                          value={color2}
                          onChange={(e) => {
                            const newGradient = `${gradientType}(${direction}, ${color1} 0%, ${e.target.value} 100%)`;
                            onPropertyChange('backgroundImage', newGradient, 'style');
                          }}
                          className="w-full h-10 border rounded cursor-pointer"
                          style={{ borderColor: 'var(--color-border)' }}
                        />
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="mt-3">
                      <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Preview</label>
                      <div 
                        className="w-full h-16 rounded-lg border"
                        style={{ 
                          backgroundImage: backgroundImage,
                          borderColor: 'var(--color-border)'
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </PropertySection>

      {/* BORDERS */}
      <PropertySection
        title="Borders"
        Icon={Box}
        sectionKey="borders"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        {/* Border Width */}
        <div>
          <SubsectionHeader title="Border Width" />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Top"
              value={currentStyles.borderTopWidth}
              onChange={(value) => onPropertyChange('borderTopWidth', value, 'style')}
              searchTerm={searchTerm}
            />
            <InputField
              label="Right"
              value={currentStyles.borderRightWidth}
              onChange={(value) => onPropertyChange('borderRightWidth', value, 'style')}
              searchTerm={searchTerm}
            />
            <InputField
              label="Bottom"
              value={currentStyles.borderBottomWidth}
              onChange={(value) => onPropertyChange('borderBottomWidth', value, 'style')}
              searchTerm={searchTerm}
            />
            <InputField
              label="Left"
              value={currentStyles.borderLeftWidth}
              onChange={(value) => onPropertyChange('borderLeftWidth', value, 'style')}
              searchTerm={searchTerm}
            />
          </div>
          <InputField
            label="All Borders"
            value={currentStyles.borderWidth}
            onChange={(value) => onPropertyChange('borderWidth', value, 'style')}
            searchTerm={searchTerm}
          />
        </div>
        
        {/* Border Style */}
        <InputField
          label="Border Style"
          value={currentStyles.borderStyle}
          onChange={(value) => onPropertyChange('borderStyle', value, 'style')}
          type="select"
          options={{
            values: ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset']
          }}
          searchTerm={searchTerm}
        />
        
        {/* Individual Border Styles */}
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Top Style"
            value={currentStyles.borderTopStyle}
            onChange={(value) => onPropertyChange('borderTopStyle', value, 'style')}
            type="select"
            options={{
              values: ['none', 'solid', 'dashed', 'dotted', 'double']
            }}
            searchTerm={searchTerm}
          />
          <InputField
            label="Right Style"
            value={currentStyles.borderRightStyle}
            onChange={(value) => onPropertyChange('borderRightStyle', value, 'style')}
            type="select"
            options={{
              values: ['none', 'solid', 'dashed', 'dotted', 'double']
            }}
            searchTerm={searchTerm}
          />
          <InputField
            label="Bottom Style"
            value={currentStyles.borderBottomStyle}
            onChange={(value) => onPropertyChange('borderBottomStyle', value, 'style')}
            type="select"
            options={{
              values: ['none', 'solid', 'dashed', 'dotted', 'double']
            }}
            searchTerm={searchTerm}
          />
          <InputField
            label="Left Style"
            value={currentStyles.borderLeftStyle}
            onChange={(value) => onPropertyChange('borderLeftStyle', value, 'style')}
            type="select"
            options={{
              values: ['none', 'solid', 'dashed', 'dotted', 'double']
            }}
            searchTerm={searchTerm}
          />
        </div>
        
        {/* Border Colors */}
        <div>
          <SubsectionHeader title="Border Colors" />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Top Color"
              value={currentStyles.borderTopColor}
              onChange={(value) => onPropertyChange('borderTopColor', value, 'style')}
              type="color"
              searchTerm={searchTerm}
            />
            <InputField
              label="Right Color"
              value={currentStyles.borderRightColor}
              onChange={(value) => onPropertyChange('borderRightColor', value, 'style')}
              type="color"
              searchTerm={searchTerm}
            />
            <InputField
              label="Bottom Color"
              value={currentStyles.borderBottomColor}
              onChange={(value) => onPropertyChange('borderBottomColor', value, 'style')}
              type="color"
              searchTerm={searchTerm}
            />
            <InputField
              label="Left Color"
              value={currentStyles.borderLeftColor}
              onChange={(value) => onPropertyChange('borderLeftColor', value, 'style')}
              type="color"
              searchTerm={searchTerm}
            />
          </div>
        </div>
        
        {/* Outline */}
        <div>
          <SubsectionHeader title="Outline" />
          <div className="grid grid-cols-3 gap-3">
            <InputField
              label="Width"
              value={currentStyles.outlineWidth}
              onChange={(value) => onPropertyChange('outlineWidth', value, 'style')}
              searchTerm={searchTerm}
            />
            <InputField
              label="Style"
              value={currentStyles.outlineStyle}
              onChange={(value) => onPropertyChange('outlineStyle', value, 'style')}
              type="select"
              options={{
                values: ['none', 'solid', 'dashed', 'dotted', 'double']
              }}
              searchTerm={searchTerm}
            />
            <InputField
              label="Offset"
              value={currentStyles.outlineOffset}
              onChange={(value) => onPropertyChange('outlineOffset', value, 'style')}
              searchTerm={searchTerm}
            />
          </div>
        </div>
      </PropertySection>

      {/* BORDER RADIUS & SHAPES */}
      <PropertySection
        title="Border Radius & Shapes"
        Icon={Circle}
        sectionKey="borderRadius"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        {/* Quick Presets */}
        <div>
          <SubsectionHeader title="Quick Presets" />
          <InputField
            label="Border Radius"
            value={currentStyles.borderRadius}
            onChange={(value) => onPropertyChange('borderRadius', value, 'style')}
            type="preset"
            options={{
              presets: presetValues.borderRadius
            }}
            searchTerm={searchTerm}
          />
        </div>
        
        {/* Individual Corners */}
        <div>
          <SubsectionHeader title="Individual Corners" />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Top Left"
              value={currentStyles.borderTopLeftRadius}
              onChange={(value) => onPropertyChange('borderTopLeftRadius', value, 'style')}
              searchTerm={searchTerm}
            />
            <InputField
              label="Top Right"
              value={currentStyles.borderTopRightRadius}
              onChange={(value) => onPropertyChange('borderTopRightRadius', value, 'style')}
              searchTerm={searchTerm}
            />
            <InputField
              label="Bottom Left"
              value={currentStyles.borderBottomLeftRadius}
              onChange={(value) => onPropertyChange('borderBottomLeftRadius', value, 'style')}
              searchTerm={searchTerm}
            />
            <InputField
              label="Bottom Right"
              value={currentStyles.borderBottomRightRadius}
              onChange={(value) => onPropertyChange('borderBottomRightRadius', value, 'style')}
              searchTerm={searchTerm}
            />
          </div>
        </div>
        
        {/* Advanced Shape Controls */}
        <div>
          <SubsectionHeader title="Advanced Shapes" />
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: 'Circle',
                onClick: () => onPropertyChange('borderRadius', '50%', 'style'),
                className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              },
              {
                label: 'Square',
                onClick: () => onPropertyChange('borderRadius', '0', 'style'),
                className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              },
              {
                label: 'Pill Top',
                onClick: () => {
                  onPropertyChange('borderTopLeftRadius', '50px', 'style');
                  onPropertyChange('borderTopRightRadius', '50px', 'style');
                  onPropertyChange('borderBottomLeftRadius', '0', 'style');
                  onPropertyChange('borderBottomRightRadius', '0', 'style');
                },
                className: 'bg-green-100 text-green-800 hover:bg-green-200'
              },
              {
                label: 'Organic',
                onClick: () => {
                  onPropertyChange('borderTopLeftRadius', '20px', 'style');
                  onPropertyChange('borderTopRightRadius', '20px', 'style');
                  onPropertyChange('borderBottomLeftRadius', '50px', 'style');
                  onPropertyChange('borderBottomRightRadius', '50px', 'style');
                },
                className: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              }
            ]}
          />
        </div>
        
        {/* Clip Path for Complex Shapes */}
        <div>
          <SubsectionHeader title="Clip Path Shapes" />
          <InputField
            label="Clip Path"
            value={currentStyles.clipPath}
            onChange={(value) => onPropertyChange('clipPath', value, 'style')}
            type="select"
            options={{
              values: [
                'none',
                'circle(50% at 50% 50%)',
                'ellipse(50% 60% at 50% 50%)',
                'polygon(50% 0%, 0% 100%, 100% 100%)',
                'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)',
                'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)'
              ]
            }}
            searchTerm={searchTerm}
          />
        </div>
      </PropertySection>

      {/* SHADOWS & LIGHTING */}
      <PropertySection
        title="Shadows & Lighting"
        Icon={Sparkles}
        sectionKey="shadows"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        {/* Box Shadow */}
        <div>
          <SubsectionHeader title="Box Shadow" />
          <InputField
            label="Box Shadow"
            value={currentStyles.boxShadow}
            onChange={(value) => onPropertyChange('boxShadow', value, 'style')}
            type="preset"
            options={{
              presets: presetValues.shadows
            }}
            searchTerm={searchTerm}
          />
        </div>
        
        {/* Drop Shadow Filter */}
        <InputField
          label="Drop Shadow (Filter)"
          value={(() => {
            const filterStr = currentStyles.filter || '';
            if (typeof filterStr === 'string') {
              return filterStr.includes('drop-shadow') ? 'enabled' : 'disabled';
            }
            return 'disabled';
          })()}
          onChange={(value) => {
            const filterStr = currentStyles.filter || '';
            const currentFilter = typeof filterStr === 'string' ? filterStr : '';
            if (value === 'enabled') {
              const newFilter = currentFilter + ' drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))';
              onPropertyChange('filter', newFilter.trim(), 'style');
            } else {
              const newFilter = currentFilter.replace(/drop-shadow\([^)]+\)/g, '').trim();
              onPropertyChange('filter', newFilter || 'none', 'style');
            }
          }}
          type="select"
          options={{
            values: ['disabled', 'enabled']
          }}
          searchTerm={searchTerm}
        />
        
        {/* Inset Shadows */}
        <InputField
          label="Inset Shadow"
          value={currentStyles.boxShadow?.includes('inset')}
          onChange={(value) => {
            if (value) {
              onPropertyChange('boxShadow', 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', 'style');
            } else {
              onPropertyChange('boxShadow', 'none', 'style');
            }
          }}
          type="checkbox"
          searchTerm={searchTerm}
        />
        
        {/* Multiple Shadows */}
        <div>
          <SubsectionHeader title="Multiple Shadows" />
          <button
            onClick={() => {
              const multiShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 10px 15px rgba(0, 0, 0, 0.1), 0 20px 25px rgba(0, 0, 0, 0.1)';
              onPropertyChange('boxShadow', multiShadow, 'style');
            }}
            className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm hover:bg-purple-200 transition-colors w-full"
          >
            Apply Layered Shadows
          </button>
        </div>
      </PropertySection>

      {/* FILTERS & EFFECTS */}
      <PropertySection
        title="Filters & Effects"
        Icon={Filter}
        sectionKey="filters"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        <InputField
          label="Blur"
          value={getFilterValue('blur', 0)}
          onChange={(value) => {
            const filterStr = currentStyles.filter || '';
            const currentFilter = typeof filterStr === 'string' ? filterStr.replace(/blur\([^)]+\)/g, '').trim() : '';
            const newFilter = value > 0 ? `${currentFilter} blur(${value}px)`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 50, step: 1, unit: 'px' }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Brightness"
          value={getFilterValue('brightness', 1)}
          onChange={(value) => {
            const filterStr = currentStyles.filter || '';
            const currentFilter = typeof filterStr === 'string' ? filterStr.replace(/brightness\([^)]+\)/g, '').trim() : '';
            const newFilter = value !== 1 ? `${currentFilter} brightness(${value})`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 3, step: 0.1 }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Contrast"
          value={getFilterValue('contrast', 1)}
          onChange={(value) => {
            const filterStr = currentStyles.filter || '';
            const currentFilter = typeof filterStr === 'string' ? filterStr.replace(/contrast\([^)]+\)/g, '').trim() : '';
            const newFilter = value !== 1 ? `${currentFilter} contrast(${value})`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 3, step: 0.1 }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Saturate"
          value={getFilterValue('saturate', 1)}
          onChange={(value) => {
            const filterStr = currentStyles.filter || '';
            const currentFilter = typeof filterStr === 'string' ? filterStr.replace(/saturate\([^)]+\)/g, '').trim() : '';
            const newFilter = value !== 1 ? `${currentFilter} saturate(${value})`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 3, step: 0.1 }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Hue Rotate"
          value={getFilterValue('hue-rotate', 0)}
          onChange={(value) => {
            const filterStr = currentStyles.filter || '';
            const currentFilter = typeof filterStr === 'string' ? filterStr.replace(/hue-rotate\([^)]+\)/g, '').trim() : '';
            const newFilter = value !== 0 ? `${currentFilter} hue-rotate(${value}deg)`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 360, step: 1, unit: 'deg' }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Invert"
          value={getFilterValue('invert', 0)}
          onChange={(value) => {
            const filterStr = currentStyles.filter || '';
            const currentFilter = typeof filterStr === 'string' ? filterStr.replace(/invert\([^)]+\)/g, '').trim() : '';
            const newFilter = value > 0 ? `${currentFilter} invert(${value})`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 1, step: 0.1 }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Sepia"
          value={getFilterValue('sepia', 0)}
          onChange={(value) => {
            const filterStr = currentStyles.filter || '';
            const currentFilter = typeof filterStr === 'string' ? filterStr.replace(/sepia\([^)]+\)/g, '').trim() : '';
            const newFilter = value > 0 ? `${currentFilter} sepia(${value})`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 1, step: 0.1 }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Grayscale"
          value={getFilterValue('grayscale', 0)}
          onChange={(value) => {
            const filterStr = currentStyles.filter || '';
            const currentFilter = typeof filterStr === 'string' ? filterStr.replace(/grayscale\([^)]+\)/g, '').trim() : '';
            const newFilter = value > 0 ? `${currentFilter} grayscale(${value})`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 1, step: 0.1 }}
          searchTerm={searchTerm}
        />
        
        {/* Backdrop Filters */}
        <div>
          <SubsectionHeader title="Backdrop Filters" />
          <InputField
            label="Backdrop Blur"
            value={getBackdropFilterValue('blur', 0)}
            onChange={(value) => {
              const backdropFilterStr = currentStyles.backdropFilter || '';
              const currentFilter = typeof backdropFilterStr === 'string' ? backdropFilterStr.replace(/blur\([^)]+\)/g, '').trim() : '';
              const newFilter = value > 0 ? `${currentFilter} blur(${value}px)`.trim() : currentFilter;
              onPropertyChange('backdropFilter', newFilter || 'none', 'style');
            }}
            type="range"
            options={{ min: 0, max: 50, step: 1, unit: 'px' }}
            searchTerm={searchTerm}
          />
          
          <InputField
            label="Backdrop Brightness"
            value={getBackdropFilterValue('brightness', 1)}
            onChange={(value) => {
              const backdropFilterStr = currentStyles.backdropFilter || '';
              const currentFilter = typeof backdropFilterStr === 'string' ? backdropFilterStr.replace(/brightness\([^)]+\)/g, '').trim() : '';
              const newFilter = value !== 1 ? `${currentFilter} brightness(${value})`.trim() : currentFilter;
              onPropertyChange('backdropFilter', newFilter || 'none', 'style');
            }}
            type="range"
            options={{ min: 0, max: 3, step: 0.1 }}
            searchTerm={searchTerm}
          />
        </div>
      </PropertySection>
    </>
  );
};

export default StylingSection;