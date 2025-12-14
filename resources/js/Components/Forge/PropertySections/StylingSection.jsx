import React from 'react';
import { Palette, Box, Circle, Sparkles, Filter, Paintbrush } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader, ButtonGrid, presetValues } from '../PropertyUtils';
import { 
  hexToOklch, 
  hexToOklab, 
  createColorMix, 
  detectColorFormat,
  oklchPalettes,
  colorMixPresets,
  generateColorScheme,
  checkColorSupport
} from '../utils/modernColorSupport';

const StylingSection = ({ currentStyles, onPropertyChange, expandedSections, setExpandedSections, searchTerm, styleFramework = 'css' }) => {
  
  
  
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
      {/* MODERN COLORS (CSS Color Level 4 & 5) - NEW */}
      <PropertySection
        title={
          <div className="flex items-center gap-2">
            <span>Modern Colors</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
              NEW
            </span>
          </div>
        }
        Icon={Palette}
        sectionKey="modernColors"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        {/* Color Space Converter */}
        <div>
          <SubsectionHeader title="Color Space Converter" />
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="color"
                id="modern-color-picker"
                defaultValue="#667eea"
                className="w-12 h-10 border rounded cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              />
              <div className="flex-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Pick a color to convert to modern formats
              </div>
            </div>
            
            <ButtonGrid
              columns={2}
              buttons={[
                {
                  label: '→ OKLCH',
                  onClick: () => {
                    const hex = document.getElementById('modern-color-picker').value;
                    const oklch = hexToOklch(hex);
                    onPropertyChange('color', oklch, 'style');
                  },
                  className: 'bg-purple-100 text-purple-800 hover:bg-purple-200 font-mono text-xs'
                },
                {
                  label: '→ OKLAB',
                  onClick: () => {
                    const hex = document.getElementById('modern-color-picker').value;
                    const oklab = hexToOklab(hex);
                    onPropertyChange('color', oklab, 'style');
                  },
                  className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 font-mono text-xs'
                }
              ]}
            />
          </div>
        </div>

        {/* OKLCH Palettes */}
        <div>
          <SubsectionHeader title="OKLCH Palettes" />
          <div className="space-y-2">
            {Object.entries(oklchPalettes).map(([paletteName, colors]) => (
              <div key={paletteName}>
                <p className="text-xs font-medium mb-1 capitalize" style={{ color: 'var(--color-text-muted)' }}>
                  {paletteName}
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {Object.entries(colors).map(([colorName, colorValue]) => (
                    <button
                      key={colorName}
                      onClick={() => onPropertyChange('color', colorValue, 'style')}
                      className="h-10 rounded border-2 transition-all hover:scale-105"
                      style={{
                        background: colorValue,
                        borderColor: 'var(--color-border)'
                      }}
                      title={`${colorName}: ${colorValue}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* color-mix() Generator */}
        <div>
          <SubsectionHeader title="color-mix() Generator" />
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="color"
                id="color-mix-1"
                defaultValue="#667eea"
                className="w-full h-10 border rounded cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              />
              <input
                type="color"
                id="color-mix-2"
                defaultValue="#764ba2"
                className="w-full h-10 border rounded cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
            
            <InputField
              label="Mix Percentage"
              value={50}
              onChange={(value) => {
                // Store for use in apply button
                document.getElementById('color-mix-percentage').value = value;
              }}
              type="range"
              options={{ min: 0, max: 100, step: 5, unit: '%' }}
              searchTerm={searchTerm}
            />
            <input type="hidden" id="color-mix-percentage" value="50" />
            
            <div className="grid grid-cols-2 gap-2">
              <select
                id="color-mix-space"
                className="px-3 py-2 border rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
                defaultValue="oklch"
              >
                <option value="oklch">OKLCH</option>
                <option value="oklab">OKLAB</option>
                <option value="srgb">sRGB</option>
                <option value="srgb-linear">sRGB Linear</option>
                <option value="lab">LAB</option>
                <option value="lch">LCH</option>
                <option value="hsl">HSL</option>
              </select>
              
              <button
                onClick={() => {
                  const color1 = document.getElementById('color-mix-1').value;
                  const color2 = document.getElementById('color-mix-2').value;
                  const percentage = parseInt(document.getElementById('color-mix-percentage').value);
                  const space = document.getElementById('color-mix-space').value;
                  const mixed = createColorMix(color1, color2, percentage, space);
                  onPropertyChange('color', mixed, 'style');
                }}
                className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Apply Mix
              </button>
            </div>
          </div>
        </div>

        {/* Quick color-mix() Presets */}
        <div>
          <SubsectionHeader title="Quick color-mix() Effects" />
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Apply to current text color
          </p>
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: '💡 Lighten',
                onClick: () => {
                  const current = currentStyles.color || '#000000';
                  onPropertyChange('color', colorMixPresets.lighten(current), 'style');
                },
                className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              },
              {
                label: '🌑 Darken',
                onClick: () => {
                  const current = currentStyles.color || '#000000';
                  onPropertyChange('color', colorMixPresets.darken(current), 'style');
                },
                className: 'bg-gray-800 text-white hover:bg-gray-900'
              },
              {
                label: '🎨 Saturate',
                onClick: () => {
                  const current = currentStyles.color || '#000000';
                  onPropertyChange('color', colorMixPresets.saturate(current), 'style');
                },
                className: 'bg-pink-100 text-pink-800 hover:bg-pink-200'
              },
              {
                label: '🔘 Desaturate',
                onClick: () => {
                  const current = currentStyles.color || '#000000';
                  onPropertyChange('color', colorMixPresets.desaturate(current), 'style');
                },
                className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              },
              {
                label: '👻 50% Transparent',
                onClick: () => {
                  const current = currentStyles.color || '#000000';
                  onPropertyChange('color', colorMixPresets.transparent(current, 50), 'style');
                },
                className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              },
              {
                label: '✨ 75% Transparent',
                onClick: () => {
                  const current = currentStyles.color || '#000000';
                  onPropertyChange('color', colorMixPresets.transparent(current, 25), 'style');
                },
                className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
              }
            ]}
          />
        </div>

        {/* Color Scheme Generator */}
        <div>
          <SubsectionHeader title="OKLCH Color Schemes" />
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Generate harmonious colors from current color
          </p>
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: '🎨 Analogous',
                onClick: () => {
                  const colors = generateColorScheme(currentStyles.color || '#667eea', 'analogous');
                  onPropertyChange('color', colors[0], 'style');
                  console.log('Analogous scheme:', colors);
                },
                className: 'bg-green-100 text-green-800 hover:bg-green-200'
              },
              {
                label: '⚖️ Complementary',
                onClick: () => {
                  const colors = generateColorScheme(currentStyles.color || '#667eea', 'complementary');
                  onPropertyChange('color', colors[0], 'style');
                  console.log('Complementary scheme:', colors);
                },
                className: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
              },
              {
                label: '🔺 Triadic',
                onClick: () => {
                  const colors = generateColorScheme(currentStyles.color || '#667eea', 'triadic');
                  onPropertyChange('color', colors[0], 'style');
                  console.log('Triadic scheme:', colors);
                },
                className: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              },
              {
                label: '🔲 Tetradic',
                onClick: () => {
                  const colors = generateColorScheme(currentStyles.color || '#667eea', 'tetradic');
                  onPropertyChange('color', colors[0], 'style');
                  console.log('Tetradic scheme:', colors);
                },
                className: 'bg-red-100 text-red-800 hover:bg-red-200'
              },
              {
                label: '📊 Monochromatic',
                onClick: () => {
                  const colors = generateColorScheme(currentStyles.color || '#667eea', 'monochromatic');
                  onPropertyChange('color', colors[2], 'style'); // Use middle value
                  console.log('Monochromatic scheme:', colors);
                },
                className: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200'
              }
            ]}
          />
        </div>

        {/* Browser Support Info */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                Modern Color Spaces
              </p>
              <ul className="text-xs space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                <li>• <strong>OKLCH:</strong> Perceptually uniform colors with better gradients</li>
                <li>• <strong>OKLAB:</strong> Perceptually uniform Lab color space</li>
                <li>• <strong>color-mix():</strong> Mix colors in any color space</li>
                <li>• Tailwind CSS supports these in configuration</li>
                <li>• Supported in Chrome 111+, Firefox 113+, Safari 16.4+</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Current Color Info */}
        <div>
          <SubsectionHeader title="Current Color Info" />
          <div className="p-3 rounded-lg font-mono text-xs space-y-1" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
            {(() => {
              const { format, isModern } = detectColorFormat(currentStyles.color);
              return (
                <>
                  <div>Format: <span className="font-bold" style={{ color: 'var(--color-text)' }}>{format}</span></div>
                  <div>Modern: <span className={`font-bold ${isModern ? 'text-green-600' : 'text-orange-600'}`}>{isModern ? '✓ Yes' : '✗ No'}</span></div>
                  <div>Value: <span className="font-bold" style={{ color: 'var(--color-text)' }}>{currentStyles.color || 'none'}</span></div>
                </>
              );
            })()}
          </div>
        </div>
      </PropertySection>

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
          styleFramework={styleFramework}
          variablePropertyType="color"
        />
        
        <InputField
          label="Background Color"
          value={currentStyles.backgroundColor}
          onChange={(value) => onPropertyChange('backgroundColor', value, 'style')}
          type="color"
          searchTerm={searchTerm}
          styleFramework={styleFramework}
          variablePropertyType="color"
        />
        
        <InputField
          label="Border Color"
          value={currentStyles.borderColor}
          onChange={(value) => onPropertyChange('borderColor', value, 'style')}
          type="color"
          searchTerm={searchTerm}
          styleFramework={styleFramework}
          variablePropertyType="color"
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
        
        {/* Border Image */}
        <div>
          <SubsectionHeader title="Border Image" />
          <InputField
            label="Border Image Source"
            value={currentStyles.borderImageSource}
            onChange={(value) => onPropertyChange('borderImageSource', value, 'style')}
            placeholder="url(...) or gradient"
            searchTerm={searchTerm}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Image Slice"
              value={currentStyles.borderImageSlice}
              onChange={(value) => onPropertyChange('borderImageSlice', value, 'style')}
              placeholder="e.g., 30"
              searchTerm={searchTerm}
            />
            <InputField
              label="Image Width"
              value={currentStyles.borderImageWidth}
              onChange={(value) => onPropertyChange('borderImageWidth', value, 'style')}
              placeholder="e.g., 10px"
              searchTerm={searchTerm}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Image Outset"
              value={currentStyles.borderImageOutset}
              onChange={(value) => onPropertyChange('borderImageOutset', value, 'style')}
              placeholder="e.g., 0"
              searchTerm={searchTerm}
            />
            <InputField
              label="Image Repeat"
              value={currentStyles.borderImageRepeat}
              onChange={(value) => onPropertyChange('borderImageRepeat', value, 'style')}
              type="select"
              options={{
                values: ['stretch', 'repeat', 'round', 'space']
              }}
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

      {/* CONTAINER QUERIES - NEW */}
      <PropertySection
        title={
          <div className="flex items-center gap-2">
            <span>Container Queries</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
              NEW
            </span>
          </div>
        }
        Icon={Box}
        sectionKey="containerQueries"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        {/* Container Type */}
        <div>
          <SubsectionHeader title="Container Type" />
          <InputField
            label="Container Type"
            value={currentStyles.containerType}
            onChange={(value) => onPropertyChange('containerType', value, 'style')}
            type="select"
            options={{
              values: ['normal', 'size', 'inline-size', 'block-size']
            }}
            searchTerm={searchTerm}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Makes this element a container for child query breakpoints
          </p>
        </div>

        {/* Container Name */}
        <div>
          <SubsectionHeader title="Container Name" />
          <InputField
            label="Container Name"
            value={currentStyles.containerName}
            onChange={(value) => onPropertyChange('containerName', value, 'style')}
            options={{ placeholder: 'e.g., sidebar, card, hero' }}
            searchTerm={searchTerm}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Give this container a name to reference in @container queries
          </p>
        </div>

        {/* Quick Presets */}
        <div>
          <SubsectionHeader title="Quick Setup" />
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: '📦 Basic Container',
                onClick: () => {
                  onPropertyChange('containerType', 'inline-size', 'style');
                },
                className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              },
              {
                label: '📐 Size Container',
                onClick: () => {
                  onPropertyChange('containerType', 'size', 'style');
                },
                className: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              },
              {
                label: '📏 Inline Container',
                onClick: () => {
                  onPropertyChange('containerType', 'inline-size', 'style');
                },
                className: 'bg-green-100 text-green-800 hover:bg-green-200'
              },
              {
                label: '❌ Disable',
                onClick: () => {
                  onPropertyChange('containerType', 'normal', 'style');
                  onPropertyChange('containerName', '', 'style');
                },
                className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }
            ]}
          />
        </div>

        {/* Named Container Presets */}
        <div>
          <SubsectionHeader title="Common Container Names" />
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: '🎴 Card',
                onClick: () => {
                  onPropertyChange('containerType', 'inline-size', 'style');
                  onPropertyChange('containerName', 'card', 'style');
                },
                className: 'bg-pink-100 text-pink-800 hover:bg-pink-200'
              },
              {
                label: '📊 Sidebar',
                onClick: () => {
                  onPropertyChange('containerType', 'inline-size', 'style');
                  onPropertyChange('containerName', 'sidebar', 'style');
                },
                className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
              },
              {
                label: '🎯 Hero',
                onClick: () => {
                  onPropertyChange('containerType', 'size', 'style');
                  onPropertyChange('containerName', 'hero', 'style');
                },
                className: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
              },
              {
                label: '📰 Article',
                onClick: () => {
                  onPropertyChange('containerType', 'inline-size', 'style');
                  onPropertyChange('containerName', 'article', 'style');
                },
                className: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200'
              },
              {
                label: '🎬 Media',
                onClick: () => {
                  onPropertyChange('containerType', 'size', 'style');
                  onPropertyChange('containerName', 'media', 'style');
                },
                className: 'bg-red-100 text-red-800 hover:bg-red-200'
              },
              {
                label: '📋 Form',
                onClick: () => {
                  onPropertyChange('containerType', 'inline-size', 'style');
                  onPropertyChange('containerName', 'form', 'style');
                },
                className: 'bg-teal-100 text-teal-800 hover:bg-teal-200'
              }
            ]}
          />
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
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
                <div className="text-2xl mb-2">✅</div>
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
                <div className="text-2xl mb-2">⚪</div>
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

      {/* ASPECT RATIO - NEW */}
      <PropertySection
        title={
          <div className="flex items-center gap-2">
            <span>Aspect Ratio</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
              NEW
            </span>
          </div>
        }
        Icon={Box}
        sectionKey="aspectRatio"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        {/* Common Aspect Ratios */}
        <div>
          <SubsectionHeader title="Common Ratios" />
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

        {/* Device & Screen Ratios */}
        <div>
          <SubsectionHeader title="Device Ratios" />
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: '📱 iPhone (19.5:9)',
                onClick: () => onPropertyChange('aspectRatio', '19.5 / 9', 'style'),
                className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              },
              {
                label: '📱 Android (20:9)',
                onClick: () => onPropertyChange('aspectRatio', '20 / 9', 'style'),
                className: 'bg-green-100 text-green-800 hover:bg-green-200'
              },
              {
                label: '💻 Laptop (16:10)',
                onClick: () => onPropertyChange('aspectRatio', '16 / 10', 'style'),
                className: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200'
              },
              {
                label: '🖥️ Monitor (16:9)',
                onClick: () => onPropertyChange('aspectRatio', '16 / 9', 'style'),
                className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              },
              {
                label: '📺 Cinema (2.39:1)',
                onClick: () => onPropertyChange('aspectRatio', '2.39 / 1', 'style'),
                className: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              },
              {
                label: '🎬 IMAX (1.43:1)',
                onClick: () => onPropertyChange('aspectRatio', '1.43 / 1', 'style'),
                className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
              }
            ]}
          />
        </div>

        {/* Social Media Ratios */}
        <div>
          <SubsectionHeader title="Social Media" />
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: '📸 Instagram Post (1:1)',
                onClick: () => onPropertyChange('aspectRatio', '1 / 1', 'style'),
                className: 'bg-pink-100 text-pink-800 hover:bg-pink-200'
              },
              {
                label: '📱 Instagram Story (9:16)',
                onClick: () => onPropertyChange('aspectRatio', '9 / 16', 'style'),
                className: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              },
              {
                label: '🎥 YouTube (16:9)',
                onClick: () => onPropertyChange('aspectRatio', '16 / 9', 'style'),
                className: 'bg-red-100 text-red-800 hover:bg-red-200'
              },
              {
                label: '🐦 Twitter Header (3:1)',
                onClick: () => onPropertyChange('aspectRatio', '3 / 1', 'style'),
                className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              },
              {
                label: '📘 Facebook Cover (2.7:1)',
                onClick: () => onPropertyChange('aspectRatio', '2.7 / 1', 'style'),
                className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              },
              {
                label: '📌 Pinterest Pin (2:3)',
                onClick: () => onPropertyChange('aspectRatio', '2 / 3', 'style'),
                className: 'bg-red-100 text-red-800 hover:bg-red-200'
              }
            ]}
          />
        </div>

        {/* Custom Aspect Ratio */}
        <div>
          <SubsectionHeader title="Custom Ratio" />
          <InputField
            label="Aspect Ratio"
            value={currentStyles.aspectRatio}
            onChange={(value) => onPropertyChange('aspectRatio', value, 'style')}
            options={{ placeholder: 'e.g., 16 / 9 or auto' }}
            searchTerm={searchTerm}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <SubsectionHeader title="Quick Actions" />
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: '🔄 Flip Ratio',
                onClick: () => {
                  const current = currentStyles.aspectRatio;
                  if (current && typeof current === 'string' && current.includes('/')) {
                    const [width, height] = current.split('/').map(s => s.trim());
                    onPropertyChange('aspectRatio', `${height} / ${width}`, 'style');
                  }
                },
                className: 'bg-violet-100 text-violet-800 hover:bg-violet-200'
              },
              {
                label: '❌ Reset',
                onClick: () => onPropertyChange('aspectRatio', 'auto', 'style'),
                className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }
            ]}
          />
        </div>

        {/* Visual Preview */}
        <div>
          <SubsectionHeader title="Live Preview" />
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
      </PropertySection>

      {/* CORNER SHAPE - NEW */}
      <PropertySection
        title={
          <div className="flex items-center gap-2">
            <span>Corner Shape</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
              NEW
            </span>
          </div>
        }
        Icon={Circle}
        sectionKey="cornerShape"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        {/* Corner Style Presets */}
        <div>
          <SubsectionHeader title="Corner Style" />
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: '⬜ Sharp',
                onClick: () => onPropertyChange('borderRadius', '0', 'style'),
                className: 'bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium'
              },
              {
                label: '◽ Rounded',
                onClick: () => onPropertyChange('borderRadius', '8px', 'style'),
                className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium'
              },
              {
                label: '⬭ Smooth',
                onClick: () => onPropertyChange('borderRadius', '16px', 'style'),
                className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 font-medium'
              },
              {
                label: '⭕ Circular',
                onClick: () => onPropertyChange('borderRadius', '50%', 'style'),
                className: 'bg-purple-100 text-purple-800 hover:bg-purple-200 font-medium'
              },
              {
                label: '💊 Pill',
                onClick: () => onPropertyChange('borderRadius', '999px', 'style'),
                className: 'bg-pink-100 text-pink-800 hover:bg-pink-200 font-medium'
              },
              {
                label: '🌊 Organic',
                onClick: () => onPropertyChange('borderRadius', '30% 70% 70% 30% / 30% 30% 70% 70%', 'style'),
                className: 'bg-green-100 text-green-800 hover:bg-green-200 font-medium'
              }
            ]}
          />
        </div>

        {/* Corner Size Control */}
        <div>
          <SubsectionHeader title="Corner Size" />
          <InputField
            label="Corner Radius"
            value={currentStyles.borderRadius}
            onChange={(value) => onPropertyChange('borderRadius', value, 'style')}
            type="range"
            options={{ min: 0, max: 100, step: 1, unit: 'px' }}
            searchTerm={searchTerm}
          />
        </div>

        {/* Asymmetric Corners */}
        <div>
          <SubsectionHeader title="Asymmetric Corners" />
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: '↗️ Top Rounded',
                onClick: () => {
                  onPropertyChange('borderTopLeftRadius', '24px', 'style');
                  onPropertyChange('borderTopRightRadius', '24px', 'style');
                  onPropertyChange('borderBottomLeftRadius', '0', 'style');
                  onPropertyChange('borderBottomRightRadius', '0', 'style');
                },
                className: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200'
              },
              {
                label: '↘️ Bottom Rounded',
                onClick: () => {
                  onPropertyChange('borderTopLeftRadius', '0', 'style');
                  onPropertyChange('borderTopRightRadius', '0', 'style');
                  onPropertyChange('borderBottomLeftRadius', '24px', 'style');
                  onPropertyChange('borderBottomRightRadius', '24px', 'style');
                },
                className: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200'
              },
              {
                label: '↖️ Left Rounded',
                onClick: () => {
                  onPropertyChange('borderTopLeftRadius', '24px', 'style');
                  onPropertyChange('borderTopRightRadius', '0', 'style');
                  onPropertyChange('borderBottomLeftRadius', '24px', 'style');
                  onPropertyChange('borderBottomRightRadius', '0', 'style');
                },
                className: 'bg-teal-100 text-teal-800 hover:bg-teal-200'
              },
              {
                label: '↗️ Right Rounded',
                onClick: () => {
                  onPropertyChange('borderTopLeftRadius', '0', 'style');
                  onPropertyChange('borderTopRightRadius', '24px', 'style');
                  onPropertyChange('borderBottomLeftRadius', '0', 'style');
                  onPropertyChange('borderBottomRightRadius', '24px', 'style');
                },
                className: 'bg-teal-100 text-teal-800 hover:bg-teal-200'
              },
              {
                label: '◸ Diagonal TL-BR',
                onClick: () => {
                  onPropertyChange('borderTopLeftRadius', '50px', 'style');
                  onPropertyChange('borderTopRightRadius', '0', 'style');
                  onPropertyChange('borderBottomLeftRadius', '0', 'style');
                  onPropertyChange('borderBottomRightRadius', '50px', 'style');
                },
                className: 'bg-violet-100 text-violet-800 hover:bg-violet-200'
              },
              {
                label: '◹ Diagonal TR-BL',
                onClick: () => {
                  onPropertyChange('borderTopLeftRadius', '0', 'style');
                  onPropertyChange('borderTopRightRadius', '50px', 'style');
                  onPropertyChange('borderBottomLeftRadius', '50px', 'style');
                  onPropertyChange('borderBottomRightRadius', '0', 'style');
                },
                className: 'bg-violet-100 text-violet-800 hover:bg-violet-200'
              }
            ]}
          />
        </div>

        {/* Squircle & Modern Shapes */}
        <div>
          <SubsectionHeader title="Modern Shapes" />
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: '⬜ Squircle',
                onClick: () => onPropertyChange('borderRadius', '20% / 50%', 'style'),
                className: 'bg-orange-100 text-orange-800 hover:bg-orange-200 font-medium'
              },
              {
                label: '🥚 Egg',
                onClick: () => onPropertyChange('borderRadius', '50% 50% 50% 50% / 60% 60% 40% 40%', 'style'),
                className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-medium'
              },
              {
                label: '🔷 Diamond',
                onClick: () => onPropertyChange('clipPath', 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', 'style'),
                className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium'
              },
              {
                label: '⭐ Star',
                onClick: () => onPropertyChange('clipPath', 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', 'style'),
                className: 'bg-amber-100 text-amber-800 hover:bg-amber-200 font-medium'
              },
              {
                label: '🔶 Hexagon',
                onClick: () => onPropertyChange('clipPath', 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', 'style'),
                className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-medium'
              },
              {
                label: '🔺 Triangle',
                onClick: () => onPropertyChange('clipPath', 'polygon(50% 0%, 0% 100%, 100% 100%)', 'style'),
                className: 'bg-red-100 text-red-800 hover:bg-red-200 font-medium'
              }
            ]}
          />
        </div>

        {/* Individual Corner Control */}
        <div>
          <SubsectionHeader title="Fine-tune Each Corner" />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="↖️ Top Left"
              value={currentStyles.borderTopLeftRadius}
              onChange={(value) => onPropertyChange('borderTopLeftRadius', value, 'style')}
              searchTerm={searchTerm}
            />
            <InputField
              label="↗️ Top Right"
              value={currentStyles.borderTopRightRadius}
              onChange={(value) => onPropertyChange('borderTopRightRadius', value, 'style')}
              searchTerm={searchTerm}
            />
            <InputField
              label="↙️ Bottom Left"
              value={currentStyles.borderBottomLeftRadius}
              onChange={(value) => onPropertyChange('borderBottomLeftRadius', value, 'style')}
              searchTerm={searchTerm}
            />
            <InputField
              label="↘️ Bottom Right"
              value={currentStyles.borderBottomRightRadius}
              onChange={(value) => onPropertyChange('borderBottomRightRadius', value, 'style')}
              searchTerm={searchTerm}
            />
          </div>
        </div>

        {/* Visual Preview */}
        <div>
          <SubsectionHeader title="Live Preview" />
          <div className="flex justify-center p-6 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
            <div
              className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 transition-all duration-300"
              style={{
                borderRadius: currentStyles.borderRadius || '0',
                borderTopLeftRadius: currentStyles.borderTopLeftRadius,
                borderTopRightRadius: currentStyles.borderTopRightRadius,
                borderBottomLeftRadius: currentStyles.borderBottomLeftRadius,
                borderBottomRightRadius: currentStyles.borderBottomRightRadius,
                clipPath: currentStyles.clipPath || 'none'
              }}
            />
          </div>
          <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Preview updates in real-time
          </p>
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