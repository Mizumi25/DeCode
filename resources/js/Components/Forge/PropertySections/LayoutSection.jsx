import React, { useState } from 'react';
import { Move, Layout, Columns, Grid3X3, Maximize, Square, MousePointer, Layers, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader } from '../PropertyUtils';

const LayoutSection = ({ 
  currentStyles, 
  onPropertyChange, 
  expandedSections, 
  setExpandedSections, 
  selectedComponentData,
  onLivePreview,
  searchTerm = ''
}) => {
  const [livePreview, setLivePreview] = useState({});

  const VisualButtonGroup = ({ label, value, onChange, options, icons = {} }) => (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>{label}</label>
      <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
        {options.map((option) => {
          const Icon = icons[option];
          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`flex-1 px-3 py-2 text-xs rounded-md transition-all`}
              style={value === option ? {
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                boxShadow: 'var(--shadow-sm)'
              } : {
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)'
              }}
            >
              {Icon ? (
                <div className="flex items-center justify-center gap-1">
                  <Icon className="w-3 h-3" />
                  <span>{option}</span>
                </div>
              ) : (
                option
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const handleLiveChange = (property, value, type = 'style') => {
    setLivePreview(prev => ({
      ...prev,
      [property]: value
    }));
    
    const timeoutId = setTimeout(() => {
      onPropertyChange(property, value, type);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const SpacingControl = ({ label, property, value, onChange }) => (
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>{label}</label>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>All</div>
          <input
            type="number"
            className="w-full px-2 py-1 text-xs border rounded"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
            placeholder="0"
            value={value || ''}
            onChange={(e) => {
              const val = e.target.value ? `${e.target.value}px` : '';
              onChange(property, val);
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>T</div>
            <input
              type="number"
              className="w-full px-1 py-1 text-xs border rounded"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="0"
              onChange={(e) => {
                const val = e.target.value ? `${e.target.value}px` : '';
                onChange(`${property}Top`, val);
              }}
            />
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>R</div>
            <input
              type="number"
              className="w-full px-1 py-1 text-xs border rounded"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="0"
              onChange={(e) => {
                const val = e.target.value ? `${e.target.value}px` : '';
                onChange(`${property}Right`, val);
              }}
            />
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>B</div>
            <input
              type="number"
              className="w-full px-1 py-1 text-xs border rounded"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="0"
              onChange={(e) => {
                const val = e.target.value ? `${e.target.value}px` : '';
                onChange(`${property}Bottom`, val);
              }}
            />
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>L</div>
            <input
              type="number"
              className="w-full px-1 py-1 text-xs border rounded"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="0"
              onChange={(e) => {
                const val = e.target.value ? `${e.target.value}px` : '';
                onChange(`${property}Left`, val);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PropertySection
        title="Position & Display"
        Icon={MousePointer}
        sectionKey="position-display"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        defaultExpanded={true}
        searchTerm={searchTerm}
      >
        <div className="rounded-lg border-2 p-4" style={{ 
          background: 'linear-gradient(135deg, var(--color-primary-soft) 0%, transparent 100%)',
          borderColor: 'var(--color-border)'
        }}>
          <SubsectionHeader title="Convert Layout Mode" />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onPropertyChange('display', 'flex', 'style');
                onPropertyChange('flexDirection', 'row', 'style');
                onPropertyChange('gap', '16px', 'style');
              }}
              className="px-4 py-3 rounded-lg border-2 transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              <Columns className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-semibold">Flexbox</div>
            </button>
            
            <button
              onClick={() => {
                onPropertyChange('display', 'grid', 'style');
                onPropertyChange('gridTemplateColumns', 'repeat(3, 1fr)', 'style');
                onPropertyChange('gap', '16px', 'style');
              }}
              className="px-4 py-3 rounded-lg border-2 transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              <Grid3X3 className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-semibold">Grid</div>
            </button>
          </div>
        </div>

        <VisualButtonGroup
          label="Position"
          value={currentStyles.position || 'static'}
          onChange={(value) => onPropertyChange('position', value, 'style')}
          options={['static', 'relative', 'absolute', 'fixed', 'sticky']}
        />

        <VisualButtonGroup
          label="Display"
          value={currentStyles.display || 'block'}
          onChange={(value) => onPropertyChange('display', value, 'style')}
          options={['block', 'inline-block', 'flex', 'grid', 'none']}
        />

        {currentStyles.position && currentStyles.position !== 'static' && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <SubsectionHeader title="Position Values" />
            <div className="grid grid-cols-2 gap-2">
              <InputField
                label="Top"
                value={currentStyles.top}
                onChange={(value) => handleLiveChange('top', value)}
                options={{ placeholder: 'auto' }}
                searchTerm={searchTerm}
              />
              <InputField
                label="Right"
                value={currentStyles.right}
                onChange={(value) => handleLiveChange('right', value)}
                options={{ placeholder: 'auto' }}
                searchTerm={searchTerm}
              />
              <InputField
                label="Bottom"
                value={currentStyles.bottom}
                onChange={(value) => handleLiveChange('bottom', value)}
                options={{ placeholder: 'auto' }}
                searchTerm={searchTerm}
              />
              <InputField
                label="Left"
                value={currentStyles.left}
                onChange={(value) => handleLiveChange('left', value)}
                options={{ placeholder: 'auto' }}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        )}

        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <SubsectionHeader title="Canvas Position" />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="X"
              value={selectedComponentData.position?.x || 0}
              onChange={(value) => onPropertyChange('position', { 
                ...selectedComponentData.position, 
                x: parseFloat(value) || 0 
              })}
              type="number"
              options={{ step: 1 }}
              searchTerm={searchTerm}
            />
            <InputField
              label="Y"
              value={selectedComponentData.position?.y || 0}
              onChange={(value) => onPropertyChange('position', { 
                ...selectedComponentData.position, 
                y: parseFloat(value) || 0 
              })}
              type="number"
              options={{ step: 1 }}
              searchTerm={searchTerm}
            />
          </div>
        </div>

        <InputField
          label="Layer (Z-Index)"
          value={currentStyles.zIndex}
          onChange={(value) => onPropertyChange('zIndex', value, 'style')}
          type="number"
          options={{ min: -1000, max: 1000 }}
          searchTerm={searchTerm}
        />
      </PropertySection>

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
            label="Direction"
            value={currentStyles.flexDirection || 'row'}
            onChange={(value) => onPropertyChange('flexDirection', value, 'style')}
            options={['row', 'column', 'row-reverse', 'column-reverse']}
          />

          <VisualButtonGroup
            label="Justify (Main Axis)"
            value={currentStyles.justifyContent || 'flex-start'}
            onChange={(value) => onPropertyChange('justifyContent', value, 'style')}
            options={['flex-start', 'center', 'flex-end', 'space-between', 'space-around']}
            icons={{
              'flex-start': AlignLeft,
              'center': AlignCenter,
              'flex-end': AlignRight,
              'space-between': AlignJustify
            }}
          />

          <VisualButtonGroup
            label="Align (Cross Axis)"
            value={currentStyles.alignItems || 'stretch'}
            onChange={(value) => onPropertyChange('alignItems', value, 'style')}
            options={['stretch', 'flex-start', 'center', 'flex-end', 'baseline']}
          />

          <VisualButtonGroup
            label="Wrap"
            value={currentStyles.flexWrap || 'nowrap'}
            onChange={(value) => onPropertyChange('flexWrap', value, 'style')}
            options={['nowrap', 'wrap', 'wrap-reverse']}
          />

          <InputField
            label="Gap"
            value={currentStyles.gap}
            onChange={(value) => handleLiveChange('gap', value)}
            options={{ placeholder: '0px' }}
            searchTerm={searchTerm}
          />

          <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <SubsectionHeader title="Flex Item Properties" />
            <div className="grid grid-cols-3 gap-2">
              <InputField
                label="Grow"
                value={currentStyles.flexGrow}
                onChange={(value) => onPropertyChange('flexGrow', value, 'style')}
                type="number"
                options={{ min: 0, step: 1 }}
                searchTerm={searchTerm}
              />
              <InputField
                label="Shrink"
                value={currentStyles.flexShrink}
                onChange={(value) => onPropertyChange('flexShrink', value, 'style')}
                type="number"
                options={{ min: 0, step: 1 }}
                searchTerm={searchTerm}
              />
              <InputField
                label="Basis"
                value={currentStyles.flexBasis}
                onChange={(value) => onPropertyChange('flexBasis', value, 'style')}
                options={{ placeholder: 'auto' }}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        </PropertySection>
      )}

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
            <InputField
              label="Grid Columns"
              value={currentStyles.gridTemplateColumns}
              onChange={(value) => handleLiveChange('gridTemplateColumns', value)}
              options={{ placeholder: 'repeat(3, 1fr)' }}
              searchTerm={searchTerm}
            />
            <InputField
              label="Grid Rows"
              value={currentStyles.gridTemplateRows}
              onChange={(value) => handleLiveChange('gridTemplateRows', value)}
              options={{ placeholder: 'repeat(2, 1fr)' }}
              searchTerm={searchTerm}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Column Gap"
              value={currentStyles.columnGap}
              onChange={(value) => handleLiveChange('columnGap', value)}
              options={{ placeholder: '10px' }}
              searchTerm={searchTerm}
            />
            <InputField
              label="Row Gap"
              value={currentStyles.rowGap}
              onChange={(value) => handleLiveChange('rowGap', value)}
              options={{ placeholder: '10px' }}
              searchTerm={searchTerm}
            />
          </div>

          <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <SubsectionHeader title="Grid Item Position" />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Grid Column"
                value={currentStyles.gridColumn}
                onChange={(value) => onPropertyChange('gridColumn', value, 'style')}
                options={{ placeholder: '1 / 3' }}
                searchTerm={searchTerm}
              />
              <InputField
                label="Grid Row"
                value={currentStyles.gridRow}
                onChange={(value) => onPropertyChange('gridRow', value, 'style')}
                options={{ placeholder: '1 / 2' }}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        </PropertySection>
      )}

      <PropertySection
        title="Size & Dimensions"
        Icon={Maximize}
        sectionKey="sizing"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        defaultExpanded={false}
        searchTerm={searchTerm}
      >
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Width"
            value={currentStyles.width}
            onChange={(value) => handleLiveChange('width', value)}
            options={{ placeholder: 'auto' }}
            searchTerm={searchTerm}
          />
          <InputField
            label="Height"
            value={currentStyles.height}
            onChange={(value) => handleLiveChange('height', value)}
            options={{ placeholder: 'auto' }}
            searchTerm={searchTerm}
          />
        </div>
        
        <div>
          <SubsectionHeader title="Constraints" />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Min Width"
              value={currentStyles.minWidth}
              onChange={(value) => handleLiveChange('minWidth', value)}
              options={{ placeholder: '0' }}
              searchTerm={searchTerm}
            />
            <InputField
              label="Max Width"
              value={currentStyles.maxWidth}
              onChange={(value) => handleLiveChange('maxWidth', value)}
              options={{ placeholder: 'none' }}
              searchTerm={searchTerm}
            />
            <InputField
              label="Min Height"
              value={currentStyles.minHeight}
              onChange={(value) => handleLiveChange('minHeight', value)}
              options={{ placeholder: '0' }}
              searchTerm={searchTerm}
            />
            <InputField
              label="Max Height"
              value={currentStyles.maxHeight}
              onChange={(value) => handleLiveChange('maxHeight', value)}
              options={{ placeholder: 'none' }}
              searchTerm={searchTerm}
            />
          </div>
        </div>

        <VisualButtonGroup
          label="Box Model"
          value={currentStyles.boxSizing || 'content-box'}
          onChange={(value) => onPropertyChange('boxSizing', value, 'style')}
          options={['content-box', 'border-box']}
        />
      </PropertySection>

      <PropertySection
        title="Spacing"
        Icon={Square}
        sectionKey="spacing"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        <SpacingControl
          label="Margin"
          property="margin"
          value={currentStyles.margin}
          onChange={onPropertyChange}
        />

        <SpacingControl
          label="Padding"
          property="padding"
          value={currentStyles.padding}
          onChange={onPropertyChange}
        />
      </PropertySection>

      <PropertySection
        title="Overflow & Behavior"
        Icon={Layers}
        sectionKey="overflow"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        <VisualButtonGroup
          label="Overflow"
          value={currentStyles.overflow || 'visible'}
          onChange={(value) => onPropertyChange('overflow', value, 'style')}
          options={['visible', 'hidden', 'scroll', 'auto']}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <VisualButtonGroup
            label="Overflow X"
            value={currentStyles.overflowX || 'visible'}
            onChange={(value) => onPropertyChange('overflowX', value, 'style')}
            options={['visible', 'hidden', 'scroll', 'auto']}
          />
          <VisualButtonGroup
            label="Overflow Y"
            value={currentStyles.overflowY || 'visible'}
            onChange={(value) => onPropertyChange('overflowY', value, 'style')}
            options={['visible', 'hidden', 'scroll', 'auto']}
          />
        </div>
      </PropertySection>

      <PropertySection
        title="Layout Presets"
        Icon={Layout}
        sectionKey="presets"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        searchTerm={searchTerm}
      >
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onPropertyChange('display', 'flex', 'style');
              onPropertyChange('justifyContent', 'center', 'style');
              onPropertyChange('alignItems', 'center', 'style');
            }}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)'
            }}
          >
            Center Content
          </button>
          
          <button
            onClick={() => {
              onPropertyChange('display', 'flex', 'style');
              onPropertyChange('justifyContent', 'space-between', 'style');
              onPropertyChange('alignItems', 'center', 'style');
            }}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)'
            }}
          >
            Space Between
          </button>
          
          <button
            onClick={() => {
              onPropertyChange('display', 'grid', 'style');
              onPropertyChange('gridTemplateColumns', 'repeat(auto-fit, minmax(200px, 1fr))', 'style');
              onPropertyChange('gap', '20px', 'style');
            }}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)'
            }}
          >
            Auto Grid
          </button>
          
          <button
            onClick={() => {
              onPropertyChange('display', 'flex', 'style');
              onPropertyChange('flexDirection', 'column', 'style');
              onPropertyChange('gap', '16px', 'style');
            }}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)'
            }}
          >
            Stack Vertical
          </button>
        </div>
      </PropertySection>
    </>
  );
};

export default LayoutSection;