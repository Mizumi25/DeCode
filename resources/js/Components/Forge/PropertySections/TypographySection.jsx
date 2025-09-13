import React from 'react';
import { Type, Wand2 } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader, presetValues } from '../PropertyUtils';

const TypographySection = ({ currentStyles, onPropertyChange, expandedSections, setExpandedSections }) => {
  return (
    <>
      {/* TYPOGRAPHY */}
      <PropertySection
        title="Typography"
        Icon={Type}
        sectionKey="typography"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        <InputField
          label="Font Family"
          value={currentStyles.fontFamily}
          onChange={(value) => onPropertyChange('fontFamily', value, 'style')}
          type="select"
          options={{
            values: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'monospace', 'sans-serif', 'serif', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro', 'Oswald', 'Raleway', 'Ubuntu']
          }}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Font Size"
            value={currentStyles.fontSize}
            onChange={(value) => onPropertyChange('fontSize', value, 'style')}
            options={{ placeholder: '16px' }}
          />
          <InputField
            label="Font Weight"
            value={currentStyles.fontWeight}
            onChange={(value) => onPropertyChange('fontWeight', value, 'style')}
            type="select"
            options={{
              values: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder', 'lighter']
            }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Line Height"
            value={currentStyles.lineHeight}
            onChange={(value) => onPropertyChange('lineHeight', value, 'style')}
            options={{ placeholder: 'normal' }}
          />
          <InputField
            label="Letter Spacing"
            value={currentStyles.letterSpacing}
            onChange={(value) => onPropertyChange('letterSpacing', value, 'style')}
            options={{ placeholder: 'normal' }}
          />
        </div>
        
        <InputField
          label="Word Spacing"
          value={currentStyles.wordSpacing}
          onChange={(value) => onPropertyChange('wordSpacing', value, 'style')}
          options={{ placeholder: 'normal' }}
        />
        
        <InputField
          label="Text Align"
          value={currentStyles.textAlign}
          onChange={(value) => onPropertyChange('textAlign', value, 'style')}
          type="select"
          options={{
            values: ['left', 'center', 'right', 'justify', 'start', 'end']
          }}
        />
        
        <InputField
          label="Vertical Align"
          value={currentStyles.verticalAlign}
          onChange={(value) => onPropertyChange('verticalAlign', value, 'style')}
          type="select"
          options={{
            values: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'super', 'sub']
          }}
        />
        
        <InputField
          label="Text Transform"
          value={currentStyles.textTransform}
          onChange={(value) => onPropertyChange('textTransform', value, 'style')}
          type="select"
          options={{
            values: ['none', 'uppercase', 'lowercase', 'capitalize', 'full-width']
          }}
        />
        
        <InputField
          label="Font Style"
          value={currentStyles.fontStyle}
          onChange={(value) => onPropertyChange('fontStyle', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'italic', 'oblique']
          }}
        />
        
        <InputField
          label="Font Variant"
          value={currentStyles.fontVariant}
          onChange={(value) => onPropertyChange('fontVariant', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'small-caps', 'all-small-caps', 'petite-caps', 'all-petite-caps', 'unicase', 'titling-caps']
          }}
        />
        
        <InputField
          label="Text Indent"
          value={currentStyles.textIndent}
          onChange={(value) => onPropertyChange('textIndent', value, 'style')}
          options={{ placeholder: '0px' }}
        />
        
        <InputField
          label="White Space"
          value={currentStyles.whiteSpace}
          onChange={(value) => onPropertyChange('whiteSpace', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces']
          }}
        />
        
        <InputField
          label="Word Break"
          value={currentStyles.wordBreak}
          onChange={(value) => onPropertyChange('wordBreak', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'break-all', 'keep-all', 'break-word']
          }}
        />
        
        <InputField
          label="Hyphens"
          value={currentStyles.hyphens}
          onChange={(value) => onPropertyChange('hyphens', value, 'style')}
          type="select"
          options={{
            values: ['none', 'manual', 'auto']
          }}
        />
      </PropertySection>

      {/* TEXT EFFECTS */}
      <PropertySection
        title="Text Effects"
        Icon={Wand2}
        sectionKey="textEffects"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        <InputField
          label="Text Decoration"
          value={currentStyles.textDecoration}
          onChange={(value) => onPropertyChange('textDecoration', value, 'style')}
          type="select"
          options={{
            values: ['none', 'underline', 'overline', 'line-through', 'underline overline']
          }}
        />
        
        <InputField
          label="Text Decoration Style"
          value={currentStyles.textDecorationStyle}
          onChange={(value) => onPropertyChange('textDecorationStyle', value, 'style')}
          type="select"
          options={{
            values: ['solid', 'double', 'dotted', 'dashed', 'wavy']
          }}
        />
        
        <InputField
          label="Text Decoration Color"
          value={currentStyles.textDecorationColor}
          onChange={(value) => onPropertyChange('textDecorationColor', value, 'style')}
          type="color"
        />
        
        <InputField
          label="Text Shadow"
          value={currentStyles.textShadow}
          onChange={(value) => onPropertyChange('textShadow', value, 'style')}
          type="preset"
          options={{
            presets: presetValues.textShadows
          }}
        />
        
        <InputField
          label="Text Stroke Width"
          value={currentStyles.webkitTextStrokeWidth || currentStyles.textStrokeWidth}
          onChange={(value) => {
            onPropertyChange('webkitTextStrokeWidth', value, 'style');
            onPropertyChange('textStrokeWidth', value, 'style');
          }}
          options={{ placeholder: '0px' }}
        />
        
        <InputField
          label="Text Stroke Color"
          value={currentStyles.webkitTextStrokeColor || currentStyles.textStrokeColor}
          onChange={(value) => {
            onPropertyChange('webkitTextStrokeColor', value, 'style');
            onPropertyChange('textStrokeColor', value, 'style');
          }}
          type="color"
        />
        
        <InputField
          label="Text Fill Color"
          value={currentStyles.webkitTextFillColor || currentStyles.textFillColor}
          onChange={(value) => {
            onPropertyChange('webkitTextFillColor', value, 'style');
            onPropertyChange('textFillColor', value, 'style');
          }}
          type="color"
        />
        
        <InputField
          label="Text Emphasis Style"
          value={currentStyles.textEmphasisStyle}
          onChange={(value) => onPropertyChange('textEmphasisStyle', value, 'style')}
          type="select"
          options={{
            values: ['none', 'filled', 'open', 'dot', 'circle', 'double-circle', 'triangle', 'sesame']
          }}
        />
        
        <InputField
          label="Text Emphasis Color"
          value={currentStyles.textEmphasisColor}
          onChange={(value) => onPropertyChange('textEmphasisColor', value, 'style')}
          type="color"
        />
        
        <InputField
          label="Writing Mode"
          value={currentStyles.writingMode}
          onChange={(value) => onPropertyChange('writingMode', value, 'style')}
          type="select"
          options={{
            values: ['horizontal-tb', 'vertical-rl', 'vertical-lr']
          }}
        />
      </PropertySection>
    </>
  );
};

export default TypographySection;