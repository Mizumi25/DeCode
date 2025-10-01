// @/Components/Forge/SelectionOverlay.jsx
import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore'; // ADD THIS

const SelectionOverlay = ({ componentId, canvasRef }) => {
  const [bounds, setBounds] = useState(null);
  const [computedStyles, setComputedStyles] = useState(null);
  
  // GET responsive mode and scale factor
  const { responsiveMode, getResponsiveScaleFactor } = useEditorStore();

   useEffect(() => {
    if (!componentId || !canvasRef.current) return;
  
    const updateBounds = () => {
      const element = document.querySelector(`[data-component-id="${componentId}"]`);
      if (!element) {
        setBounds(null);
        setComputedStyles(null);
        return;
      }
  
      const rect = element.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
  
      // CRITICAL FIX: Get actual scale from canvas transform or use responsive scale
      let scaleFactor = 1;
      
      if (responsiveMode !== 'desktop') {
        scaleFactor = getResponsiveScaleFactor();
      }
      
      // Also check if canvas has inline transform scale
      const canvasTransform = window.getComputedStyle(canvasRef.current).transform;
      if (canvasTransform && canvasTransform !== 'none') {
        const matrix = new DOMMatrix(canvasTransform);
        scaleFactor = matrix.a;
      }
  
      setBounds({
        top: (rect.top - canvasRect.top) / scaleFactor,
        left: (rect.left - canvasRect.left) / scaleFactor,
        width: rect.width / scaleFactor,
        height: rect.height / scaleFactor
      });
  
      setComputedStyles({
        marginTop: parseInt(styles.marginTop) || 0,
        marginRight: parseInt(styles.marginRight) || 0,
        marginBottom: parseInt(styles.marginBottom) || 0,
        marginLeft: parseInt(styles.marginLeft) || 0,
        paddingTop: parseInt(styles.paddingTop) || 0,
        paddingRight: parseInt(styles.paddingRight) || 0,
        paddingBottom: parseInt(styles.paddingBottom) || 0,
        paddingLeft: parseInt(styles.paddingLeft) || 0
      });
    };
  
    // Immediate update
    updateBounds();
    
    const observer = new ResizeObserver(updateBounds);
    const element = document.querySelector(`[data-component-id="${componentId}"]`);
    if (element) observer.observe(element);
    
    // Listen for responsive mode changes
    const handleModeChange = () => {
      console.log('SelectionOverlay: Responsive mode changed, updating bounds');
      setBounds(null);
      setComputedStyles(null);
      setTimeout(updateBounds, 150);
    };
    
    window.addEventListener('responsive-mode-changed', handleModeChange);
  
    return () => {
      observer.disconnect();
      window.removeEventListener('responsive-mode-changed', handleModeChange);
    };
  }, [componentId, canvasRef, responsiveMode, getResponsiveScaleFactor]);

  if (!bounds || !computedStyles) return null;

  // Calculate content area (after padding is applied)
  const contentArea = {
    top: bounds.top + computedStyles.paddingTop,
    left: bounds.left + computedStyles.paddingLeft,
    width: bounds.width - computedStyles.paddingLeft - computedStyles.paddingRight,
    height: bounds.height - computedStyles.paddingTop - computedStyles.paddingBottom
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40" style={{ overflow: 'visible' }}>
      {/* Margin Overlay - Orange */}
      {(computedStyles.marginTop > 0 || computedStyles.marginRight > 0 || 
        computedStyles.marginBottom > 0 || computedStyles.marginLeft > 0) && (
        <>
          {/* Top Margin */}
          {computedStyles.marginTop > 0 && (
            <div
              className="absolute"
              style={{
                top: bounds.top - computedStyles.marginTop,
                left: bounds.left,
                width: bounds.width,
                height: computedStyles.marginTop,
                backgroundColor: 'rgba(251, 146, 60, 0.15)',
                borderTop: '1px dashed rgba(251, 146, 60, 0.5)',
                borderBottom: '1px dashed rgba(251, 146, 60, 0.5)'
              }}
            >
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono bg-orange-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                {computedStyles.marginTop}
              </span>
            </div>
          )}

          {/* Right Margin */}
          {computedStyles.marginRight > 0 && (
            <div
              className="absolute"
              style={{
                top: bounds.top,
                left: bounds.left + bounds.width,
                width: computedStyles.marginRight,
                height: bounds.height,
                backgroundColor: 'rgba(251, 146, 60, 0.15)',
                borderLeft: '1px dashed rgba(251, 146, 60, 0.5)',
                borderRight: '1px dashed rgba(251, 146, 60, 0.5)'
              }}
            >
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono bg-orange-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                {computedStyles.marginRight}
              </span>
            </div>
          )}

          {/* Bottom Margin */}
          {computedStyles.marginBottom > 0 && (
            <div
              className="absolute"
              style={{
                top: bounds.top + bounds.height,
                left: bounds.left,
                width: bounds.width,
                height: computedStyles.marginBottom,
                backgroundColor: 'rgba(251, 146, 60, 0.15)',
                borderTop: '1px dashed rgba(251, 146, 60, 0.5)',
                borderBottom: '1px dashed rgba(251, 146, 60, 0.5)'
              }}
            >
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono bg-orange-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                {computedStyles.marginBottom}
              </span>
            </div>
          )}

          {/* Left Margin */}
          {computedStyles.marginLeft > 0 && (
            <div
              className="absolute"
              style={{
                top: bounds.top,
                left: bounds.left - computedStyles.marginLeft,
                width: computedStyles.marginLeft,
                height: bounds.height,
                backgroundColor: 'rgba(251, 146, 60, 0.15)',
                borderLeft: '1px dashed rgba(251, 146, 60, 0.5)',
                borderRight: '1px dashed rgba(251, 146, 60, 0.5)'
              }}
            >
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono bg-orange-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                {computedStyles.marginLeft}
              </span>
            </div>
          )}
        </>
      )}

      {/* Padding Overlay - Green */}
      {(computedStyles.paddingTop > 0 || computedStyles.paddingRight > 0 || 
        computedStyles.paddingBottom > 0 || computedStyles.paddingLeft > 0) && (
        <>
          {/* Top Padding */}
          {computedStyles.paddingTop > 0 && (
            <div
              className="absolute"
              style={{
                top: bounds.top,
                left: bounds.left,
                width: bounds.width,
                height: computedStyles.paddingTop,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderTop: '1px dashed rgba(34, 197, 94, 0.5)',
                borderBottom: '1px dashed rgba(34, 197, 94, 0.5)'
              }}
            >
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono bg-green-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                {computedStyles.paddingTop}
              </span>
            </div>
          )}

          {/* Right Padding */}
          {computedStyles.paddingRight > 0 && (
            <div
              className="absolute"
              style={{
                top: bounds.top,
                left: bounds.left + bounds.width - computedStyles.paddingRight,
                width: computedStyles.paddingRight,
                height: bounds.height,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderLeft: '1px dashed rgba(34, 197, 94, 0.5)',
                borderRight: '1px dashed rgba(34, 197, 94, 0.5)'
              }}
            >
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono bg-green-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                {computedStyles.paddingRight}
              </span>
            </div>
          )}

          {/* Bottom Padding */}
          {computedStyles.paddingBottom > 0 && (
            <div
              className="absolute"
              style={{
                top: bounds.top + bounds.height - computedStyles.paddingBottom,
                left: bounds.left,
                width: bounds.width,
                height: computedStyles.paddingBottom,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderTop: '1px dashed rgba(34, 197, 94, 0.5)',
                borderBottom: '1px dashed rgba(34, 197, 94, 0.5)'
              }}
            >
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono bg-green-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                {computedStyles.paddingBottom}
              </span>
            </div>
          )}

          {/* Left Padding */}
          {computedStyles.paddingLeft > 0 && (
            <div
              className="absolute"
              style={{
                top: bounds.top,
                left: bounds.left,
                width: computedStyles.paddingLeft,
                height: bounds.height,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderLeft: '1px dashed rgba(34, 197, 94, 0.5)',
                borderRight: '1px dashed rgba(34, 197, 94, 0.5)'
              }}
            >
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono bg-green-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                {computedStyles.paddingLeft}
              </span>
            </div>
          )}

          {/* Content Area Border */}
          <div
            className="absolute border border-dashed"
            style={{
              top: contentArea.top,
              left: contentArea.left,
              width: contentArea.width,
              height: contentArea.height,
              borderColor: 'rgba(59, 130, 246, 0.5)',
              pointerEvents: 'none'
            }}
          >
            <span className="absolute -top-5 left-0 text-[9px] font-mono bg-blue-500 text-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
              {Math.round(contentArea.width)} × {Math.round(contentArea.height)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default SelectionOverlay;