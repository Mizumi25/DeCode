import React, { useState, useEffect } from 'react';
import { Settings, Code, Trash2, RotateCcw } from 'lucide-react';

// Import sub-components
import LayoutSection from './PropertySections/LayoutSection';
import TypographySection from './PropertySections/TypographySection';
import StylingSection from './PropertySections/StylingSection';
import AnimationSection from './PropertySections/AnimationSection';
import ResponsiveSection from './PropertySections/ResponsiveSection';
import InteractionsSection from './PropertySections/InteractionsSection';
import CustomSection from './PropertySections/CustomSection';
import LayoutPresets from './LayoutPresets';

const PropertiesPanel = ({ 
  canvasComponents, 
  selectedComponent, 
  onPropertyUpdate, 
  onComponentDelete, 
  onGenerateCode,
  componentLibraryService
}) => {
  const [selectedComponentData, setSelectedComponentData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    layout: true,
    typography: false,
    styling: false,
    animation: false,
    responsive: false,
    interactions: false,
    custom: false
  });

  useEffect(() => {
    if (selectedComponent && canvasComponents) {
      const component = canvasComponents.find(c => c.id === selectedComponent);
      setSelectedComponentData(component);
    } else {
      setSelectedComponentData(null);
    }
  }, [selectedComponent, canvasComponents]);

  const handlePropertyChange = (propName, value, category = 'style') => {
    if (!selectedComponent) return;
    
    if (category === 'style') {
      const currentStyles = selectedComponentData?.style || {};
      const newStyles = { ...currentStyles, [propName]: value };
      onPropertyUpdate(selectedComponent, 'style', newStyles);
    } else if (category === 'animation') {
      const currentAnimation = selectedComponentData?.animation || {};
      const newAnimation = { ...currentAnimation, [propName]: value };
      onPropertyUpdate(selectedComponent, 'animation', newAnimation);
    } else {
      onPropertyUpdate(selectedComponent, propName, value);
    }
  };

  if (!selectedComponent || !selectedComponentData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Properties</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Select a component to edit</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No component selected.<br />
            Click on a component to see its properties.
          </p>
        </div>
      </div>
    );
  }

  const componentDefinition = componentLibraryService?.getComponentDefinition?.(selectedComponentData.type);
  const currentStyles = selectedComponentData.style || {};
  const currentAnimation = selectedComponentData.animation || {};

  const commonProps = {
    currentStyles,
    currentAnimation,
    onPropertyChange: handlePropertyChange,
    expandedSections,
    setExpandedSections
  };

  return (
    <div className="space-y-0 max-h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sticky top-0 bg-white dark:bg-gray-900 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
          <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Properties</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {componentDefinition?.name || selectedComponentData.type} #{selectedComponent.split('_').pop()}
          </p>
        </div>
      </div>

      {/* Property Sections */}
      <LayoutPresets {...commonProps} />
      <LayoutSection {...commonProps} selectedComponentData={selectedComponentData} />
      <TypographySection {...commonProps} />
      <StylingSection {...commonProps} />
      <AnimationSection {...commonProps} />
      <ResponsiveSection {...commonProps} />
      <InteractionsSection {...commonProps} />
      <CustomSection {...commonProps} />

      {/* Component Name */}
      <div className="space-y-2 mt-6">
        <label className="block text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Component Name
        </label>
        <input
          type="text"
          value={selectedComponentData.name || ''}
          onChange={(e) => onPropertyUpdate(selectedComponent, 'name', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
        />
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => onGenerateCode([selectedComponentData])}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Code className="w-4 h-4" />
          Generate Code
        </button>
        
        <button
          onClick={() => onComponentDelete(selectedComponent)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Component
        </button>
        
        <button
          onClick={() => handlePropertyChange('reset', true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Styles
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;