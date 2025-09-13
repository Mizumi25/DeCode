import React from 'react';
import { Code } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader, ButtonGrid } from '../PropertyUtils';

const CustomSection = ({ currentStyles, currentAnimation, onPropertyChange, expandedSections, setExpandedSections }) => {
  return (
    <PropertySection
      title="Custom CSS & Variables"
      Icon={Code}
      sectionKey="custom"
      expandedSections={expandedSections}
      setExpandedSections={setExpandedSections}
    >
      {/* CSS Variables */}
      <div>
        <SubsectionHeader title="CSS Variables" />
        <InputField
          label="Variable Name"
          value={currentStyles.variableName}
          onChange={(value) => onPropertyChange('variableName', value, 'style')}
          options={{ placeholder: '--my-variable' }}
        />
        <InputField
          label="Variable Value"
          value={currentStyles.variableValue}
          onChange={(value) => onPropertyChange('variableValue', value, 'style')}
          options={{ placeholder: '10px or #fff' }}
        />
        
        <button
          onClick={() => {
            const varName = currentStyles.variableName || '--custom-var';
            const varValue = currentStyles.variableValue || '10px';
            const customCSS = currentStyles.customCSS || '';
            const newCustomCSS = `${customCSS}\n${varName}: ${varValue};`;
            onPropertyChange('customCSS', newCustomCSS, 'style');
          }}
          className="w-full px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors"
        >
          Add CSS Variable
        </button>
      </div>

      {/* CSS Functions */}
      <div>
        <SubsectionHeader title="CSS Functions" />
        <InputField
          label="Calc Expression"
          value={currentStyles.calcExpression}
          onChange={(value) => onPropertyChange('calcExpression', value, 'style')}
          options={{ placeholder: 'calc(100% - 20px)' }}
        />
        <InputField
          label="Clamp Expression"
          value={currentStyles.clampExpression}
          onChange={(value) => onPropertyChange('clampExpression', value, 'style')}
          options={{ placeholder: 'clamp(1rem, 2.5vw, 2rem)' }}
        />
        <InputField
          label="Min Expression"
          value={currentStyles.minExpression}
          onChange={(value) => onPropertyChange('minExpression', value, 'style')}
          options={{ placeholder: 'min(50%, 300px)' }}
        />
        <InputField
          label="Max Expression"
          value={currentStyles.maxExpression}
          onChange={(value) => onPropertyChange('maxExpression', value, 'style')}
          options={{ placeholder: 'max(50%, 300px)' }}
        />
      </div>

      {/* Custom Rules */}
      <div>
        <SubsectionHeader title="Custom CSS Rules" />
        <InputField
          label="Custom CSS"
          value={currentStyles.customCSS}
          onChange={(value) => onPropertyChange('customCSS', value, 'style')}
          type="textarea"
        />
        
        <InputField
          label="CSS Selector"
          value={currentStyles.customSelector}
          onChange={(value) => onPropertyChange('customSelector', value, 'style')}
          options={{ placeholder: '&:hover, &::before' }}
        />
        
        <InputField
          label="CSS Media Query"
          value={currentStyles.customMediaQuery}
          onChange={(value) => onPropertyChange('customMediaQuery', value, 'style')}
          options={{ placeholder: '@media (max-width: 768px)' }}
        />
      </div>

      {/* Import/Export */}
      <div>
        <SubsectionHeader title="Import/Export" />
        <ButtonGrid
          columns={2}
          buttons={[
            {
              label: 'Copy Styles',
              onClick: () => {
                const styles = JSON.stringify(currentStyles, null, 2);
                navigator.clipboard.writeText(styles);
              },
              className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            },
            {
              label: 'Copy Animations',
              onClick: () => {
                const animations = JSON.stringify(currentAnimation, null, 2);
                navigator.clipboard.writeText(animations);
              },
              className: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            }
          ]}
        />
        
        <InputField
          label="Import Styles JSON"
          value=""
          onChange={(value) => {
            try {
              const importedStyles = JSON.parse(value);
              onPropertyChange('importStyles', { ...currentStyles, ...importedStyles }, 'style');
            } catch (e) {
              console.error('Invalid JSON');
            }
          }}
          type="textarea"
        />
      </div>

      {/* Legacy CSS Properties */}
      <div>
        <SubsectionHeader title="Legacy & Browser Compatibility" />
        
        {/* Legacy Table Properties */}
        <div>
          <h6 className="text-xs font-medium mb-2" style={{ color: 'var(--color-text)' }}>Table Layout (Legacy)</h6>
          <InputField
            label="Table Layout"
            value={currentStyles.tableLayout}
            onChange={(value) => onPropertyChange('tableLayout', value, 'style')}
            type="select"
            options={{
              values: ['auto', 'fixed']
            }}
          />
          <InputField
            label="Border Collapse"
            value={currentStyles.borderCollapse}
            onChange={(value) => onPropertyChange('borderCollapse', value, 'style')}
            type="select"
            options={{
              values: ['separate', 'collapse']
            }}
          />
          <InputField
            label="Border Spacing"
            value={currentStyles.borderSpacing}
            onChange={(value) => onPropertyChange('borderSpacing', value, 'style')}
          />
          <InputField
            label="Caption Side"
            value={currentStyles.captionSide}
            onChange={(value) => onPropertyChange('captionSide', value, 'style')}
            type="select"
            options={{
              values: ['top', 'bottom', 'left', 'right']
            }}
          />
          <InputField
            label="Empty Cells"
            value={currentStyles.emptyCells}
            onChange={(value) => onPropertyChange('emptyCells', value, 'style')}
            type="select"
            options={{
              values: ['show', 'hide']
            }}
          />
        </div>

        {/* Legacy Printing */}
        <div>
          <h6 className="text-xs font-medium mb-2" style={{ color: 'var(--color-text)' }}>Print Properties</h6>
          <InputField
            label="Page Break Before"
            value={currentStyles.pageBreakBefore}
            onChange={(value) => onPropertyChange('pageBreakBefore', value, 'style')}
            type="select"
            options={{
              values: ['auto', 'always', 'avoid', 'left', 'right']
            }}
          />
          <InputField
            label="Page Break After"
            value={currentStyles.pageBreakAfter}
            onChange={(value) => onPropertyChange('pageBreakAfter', value, 'style')}
            type="select"
            options={{
              values: ['auto', 'always', 'avoid', 'left', 'right']
            }}
          />
          <InputField
            label="Page Break Inside"
            value={currentStyles.pageBreakInside}
            onChange={(value) => onPropertyChange('pageBreakInside', value, 'style')}
            type="select"
            options={{
              values: ['auto', 'avoid']
            }}
          />
          <InputField
            label="Orphans"
            value={currentStyles.orphans}
            onChange={(value) => onPropertyChange('orphans', value, 'style')}
            type="number"
            options={{ min: 1 }}
          />
          <InputField
            label="Widows"
            value={currentStyles.widows}
            onChange={(value) => onPropertyChange('widows', value, 'style')}
            type="number"
            options={{ min: 1 }}
          />
        </div>

        {/* Legacy Webkit/Moz Properties */}
        <div>
          <h6 className="text-xs font-medium mb-2" style={{ color: 'var(--color-text)' }}>Browser Prefixes</h6>
          <InputField
            label="Webkit Transform"
            value={currentStyles.webkitTransform}
            onChange={(value) => onPropertyChange('webkitTransform', value, 'style')}
          />
          <InputField
            label="Moz Transform"
            value={currentStyles.mozTransform}
            onChange={(value) => onPropertyChange('mozTransform', value, 'style')}
          />
          <InputField
            label="MS Transform"
            value={currentStyles.msTransform}
            onChange={(value) => onPropertyChange('msTransform', value, 'style')}
          />
          <InputField
            label="Webkit User Select"
            value={currentStyles.webkitUserSelect}
            onChange={(value) => onPropertyChange('webkitUserSelect', value, 'style')}
            type="select"
            options={{
              values: ['auto', 'text', 'none', 'contain', 'all']
            }}
          />
          <InputField
            label="Moz User Select"
            value={currentStyles.mozUserSelect}
            onChange={(value) => onPropertyChange('mozUserSelect', value, 'style')}
            type="select"
            options={{
              values: ['auto', 'text', 'none', 'all']
            }}
          />
        </div>
      </div>
    </PropertySection>
  );
};

export default CustomSection;