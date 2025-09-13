import React from 'react';
import { Move, Layout, Columns, Grid3X3, Maximize, Square } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader } from '../PropertyUtils';

const LayoutSection = ({ currentStyles, onPropertyChange, expandedSections, setExpandedSections, selectedComponentData }) => {
  return (
    <>
      {/* LAYOUT & POSITIONING */}
      <PropertySection
        title="Layout & Positioning"
        Icon={Move}
        sectionKey="layout"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        {/* Position */}
        <div>
          <SubsectionHeader title="Position" />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="X"
              value={selectedComponentData.position?.x || 0}
              onChange={(value) => onPropertyChange('position', { ...selectedComponentData.position, x: parseFloat(value) || 0 })}
              type="number"
              options={{ step: 1 }}
            />
            <InputField
              label="Y"
              value={selectedComponentData.position?.y || 0}
              onChange={(value) => onPropertyChange('position', { ...selectedComponentData.position, y: parseFloat(value) || 0 })}
              type="number"
              options={{ step: 1 }}
            />
          </div>
        </div>
        
        {/* Position Type */}
        <InputField
          label="Position Type"
          value={currentStyles.position}
          onChange={(value) => onPropertyChange('position', value, 'style')}
          type="select"
          options={{
            values: ['static', 'relative', 'absolute', 'fixed', 'sticky']
          }}
        />

        {/* Top, Right, Bottom, Left */}
        <div>
          <SubsectionHeader title="Position Values" />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Top"
              value={currentStyles.top}
              onChange={(value) => onPropertyChange('top', value, 'style')}
              options={{ placeholder: 'auto' }}
            />
            <InputField
              label="Right"
              value={currentStyles.right}
              onChange={(value) => onPropertyChange('right', value, 'style')}
              options={{ placeholder: 'auto' }}
            />
            <InputField
              label="Bottom"
              value={currentStyles.bottom}
              onChange={(value) => onPropertyChange('bottom', value, 'style')}
              options={{ placeholder: 'auto' }}
            />
            <InputField
              label="Left"
              value={currentStyles.left}
              onChange={(value) => onPropertyChange('left', value, 'style')}
              options={{ placeholder: 'auto' }}
            />
          </div>
        </div>

        {/* Z-Index */}
        <InputField
          label="Z-Index"
          value={currentStyles.zIndex}
          onChange={(value) => onPropertyChange('zIndex', value, 'style')}
          type="number"
        />
      </PropertySection>

      {/* DISPLAY & FLOW */}
      <PropertySection
        title="Display & Flow"
        Icon={Layout}
        sectionKey="display"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        <InputField
          label="Display"
          value={currentStyles.display}
          onChange={(value) => onPropertyChange('display', value, 'style')}
          type="select"
          options={{
            values: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'table', 'table-cell', 'table-row', 'none', 'contents']
          }}
        />
        
        <InputField
          label="Visibility"
          value={currentStyles.visibility}
          onChange={(value) => onPropertyChange('visibility', value, 'style')}
          type="select"
          options={{
            values: ['visible', 'hidden', 'collapse']
          }}
        />
        
        <InputField
          label="Overflow"
          value={currentStyles.overflow}
          onChange={(value) => onPropertyChange('overflow', value, 'style')}
          type="select"
          options={{
            values: ['visible', 'hidden', 'scroll', 'auto', 'clip']
          }}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Overflow X"
            value={currentStyles.overflowX}
            onChange={(value) => onPropertyChange('overflowX', value, 'style')}
            type="select"
            options={{
              values: ['visible', 'hidden', 'scroll', 'auto', 'clip']
            }}
          />
          <InputField
            label="Overflow Y"
            value={currentStyles.overflowY}
            onChange={(value) => onPropertyChange('overflowY', value, 'style')}
            type="select"
            options={{
              values: ['visible', 'hidden', 'scroll', 'auto', 'clip']
            }}
          />
        </div>
        
        <InputField
          label="Float"
          value={currentStyles.float}
          onChange={(value) => onPropertyChange('float', value, 'style')}
          type="select"
          options={{
            values: ['none', 'left', 'right']
          }}
        />
        
        <InputField
          label="Clear"
          value={currentStyles.clear}
          onChange={(value) => onPropertyChange('clear', value, 'style')}
          type="select"
          options={{
            values: ['none', 'left', 'right', 'both']
          }}
        />
      </PropertySection>

      {/* FLEXBOX */}
      <PropertySection
        title="Flexbox"
        Icon={Columns}
        sectionKey="flexbox"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        <InputField
          label="Flex Direction"
          value={currentStyles.flexDirection}
          onChange={(value) => onPropertyChange('flexDirection', value, 'style')}
          type="select"
          options={{
            values: ['row', 'row-reverse', 'column', 'column-reverse']
          }}
        />
        
        <InputField
          label="Flex Wrap"
          value={currentStyles.flexWrap}
          onChange={(value) => onPropertyChange('flexWrap', value, 'style')}
          type="select"
          options={{
            values: ['nowrap', 'wrap', 'wrap-reverse']
          }}
        />
        
        <InputField
          label="Justify Content"
          value={currentStyles.justifyContent}
          onChange={(value) => onPropertyChange('justifyContent', value, 'style')}
          type="select"
          options={{
            values: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']
          }}
        />
        
        <InputField
          label="Align Items"
          value={currentStyles.alignItems}
          onChange={(value) => onPropertyChange('alignItems', value, 'style')}
          type="select"
          options={{
            values: ['stretch', 'flex-start', 'flex-end', 'center', 'baseline']
          }}
        />
        
        <InputField
          label="Align Content"
          value={currentStyles.alignContent}
          onChange={(value) => onPropertyChange('alignContent', value, 'style')}
          type="select"
          options={{
            values: ['stretch', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around']
          }}
        />
        
        <div className="grid grid-cols-3 gap-3">
          <InputField
            label="Flex Grow"
            value={currentStyles.flexGrow}
            onChange={(value) => onPropertyChange('flexGrow', value, 'style')}
            type="number"
            options={{ min: 0, step: 1 }}
          />
          <InputField
            label="Flex Shrink"
            value={currentStyles.flexShrink}
            onChange={(value) => onPropertyChange('flexShrink', value, 'style')}
            type="number"
            options={{ min: 0, step: 1 }}
          />
          <InputField
            label="Flex Basis"
            value={currentStyles.flexBasis}
            onChange={(value) => onPropertyChange('flexBasis', value, 'style')}
            options={{ placeholder: 'auto' }}
          />
        </div>
        
        <InputField
          label="Align Self"
          value={currentStyles.alignSelf}
          onChange={(value) => onPropertyChange('alignSelf', value, 'style')}
          type="select"
          options={{
            values: ['auto', 'stretch', 'flex-start', 'flex-end', 'center', 'baseline']
          }}
        />
        
        <InputField
          label="Gap"
          value={currentStyles.gap}
          onChange={(value) => onPropertyChange('gap', value, 'style')}
          options={{ placeholder: '0px' }}
        />
      </PropertySection>

      {/* GRID */}
      <PropertySection
        title="Grid"
        Icon={Grid3X3}
        sectionKey="grid"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        <InputField
          label="Grid Template Columns"
          value={currentStyles.gridTemplateColumns}
          onChange={(value) => onPropertyChange('gridTemplateColumns', value, 'style')}
          options={{ placeholder: 'none' }}
        />
        <InputField
          label="Grid Template Rows"
          value={currentStyles.gridTemplateRows}
          onChange={(value) => onPropertyChange('gridTemplateRows', value, 'style')}
          options={{ placeholder: 'none' }}
        />
        <InputField
          label="Grid Template Areas"
          value={currentStyles.gridTemplateAreas}
          onChange={(value) => onPropertyChange('gridTemplateAreas', value, 'style')}
          type="textarea"
        />
        
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Grid Column Gap"
            value={currentStyles.columnGap}
            onChange={(value) => onPropertyChange('columnGap', value, 'style')}
          />
          <InputField
            label="Grid Row Gap"
            value={currentStyles.rowGap}
            onChange={(value) => onPropertyChange('rowGap', value, 'style')}
          />
        </div>
        
        <InputField
          label="Grid Auto Flow"
          value={currentStyles.gridAutoFlow}
          onChange={(value) => onPropertyChange('gridAutoFlow', value, 'style')}
          type="select"
          options={{
            values: ['row', 'column', 'row dense', 'column dense']
          }}
        />
        
        <InputField
          label="Grid Auto Columns"
          value={currentStyles.gridAutoColumns}
          onChange={(value) => onPropertyChange('gridAutoColumns', value, 'style')}
        />
        <InputField
          label="Grid Auto Rows"
          value={currentStyles.gridAutoRows}
          onChange={(value) => onPropertyChange('gridAutoRows', value, 'style')}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Grid Column"
            value={currentStyles.gridColumn}
            onChange={(value) => onPropertyChange('gridColumn', value, 'style')}
          />
          <InputField
            label="Grid Row"
            value={currentStyles.gridRow}
            onChange={(value) => onPropertyChange('gridRow', value, 'style')}
          />
        </div>
        
        <InputField
          label="Grid Area"
          value={currentStyles.gridArea}
          onChange={(value) => onPropertyChange('gridArea', value, 'style')}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Justify Self"
            value={currentStyles.justifySelf}
            onChange={(value) => onPropertyChange('justifySelf', value, 'style')}
            type="select"
            options={{
              values: ['auto', 'start', 'end', 'center', 'stretch']
            }}
          />
          <InputField
            label="Align Self"
            value={currentStyles.alignSelf}
            onChange={(value) => onPropertyChange('alignSelf', value, 'style')}
            type="select"
            options={{
              values: ['auto', 'start', 'end', 'center', 'stretch', 'baseline']
            }}
          />
        </div>
      </PropertySection>

      {/* SIZING */}
      <PropertySection
        title="Sizing"
        Icon={Maximize}
        sectionKey="sizing"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Width"
            value={currentStyles.width}
            onChange={(value) => onPropertyChange('width', value, 'style')}
            options={{ placeholder: 'auto' }}
          />
          <InputField
            label="Height"
            value={currentStyles.height}
            onChange={(value) => onPropertyChange('height', value, 'style')}
            options={{ placeholder: 'auto' }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Min Width"
            value={currentStyles.minWidth}
            onChange={(value) => onPropertyChange('minWidth', value, 'style')}
          />
          <InputField
            label="Min Height"
            value={currentStyles.minHeight}
            onChange={(value) => onPropertyChange('minHeight', value, 'style')}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Max Width"
            value={currentStyles.maxWidth}
            onChange={(value) => onPropertyChange('maxWidth', value, 'style')}
          />
          <InputField
            label="Max Height"
            value={currentStyles.maxHeight}
            onChange={(value) => onPropertyChange('maxHeight', value, 'style')}
          />
        </div>
        
        <InputField
          label="Box Sizing"
          value={currentStyles.boxSizing}
          onChange={(value) => onPropertyChange('boxSizing', value, 'style')}
          type="select"
          options={{
            values: ['content-box', 'border-box']
          }}
        />
        
        <InputField
          label="Aspect Ratio"
          value={currentStyles.aspectRatio}
          onChange={(value) => onPropertyChange('aspectRatio', value, 'style')}
          options={{ placeholder: 'auto or 16/9' }}
        />
      </PropertySection>

      {/* SPACING */}
      <PropertySection
        title="Spacing"
        Icon={Square}
        sectionKey="spacing"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        {/* Margin */}
        <div>
          <SubsectionHeader title="Margin" />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Margin Top"
              value={currentStyles.marginTop}
              onChange={(value) => onPropertyChange('marginTop', value, 'style')}
            />
            <InputField
              label="Margin Right"
              value={currentStyles.marginRight}
              onChange={(value) => onPropertyChange('marginRight', value, 'style')}
            />
            <InputField
              label="Margin Bottom"
              value={currentStyles.marginBottom}
              onChange={(value) => onPropertyChange('marginBottom', value, 'style')}
            />
            <InputField
              label="Margin Left"
              value={currentStyles.marginLeft}
              onChange={(value) => onPropertyChange('marginLeft', value, 'style')}
            />
          </div>
          <InputField
            label="Margin (All)"
            value={currentStyles.margin}
            onChange={(value) => onPropertyChange('margin', value, 'style')}
          />
        </div>

        {/* Padding */}
        <div>
          <SubsectionHeader title="Padding" />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Padding Top"
              value={currentStyles.paddingTop}
              onChange={(value) => onPropertyChange('paddingTop', value, 'style')}
            />
            <InputField
              label="Padding Right"
              value={currentStyles.paddingRight}
              onChange={(value) => onPropertyChange('paddingRight', value, 'style')}
            />
            <InputField
              label="Padding Bottom"
              value={currentStyles.paddingBottom}
              onChange={(value) => onPropertyChange('paddingBottom', value, 'style')}
            />
            <InputField
              label="Padding Left"
              value={currentStyles.paddingLeft}
              onChange={(value) => onPropertyChange('paddingLeft', value, 'style')}
            />
          </div>
          <InputField
            label="Padding (All)"
            value={currentStyles.padding}
            onChange={(value) => onPropertyChange('padding', value, 'style')}
          />
        </div>
      </PropertySection>
    </>
  );
};

export default LayoutSection;