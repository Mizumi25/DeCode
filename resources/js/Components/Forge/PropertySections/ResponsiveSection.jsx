import React from 'react';
import { Monitor, Smartphone, Tablet, Heart } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader, ButtonGrid } from '../PropertyUtils';

const ResponsiveSection = ({ currentStyles, currentAnimation, onPropertyChange, expandedSections, setExpandedSections }) => {
  return (
    <>
      {/* RESPONSIVE DESIGN */}
      <PropertySection
        title="Responsive & Container Queries"
        Icon={Monitor}
        sectionKey="responsive"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        {/* Breakpoints */}
        <div>
          <SubsectionHeader title="Breakpoints" />
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: 'Mobile',
                onClick: () => onPropertyChange('activeBreakpoint', 'mobile', 'responsive'),
                className: `px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  currentAnimation.activeBreakpoint === 'mobile' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`,
                icon: Smartphone
              },
              {
                label: 'Tablet',
                onClick: () => onPropertyChange('activeBreakpoint', 'tablet', 'responsive'),
                className: `px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  currentAnimation.activeBreakpoint === 'tablet' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`,
                icon: Tablet
              },
              {
                label: 'Desktop',
                onClick: () => onPropertyChange('activeBreakpoint', 'desktop', 'responsive'),
                className: `px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  currentAnimation.activeBreakpoint === 'desktop' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`,
                icon: Monitor
              },
              {
                label: 'XL',
                onClick: () => onPropertyChange('activeBreakpoint', 'xl', 'responsive'),
                className: `px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  currentAnimation.activeBreakpoint === 'xl' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`,
                icon: Monitor
              }
            ]}
          />
        </div>

        {/* Container Queries */}
        <div>
          <SubsectionHeader title="Container Queries" />
          <InputField
            label="Container Type"
            value={currentStyles.containerType}
            onChange={(value) => onPropertyChange('containerType', value, 'style')}
            type="select"
            options={{
              values: ['normal', 'size', 'inline-size', 'block-size']
            }}
          />
          
          <InputField
            label="Container Name"
            value={currentStyles.containerName}
            onChange={(value) => onPropertyChange('containerName', value, 'style')}
          />
          
          <InputField
            label="Container Query"
            value={currentStyles.containerQuery}
            onChange={(value) => onPropertyChange('containerQuery', value, 'style')}
            options={{ placeholder: '(min-width: 400px)' }}
          />
        </div>

        {/* Logical Properties */}
        <div>
          <SubsectionHeader title="Logical Properties" />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Block Start"
              value={currentStyles.marginBlockStart}
              onChange={(value) => onPropertyChange('marginBlockStart', value, 'style')}
            />
            <InputField
              label="Block End"
              value={currentStyles.marginBlockEnd}
              onChange={(value) => onPropertyChange('marginBlockEnd', value, 'style')}
            />
            <InputField
              label="Inline Start"
              value={currentStyles.marginInlineStart}
              onChange={(value) => onPropertyChange('marginInlineStart', value, 'style')}
            />
            <InputField
              label="Inline End"
              value={currentStyles.marginInlineEnd}
              onChange={(value) => onPropertyChange('marginInlineEnd', value, 'style')}
            />
          </div>
        </div>
      </PropertySection>

      {/* ACCESSIBILITY */}
      <PropertySection
        title="Accessibility & Color Schemes"
        Icon={Heart}
        sectionKey="accessibility"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        {/* Screen Reader */}
        <div>
          <SubsectionHeader title="Screen Reader" />
          <InputField
            label="Speak"
            value={currentStyles.speak}
            onChange={(value) => onPropertyChange('speak', value, 'style')}
            type="select"
            options={{
              values: ['auto', 'none', 'normal']
            }}
          />
          
          <InputField
            label="Speak Punctuation"
            value={currentStyles.speakPunctuation}
            onChange={(value) => onPropertyChange('speakPunctuation', value, 'style')}
            type="select"
            options={{
              values: ['code', 'none']
            }}
          />
          
          <InputField
            label="Speak Numeral"
            value={currentStyles.speakNumeral}
            onChange={(value) => onPropertyChange('speakNumeral', value, 'style')}
            type="select"
            options={{
              values: ['digits', 'continuous']
            }}
          />
        </div>

        {/* Color Scheme */}
        <div>
          <SubsectionHeader title="Color Schemes" />
          <InputField
            label="Color Scheme"
            value={currentStyles.colorScheme}
            onChange={(value) => onPropertyChange('colorScheme', value, 'style')}
            type="select"
            options={{
              values: ['auto', 'light', 'dark', 'light dark', 'only light']
            }}
          />
          
          <InputField
            label="Forced Color Adjust"
            value={currentStyles.forcedColorAdjust}
            onChange={(value) => onPropertyChange('forcedColorAdjust', value, 'style')}
            type="select"
            options={{
              values: ['auto', 'none']
            }}
          />
        </div>

        {/* Motion Preferences */}
        <div>
          <SubsectionHeader title="Motion Preferences" />
          <InputField
            label="Prefers Reduced Motion"
            value={currentAnimation.prefersReducedMotion}
            onChange={(value) => onPropertyChange('prefersReducedMotion', value, 'animation')}
            type="checkbox"
          />
          
          {currentAnimation.prefersReducedMotion && (
            <div className="space-y-3">
              <InputField
                label="Reduced Motion Duration"
                value={currentAnimation.reducedMotionDuration}
                onChange={(value) => onPropertyChange('reducedMotionDuration', value, 'animation')}
                options={{ placeholder: '0.01s' }}
              />
              <InputField
                label="Disable Animations"
                value={currentAnimation.disableAnimations}
                onChange={(value) => onPropertyChange('disableAnimations', value, 'animation')}
                type="checkbox"
              />
            </div>
          )}
        </div>

        {/* High Contrast */}
        <div>
          <SubsectionHeader title="High Contrast" />
          <InputField
            label="High Contrast Support"
            value={currentAnimation.highContrast}
            onChange={(value) => onPropertyChange('highContrast', value, 'animation')}
            type="checkbox"
          />
          
          {currentAnimation.highContrast && (
            <div className="space-y-3">
              <InputField
                label="High Contrast Text Color"
                value={currentStyles.highContrastTextColor}
                onChange={(value) => onPropertyChange('highContrastTextColor', value, 'style')}
                type="color"
              />
              <InputField
                label="High Contrast Background"
                value={currentStyles.highContrastBackground}
                onChange={(value) => onPropertyChange('highContrastBackground', value, 'style')}
                type="color"
              />
            </div>
          )}
        </div>
      </PropertySection>
    </>
  );
};

export default ResponsiveSection;