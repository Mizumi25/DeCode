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

// ✅ ADD THIS IMPORT
import { useCanvasOverlayStore } from '@/stores/useCanvasOverlayStore';

const PropertiesPanel = ({ 
  frame,  // ADD THIS
  canvasComponents, 
  selectedComponent, 
  onPropertyUpdate, 
  onComponentDelete, 
  onGenerateCode,
  componentLibraryService,
  searchTerm: externalSearchTerm = '',
  onSearchChange
}) => {
  
  const selectedComponentData = useMemo(() => {
    if (!selectedComponent || !canvasComponents) return null;
    
    // 🔥 ENHANCED: Recursive search with depth tracking for debugging
    const findComponent = (components, id, depth = 0) => {
      console.log(`🔍 Searching at depth ${depth}:`, components.map(c => c.id));
      
      for (const comp of components) {
        if (comp.id === id) {
          console.log(`✅ FOUND at depth ${depth}:`, {
            id: comp.id,
            type: comp.type,
            hasProps: !!comp.props,
            hasStyle: !!comp.style,
            hasChildren: comp.children?.length > 0
          });
          return comp;
        }
        
        // 🔥 CRITICAL: Search in ALL children recursively
        if (comp.children?.length > 0) {
          const found = findComponent(comp.children, id, depth + 1);
          if (found) return found;
        }
      }
      return null;
    };
    
    const found = findComponent(canvasComponents, selectedComponent);
    
    if (!found) {
      console.warn('⚠️ Component not found:', selectedComponent);
    }
    
    return found;
}, [selectedComponent, canvasComponents]);
  
  
  
  
  
  
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
  
  // ✅ ADD THIS - Critical missing state
  const [localStyles, setLocalStyles] = useState({});

  
  // ✅ ADD THIS LINE
  const { toggleOverlay, isOverlayEnabled } = useCanvasOverlayStore();

  
  
  
 // REPLACE useEffect for syncing local styles (around line 60)
useEffect(() => {
  if (selectedComponentData?.id) {
    console.log('🔄 PropertiesPanel syncing local styles:', {
      componentId: selectedComponentData.id,
      styleKeys: Object.keys(selectedComponentData?.style || {}),
      propsKeys: Object.keys(selectedComponentData?.props || {}),
    });
    
    setLocalStyles(selectedComponentData?.style || {});
  }
}, [selectedComponentData?.id]); // ✅ Only re-sync when component ID changes

  
  
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

   
// MODIFY handlePropertyChange to trigger code generation
const handlePropertyChange = useCallback((propName, value, category = 'style') => {
  if (!selectedComponent || !selectedComponentData) {
    console.warn('⚠️ Cannot update: no component selected');
    return;
  }
  
  console.log('🔧 PropertiesPanel property change:', { 
    propName, 
    value, 
    category, 
    selectedComponent
  });
  
  if (category === 'style') {
    setLocalStyles(prev => {
      const updated = { ...prev, [propName]: value };
      return updated;
    });
    
    const currentStyles = selectedComponentData?.style || {};
    const newStyles = { ...currentStyles, [propName]: value };
    
    onPropertyUpdate(selectedComponent, 'style', newStyles);
    
  } else if (category === 'props') {
    const currentProps = selectedComponentData?.props || {};
    const newProps = { ...currentProps, [propName]: value };
    onPropertyUpdate(selectedComponent, 'props', newProps);
    
  } else if (category === 'animation') {
    const currentAnimation = selectedComponentData?.animation || {};
    const newAnimation = { ...currentAnimation, [propName]: value };
    onPropertyUpdate(selectedComponent, 'animation', newAnimation);
    
  } else {
    onPropertyUpdate(selectedComponent, propName, value);
  }
  
  // 🔥 NEW: Trigger code regeneration immediately
  if (typeof onGenerateCode === 'function') {
    onGenerateCode(canvasComponents);
  }
}, [selectedComponent, selectedComponentData, onPropertyUpdate, canvasComponents, onGenerateCode]);
    


    // In PropertiesPanel.jsx - add this debug section at the top of the return
console.log('🔍 PropertiesPanel Debug:', {
  selectedComponent,
  selectedComponentData,
  props: selectedComponentData?.props,
  style: selectedComponentData?.style,
  hasProps: !!selectedComponentData?.props,
  hasStyle: !!selectedComponentData?.style
});



// REPLACE (around line 80)
const currentStyles = selectedComponentData?.style || {};
const currentAnimation = selectedComponentData?.animation || {};

const commonProps = {
  currentStyles: localStyles, // 🔥 USE LOCAL STATE instead of direct selectedComponentData.style
  currentAnimation,
  onPropertyChange: handlePropertyChange,
  expandedSections,
  setExpandedSections,
  selectedComponentData,
  searchTerm: activeSearchTerm
};


// Handle canvas root selection - show canvas properties
if (!selectedComponent || selectedComponent === '__canvas_root__') {
  const canvasRootData = frame?.canvas_root || {};
  
  return (
    <div className="space-y-6 p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
          <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Canvas Root</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Edit body/root styles</p>
        </div>
      </div>
      
      <LayoutSection 
        currentStyles={canvasRootData}
        currentAnimation={{}}
        onPropertyChange={(propName, value) => {
          onPropertyUpdate('__canvas_root__', 'canvas_root', { ...canvasRootData, [propName]: value });
        }}
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        selectedComponentData={canvasRootData}
        searchTerm={activeSearchTerm}
      />
      
      <StylingSection 
        currentStyles={canvasRootData}
        currentAnimation={{}}
        onPropertyChange={(propName, value) => {
          onPropertyUpdate('__canvas_root__', 'canvas_root', { ...canvasRootData, [propName]: value });
        }}
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        selectedComponentData={canvasRootData}
        searchTerm={activeSearchTerm}
      />
    </div>
  );
}

// Only show real component properties if we have one selected (not canvas)
if (!selectedComponentData) {
  return (
    <div className="space-y-6 p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="text-center opacity-50">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No component selected</p>
      </div>
    </div>
  );
}

const componentDefinition = componentLibraryService?.getComponentDefinition?.(selectedComponentData.type);

  


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
  

<div className="p-3 mb-4 bg-[var(--color-primary-soft)] border border-[var(--color-primary-soft)] rounded text-xs overflow-auto">
  <div><strong>DEBUG:</strong> Component: {selectedComponent}</div>
  <div><strong>Props:</strong> {JSON.stringify(selectedComponentData?.props)}</div>
  <div><strong>Style:</strong> {JSON.stringify(selectedComponentData?.style)}</div>
  <div><strong>Type:</strong> {selectedComponentData?.type}</div>
</div>
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
        {/* 🔥 TEXT CONTENT INPUTS - Show for all text elements and their children */}
        {(() => {
            // Get all text child nodes
            const textChildren = selectedComponentData?.children?.filter(child => 
                child.type === 'text-node' || child.isPseudoElement
            ) || [];
            
            // Check if current element can have text
            const textElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 
                'small', 'label', 'blockquote', 'button', 'link', 'text-node'];
            
            const canHaveText = textElements.includes(selectedComponentData?.type);
            
            if (!canHaveText && textChildren.length === 0) return null;
            
            return (
                <div className="p-4 mb-4 bg-blue-50 border-2 border-blue-300 rounded-lg space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-blue-900">Text Content Editor</h4>
                        <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">
                            {textChildren.length + (canHaveText ? 1 : 0)} text node(s)
                        </span>
                    </div>

{/* 🔥 TEXT CONTENT EDITOR - Only for text-node components */}
{selectedComponentData?.type === 'text-node' && (
    <div className="p-4 mb-4 bg-blue-50 border-2 border-blue-300 rounded-lg space-y-4">
        <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-900">Text Node Content</h4>
            <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">
                Independent Element
            </span>
        </div>
        
        <div className="bg-white p-3 rounded border border-blue-200">
            <label className="block text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Text Content
            </label>
            <textarea
                value={selectedComponentData?.props?.content || selectedComponentData?.text_content || ''}
                onChange={(e) => {
                    const value = e.target.value;
                    handlePropertyChange('content', value, 'props');
                    handlePropertyChange('text_content', value, 'direct');
                }}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                placeholder="Enter text content..."
                rows={4}
                style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)'
                }}
            />
            <p className="text-xs text-blue-600 mt-2 flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                This is an independent text node. It can be dragged, selected, and positioned separately from other elements.
            </p>
        </div>
    </div>
)}
                    
                    {/* Child text nodes */}
                    {textChildren.map((child, index) => (
                        <div key={child.id || `text-child-${index}`} className="bg-amber-50 p-3 rounded border border-amber-200">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-amber-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    Text Child Node {index + 1}
                                </label>
                                <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-800 rounded">
                                    PSEUDO
                                </span>
                            </div>
                            <textarea
                                value={child.props?.content || child.props?.text || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const updatedChildren = [...(selectedComponentData.children || [])];
                                    const childIndex = updatedChildren.findIndex(c => c.id === child.id);
                                    if (childIndex !== -1) {
                                        updatedChildren[childIndex] = {
                                            ...updatedChildren[childIndex],
                                            props: {
                                                ...updatedChildren[childIndex].props,
                                                content: value,
                                                text: value
                                            }
                                        };
                                        onPropertyUpdate(selectedComponent, 'children', updatedChildren);
                                    }
                                }}
                                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                                placeholder="Enter text content..."
                                rows={2}
                                style={{
                                    backgroundColor: 'var(--color-surface)',
                                    color: 'var(--color-text)'
                                }}
                            />
                            <button
                                onClick={() => {
                                    const updatedChildren = selectedComponentData.children.filter(c => c.id !== child.id);
                                    onPropertyUpdate(selectedComponent, 'children', updatedChildren);
                                }}
                                className="mt-2 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                                Remove Text Node
                            </button>
                        </div>
                    ))}
                    
                    {/* Add new text node button */}
                    <button
                        onClick={() => {
                            const newTextNode = {
                                id: `text-node_${Date.now()}`,
                                type: 'text-node',
                                isPseudoElement: true,
                                props: {
                                    content: 'New text content',
                                    text: 'New text content'
                                }
                            };
                            const updatedChildren = [...(selectedComponentData.children || []), newTextNode];
                            onPropertyUpdate(selectedComponent, 'children', updatedChildren);
                        }}
                        className="w-full py-2 px-3 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Text Node
                    </button>
                    
                    <p className="text-xs text-blue-600 mt-2 flex items-start gap-2">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        {textChildren.length > 0 
                            ? `Managing ${textChildren.length} child text node(s) and parent content` 
                            : 'Text content for this element. Add child nodes for complex text.'}
                    </p>
                </div>
            );
        })()}
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
        
        {/* ✅ NEW: Quick Spacing Toggle Button */}
        <button
          onClick={() => toggleOverlay('showSpacingIndicators')}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 ${
            isOverlayEnabled('showSpacingIndicators') 
              ? 'ring-2 ring-green-500' 
              : ''
          }`}
          style={{ 
            backgroundColor: isOverlayEnabled('showSpacingIndicators') 
              ? '#dcfce7' 
              : 'var(--color-bg-muted)',
            color: isOverlayEnabled('showSpacingIndicators') 
              ? '#166534' 
              : 'var(--color-text)',
            border: '1px solid var(--color-border)'
          }}
        >
          <Maximize2 className="w-4 h-4" />
          {isOverlayEnabled('showSpacingIndicators') ? 'Hide' : 'Show'} Spacing
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