// @/Components/Forge/DragSnapLines.jsx
import React from 'react';

const DragSnapLines = ({ dragPosition, canvasComponents, canvasRef }) => {
  if (!dragPosition || !canvasRef.current) return null;

  const snapThreshold = 5; // pixels
  const snapLines = [];
  
  const canvasRect = canvasRef.current.getBoundingClientRect();
  
  // Check snap points against all components
  canvasComponents.forEach(comp => {
    const element = document.querySelector(`[data-component-id="${comp.id}"]`);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const relativeRect = {
      top: rect.top - canvasRect.top,
      left: rect.left - canvasRect.left,
      right: rect.right - canvasRect.left,
      bottom: rect.bottom - canvasRect.top,
      centerX: (rect.left + rect.right) / 2 - canvasRect.left,
      centerY: (rect.top + rect.bottom) / 2 - canvasRect.top
    };

    // Vertical snap lines
    if (Math.abs(dragPosition.x - relativeRect.left) < snapThreshold) {
      snapLines.push({ type: 'vertical', position: relativeRect.left, label: '0px' });
    }
    if (Math.abs(dragPosition.x - relativeRect.right) < snapThreshold) {
      snapLines.push({ type: 'vertical', position: relativeRect.right, label: '0px' });
    }
    if (Math.abs(dragPosition.x - relativeRect.centerX) < snapThreshold) {
      snapLines.push({ type: 'vertical', position: relativeRect.centerX, label: 'center' });
    }

    // Horizontal snap lines
    if (Math.abs(dragPosition.y - relativeRect.top) < snapThreshold) {
      snapLines.push({ type: 'horizontal', position: relativeRect.top, label: '0px' });
    }
    if (Math.abs(dragPosition.y - relativeRect.bottom) < snapThreshold) {
      snapLines.push({ type: 'horizontal', position: relativeRect.bottom, label: '0px' });
    }
    if (Math.abs(dragPosition.y - relativeRect.centerY) < snapThreshold) {
      snapLines.push({ type: 'horizontal', position: relativeRect.centerY, label: 'center' });
    }

    // Gap measurements
    const gap = Math.abs(dragPosition.y - relativeRect.bottom);
    if (gap > 0 && gap < 50) {
      snapLines.push({
        type: 'gap-vertical',
        start: relativeRect.bottom,
        end: dragPosition.y,
        label: `${Math.round(gap)}px`
      });
    }
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {snapLines.map((line, idx) => {
        if (line.type === 'vertical') {
          return (
            <div
              key={`v-${idx}`}
              className="absolute w-px bg-blue-500"
              style={{
                left: line.position,
                top: 0,
                bottom: 0,
                boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)'
              }}
            >
              <span className="absolute top-2 left-2 text-xs font-mono bg-blue-500 text-white px-1 rounded">
                {line.label}
              </span>
            </div>
          );
        }
        
        if (line.type === 'horizontal') {
          return (
            <div
              key={`h-${idx}`}
              className="absolute h-px bg-blue-500"
              style={{
                top: line.position,
                left: 0,
                right: 0,
                boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)'
              }}
            >
              <span className="absolute left-2 top-2 text-xs font-mono bg-blue-500 text-white px-1 rounded">
                {line.label}
              </span>
            </div>
          );
        }

        if (line.type === 'gap-vertical') {
          return (
            <div
              key={`gap-${idx}`}
              className="absolute"
              style={{
                left: dragPosition.x + 20,
                top: Math.min(line.start, line.end),
                height: Math.abs(line.end - line.start)
              }}
            >
              <div className="relative h-full w-px bg-purple-500">
                <div className="absolute top-0 w-2 h-px bg-purple-500 -left-0.5"></div>
                <div className="absolute bottom-0 w-2 h-px bg-purple-500 -left-0.5"></div>
                <span className="absolute top-1/2 -translate-y-1/2 left-2 text-xs font-mono bg-purple-500 text-white px-1 rounded whitespace-nowrap">
                  {line.label}
                </span>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default DragSnapLines;