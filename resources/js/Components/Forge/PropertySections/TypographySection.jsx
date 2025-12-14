// @/Components/Forge/PropertySections/TypographySection.jsx - FULLY WORKING

import React, { useEffect, useState } from 'react';
import { Type, Wand2 } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader, presetValues } from '../PropertyUtils';

// Google Fonts List
const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 
  'Nunito', 'Ubuntu', 'Playfair Display', 'Merriweather', 'PT Sans', 'Source Sans Pro',
  'Oswald', 'Quicksand', 'Karla', 'Work Sans', 'DM Sans', 'Space Grotesk',
  'Plus Jakarta Sans', 'Outfit', 'Manrope', 'Sora', 'Archivo', 'Public Sans',
];

const SYSTEM_FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
  'Courier New', 'monospace', 'sans-serif', 'serif'
];

const TypographySection = ({ 
  currentStyles, 
  onPropertyChange, 
  expandedSections, 
  setExpandedSections, 
  searchTerm = '', 
  selectedComponentData,
  styleFramework = 'css'
}) => {
  // Load Google Fonts
  useEffect(() => {
    if (!document.getElementById('google-fonts-decode')) {
      const link = document.createElement('link');
      link.id = 'google-fonts-decode';
      link.rel = 'stylesheet';
      
      const fontsQuery = GOOGLE_FONTS.map(font => 
        `family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900`
      ).join('&');
      
      link.href = `https://fonts.googleapis.com/css2?${fontsQuery}&display=swap`;
      document.head.appendChild(link);
    }
  }, []);

  const allFonts = [...GOOGLE_FONTS, '---', ...SYSTEM_FONTS];
  
  const needsPlaceholder = ['input', 'textarea', 'select'].includes(selectedComponentData?.type);

  return (
    <>
      <PropertySection
        title="Typography"
        Icon={Type}
        sectionKey="typography"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        {/* Placeholder - Only for inputs/textarea */}
        {needsPlaceholder && (
          <InputField
            label="Placeholder Text"
            value={currentStyles.placeholder || selectedComponentData?.props?.placeholder || ''}
            onChange={(value) => {
              onPropertyChange('placeholder', value, 'props');
            }}
            type="text"
            options={{ placeholder: 'Enter placeholder text...' }}
            searchTerm={searchTerm}
          />
        )}
        
        {/* Font Family */}
        <InputField
          label="Font Family"
          value={currentStyles.fontFamily || ''}
          onChange={(value) => {
            if (value === '---') return;
            onPropertyChange('fontFamily', value, 'style');
          }}
          type="select"
          options={{ values: allFonts }}
          searchTerm={searchTerm}
        />
        
        {/* Font Size & Weight */}
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Font Size"
            value={currentStyles.fontSize || ''}
            onChange={(value) => onPropertyChange('fontSize', value, 'style')}
            options={{ placeholder: '16px, 1rem, var(--font-size-base)' }}
            searchTerm={searchTerm}
            styleFramework={styleFramework}
            variablePropertyType="typography"
          />
          <InputField
            label="Font Weight"
            value={currentStyles.fontWeight || ''}
            onChange={(value) => onPropertyChange('fontWeight', value, 'style')}
            type="select"
            options={{
              values: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder', 'lighter']
            }}
            searchTerm={searchTerm}
          />
        </div>
        
        {/* Line Height & Letter Spacing */}
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Line Height"
            value={currentStyles.lineHeight || ''}
            onChange={(value) => onPropertyChange('lineHeight', value, 'style')}
            options={{ placeholder: 'normal, 1.5, var(--line-height-base)' }}
            searchTerm={searchTerm}
            styleFramework={styleFramework}
            variablePropertyType="typography"
          />
          <InputField
            label="Letter Spacing"
            value={currentStyles.letterSpacing || ''}
            onChange={(value) => onPropertyChange('letterSpacing', value, 'style')}
            options={{ placeholder: 'normal, 0.5px, var(--letter-spacing)' }}
            searchTerm={searchTerm}
            styleFramework={styleFramework}
            variablePropertyType="typography"
          />
        </div>
        
        {/* Word Spacing */}
        <InputField
          label="Word Spacing"
          value={currentStyles.wordSpacing || ''}
          onChange={(value) => onPropertyChange('wordSpacing', value, 'style')}
          options={{ placeholder: 'normal, 2px, 4px' }}
          searchTerm={searchTerm}
        />
        
        {/* Text Align */}
        <InputField
          label="Text Align"
          value={currentStyles.textAlign || ''}
          onChange={(value) => onPropertyChange('textAlign', value, 'style')}
          type="select"
          options={{
            values: ['left', 'center', 'right', 'justify', 'start', 'end']
          }}
          searchTerm={searchTerm}
        />
        
        {/* Vertical Align */}
        <InputField
          label="Vertical Align"
          value={currentStyles.verticalAlign || ''}
          onChange={(value) => onPropertyChange('verticalAlign', value, 'style')}
          type="select"
          options={{
            values: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'super', 'sub']
          }}
          searchTerm={searchTerm}
        />
        
        {/* Text Transform */}
        <InputField
          label="Text Transform"
          value={currentStyles.textTransform || ''}
          onChange={(value) => onPropertyChange('textTransform', value, 'style')}
          type="select"
          options={{
            values: ['none', 'uppercase', 'lowercase', 'capitalize', 'full-width']
          }}
          searchTerm={searchTerm}
        />
        
        {/* Font Style */}
        <InputField
          label="Font Style"
          value={currentStyles.fontStyle || ''}
          onChange={(value) => onPropertyChange('fontStyle', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'italic', 'oblique']
          }}
          searchTerm={searchTerm}
        />
        
        {/* Font Variant */}
        <InputField
          label="Font Variant"
          value={currentStyles.fontVariant || ''}
          onChange={(value) => onPropertyChange('fontVariant', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'small-caps', 'all-small-caps']
          }}
          searchTerm={searchTerm}
        />
        
        {/* Text Indent */}
        <InputField
          label="Text Indent"
          value={currentStyles.textIndent || ''}
          onChange={(value) => onPropertyChange('textIndent', value, 'style')}
          options={{ placeholder: '0px, 20px, 1em' }}
          searchTerm={searchTerm}
        />
        
        {/* White Space */}
        <InputField
          label="White Space"
          value={currentStyles.whiteSpace || ''}
          onChange={(value) => onPropertyChange('whiteSpace', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces']
          }}
          searchTerm={searchTerm}
        />
        
        {/* Text Wrap - NEW */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Text Wrap
            </label>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
              NEW
            </span>
          </div>
          <InputField
            label=""
            value={currentStyles.textWrap || ''}
            onChange={(value) => onPropertyChange('textWrap', value, 'style')}
            type="preset"
            options={{
              presets: [
                { label: 'Wrap (Default)', value: 'wrap' },
                { label: 'No Wrap', value: 'nowrap' },
                { label: 'Balance', value: 'balance' },
                { label: 'Pretty', value: 'pretty' },
                { label: 'Stable', value: 'stable' }
              ]
            }}
            searchTerm={searchTerm}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            <strong>Balance:</strong> Evenly distribute text across lines<br/>
            <strong>Pretty:</strong> Avoid orphans & improve readability
          </p>
        </div>
        
        {/* Word Break */}
        <InputField
          label="Word Break"
          value={currentStyles.wordBreak || ''}
          onChange={(value) => onPropertyChange('wordBreak', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'break-all', 'keep-all', 'break-word']
          }}
          searchTerm={searchTerm}
        />
        
        {/* Hyphens */}
        <InputField
          label="Hyphens"
          value={currentStyles.hyphens || ''}
          onChange={(value) => onPropertyChange('hyphens', value, 'style')}
          type="select"
          options={{
            values: ['none', 'manual', 'auto']
          }}
          searchTerm={searchTerm}
        />
      </PropertySection>

      {/* Text Effects Section */}
      <PropertySection
        title="Text Effects"
        Icon={Wand2}
        sectionKey="textEffects"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        {/* Text Decoration */}
        <InputField
          label="Text Decoration"
          value={currentStyles.textDecoration || ''}
          onChange={(value) => onPropertyChange('textDecoration', value, 'style')}
          type="select"
          options={{
            values: ['none', 'underline', 'overline', 'line-through', 'underline overline']
          }}
          searchTerm={searchTerm}
        />
        
        {/* Text Decoration Style */}
        <InputField
          label="Text Decoration Style"
          value={currentStyles.textDecorationStyle || ''}
          onChange={(value) => onPropertyChange('textDecorationStyle', value, 'style')}
          type="select"
          options={{
            values: ['solid', 'double', 'dotted', 'dashed', 'wavy']
          }}
          searchTerm={searchTerm}
        />
        
        {/* Text Decoration Color */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Text Decoration Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={currentStyles.textDecorationColor || '#000000'}
              onChange={(e) => onPropertyChange('textDecorationColor', e.target.value, 'style')}
              className="w-12 h-10 border rounded cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            />
            <input
              type="text"
              value={currentStyles.textDecorationColor || ''}
              onChange={(e) => onPropertyChange('textDecorationColor', e.target.value, 'style')}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>
        </div>
        
        {/* Text Shadow */}
        <InputField
          label="Text Shadow"
          value={currentStyles.textShadow || ''}
          onChange={(value) => onPropertyChange('textShadow', value, 'style')}
          type="preset"
          options={{
            presets: presetValues.textShadows
          }}
          searchTerm={searchTerm}
        />
        
        {/* Text Stroke */}
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Text Stroke Width"
            value={currentStyles.webkitTextStrokeWidth || currentStyles.textStrokeWidth || ''}
            onChange={(value) => {
              onPropertyChange('webkitTextStrokeWidth', value, 'style');
              onPropertyChange('textStrokeWidth', value, 'style');
            }}
            options={{ placeholder: '0px, 1px, 2px' }}
            searchTerm={searchTerm}
          />
          
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Stroke Color
            </label>
            <input
              type="color"
              value={currentStyles.webkitTextStrokeColor || currentStyles.textStrokeColor || '#000000'}
              onChange={(e) => {
                onPropertyChange('webkitTextStrokeColor', e.target.value, 'style');
                onPropertyChange('textStrokeColor', e.target.value, 'style');
              }}
              className="w-full h-10 border rounded cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>
        </div>
        
        {/* Text Fill Color */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Text Fill Color (Webkit)
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={currentStyles.webkitTextFillColor || currentStyles.textFillColor || '#000000'}
              onChange={(e) => {
                onPropertyChange('webkitTextFillColor', e.target.value, 'style');
                onPropertyChange('textFillColor', e.target.value, 'style');
              }}
              className="w-12 h-10 border rounded cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            />
            <input
              type="text"
              value={currentStyles.webkitTextFillColor || currentStyles.textFillColor || ''}
              onChange={(e) => {
                onPropertyChange('webkitTextFillColor', e.target.value, 'style');
                onPropertyChange('textFillColor', e.target.value, 'style');
              }}
              placeholder="transparent, #000000"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>
        </div>
        
        
        {/* Text Gradient */}
      <div>
        <SubsectionHeader title="Text Gradient" />
        <InputField
          label="Enable Text Gradient"
          value={!!(currentStyles.background?.includes('gradient') && 
                   (currentStyles.WebkitBackgroundClip === 'text' || currentStyles.backgroundClip === 'text'))}
          onChange={(value) => {
            if (value) {
              onPropertyChange('background', 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)', 'style');
              onPropertyChange('WebkitBackgroundClip', 'text', 'style');
              onPropertyChange('WebkitTextFillColor', 'transparent', 'style');
              onPropertyChange('backgroundClip', 'text', 'style');
            } else {
              onPropertyChange('background', '', 'style');
              onPropertyChange('WebkitBackgroundClip', '', 'style');
              onPropertyChange('WebkitTextFillColor', '', 'style');
              onPropertyChange('backgroundClip', '', 'style');
            }
          }}
          type="checkbox"
          searchTerm={searchTerm}
        />
        
        {currentStyles.background?.includes('gradient') && (
          <div className="mt-3 space-y-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border)' }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Start Color</label>
                <input
                  type="color"
                  value="#9333ea"
                  onChange={(e) => {
                    const currentBg = currentStyles.background || '';
                    const colors = currentBg.match(/#[0-9a-fA-F]{6}/g) || ['#9333ea', '#ec4899'];
                    const newGradient = `linear-gradient(135deg, ${e.target.value} 0%, ${colors[1]} 100%)`;
                    onPropertyChange('background', newGradient, 'style');
                  }}
                  className="w-full h-10 border rounded cursor-pointer"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>End Color</label>
                <input
                  type="color"
                  value="#ec4899"
                  onChange={(e) => {
                    const currentBg = currentStyles.background || '';
                    const colors = currentBg.match(/#[0-9a-fA-F]{6}/g) || ['#9333ea', '#ec4899'];
                    const newGradient = `linear-gradient(135deg, ${colors[0]} 0%, ${e.target.value} 100%)`;
                    onPropertyChange('background', newGradient, 'style');
                  }}
                  className="w-full h-10 border rounded cursor-pointer"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
        
        {/* Writing Mode */}
        <InputField
          label="Writing Mode"
          value={currentStyles.writingMode || ''}
          onChange={(value) => onPropertyChange('writingMode', value, 'style')}
          type="select"
          options={{
            values: ['horizontal-tb', 'vertical-rl', 'vertical-lr']
          }}
          searchTerm={searchTerm}
        />
      </PropertySection>
    </>
  );
};

export default TypographySection;