// @/Components/Forge/PropertiesPanel.jsx - Enhanced with Proper Dynamic Theming
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
      <div className="space-y-6 p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Properties</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Select a component to edit</p>
          </div>
        </div>
        
        <div 
          className="text-center py-12 rounded-xl border-2 border-dashed"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
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
    <div 
      className="space-y-0 max-h-full overflow-y-auto"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Header - Fixed with proper theming */}
      <div 
        className="sticky top-0 z-10 p-4 border-b"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex items-center gap-3 mb-4">
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

        {/* Component Name Editor */}
        <div className="space-y-2">
          <label className="block text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Component Name
          </label>
          <input
            type="text"
            value={selectedComponentData.name || ''}
            onChange={(e) => onPropertyUpdate(selectedComponent, 'name', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              '--focus-ring-color': 'var(--color-primary)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(160, 82, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 space-y-4">
        {/* Property Sections */}
        <LayoutPresets {...commonProps} />
        <LayoutSection {...commonProps} selectedComponentData={selectedComponentData} />
        <TypographySection {...commonProps} />
        <StylingSection {...commonProps} />
        <AnimationSection {...commonProps} />
        <ResponsiveSection {...commonProps} />
        <InteractionsSection {...commonProps} />
        <CustomSection {...commonProps} />
      </div>

      {/* Actions - Fixed at bottom with proper theming */}
      <div 
        className="sticky bottom-0 p-4 border-t space-y-3"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <button
          onClick={() => onGenerateCode([selectedComponentData])}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-90"
          style={{ 
            backgroundColor: 'var(--color-primary)',
            color: 'white'
          }}
        >
          <Code className="w-4 h-4" />
          Generate Code
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePropertyChange('reset', true)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ 
              backgroundColor: 'var(--color-bg-muted)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)'
            }}
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          
          <button
            onClick={() => onComponentDelete(selectedComponent)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ 
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca'
            }}
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>

      {/* Global Styles for Input Theming */}
      <style jsx>{`
        .space-y-0 input,
        .space-y-0 select,
        .space-y-0 textarea {
          background-color: var(--color-surface) !important;
          color: var(--color-text) !important;
          border-color: var(--color-border) !important;
        }
        
        .space-y-0 input:focus,
        .space-y-0 select:focus,
        .space-y-0 textarea:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(160, 82, 255, 0.1) !important;
        }
        
        .space-y-0 button:not(.w-full) {
          background-color: var(--color-surface) !important;
          color: var(--color-text) !important;
          border-color: var(--color-border) !important;
        }
        
        .space-y-0 button:not(.w-full):hover {
          background-color: var(--color-bg-muted) !important;
        }
        
        /* Range slider styling */
        .space-y-0 input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        .space-y-0 input[type="range"]::-webkit-slider-track {
          background: var(--color-border);
          height: 6px;
          border-radius: 3px;
        }
        
        .space-y-0 input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: var(--color-primary);
          height: 18px;
          width: 18px;
          border-radius: 50%;
          border: 2px solid var(--color-surface);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .space-y-0 input[type="range"]::-moz-range-track {
          background: var(--color-border);
          height: 6px;
          border-radius: 3px;
        }
        
        .space-y-0 input[type="range"]::-moz-range-thumb {
          background: var(--color-primary);
          height: 18px;
          width: 18px;
          border-radius: 50%;
          border: 2px solid var(--color-surface);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Color input styling */
        .space-y-0 input[type="color"] {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 2px solid var(--color-border);
          cursor: pointer;
        }
        
        .space-y-0 input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        
        .space-y-0 input[type="color"]::-webkit-color-swatch {
          border: none;
          border-radius: 6px;
        }
        
        /* Checkbox styling */
        .space-y-0 input[type="checkbox"] {
          accent-color: var(--color-primary);
        }
        
        /* Select styling */
        .space-y-0 select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 8px center;
          background-repeat: no-repeat;
          background-size: 16px 12px;
          padding-right: 32px;
        }
      `}</style>
    </div>
  );
};

export default PropertiesPanel;