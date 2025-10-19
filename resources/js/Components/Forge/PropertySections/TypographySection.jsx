import React, { useEffect } from 'react';
import { Type, Wand2 } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader, presetValues } from '../PropertyUtils';

// 🔥 ADD: Google Fonts List (Top 100 most popular)
const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 
  'Nunito', 'Ubuntu', 'Playfair Display', 'Merriweather', 'PT Sans', 'Source Sans Pro',
  'Oswald', 'Quicksand', 'Karla', 'Work Sans', 'DM Sans', 'Space Grotesk',
  'Plus Jakarta Sans', 'Outfit', 'Manrope', 'Sora', 'Archivo', 'Public Sans',
  'Lexend', 'Be Vietnam Pro', 'IBM Plex Sans', 'Rubik', 'Mukta', 'Barlow',
  'Noto Sans', 'Kanit', 'Crimson Text', 'Libre Baskerville', 'Arimo',
  'Titillium Web', 'Hind', 'Inconsolata', 'Cabin', 'Heebo', 'Josefin Sans',
  'Libre Franklin', 'Oxygen', 'Dosis', 'Bitter', 'Exo 2', 'Varela Round',
  'Abril Fatface', 'Righteous', 'Pacifico', 'Dancing Script', 'Caveat',
];

const SYSTEM_FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
  'Courier New', 'monospace', 'sans-serif', 'serif'
];

