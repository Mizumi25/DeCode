import React from 'react';
import { MousePointer } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader } from '../PropertyUtils';

const InteractionsSection = ({ currentStyles, onPropertyChange, expandedSections, setExpandedSections }) => {
  return (
    <PropertySection
      title="Interactions & User States"
      Icon={MousePointer}
      sectionKey="interactions"
      expandedSections={expandedSections}
      setExpandedSections={setExpandedSections}
    >
      {/* Cursor */}
      <div>
        <SubsectionHeader title="Cursor & Pointer" />
        <InputField
          label="Cursor"
          value={currentStyles.cursor}
          onChange={(value) => onPropertyChange('cursor', value, 'style')}
          type="select"
          options={{
            values: [
              'auto', 'default', 'none', 'context-menu', 'help', 'pointer', 'progress', 'wait',
              'cell', 'crosshair', 'text', 'vertical-text', 'alias', 'copy', 'move', 'no-drop',
              'not-allowed', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize',
              'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize',
              'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize',
              'zoom-in', 'zoom-out'
            ]
          }}
        />
        
        <InputField
          label="Pointer Events"
          value={currentStyles.pointerEvents}
          onChange={(value) => onPropertyChange('pointerEvents', value, 'style')}
          type="select"
          options={{
            values: ['auto', 'none', 'visiblePainted', 'visibleFill', 'visibleStroke', 'visible', 'painted', 'fill', 'stroke', 'all', 'inherit']
          }}
        />
        
        <InputField
          label="Touch Action"
          value={currentStyles.touchAction}
          onChange={(value) => onPropertyChange('touchAction', value, 'style')}
          type="select"
          options={{
            values: ['auto', 'none', 'pan-x', 'pan-left', 'pan-right', 'pan-y', 'pan-up', 'pan-down', 'pinch-zoom', 'manipulation']
          }}
        />
      </div>

      {/* User Interaction */}
      <div>
        <SubsectionHeader title="User Interaction" />
        <InputField
          label="User Select"
          value={currentStyles.userSelect}
          onChange={(value) => onPropertyChange('userSelect', value, 'style')}
          type="select"
          options={{
            values: ['auto', 'text', 'none', 'contain', 'all']
          }}
        />
        
        <InputField
          label="User Drag"
          value={currentStyles.userDrag}
          onChange={(value) => onPropertyChange('userDrag', value, 'style')}
          type="select"
          options={{
            values: ['auto', 'element', 'none']
          }}
        />
        
        <InputField
          label="User Modify"
          value={currentStyles.userModify}
          onChange={(value) => onPropertyChange('userModify', value, 'style')}
          type="select"
          options={{
            values: ['read-only', 'read-write', 'write-only']
          }}
        />
      </div>

      {/* Scroll Behavior */}
      <div>
        <SubsectionHeader title="Scroll Behavior" />
        <InputField
          label="Scroll Behavior"
          value={currentStyles.scrollBehavior}
          onChange={(value) => onPropertyChange('scrollBehavior', value, 'style')}
          type="select"
          options={{
            values: ['auto', 'smooth']
          }}
        />
        
        <InputField
          label="Scroll Snap Type"
          value={currentStyles.scrollSnapType}
          onChange={(value) => onPropertyChange('scrollSnapType', value, 'style')}
          type="select"
          options={{
            values: ['none', 'x mandatory', 'y mandatory', 'x proximity', 'y proximity', 'both mandatory', 'both proximity']
          }}
        />
        
        <InputField
          label="Scroll Snap Align"
          value={currentStyles.scrollSnapAlign}
          onChange={(value) => onPropertyChange('scrollSnapAlign', value, 'style')}
          type="select"
          options={{
            values: ['none', 'start', 'end', 'center']
          }}
        />
        
        <InputField
          label="Scroll Snap Stop"
          value={currentStyles.scrollSnapStop}
          onChange={(value) => onPropertyChange('scrollSnapStop', value, 'style')}
          type="select"
          options={{
            values: ['normal', 'always']
          }}
        />
      </div>

      {/* Resize */}
      <div>
        <SubsectionHeader title="Resize" />
        <InputField
          label="Resize"
          value={currentStyles.resize}
          onChange={(value) => onPropertyChange('resize', value, 'style')}
          type="select"
          options={{
            values: ['none', 'both', 'horizontal', 'vertical', 'block', 'inline']
          }}
        />
      </div>
    </PropertySection>
  );
};

export default InteractionsSection;