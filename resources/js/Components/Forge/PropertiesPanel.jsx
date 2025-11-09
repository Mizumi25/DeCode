// @/Components/Forge/PropertiesPanel.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Settings, Code, Trash2, RotateCw, Move, RotateCcw, Search, X, Eye, EyeOff, Maximize2, Grid, Layers, Layout, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'; // Add this import
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
  canvasRef,
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
  
  // REPLACE the selectedComponentData lookup in PropertiesPanel.jsx
const selectedComponentData = useMemo(() => {
  if (!selectedComponent || !canvasComponents) return null;
  
  // 🔥 FIX: Handle canvas root specially
  if (selectedComponent === '__canvas_root__') {
    return {
      id: '__canvas_root__',
      type: 'canvas_root',
      name: 'Canvas Root',
      style: frame?.canvas_style || {},
      props: frame?.canvas_props || {},
      animation: frame?.canvas_animation || {},
      isCanvasRoot: true // 🔥 Flag to identify canvas root
    };
  }
  
  // 🔥 ENHANCED: Recursive search for real components
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
}, [selectedComponent, canvasComponents, frame]);
  
  
  
  
  
  
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

   
   
   
const handleCanvasPropertyChange = useCallback(async (propName, value, category = 'style') => {
  if (!frame) {
    console.warn('⚠️ No frame available for canvas update');
    return;
  }
  
  console.log('🎨 Canvas property change:', { propName, value, category });
  
  // 🔥 CRITICAL: Apply style IMMEDIATELY to canvas DOM element
  if (category === 'style' && canvasRef?.current) {
    const canvas = canvasRef.current;
    canvas.style[propName] = value;
    
    // 🔥 SPECIAL: If display changes to flex, apply flex defaults
    if (propName === 'display' && value === 'flex') {
      canvas.style.flexDirection = canvas.style.flexDirection || 'row';
      canvas.style.justifyContent = canvas.style.justifyContent || 'flex-start';
      canvas.style.alignItems = canvas.style.alignItems || 'flex-start';
    }
    
    console.log('⚡ Applied style immediately to canvas:', { propName, value });
  }
  
  try {
    const updatePayload = {};
    
    if (category === 'style') {
      updatePayload.canvas_style = { [propName]: value };
    } else if (category === 'props') {
      updatePayload.canvas_props = { [propName]: value };
    } else if (category === 'animation') {
      updatePayload.canvas_animation = { [propName]: value };
    }
    
    console.log('📤 Sending canvas update to backend:', updatePayload);
    
   const response = await axios.put(`/api/frames/${frame.uuid}/canvas-styles`, updatePayload);
    
    if (response.data.success) {
      console.log('✅ Canvas updated on backend');
      
      if (typeof onGenerateCode === 'function') {
        onGenerateCode(canvasComponents);
      }
    }
  } catch (error) {
    console.error('❌ Failed to update canvas:', error.response?.data || error.message);
  }
}, [frame, canvasComponents, onGenerateCode, canvasRef]);
   
   
   
   
// MODIFY handlePropertyChange to trigger code generation
 const handlePropertyChange = useCallback((propName, value, category = 'style') => {
  // 🔥 NEW: Handle canvas root selection
  if (selectedComponent === '__canvas_root__') {
    console.log('🎨 Canvas root property change:', { propName, value, category });
    handleCanvasPropertyChange(propName, value, category);
    return;
  }
  
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
// Handle canvas root selection - show canvas properties
if (!selectedComponent || selectedComponent === '__canvas_root__') {
  const canvasStyle = frame?.canvas_style || {};
  const canvasProps = frame?.canvas_props || {};
  const canvasAnimation = frame?.canvas_animation || {};
  
// 🔥 ENHANCED: Merged debug for Canvas + Element properties
  const debugData = {
    canvas: {
      frame_uuid: frame?.uuid,
      frame_type: frame?.type,
      style_keys: Object.keys(canvasStyle),
      props_keys: Object.keys(canvasProps),
      sample_styles: Object.entries(canvasStyle).slice(0, 5),
      last_updated: new Date().toLocaleTimeString()
    },
    element: {
      selected: selectedComponent,
      is_canvas: selectedComponent === '__canvas_root__',
      component_count: canvasComponents?.length || 0
    },
    device: {
      mode: frame?.settings?.responsive_mode || 'desktop',
      viewport: frame?.settings?.viewport_width ? 
        `${frame.settings.viewport_width}×${frame.settings.viewport_height}` : 
        'Auto'
    }
  };
  
  return (
    <div className="space-y-6 p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        {/*🔥 DYNAMIC DEBUG PANEL - USING SAME VARIABLES AS PROPERTIES PANEL*/}
        <div className="p-4 mb-6 rounded-xl" style={{
          background: 'var(--color-surface)',
          boxShadow: '0 8px 25px var(--color-primary-soft)',
          border: '1px solid var(--color-border)'
        }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {(!selectedComponent || selectedComponent === '__canvas_root__') ? (
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
                  <Layout className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                </div>
              ) : (
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
                  <Square className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                </div>
              )}
              <div>
                <h4 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  {(!selectedComponent || selectedComponent === '__canvas_root__') ? 'Canvas Root' : 'Selected Element'}
                </h4>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {(!selectedComponent || selectedComponent === '__canvas_root__') ? 'Frame styles & properties' : `${selectedComponentData?.type} component`}
                </p>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ 
                backgroundColor: 'var(--color-bg-muted)',
                color: 'var(--color-text-muted)'
              }}
            >
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          
          <div className="space-y-3">
            {(!selectedComponent || selectedComponent === '__canvas_root__') ? (
              <>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {frame?.canvas_style ? Object.keys(frame.canvas_style).length : 0}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Canvas Styles</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {frame?.canvas_props ? Object.keys(frame.canvas_props).length : 0}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Canvas Props</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {frame?.uuid ? frame.uuid.slice(0, 6) : 'N/A'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Frame ID</div>
                  </div>
                </div>
                
                {/* Show canvas styles */}
                {frame?.canvas_style && Object.keys(frame.canvas_style).length > 0 ? (
                  <div className="rounded-xl p-3 max-h-32 overflow-y-auto border" 
                    style={{ 
                      backgroundColor: 'var(--color-bg-muted)',
                      borderColor: 'var(--color-border)'
                    }}>
                    <div className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                      <Layout className="w-3 h-3" />
                      Canvas Body Styles
                    </div>
                    <div className="space-y-2 font-mono text-xs">
                      {Object.entries(frame.canvas_style).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2">
                          <span className="font-semibold flex-shrink-0" style={{ color: 'var(--color-primary)' }}>{key}:</span>
                          <span className="flex-1 break-all" style={{ color: 'var(--color-accent)' }}>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm rounded-lg border" 
                    style={{ 
                      backgroundColor: 'var(--color-primary-soft)',
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)'
                    }}>
                    <Layout className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div>No canvas styles applied yet</div>
                    <div className="text-xs mt-1">Set background color in properties panel below</div>
                  </div>
                )}
              </>
            ) : selectedComponentData ? (
              <>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>{Object.keys(selectedComponentData?.style || {}).length}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Styles</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>{Object.keys(selectedComponentData?.props || {}).length}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Props</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>{selectedComponentData?.type}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Type</div>
                  </div>
                </div>
                
                {/* Scrollable Styles */}
                {selectedComponentData?.style && Object.keys(selectedComponentData.style).length > 0 && (
                  <div className="rounded-xl p-3 max-h-32 overflow-y-auto border"
                    style={{ 
                      backgroundColor: 'var(--color-bg-muted)',
                      borderColor: 'var(--color-border)'
                    }}>
                    <div className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                      <Code className="w-3 h-3" />
                      Live Styles
                    </div>
                    <div className="space-y-2 font-mono text-xs">
                      {Object.entries(selectedComponentData.style).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2">
                          <span className="font-semibold flex-shrink-0" style={{ color: 'var(--color-primary)' }}>{key}:</span>
                          <span className="flex-1 break-all" style={{ color: 'var(--color-accent)' }}>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(!selectedComponentData?.style || Object.keys(selectedComponentData.style).length === 0) && (
                  <div className="text-center py-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div>No styles applied yet</div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div>No element selected</div>
              </div>
            )}
          </div>
        </div>
      
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
          <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Canvas Body</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Edit &lt;body&gt; root styles</p>
        </div>
      </div>
      
      <LayoutSection 
        currentStyles={canvasStyle}
        currentAnimation={canvasAnimation}
        onPropertyChange={(propName, value, category) => {
          console.log('🎨 Canvas property change:', { propName, value, category });
          handleCanvasPropertyChange(propName, value, category);
        }}
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        selectedComponentData={{ style: canvasStyle }}
        searchTerm={activeSearchTerm}
      />
      
      <StylingSection 
        currentStyles={canvasStyle}
        currentAnimation={canvasAnimation}
        onPropertyChange={(propName, value, category) => {
          console.log('🎨 Canvas styling change:', { propName, value, category });
          handleCanvasPropertyChange(propName, value, category);
        }}
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        selectedComponentData={{ style: canvasStyle }}
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
  <div className="space-y-0 max-h-full overflow-y-auto" style={{ backgroundColor: 'var(--color-bg)' }}>
     {/*🔥 DYNAMIC DEBUG PANEL - USING SAME VARIABLES AS PROPERTIES PANEL*/}
        <div className="p-4 mb-6 rounded-xl" style={{
          background: 'var(--color-surface)',
          boxShadow: '0 8px 25px var(--color-primary-soft)',
          border: '1px solid var(--color-border)'
        }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {(!selectedComponent || selectedComponent === '__canvas_root__') ? (
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
                  <Layout className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                </div>
              ) : (
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
                  <Square className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                </div>
              )}
              <div>
                <h4 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  {(!selectedComponent || selectedComponent === '__canvas_root__') ? 'Canvas Root' : 'Selected Element'}
                </h4>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {(!selectedComponent || selectedComponent === '__canvas_root__') ? 'Frame styles & properties' : `${selectedComponentData?.type} component`}
                </p>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ 
                backgroundColor: 'var(--color-bg-muted)',
                color: 'var(--color-text-muted)'
              }}
            >
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          
          <div className="space-y-3">
            {(!selectedComponent || selectedComponent === '__canvas_root__') ? (
              <>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {frame?.canvas_style ? Object.keys(frame.canvas_style).length : 0}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Canvas Styles</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {frame?.canvas_props ? Object.keys(frame.canvas_props).length : 0}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Canvas Props</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {frame?.uuid ? frame.uuid.slice(0, 6) : 'N/A'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Frame ID</div>
                  </div>
                </div>
                
                {/* Show canvas styles */}
                {frame?.canvas_style && Object.keys(frame.canvas_style).length > 0 ? (
                  <div className="rounded-xl p-3 max-h-32 overflow-y-auto border" 
                    style={{ 
                      backgroundColor: 'var(--color-bg-muted)',
                      borderColor: 'var(--color-border)'
                    }}>
                    <div className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                      <Layout className="w-3 h-3" />
                      Canvas Body Styles
                    </div>
                    <div className="space-y-2 font-mono text-xs">
                      {Object.entries(frame.canvas_style).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2">
                          <span className="font-semibold flex-shrink-0" style={{ color: 'var(--color-primary)' }}>{key}:</span>
                          <span className="flex-1 break-all" style={{ color: 'var(--color-accent)' }}>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm rounded-lg border" 
                    style={{ 
                      backgroundColor: 'var(--color-primary-soft)',
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)'
                    }}>
                    <Layout className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div>No canvas styles applied yet</div>
                    <div className="text-xs mt-1">Set background color in properties panel below</div>
                  </div>
                )}
              </>
            ) : selectedComponentData ? (
              <>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>{Object.keys(selectedComponentData?.style || {}).length}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Styles</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>{Object.keys(selectedComponentData?.props || {}).length}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Props</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>{selectedComponentData?.type}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Type</div>
                  </div>
                </div>
                
                {/* Scrollable Styles */}
                {selectedComponentData?.style && Object.keys(selectedComponentData.style).length > 0 && (
                  <div className="rounded-xl p-3 max-h-32 overflow-y-auto border"
                    style={{ 
                      backgroundColor: 'var(--color-bg-muted)',
                      borderColor: 'var(--color-border)'
                    }}>
                    <div className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                      <Code className="w-3 h-3" />
                      Live Styles
                    </div>
                    <div className="space-y-2 font-mono text-xs">
                      {Object.entries(selectedComponentData.style).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2">
                          <span className="font-semibold flex-shrink-0" style={{ color: 'var(--color-primary)' }}>{key}:</span>
                          <span className="flex-1 break-all" style={{ color: 'var(--color-accent)' }}>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(!selectedComponentData?.style || Object.keys(selectedComponentData.style).length === 0) && (
                  <div className="text-center py-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div>No styles applied yet</div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div>No element selected</div>
              </div>
            )}
          </div>
        </div>
    {/* Enhanced Header with Canvas Settings */}
    <div className=" z-10 border-b" style={{ 
      backgroundColor: 'var(--color-surface)',
      borderColor: 'var(--color-border)'
    }}>
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
                {selectedComponent === '__canvas_root__' ? 'Canvas Body' : 
                 selectedComponentData ? `${componentDefinition?.name || selectedComponentData.type} #${selectedComponent.split('_').pop()}` : 'No selection'}
              </p>
            </div>
          </div>
          
          {/* Canvas Settings Dropdown Button */}
          <CanvasSettingsDropdown />
        </div>

    

        {/* Component Name Input - Only show for elements */}
        {selectedComponentData && selectedComponent !== '__canvas_root__' && (
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
        )}
        
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
            <div className="text-xs px-2 py-1 rounded text-center"
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
        {/* 🔥 TEXT CONTENT INPUTS - FIXED with direct text_content field */}
        {(() => {
          const textElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 
              'small', 'label', 'blockquote', 'button', 'link', 'text-node'];
          
          const canHaveText = textElements.includes(selectedComponentData?.type);
          
          if (!canHaveText) return null;
          
          return (
            <div className="p-4 mb-4 bg-blue-50 border-2 border-blue-300 rounded-lg space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900">Text Content Editor</h4>
                <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">
                  {selectedComponentData.type}
                </span>
              </div>
              
              <div className="bg-white p-3 rounded border border-blue-200">
                <label className="block text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Text Content
                </label>
                <textarea
                  value={selectedComponentData?.text_content || selectedComponentData?.props?.content || selectedComponentData?.props?.text || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Update text_content field directly
                    onPropertyUpdate(selectedComponent, 'text_content', value, 'direct');
                    // Also update props.content for compatibility
                    handlePropertyChange('content', value, 'props');
                  }}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  placeholder="Enter text content..."
                  rows={4}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
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