const TypographySection = ({ currentStyles, onPropertyChange, expandedSections, setExpandedSections, searchTerm = '', selectedComponentData }) => {
  // 🔥 ADD: Load Google Fonts dynamically
  useEffect(() => {
    if (!document.getElementById('google-fonts-decode')) {
      const link = document.createElement('link');
      link.id = 'google-fonts-decode';
      link.rel = 'stylesheet';
      
      // Load all fonts with weights 300-900
      const fontsQuery = GOOGLE_FONTS.map(font => 
        `family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900`
      ).join('&');
      
      link.href = `https://fonts.googleapis.com/css2?${fontsQuery}&display=swap`;
      document.head.appendChild(link);
      
      console.log('✅ Google Fonts loaded:', GOOGLE_FONTS.length, 'fonts');
    }
  }, []);

  // 🔥 ADD: Combined font list
  const allFonts = [
    ...GOOGLE_FONTS,
    '---',  // Separator
    ...SYSTEM_FONTS
  ];
  
  
  // Check if component needs placeholder (inputs/textarea)
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
      
        {/* 🔥 PLACEHOLDER - Only for inputs/textarea */}
        {needsPlaceholder && (
          <InputField
            label="Placeholder Text"
            value={selectedComponentData?.props?.placeholder || ''}
            onChange={(value) => onPropertyChange('placeholder', value, 'props')}
            type="text"
            options={{ placeholder: 'Enter placeholder text...' }}
            searchTerm={searchTerm}
          />
        )}
        
        {/* 🔥 UPDATED: Font Family with Google Fonts */}
        <InputField
          label="Font Family"
          value={currentStyles.fontFamily}
          onChange={(value) => onPropertyChange('fontFamily', value, 'style')}
          type="select"
          options={{
            values: allFonts
          }}
          searchTerm={searchTerm}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Font Size"
            value={currentStyles.fontSize}
            onChange={(value) => onPropertyChange('fontSize', value, 'style')}
            options={{ placeholder: '16px' }}
            searchTerm={searchTerm}
          />
          <InputField
            label="Font Weight"
            value={currentStyles.fontWeight}
            onChange={(value) => onPropertyChange('fontWeight', value, 'style')}
            type="select"
            options={{
              values: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder', 'lighter']
            }}
            searchTerm={searchTerm}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Line Height"
            value={currentStyles.lineHeight}
            onChange={(value) => onPropertyChange('lineHeight', value, 'style')}
            options={{ placeholder: 'normal' }}
            searchTerm={searchTerm}
          />
          <InputField
            label="Letter Spacing"
            value={currentStyles.letterSpacing}
            onChange={(value) => onPropertyChange('letterSpacing', value, 'style')}
            options={{ placeholder: 'normal' }}
            searchTerm={searchTerm}
          />
        </div>
        
        <InputField
          label="Word Spacing"
          value={currentStyles.wordSpacing}
          onChange={(value) => onPropertyChange('wordSpacing', value, 'style')}
          options={{ placeholder: 'normal' }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Text Align"
          value={currentStyles.textAlign}
          onChange={(value) => onPropertyChange('textAlign', value, 'style')}
          type="select"
          options={{
            values: ['left', 'center', 'right', 'justify', 'start', 'end']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Vertical Align"
          value={currentStyles.verticalAlign}
          onChange={(value) => onPropertyChange('verticalAlign', value, 'style')}
          type="select"
          options={{
            values: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'super', 'sub']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Text Transform"
          value={currentStyles.textTransform}
          onChange={(value) => onPropertyChange('textTransform', value, 'style')}
          type="select"
          options={{
            values: ['none', 'uppercase', 'lowercase', 'capitalize', 'full-width']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Font Style"
          value={currentStyles.fontStyle}
          onChange={(value) => onPropertyChange('fontStyle', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'italic', 'oblique']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Font Variant"
          value={currentStyles.fontVariant}
          onChange={(value) => onPropertyChange('fontVariant', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'small-caps', 'all-small-caps', 'petite-caps', 'all-petite-caps', 'unicase', 'titling-caps']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Text Indent"
          value={currentStyles.textIndent}
          onChange={(value) => onPropertyChange('textIndent', value, 'style')}
          options={{ placeholder: '0px' }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="White Space"
          value={currentStyles.whiteSpace}
          onChange={(value) => onPropertyChange('whiteSpace', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Word Break"
          value={currentStyles.wordBreak}
          onChange={(value) => onPropertyChange('wordBreak', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'break-all', 'keep-all', 'break-word']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Hyphens"
          value={currentStyles.hyphens}
          onChange={(value) => onPropertyChange('hyphens', value, 'style')}
          type="select"
          options={{
            values: ['none', 'manual', 'auto']
          }}
          searchTerm={searchTerm}
        />
      </PropertySection>

      <PropertySection
        title="Text Effects"
        Icon={Wand2}
        sectionKey="textEffects"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        <InputField
          label="Text Decoration"
          value={currentStyles.textDecoration}
          onChange={(value) => onPropertyChange('textDecoration', value, 'style')}
          type="select"
          options={{
            values: ['none', 'underline', 'overline', 'line-through', 'underline overline']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Text Decoration Style"
          value={currentStyles.textDecorationStyle}
          onChange={(value) => onPropertyChange('textDecorationStyle', value, 'style')}
          type="select"
          options={{
            values: ['solid', 'double', 'dotted', 'dashed', 'wavy']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Text Decoration Color"
          value={currentStyles.textDecorationColor}
          onChange={(value) => onPropertyChange('textDecorationColor', value, 'style')}
          type="color"
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Text Shadow"
          value={currentStyles.textShadow}
          onChange={(value) => onPropertyChange('textShadow', value, 'style')}
          type="preset"
          options={{
            presets: presetValues.textShadows
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Text Stroke Width"
          value={currentStyles.webkitTextStrokeWidth || currentStyles.textStrokeWidth}
          onChange={(value) => {
            onPropertyChange('webkitTextStrokeWidth', value, 'style');
            onPropertyChange('textStrokeWidth', value, 'style');
          }}
          options={{ placeholder: '0px' }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Text Stroke Color"
          value={currentStyles.webkitTextStrokeColor || currentStyles.textStrokeColor}
          onChange={(value) => {
            onPropertyChange('webkitTextStrokeColor', value, 'style');
            onPropertyChange('textStrokeColor', value, 'style');
          }}
          type="color"
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Text Fill Color"
          value={currentStyles.webkitTextFillColor || currentStyles.textFillColor}
          onChange={(value) => {
            onPropertyChange('webkitTextFillColor', value, 'style');
            onPropertyChange('textFillColor', value, 'style');
          }}
          type="color"
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Text Emphasis Style"
          value={currentStyles.textEmphasisStyle}
          onChange={(value) => onPropertyChange('textEmphasisStyle', value, 'style')}
          type="select"
          options={{
            values: ['none', 'filled', 'open', 'dot', 'circle', 'double-circle', 'triangle', 'sesame']
          }}
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Text Emphasis Color"
          value={currentStyles.textEmphasisColor}
          onChange={(value) => onPropertyChange('textEmphasisColor', value, 'style')}
          type="color"
          searchTerm={searchTerm}
        />
        
        <InputField
          label="Writing Mode"
          value={currentStyles.writingMode}
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