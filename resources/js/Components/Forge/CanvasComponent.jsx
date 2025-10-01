// @/Components/Forge/CanvasComponent.jsx - Enhanced for True Responsive Canvas Sizing
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Sparkles, Monitor, Tablet, Smartphone, Move, RotateCcw } from 'lucide-react';

import SectionDropZone from './SectionDropZone';
import EmptyCanvasState from './EmptyCanvasState';
import SelectionOverlay from './SelectionOverlay';
import DragSnapLines from './DragSnapLines';

import { useEditorStore } from '@/stores/useEditorStore';
import { useForgeUndoRedoStore } from '@/stores/useForgeUndoRedoStore';

const CanvasComponent = ({
  canvasRef,
  canvasComponents,
  selectedComponent,
  dragState,
  dragPosition,
  isCanvasSelected,
  componentLibraryService,
  onCanvasDragOver,
  onCanvasDrop,
  onCanvasClick,
  onComponentClick,
  onPropertyUpdate,
  isMobile,
  currentFrame,
  isFrameSwitching,
  frameType = 'page',
  responsiveMode,
  zoomLevel,
  gridVisible
}) => {
  // Get responsive state from EditorStore
  const {
    getCurrentCanvasDimensions,
    getResponsiveDeviceInfo,
    getResponsiveScaleFactor,
    getResponsiveCanvasClasses,
    getResponsiveGridBackground
  } = useEditorStore();
  
  
  // Get undo/redo functionality
  const { pushHistory, actionTypes } = useForgeUndoRedoStore();

  // Local state for canvas interactions
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingComponent, setResizingComponent] = useState(null);

  // Get responsive device info and dimensions
  const deviceInfo = getResponsiveDeviceInfo();
  const scaleFactor = getResponsiveScaleFactor();
  const canvasClasses = getResponsiveCanvasClasses();
  const canvasDimensions = getCurrentCanvasDimensions();

  // CRITICAL: Define actual canvas dimensions based on responsive mode
  const getCanvasSize = () => {
    switch (responsiveMode) {
      case 'mobile':
        return {
          width: 375,
          height: 667,
          maxWidth: '375px',
          deviceName: 'iPhone SE'
        };
      case 'tablet':
        return {
          width: 768,
          height: 1024,
          maxWidth: '768px',
          deviceName: 'iPad'
        };
      case 'desktop':
      default:
        return {
          width: '100%',
          height: 'auto',
          maxWidth: 'none',
          deviceName: 'Desktop'
        };
    }
  };

  const canvasSize = getCanvasSize();
  
  

  // Document flow components (those that should flow naturally)
  const flowComponents = ['div', 'section', 'header', 'main', 'footer', 'nav', 'article', 'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];
  
  // Absolute positioned components (those that need precise positioning)
  const absoluteComponents = ['button', 'badge', 'avatar', 'input', 'searchbar'];
  
  // Handle component direct manipulation (drag, resize)
  const handleComponentMouseDown = useCallback((e, componentId) => {
    e.stopPropagation();
    
    const component = canvasComponents.find(c => c.id === componentId);
    if (!component) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    setIsDraggingComponent(componentId);
    setDragOffset({
      x: e.clientX - (component.position.x + canvasRect.left),
      y: e.clientY - (component.position.y + canvasRect.top)
    });

    // Select component
    onComponentClick(componentId, e);

    let hasMoved = false;
    const initialPosition = { ...component.position };
    
    const handleMouseMove = (moveEvent) => {
      const newX = moveEvent.clientX - canvasRect.left - dragOffset.x;
      const newY = moveEvent.clientY - canvasRect.top - dragOffset.y;
      
      // Constrain to canvas bounds - use actual canvas size for responsive modes
      const maxWidth = responsiveMode === 'desktop' ? canvasRect.width - 100 : canvasSize.width - 100;
      const maxHeight = responsiveMode === 'desktop' ? canvasRect.height - 50 : 600; // Reasonable constraint for mobile/tablet
      
      const constrainedX = Math.max(0, Math.min(newX, maxWidth));
      const constrainedY = Math.max(0, Math.min(newY, maxHeight));
      
      // Check if actually moved significantly
      const deltaX = Math.abs(constrainedX - initialPosition.x);
      const deltaY = Math.abs(constrainedY - initialPosition.y);
      
      if (deltaX > 1 || deltaY > 1) {
        hasMoved = true;
      }
      
      onPropertyUpdate(componentId, 'position', { x: constrainedX, y: constrainedY });
    };
    
    const handleMouseUp = () => {
      setIsDraggingComponent(false);
      
      if (hasMoved && currentFrame && pushHistory && actionTypes) {
        const finalPosition = canvasComponents.find(c => c.id === componentId)?.position;
        if (finalPosition) {
          pushHistory(currentFrame, canvasComponents, actionTypes.MOVE, {
            componentName: component.name || component.type,
            componentId,
            initialPosition,
            finalPosition
          });
        }
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [canvasComponents, dragOffset, onPropertyUpdate, onComponentClick, responsiveMode, canvasSize, currentFrame, pushHistory, actionTypes]);

  

// REPLACE the renderComponent function
const renderComponent = useCallback((component, index, parentStyle = {}, depth = 0) => {
  const componentRenderer = componentLibraryService?.getComponent(component.type);
  const isSelected = selectedComponent === component.id;
  const isLayout = component.isLayoutContainer;
  
  let renderedContent = null;
  
  if (componentRenderer && componentRenderer.render) {
    try {
      const componentDef = componentLibraryService?.getComponentDefinition(component.type);
      const mergedProps = {
        ...componentDef?.default_props,
        ...component.props,
        style: component.style
      };
      renderedContent = componentRenderer.render(mergedProps, component.id);
    } catch (error) {
      console.warn('Component render error:', error);
      renderedContent = <div className="border rounded p-3">{component.name}</div>;
    }
  } else {
    renderedContent = <div className="border-2 border-dashed p-4">{component.name}</div>;
  }
  
  // Layout styles - NO absolute positioning
  const componentStyles = {
    position: 'relative', // Always relative for document flow
    display: component.style?.display || getDefaultDisplay(component.type),
    flexDirection: component.style?.flexDirection,
    justifyContent: component.style?.justifyContent,
    alignItems: component.style?.alignItems,
    gap: component.style?.gap,
    gridTemplateColumns: component.style?.gridTemplateColumns,
    width: component.style?.width || getDefaultWidth(component.type),
    minHeight: component.style?.minHeight || getDefaultMinHeight(component.type),
    padding: component.style?.padding || getDefaultPadding(component.type),
    ...component.style
  };

  return (
     <motion.div
      key={component.id}
      data-component-id={component.id}
      data-depth={depth}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        outline: isSelected ? '2px solid var(--color-primary)' : 'none',
        outlineOffset: isSelected ? '2px' : '0px'
      }}
      className={`
        relative group transition-all
        ${component.animation?.cssClass || ''}
        ${isLayout ? 'layout-container' : 'layout-element'}
      `}
      style={{
        ...componentStyles,
        cursor: !isLayout ? 'move' : 'default' // ADD THIS
      }}
      onClick={(e) => {
        e.stopPropagation();
        onComponentClick(component.id, e);
      }}
      onMouseDown={!isLayout ? (e) => handleComponentMouseDown(e, component.id) : undefined} // ADD THIS
    >
      {/* Layout Container Content */}
      {isLayout ? (
        <div className="w-full h-full relative" style={{ minHeight: componentStyles.minHeight }}>
          {/* Drop Zone Indicator */}
          {component.children?.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50/50">
              <span className="text-sm text-gray-400 font-medium">
                Drop elements here
              </span>
            </div>
          )}
          
          {/* Render children */}
          {component.children?.map((child, childIndex) => 
            renderComponent(child, childIndex, {}, depth + 1)
          )}
        </div>
      ) : (
        // Regular element content
        renderedContent
      )}
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -inset-1 pointer-events-none rounded z-50" 
             style={{ outline: '2px solid var(--color-primary)' }}>
          <div className="absolute -top-7 left-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap z-50"
               style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
            {component.name} • Depth: {depth}
          </div>
        </div>
      )}
      
      {/* Layout Container Label */}
      {isLayout && (
        <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-white border shadow-sm z-10"
             style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
          {component.type.toUpperCase()}
        </div>
      )}
    </motion.div>
  );
}, [componentLibraryService, selectedComponent, onComponentClick]);

  // Helper functions for default styling
  const getDefaultDisplay = (componentType) => {
    const displayMap = {
      'nav': 'flex',
      'header': 'block',
      'main': 'block',
      'section': 'block',
      'footer': 'block',
      'div': 'block',
      'article': 'block',
      'aside': 'block',
      'h1': 'block',
      'h2': 'block',
      'h3': 'block',
      'h4': 'block',
      'h5': 'block',
      'h6': 'block',
      'p': 'block',
      'span': 'inline',
      'a': 'inline',
      'button': 'inline-flex',
      'input': 'block',
      'textarea': 'block',
      'img': 'block',
      'video': 'block',
      'iframe': 'block'
    };
    return displayMap[componentType] || 'block';
  };

  const getDefaultWidth = (componentType) => {
    const widthMap = {
      'section': '100%',
      'header': '100%',
      'main': '100%',
      'footer': '100%',
      'nav': '100%',
      'div': '100%',
      'article': '100%',
      'aside': '300px',
      'button': 'fit-content',
      'input': '100%',
      'textarea': '100%'
    };
    return widthMap[componentType] || 'auto';
  };

  const getDefaultMinHeight = (componentType) => {
    const minHeightMap = {
      'section': '200px',
      'header': '80px',
      'main': '400px',
      'footer': '120px',
      'nav': '60px',
      'div': '50px',
      'article': '200px',
      'aside': '200px',
      'button': '40px',
      'input': '40px',
      'textarea': '80px'
    };
    return minHeightMap[componentType] || 'auto';
  };

  const getDefaultMaxWidth = (componentType) => {
    const maxWidthMap = {
      'button': '300px',
      'input': '500px',
      'textarea': '600px',
      'badge': '200px',
      'avatar': '200px'
    };
    return maxWidthMap[componentType] || 'none';
  };

  const getDefaultPadding = (componentType) => {
    const paddingMap = {
      'section': '48px 24px',
      'header': '24px',
      'main': '48px 24px',
      'footer': '32px 24px',
      'nav': '0 24px',
      'div': '24px',
      'article': '32px',
      'aside': '24px',
      'button': '12px 24px',
      'input': '12px 16px',
      'textarea': '12px 16px'
    };
    return paddingMap[componentType] || '0';
  };

  // Quick action buttons for selected component
  const renderComponentActions = useCallback((component) => {
    if (selectedComponent !== component.id) return null;

    return (
      <div className="absolute -top-8 right-0 flex gap-1 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPropertyUpdate(component.id, 'reset');
          }}
          className="w-6 h-6 rounded flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)'
          }}
          title="Reset styles"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            const newComponent = {
              ...component,
              id: `${component.type}_${Date.now()}`,
              position: { x: component.position.x + 20, y: component.position.y + 20 }
            };
            // Handle duplication
          }}
          className="w-6 h-6 rounded flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)'
          }}
          title="Duplicate"
        >
          <Square className="w-3 h-3" />
        </button>
      </div>
    );
  }, [selectedComponent, onPropertyUpdate]);

  return (
    <div className="w-full max-w-none flex justify-center" style={{ backgroundColor: 'transparent' }}>
      {/* Responsive Canvas Container */}
      <div
        className={`
          relative transition-all duration-500 ease-in-out overflow-visible
          ${isFrameSwitching ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
          ${responsiveMode !== 'desktop' ? 'shadow-2xl' : ''}
        `}
        style={{ 
          width: canvasSize.width,
          maxWidth: canvasSize.maxWidth,
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'center top'
        }}
      >
        {/* Device-Specific Browser Frame */}
        {responsiveMode === 'desktop' && (
          /* MacBook-Style Browser Tab Frame */
          <div 
            className="relative mb-0 rounded-t-xl overflow-hidden pointer-events-none"
            style={{
              backgroundColor: '#f5f5f7',
              border: '1px solid #d1d5db',
              borderBottom: 'none'
            }}
          >
            {/* Tab Bar */}
            <div 
              className="flex items-center px-4 py-2 border-b"
              style={{ 
                backgroundColor: '#e5e7eb',
                borderBottomColor: '#d1d5db'
              }}
            >
              {/* Traffic Light Buttons */}
              <div className="flex items-center gap-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              
              {/* Active Tab */}
              <div 
                className="flex items-center gap-2 px-4 py-1 rounded-t-lg relative"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid #d1d5db',
                  borderBottom: 'none',
                  minWidth: '200px'
                }}
              >
                {/* Tab Favicon */}
                <div className="w-4 h-4 rounded-sm flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                  D
                </div>
                
                {/* Tab Title */}
                <span className="text-sm font-medium flex-1 truncate" style={{ color: 'var(--color-text)' }}>
                  DeCode - {currentFrame} ({responsiveMode})
                </span>
                
                {/* Tab Close Button */}
                <div className="w-4 h-4 rounded-sm flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              
              {/* New Tab Button */}
              <div className="ml-2 w-8 h-8 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              
              {/* Browser Controls */}
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <div className="w-6 h-6 rounded flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="w-6 h-6 rounded flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Address Bar */}
            <div className="flex items-center px-4 py-2 gap-3">
              {/* Security Icon */}
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Address Bar Input */}
              <div 
                className="flex-1 px-3 py-1 rounded-md text-sm flex items-center gap-2"
                style={{ 
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  color: '#6b7280'
                }}
              >
                <span>https://</span>
                <span style={{ color: 'var(--color-text)' }}>decode.app/forge/{currentFrame}</span>
                <div className="ml-auto flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              
              {/* Profile Avatar */}
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                  U
                </div>
              </div>
            </div>
          </div>
        )}

        {responsiveMode === 'tablet' && (
          /* iPad-Style Safari Frame */
          <div 
            className="relative mb-0 rounded-t-2xl overflow-hidden pointer-events-none"
            style={{
              backgroundColor: '#f2f2f7',
              border: '1px solid #d1d5db',
              borderBottom: 'none'
            }}
          >
            {/* Safari Address Bar */}
            <div 
              className="flex items-center px-4 py-3 gap-3"
              style={{ 
                backgroundColor: '#ffffff',
                borderBottomColor: '#d1d5db'
              }}
            >
              {/* Navigation Buttons */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              {/* Address Bar */}
              <div 
                className="flex-1 mx-4 px-4 py-2 rounded-full text-sm flex items-center gap-2"
                style={{ 
                  backgroundColor: '#f2f2f7',
                  border: '1px solid #e5e5ea'
                }}
              >
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span style={{ color: 'var(--color-text)' }}>decode.app/forge/{currentFrame}</span>
                <div className="ml-auto">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              
              {/* Share Button */}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {responsiveMode === 'mobile' && (
          /* iPhone-Style Safari Frame */
          <div 
            className="relative mb-0 overflow-hidden pointer-events-none"
            style={{
              backgroundColor: '#f2f2f7',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
              border: '1px solid #d1d5db',
              borderBottom: 'none'
            }}
          >
            {/* Safari Address Bar */}
            <div 
              className="flex items-center px-3 py-2 gap-2"
              style={{ 
                backgroundColor: '#ffffff'
              }}
            >
              {/* Address Bar Input */}
              <div 
                className="flex-1 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                style={{ 
                  backgroundColor: '#f2f2f7',
                  border: '1px solid #e5e5ea'
                }}
              >
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs truncate" style={{ color: 'var(--color-text)' }}>decode.app</span>
                <div className="ml-auto">
                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              
              {/* Menu Button */}
              <div className="w-6 h-6 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </div>
            </div>
          </div>
        )}
        {/* Device Frame for Mobile/Tablet */}
        {responsiveMode !== 'desktop' && (
          <div 
            className="absolute -inset-4 rounded-[2rem] shadow-2xl border-8 pointer-events-none"
            style={{ 
              borderColor: '#1f2937',
              backgroundColor: '#111827'
            }}
          >
            {/* Device notch for mobile */}
            {responsiveMode === 'mobile' && (
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 rounded-b-xl"
                style={{ backgroundColor: '#111827' }}
              />
            )}
            
            {/* Device info label */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div 
                className="px-3 py-1 rounded-full text-xs flex items-center gap-2 font-medium"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)'
                }}
              >
                {responsiveMode === 'mobile' ? <Smartphone className="w-3 h-3" /> : <Tablet className="w-3 h-3" />}
                {canvasSize.deviceName} ({canvasSize.width}px)
                {zoomLevel !== 100 && <span>• {zoomLevel}%</span>}
              </div>
            </div>

            {/* Mobile/Tablet Browser Tabs at top of device frame */}
            {responsiveMode === 'tablet' && (
              <div 
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1"
                style={{ width: 'calc(100% - 32px)' }}
              >
                {/* Tab 1 - Active */}
                <div 
                  className="flex-1 h-6 rounded-t-lg flex items-center px-2 gap-1 max-w-[120px]"
                  style={{ 
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderBottom: 'none'
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                  <span className="text-[8px] truncate" style={{ color: 'var(--color-text)' }}>DeCode</span>
                </div>
                
                {/* Tab 2 - Inactive */}
                <div 
                  className="w-8 h-5 rounded-t-lg flex items-center justify-center"
                  style={{ 
                    backgroundColor: '#e5e7eb',
                    border: '1px solid #d1d5db',
                    borderBottom: 'none'
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                </div>
                
                {/* New Tab Button */}
                <div 
                  className="w-6 h-5 rounded-t-lg flex items-center justify-center"
                  style={{ backgroundColor: '#f3f4f6' }}
                >
                  <svg className="w-2 h-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            )}

            {responsiveMode === 'mobile' && (
              <div 
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-0.5"
                style={{ width: 'calc(100% - 24px)' }}
              >
                {/* Active Tab */}
                <div 
                  className="flex-1 h-4 rounded-t-md flex items-center px-1.5 gap-1 max-w-[80px]"
                  style={{ 
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderBottom: 'none'
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                  <span className="text-[6px] truncate" style={{ color: 'var(--color-text)' }}>DeCode</span>
                </div>
                
                {/* Inactive Tab */}
                <div 
                  className="w-6 h-3 rounded-t-md flex items-center justify-center"
                  style={{ 
                    backgroundColor: '#e5e7eb',
                    border: '1px solid #d1d5db',
                    borderBottom: 'none'
                  }}
                >
                  <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                </div>

                {/* New Tab Button */}
                <div 
                  className="w-5 h-3 rounded-t-md flex items-center justify-center"
                  style={{ backgroundColor: '#f3f4f6' }}
                >
                  <svg className="w-1.5 h-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Canvas - Acts as Document Body */}
        <div 
          ref={canvasRef}
          className={`
            relative overflow-visible transition-all duration-500
            ${canvasClasses}
            ${isFrameSwitching ? 'opacity-50 pointer-events-none' : ''}
          `}
          style={{
            width: '100%',
            minHeight: responsiveMode === 'desktop' ? '100vh' : '667px',
            height: responsiveMode === 'desktop' ? 'auto' : `${canvasSize.height}px`, // ADD THIS
            maxWidth: canvasSize.maxWidth,
            backgroundColor: 'var(--color-surface)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            lineHeight: '1.6',
            color: 'var(--color-text)',
            cursor: dragState.isDragging ? 'copy' : 'default',
            borderRadius: responsiveMode !== 'desktop' ? '1rem' : '0',
            boxShadow: responsiveMode !== 'desktop' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none',
            position: 'relative' // ADD THIS
          }}
          onDragOver={onCanvasDragOver}
          onDrop={onCanvasDrop}
          onClick={onCanvasClick}
        >
          {/* Canvas Grid Background - Only show if enabled */}
          {gridVisible && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 z-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, var(--color-border) 1px, transparent 1px),
                  linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
          )}
          
          
          {/* ADD HERE - Drag Snap Lines */}
          {DragSnapLines && dragPosition && dragState.isDragging && (
            <DragSnapLines
              dragPosition={dragPosition}
              canvasComponents={canvasComponents}
              canvasRef={canvasRef}
            />
          )}
          
          {/* ADD HERE - Selection Overlay for selected component */}
          {SelectionOverlay && selectedComponent && selectedComponent !== '__canvas_root__' && (
            <SelectionOverlay
              componentId={selectedComponent}
              canvasRef={canvasRef}
            />
          )}
                    
          
         {/* Drop Zone Indicator - ONLY show when canvas is empty */}
        {dragState.isDragging && canvasComponents.length === 0 && (
          <div 
            className="absolute inset-0 border-4 border-dashed flex items-center justify-center z-50"
            style={{ 
              borderColor: 'var(--color-primary)',
              backgroundColor: 'rgba(160, 82, 255, 0.05)',
              backdropFilter: 'blur(2px)',
              borderRadius: responsiveMode !== 'desktop' ? '1rem' : '0'
            }}
          >
            <div 
              className="font-medium text-lg px-6 py-3 rounded-xl"
              style={{ 
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-surface)',
                border: '2px solid var(--color-primary)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              Drop {dragState.draggedComponent?.name || 'component'} here
            </div>
          </div>
        )}

          {/* Render Components in Document Flow */}
          <div className="relative z-10" style={{ minHeight: '100%' }}>
            {canvasComponents.length === 0 && !dragState.isDragging ? (
              <EmptyCanvasState
                frameType={frameType}
                onAddSection={() => {
                  // Auto-add a section
                  const sectionComponent = componentLibraryService?.createLayoutElement('section');
                  if (sectionComponent && onPropertyUpdate) {
                    onPropertyUpdate('canvas', [...canvasComponents, sectionComponent]);
                  }
                }}
                onDragOver={onCanvasDragOver}
                onDrop={onCanvasDrop}
                isDragOver={dragState.isDragging}
              />
            ) : (
              <AnimatePresence>
                {canvasComponents.map((component, index) => renderComponent(component, index))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar - Only for Desktop */}
      {responsiveMode === 'desktop' && canvasComponents.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div 
            className="inline-flex items-center gap-4 text-sm px-4 py-2 rounded-full shadow-lg backdrop-blur-sm"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid var(--color-border)'
            }}
          >
            <span>{canvasComponents.length} components</span>
            {selectedComponent && (
              <span style={{ color: 'var(--color-primary)' }}>
                {canvasComponents.find(c => c.id === selectedComponent)?.name || 'Selected'} 
                • {canvasComponents.find(c => c.id === selectedComponent)?.style?.display || 'block'}
              </span>
            )}
            <span style={{ color: 'var(--color-border)' }}>|</span>
            <span>{canvasSize.deviceName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasComponent;