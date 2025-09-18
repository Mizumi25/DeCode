import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Sparkles, Monitor, Tablet, Smartphone, Move, RotateCcw } from 'lucide-react';

import { useEditorStore } from '@/stores/useEditorStore';
import { useForgeUndoRedoStore } from '@/stores/useForgeUndoRedoStore';

const CanvasComponent = ({
  canvasRef,
  canvasComponents,
  selectedComponent,
  dragState,
  componentLibraryService,
  onCanvasDragOver,
  onCanvasDrop,
  onCanvasClick,
  onComponentClick,
  isMobile,
  currentFrame,
  isFrameSwitching,
  onPropertyUpdate // Add this prop for direct canvas editing
}) => {
  // Get responsive state from EditorStore
  const {
    responsiveMode,
    getCurrentCanvasDimensions,
    getResponsiveDeviceInfo,
    getResponsiveScaleFactor,
    getResponsiveCanvasClasses,
    getResponsiveGridBackground,
    gridVisible,
    zoomLevel
  } = useEditorStore();
  
  // Get undo/redo functionality
  const { pushHistory, actionTypes } = useForgeUndoRedoStore();

  // Local state for canvas dimensions and interactions
  const [canvasDimensions, setCanvasDimensions] = useState(() => getCurrentCanvasDimensions());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingComponent, setResizingComponent] = useState(null);

  // Get responsive device info
  const deviceInfo = getResponsiveDeviceInfo();
  const scaleFactor = getResponsiveScaleFactor();
  const canvasClasses = getResponsiveCanvasClasses();
  const gridBackground = getResponsiveGridBackground();

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
      
      // Constrain to canvas bounds
      const constrainedX = Math.max(0, Math.min(newX, deviceInfo.width - 100));
      const constrainedY = Math.max(0, Math.min(newY, deviceInfo.height - 50));
      
      // Check if actually moved significantly (avoid micro-movements)
      const deltaX = Math.abs(constrainedX - initialPosition.x);
      const deltaY = Math.abs(constrainedY - initialPosition.y);
      
      if (deltaX > 1 || deltaY > 1) {
        hasMoved = true;
      }
      
      onPropertyUpdate(componentId, 'position', { x: constrainedX, y: constrainedY });
    };
    
    const handleMouseUp = () => {
      setIsDraggingComponent(false);
      
      // Only push to history if component actually moved significantly
      if (hasMoved && currentFrame && pushHistory && actionTypes) {
        const finalPosition = canvasComponents.find(c => c.id === componentId)?.position;
        if (finalPosition) {
          // Get updated components array for history
          const updatedComponents = canvasComponents.map(c => 
            c.id === componentId ? { ...c, position: finalPosition } : c
          );
          
          pushHistory(currentFrame, updatedComponents, actionTypes.MOVE, {
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
  }, [canvasComponents, dragOffset, onPropertyUpdate, onComponentClick, deviceInfo]);

  // Enhanced component rendering with direct manipulation
  const renderComponent = useCallback((component) => {
    const componentRenderer = componentLibraryService?.getComponent(component.type);
    const isSelected = selectedComponent === component.id;
    
    // Enhanced styles with layout properties
    const componentStyles = {
      // Position and layout
      position: component.style?.position || 'absolute',
      display: component.style?.display || 'block',
      
      // Flexbox properties
      flexDirection: component.style?.flexDirection,
      justifyContent: component.style?.justifyContent,
      alignItems: component.style?.alignItems,
      flexWrap: component.style?.flexWrap,
      gap: component.style?.gap,
      
      // Grid properties
      gridTemplateColumns: component.style?.gridTemplateColumns,
      gridTemplateRows: component.style?.gridTemplateRows,
      gridGap: component.style?.gridGap,
      
      // Sizing
      width: component.style?.width || 'auto',
      height: component.style?.height || 'auto',
      minWidth: component.style?.minWidth,
      minHeight: component.style?.minHeight,
      maxWidth: component.style?.maxWidth,
      maxHeight: component.style?.maxHeight,
      
      // Spacing
      margin: component.style?.margin,
      padding: component.style?.padding,
      
      // Visual properties
      backgroundColor: component.style?.backgroundColor,
      border: component.style?.border,
      borderRadius: component.style?.borderRadius,
      boxShadow: component.style?.boxShadow,
      opacity: component.style?.opacity,
      transform: component.style?.transform,
      
      // Overflow handling
      overflow: 'hidden',
      wordBreak: 'break-word',
      boxSizing: 'border-box'
    };

    // Use component library renderer if available
    if (componentRenderer && componentRenderer.render) {
      try {
        return (
          <div style={componentStyles}>
            {componentRenderer.render(component.props, component.id)}
          </div>
        );
      } catch (error) {
        console.warn('Component render error:', error);
      }
    }

    // Fallback to simple component representation
    return (
      <div 
        style={componentStyles}
        className="bg-white border rounded-lg p-3 min-w-[100px] min-h-[40px] flex items-center justify-center"
      >
        <span className="text-sm font-medium text-gray-700 truncate">
          {component.name || component.type}
        </span>
      </div>
    );
  }, [componentLibraryService, selectedComponent]);

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
          className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
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
            // You'd need to add a duplicate handler prop
          }}
          className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
          title="Duplicate"
        >
          <Square className="w-3 h-3" />
        </button>
      </div>
    );
  }, [selectedComponent, onPropertyUpdate]);

  return (
    <div className="w-full max-w-6xl">
      {/* Minimal Header - Focus on Canvas */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          {responsiveMode !== 'desktop' && (
            <>
              {responsiveMode === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Tablet className="w-4 h-4" />}
              <span>{deviceInfo.deviceName} ({deviceInfo.width}×{deviceInfo.height})</span>
            </>
          )}
          {zoomLevel !== 100 && <span>• {zoomLevel}%</span>}
        </div>
      </div>

      {/* Enhanced Canvas Area - Pure WYSIWYG */}
      <div className="flex justify-center">
        <div
          className={`relative transition-all duration-500 ease-in-out ${
            isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}
          style={{
            width: canvasDimensions.width,
            maxWidth: canvasDimensions.maxWidth,
            minHeight: canvasDimensions.minHeight
          }}
        >
          {/* Main Canvas */}
          <div 
            ref={canvasRef}
            className={`
              bg-white border-2 relative overflow-hidden transition-all duration-500
              ${canvasClasses}
              ${isFrameSwitching || isTransitioning ? 'opacity-50 pointer-events-none' : ''}
              ${gridVisible ? 'bg-grid-pattern' : ''}
            `}
            style={{
              width: canvasDimensions.width,
              height: canvasDimensions.height,
              minHeight: canvasDimensions.minHeight,
              ...gridBackground,
              cursor: dragState.isDragging ? 'copy' : 'default'
            }}
            onDragOver={onCanvasDragOver}
            onDrop={onCanvasDrop}
            onClick={onCanvasClick}
          >
            {/* Canvas Grid */}
            {gridVisible && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />
            )}

            {/* Drop Zone Indicator */}
            {dragState.isDragging && (
              <div className="absolute inset-0 border-4 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 flex items-center justify-center z-10">
                <div className="text-blue-600 font-medium text-lg">
                  Drop {dragState.draggedComponent?.name || 'component'} here
                </div>
              </div>
            )}

            {/* Render Components with Direct Manipulation */}
            <AnimatePresence>
              {canvasComponents.map((component) => {
                const isSelected = selectedComponent === component.id;
                
                return (
                  <motion.div
                    key={component.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      boxShadow: isSelected ? '0 0 0 2px #3b82f6, 0 0 20px rgba(59, 130, 246, 0.3)' : 'none'
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute cursor-move group"
                    style={{
                      left: component.position.x,
                      top: component.position.y,
                      zIndex: isSelected ? 999 : component.style?.zIndex || 1
                    }}
                    onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
                    onClick={(e) => onComponentClick(component.id, e)}
                  >
                    {/* Component Content */}
                    {renderComponent(component)}
                    
                    {/* Selection Outline and Handles */}
                    {isSelected && (
                      <>
                        {/* Selection outline */}
                        <div className="absolute -inset-1 border-2 border-blue-500 pointer-events-none rounded">
                          {/* Resize handles */}
                          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        
                        {/* Component label */}
                        <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap">
                          {component.name || component.type}
                          {component.style?.display && component.style.display !== 'block' && (
                            <span className="opacity-75"> • {component.style.display}</span>
                          )}
                        </div>
                      </>
                    )}
                    
                    {/* Quick Actions */}
                    {renderComponentActions(component)}
                    
                    {/* Hover state for unselected components */}
                    {!isSelected && (
                      <div className="absolute inset-0 border border-transparent group-hover:border-gray-300 group-hover:bg-blue-50 group-hover:bg-opacity-20 pointer-events-none rounded"></div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty Canvas State */}
            {canvasComponents.length === 0 && !dragState.isDragging && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Square className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium">Start building</p>
                  <p className="text-sm">Drag components from the sidebar</p>
                </div>
              </div>
            )}
          </div>

          {/* Device Frame (for mobile/tablet) */}
          {responsiveMode !== 'desktop' && (
            <div className="absolute -inset-3 border border-gray-300 rounded-3xl pointer-events-none opacity-30">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  {responsiveMode === 'mobile' ? <Smartphone className="w-3 h-3" /> : <Tablet className="w-3 h-3" />}
                  {deviceInfo.deviceName}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Minimal Status Bar */}
      {canvasComponents.length > 0 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-4 text-sm text-gray-600 bg-white border rounded-full px-4 py-2 shadow-sm">
            <span>{canvasComponents.length} components</span>
            {selectedComponent && (
              <span className="text-blue-600">
                {canvasComponents.find(c => c.id === selectedComponent)?.name || 'Selected'} 
                • {canvasComponents.find(c => c.id === selectedComponent)?.style?.display || 'block'}
              </span>
            )}
            <span className="text-gray-400">|</span>
            <span>{deviceInfo.deviceName}</span>
          </div>
        </div>
      )}

      {/* CSS Grid Pattern */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #f3f4f6 1px, transparent 1px),
            linear-gradient(to bottom, #f3f4f6 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .cursor-move {
          cursor: move;
        }
        
        .cursor-move:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

export default CanvasComponent;