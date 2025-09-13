import React from 'react';
import { Palette, Box, Circle, Sparkles, Filter, Paintbrush } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader, ButtonGrid, presetValues } from '../PropertyUtils';

const StylingSection = ({ currentStyles, onPropertyChange, expandedSections, setExpandedSections }) => {
  return (
    <>
      {/* COLORS */}
      <PropertySection
        title="Colors"
        Icon={Palette}
        sectionKey="colors"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        <InputField
          label="Text Color"
          value={currentStyles.color}
          onChange={(value) => onPropertyChange('color', value, 'style')}
          type="color"
        />
        
        <InputField
          label="Background Color"
          value={currentStyles.backgroundColor}
          onChange={(value) => onPropertyChange('backgroundColor', value, 'style')}
          type="color"
        />
        
        <InputField
          label="Border Color"
          value={currentStyles.borderColor}
          onChange={(value) => onPropertyChange('borderColor', value, 'style')}
          type="color"
        />
        
        <InputField
          label="Outline Color"
          value={currentStyles.outlineColor}
          onChange={(value) => onPropertyChange('outlineColor', value, 'style')}
          type="color"
        />
        
        <InputField
          label="Accent Color"
          value={currentStyles.accentColor}
          onChange={(value) => onPropertyChange('accentColor', value, 'style')}
          type="color"
        />
        
        <InputField
          label="Caret Color"
          value={currentStyles.caretColor}
          onChange={(value) => onPropertyChange('caretColor', value, 'style')}
          type="color"
        />
        
        {/* Opacity */}
        <InputField
          label="Opacity"
          value={currentStyles.opacity}
          onChange={(value) => onPropertyChange('opacity', value, 'style')}
          type="range"
          options={{ min: 0, max: 1, step: 0.01 }}
        />
      </PropertySection>

      {/* BACKGROUND */}
      <PropertySection
        title="Background"
        Icon={Paintbrush}
        sectionKey="background"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        <InputField
          label="Background Image"
          value={currentStyles.backgroundImage}
          onChange={(value) => onPropertyChange('backgroundImage', value, 'style')}
          options={{ placeholder: 'url() or none' }}
        />
        
        <InputField
          label="Background Size"
          value={currentStyles.backgroundSize}
          onChange={(value) => onPropertyChange('backgroundSize', value, 'style')}
          type="select"
          options={{
            values: ['auto', 'cover', 'contain', '100%', '50%']
          }}
        />
        
        <InputField
          label="Background Position"
          value={currentStyles.backgroundPosition}
          onChange={(value) => onPropertyChange('backgroundPosition', value, 'style')}
          type="select"
          options={{
            values: ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right']
          }}
        />
        
        <InputField
          label="Background Repeat"
          value={currentStyles.backgroundRepeat}
          onChange={(value) => onPropertyChange('backgroundRepeat', value, 'style')}
          type="select"
          options={{
            values: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'space', 'round']
          }}
        />
        
        <InputField
          label="Background Attachment"
          value={currentStyles.backgroundAttachment}
          onChange={(value) => onPropertyChange('backgroundAttachment', value, 'style')}
          type="select"
          options={{
            values: ['scroll', 'fixed', 'local']
          }}
        />
        
        <InputField
          label="Background Origin"
          value={currentStyles.backgroundOrigin}
          onChange={(value) => onPropertyChange('backgroundOrigin', value, 'style')}
          type="select"
          options={{
            values: ['border-box', 'padding-box', 'content-box']
          }}
        />
        
        <InputField
          label="Background Clip"
          value={currentStyles.backgroundClip}
          onChange={(value) => onPropertyChange('backgroundClip', value, 'style')}
          type="select"
          options={{
            values: ['border-box', 'padding-box', 'content-box', 'text']
          }}
        />
        
        {/* Gradient Support */}
        <div>
          <SubsectionHeader title="Gradients" />
          <InputField
            label="Gradient Type"
            value={currentStyles.backgroundImage?.includes('gradient') ? 'gradient' : 'none'}
            onChange={(value) => {
              if (value === 'none') {
                onPropertyChange('backgroundImage', 'none', 'style');
              } else {
                onPropertyChange('backgroundImage', 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', 'style');
              }
            }}
            type="select"
            options={{
              values: ['none', 'linear-gradient', 'radial-gradient', 'conic-gradient']
            }}
          />
          
          {currentStyles.backgroundImage?.includes('gradient') && (
            <div className="space-y-2 mt-2">
              <InputField
                label="Gradient Direction"
                value={currentStyles.gradientDirection || '45deg'}
                onChange={(value) => {
                  const currentGradient = currentStyles.backgroundImage || '';
                  const newGradient = currentGradient.replace(/\([^,]*,/, `(${value},`);
                  onPropertyChange('backgroundImage', newGradient, 'style');
                }}
                options={{ placeholder: '45deg or to right' }}
              />
              
              <InputField
                label="Gradient Color 1"
                value={currentStyles.gradientColor1 || '#667eea'}
                onChange={(value) => {
                  onPropertyChange('gradientColor1', value, 'style');
                  const gradient = `linear-gradient(${currentStyles.gradientDirection || '45deg'}, ${value} 0%, ${currentStyles.gradientColor2 || '#764ba2'} 100%)`;
                  onPropertyChange('backgroundImage', gradient, 'style');
                }}
                type="color"
              />
              
              <InputField
                label="Gradient Color 2"
                value={currentStyles.gradientColor2 || '#764ba2'}
                onChange={(value) => {
                  onPropertyChange('gradientColor2', value, 'style');
                  const gradient = `linear-gradient(${currentStyles.gradientDirection || '45deg'}, ${currentStyles.gradientColor1 || '#667eea'} 0%, ${value} 100%)`;
                  onPropertyChange('backgroundImage', gradient, 'style');
                }}
                type="color"
              />
            </div>
          )}
        </div>
      </PropertySection>

      {/* BORDERS */}
      <PropertySection
        title="Borders"
        Icon={Box}
        sectionKey="borders"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        {/* Border Width */}
        <div>
          <SubsectionHeader title="Border Width" />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Top"
              value={currentStyles.borderTopWidth}
              onChange={(value) => onPropertyChange('borderTopWidth', value, 'style')}
            />
            <InputField
              label="Right"
              value={currentStyles.borderRightWidth}
              onChange={(value) => onPropertyChange('borderRightWidth', value, 'style')}
            />
            <InputField
              label="Bottom"
              value={currentStyles.borderBottomWidth}
              onChange={(value) => onPropertyChange('borderBottomWidth', value, 'style')}
            />
            <InputField
              label="Left"
              value={currentStyles.borderLeftWidth}
              onChange={(value) => onPropertyChange('borderLeftWidth', value, 'style')}
            />
          </div>
          <InputField
            label="All Borders"
            value={currentStyles.borderWidth}
            onChange={(value) => onPropertyChange('borderWidth', value, 'style')}
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
          />
          <InputField
            label="Right Style"
            value={currentStyles.borderRightStyle}
            onChange={(value) => onPropertyChange('borderRightStyle', value, 'style')}
            type="select"
            options={{
              values: ['none', 'solid', 'dashed', 'dotted', 'double']
            }}
          />
          <InputField
            label="Bottom Style"
            value={currentStyles.borderBottomStyle}
            onChange={(value) => onPropertyChange('borderBottomStyle', value, 'style')}
            type="select"
            options={{
              values: ['none', 'solid', 'dashed', 'dotted', 'double']
            }}
          />
          <InputField
            label="Left Style"
            value={currentStyles.borderLeftStyle}
            onChange={(value) => onPropertyChange('borderLeftStyle', value, 'style')}
            type="select"
            options={{
              values: ['none', 'solid', 'dashed', 'dotted', 'double']
            }}
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
            />
            <InputField
              label="Right Color"
              value={currentStyles.borderRightColor}
              onChange={(value) => onPropertyChange('borderRightColor', value, 'style')}
              type="color"
            />
            <InputField
              label="Bottom Color"
              value={currentStyles.borderBottomColor}
              onChange={(value) => onPropertyChange('borderBottomColor', value, 'style')}
              type="color"
            />
            <InputField
              label="Left Color"
              value={currentStyles.borderLeftColor}
              onChange={(value) => onPropertyChange('borderLeftColor', value, 'style')}
              type="color"
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
            />
            <InputField
              label="Style"
              value={currentStyles.outlineStyle}
              onChange={(value) => onPropertyChange('outlineStyle', value, 'style')}
              type="select"
              options={{
                values: ['none', 'solid', 'dashed', 'dotted', 'double']
              }}
            />
            <InputField
              label="Offset"
              value={currentStyles.outlineOffset}
              onChange={(value) => onPropertyChange('outlineOffset', value, 'style')}
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
            />
            <InputField
              label="Top Right"
              value={currentStyles.borderTopRightRadius}
              onChange={(value) => onPropertyChange('borderTopRightRadius', value, 'style')}
            />
            <InputField
              label="Bottom Left"
              value={currentStyles.borderBottomLeftRadius}
              onChange={(value) => onPropertyChange('borderBottomLeftRadius', value, 'style')}
            />
            <InputField
              label="Bottom Right"
              value={currentStyles.borderBottomRightRadius}
              onChange={(value) => onPropertyChange('borderBottomRightRadius', value, 'style')}
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
          />
        </div>
        
        {/* Drop Shadow Filter */}
        <InputField
          label="Drop Shadow (Filter)"
          value={currentStyles.filter?.includes('drop-shadow') ? 'enabled' : 'disabled'}
          onChange={(value) => {
            const currentFilter = currentStyles.filter || '';
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
      >
        <InputField
          label="Blur"
          value={currentStyles.filter?.match(/blur\(([^)]+)\)/)?.[1] || 0}
          onChange={(value) => {
            const currentFilter = (currentStyles.filter || '').replace(/blur\([^)]+\)/g, '').trim();
            const newFilter = value > 0 ? `${currentFilter} blur(${value}px)`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 50, step: 1, unit: 'px' }}
        />
        
        <InputField
          label="Brightness"
          value={currentStyles.filter?.match(/brightness\(([^)]+)\)/)?.[1] || 1}
          onChange={(value) => {
            const currentFilter = (currentStyles.filter || '').replace(/brightness\([^)]+\)/g, '').trim();
            const newFilter = value !== 1 ? `${currentFilter} brightness(${value})`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 3, step: 0.1 }}
        />
        
        <InputField
          label="Contrast"
          value={currentStyles.filter?.match(/contrast\(([^)]+)\)/)?.[1] || 1}
          onChange={(value) => {
            const currentFilter = (currentStyles.filter || '').replace(/contrast\([^)]+\)/g, '').trim();
            const newFilter = value !== 1 ? `${currentFilter} contrast(${value})`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 3, step: 0.1 }}
        />
        
        <InputField
          label="Saturate"
          value={currentStyles.filter?.match(/saturate\(([^)]+)\)/)?.[1] || 1}
          onChange={(value) => {
            const currentFilter = (currentStyles.filter || '').replace(/saturate\([^)]+\)/g, '').trim();
            const newFilter = value !== 1 ? `${currentFilter} saturate(${value})`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 3, step: 0.1 }}
        />
        
        <InputField
          label="Hue Rotate"
          value={currentStyles.filter?.match(/hue-rotate\(([^)]+)\)/)?.[1] || 0}
          onChange={(value) => {
            const currentFilter = (currentStyles.filter || '').replace(/hue-rotate\([^)]+\)/g, '').trim();
            const newFilter = value !== 0 ? `${currentFilter} hue-rotate(${value}deg)`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 360, step: 1, unit: 'deg' }}
        />
        
        <InputField
          label="Invert"
          value={currentStyles.filter?.match(/invert\(([^)]+)\)/)?.[1] || 0}
          onChange={(value) => {
            const currentFilter = (currentStyles.filter || '').replace(/invert\([^)]+\)/g, '').trim();
            const newFilter = value > 0 ? `${currentFilter} invert(${value})`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 1, step: 0.1 }}
        />
        
        <InputField
          label="Sepia"
          value={currentStyles.filter?.match(/sepia\(([^)]+)\)/)?.[1] || 0}
          onChange={(value) => {
            const currentFilter = (currentStyles.filter || '').replace(/sepia\([^)]+\)/g, '').trim();
            const newFilter = value > 0 ? `${currentFilter} sepia(${value})`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 1, step: 0.1 }}
        />
        
        <InputField
          label="Grayscale"
          value={currentStyles.filter?.match(/grayscale\(([^)]+)\)/)?.[1] || 0}
          onChange={(value) => {
            const currentFilter = (currentStyles.filter || '').replace(/grayscale\([^)]+\)/g, '').trim();
            const newFilter = value > 0 ? `${currentFilter} grayscale(${value})`.trim() : currentFilter;
            onPropertyChange('filter', newFilter || 'none', 'style');
          }}
          type="range"
          options={{ min: 0, max: 1, step: 0.1 }}
        />
        
        {/* Backdrop Filters */}
        <div>
          <SubsectionHeader title="Backdrop Filters" />
          <InputField
            label="Backdrop Blur"
            value={currentStyles.backdropFilter?.match(/blur\(([^)]+)\)/)?.[1] || 0}
            onChange={(value) => {
              const currentFilter = (currentStyles.backdropFilter || '').replace(/blur\([^)]+\)/g, '').trim();
              const newFilter = value > 0 ? `${currentFilter} blur(${value}px)`.trim() : currentFilter;
              onPropertyChange('backdropFilter', newFilter || 'none', 'style');
            }}
            type="range"
            options={{ min: 0, max: 50, step: 1, unit: 'px' }}
          />
          
          <InputField
            label="Backdrop Brightness"
            value={currentStyles.backdropFilter?.match(/brightness\(([^)]+)\)/)?.[1] || 1}
            onChange={(value) => {
              const currentFilter = (currentStyles.backdropFilter || '').replace(/brightness\([^)]+\)/g, '').trim();
              const newFilter = value !== 1 ? `${currentFilter} brightness(${value})`.trim() : currentFilter;
              onPropertyChange('backdropFilter', newFilter || 'none', 'style');
            }}
            type="range"
            options={{ min: 0, max: 3, step: 0.1 }}
          />
        </div>
      </PropertySection>
    </>
  );
};

export default StylingSection;