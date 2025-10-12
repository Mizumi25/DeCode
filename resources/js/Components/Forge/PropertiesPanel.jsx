// @/Components/Forge/PropertiesPanel.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Settings, Code, Trash2, RotateCw, Move, RotateCcw, Search, X, Eye, EyeOff, Maximize2, Grid, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'

// Import sub-components
import LayoutSection from './PropertySections/LayoutSection';
import TypographySection from './PropertySections/TypographySection';
import StylingSection from './PropertySections/StylingSection';
import AnimationSection from './PropertySections/AnimationSection';
import ResponsiveSection from './PropertySections/ResponsiveSection';
import InteractionsSection from './PropertySections/InteractionsSection';
import CustomSection from './PropertySections/CustomSection';
import CanvasSettingsDropdown from './CanvasSettingsDropdown';


import { useCanvasOverlayStore } from '@/stores/useCanvasOverlayStore';

const PropertiesPanel = ({ 
  canvasComponents, 
  selectedComponent, 
  onPropertyUpdate, 
  onComponentDelete, 
  onGenerateCode,
  componentLibraryService,
  searchTerm: externalSearchTerm = '',
  onSearchChange
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
  
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const activeSearchTerm = externalSearchTerm || internalSearchTerm;

  useEffect(() => {
    if (selectedComponent && canvasComponents) {
      const component = canvasComponents.find(c => c.id === selectedComponent);
      setSelectedComponentData(component);
    } else {
      setSelectedComponentData(null);
    }
  }, [selectedComponent, canvasComponents]);
  
  useEffect(() => {
    if (activeSearchTerm && activeSearchTerm.trim() !== '') {
      setExpandedSections({
        layout: true,
        typography: true,
        styling: true,
        animation: true,
        responsive: true,
        interactions: true,
        custom: true
      });
    }
  }, [activeSearchTerm]);
  
  const handleSearchChange = (value) => {
    setInternalSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };
  
  const handleClearSearch = () => {
    setInternalSearchTerm('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

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
    setExpandedSections,
    selectedComponentData,
    searchTerm: activeSearchTerm
  };

  return (
    <div 
      className="space-y-0 max-h-full overflow-y-auto"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Enhanced Header with Canvas Settings */}
      <div 
        className="sticky top-0 z-10 border-b"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="p-4">
          {/* Top row with title and settings */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
                <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Properties</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {componentDefinition?.name || selectedComponentData.type} #{selectedComponent.split('_').pop()}
                </p>
              </div>
            </div>
            
            {/* Canvas Settings Dropdown Button */}
            <CanvasSettingsDropdown />
          </div>
      
          {/* Component Name Input */}
          <div className="space-y-2 mb-4">
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
                color: 'var(--color-text)'
              }}
              placeholder="Enter component name"
            />
          </div>
          
          {/* Search Properties */}
          <div className="space-y-2">
            <label className="block text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Search Properties
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                value={activeSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="e.g., background, color, padding..."
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
              {activeSearchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-muted)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            
            {activeSearchTerm && (
              <div 
                className="text-xs px-2 py-1 rounded text-center"
                style={{ 
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)'
                }}
              >
                Showing matching properties only
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="p-4 space-y-4">
        <LayoutSection {...commonProps} />
        <TypographySection {...commonProps} />
        <StylingSection {...commonProps} />
        <AnimationSection {...commonProps} />
        <ResponsiveSection {...commonProps} />
        <InteractionsSection {...commonProps} />
        <CustomSection {...commonProps} />
      </div>

      {/* Actions */}
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
            color: '#ffffff'
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
    </div>
  );
};








export default PropertiesPanel;