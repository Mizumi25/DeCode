// @/Components/Forge/IntelligentDropZones.jsx - NEW FILE
import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';

const IntelligentDropZones = ({ container, componentStyles, depth, onDropInZone }) => {
  const dropZones = useMemo(() => {
    const zones = [];
    const childCount = container.children?.length || 0;
    
    // Determine layout type
    const isFlexRow = componentStyles.display === 'flex' && 
                      (!componentStyles.flexDirection || componentStyles.flexDirection === 'row');
    const isFlexCol = componentStyles.display === 'flex' && 
                      componentStyles.flexDirection === 'column';
    const isGrid = componentStyles.display === 'grid';
    
    if (isGrid) {
      // Parse grid columns (e.g., "repeat(4, 1fr)" or "1fr 1fr 1fr 1fr")
      const gridCols = componentStyles.gridTemplateColumns;
      let columnCount = 3; // default
      
      if (gridCols) {
        const repeatMatch = gridCols.match(/repeat\((\d+),/);
        if (repeatMatch) {
          columnCount = parseInt(repeatMatch[1]);
        } else {
          columnCount = (gridCols.match(/1fr/g) || []).length;
        }
      }
      
      // Create drop zones for each grid cell
      for (let i = 0; i < columnCount; i++) {
        zones.push({
          type: 'grid-cell',
          index: i,
          style: {
            gridColumn: i + 1,
            gridRow: 1
          }
        });
      }
    } else if (isFlexRow) {
      // Horizontal flex: show zones between children + start/end
      zones.push({ type: 'flex-start', index: 0 });
      
      for (let i = 0; i < childCount; i++) {
        zones.push({ type: 'flex-between', index: i + 1 });
      }
      
      if (childCount === 0) {
        zones.push({ type: 'flex-center', index: 0 });
      }
    } else if (isFlexCol) {
      // Vertical flex: show zones between children + start/end
      zones.push({ type: 'flex-start', index: 0 });
      
      for (let i = 0; i < childCount; i++) {
        zones.push({ type: 'flex-between', index: i + 1 });
      }
      
      if (childCount === 0) {
        zones.push({ type: 'flex-center', index: 0 });
      }
    } else {
      // Block layout: single center drop zone
      zones.push({ type: 'block-center', index: childCount });
    }
    
    return zones;
  }, [container.children, componentStyles]);
  
  return (
    <>
      {dropZones.map((zone, idx) => (
        <DropZone
          key={`${container.id}-zone-${idx}`}
          zone={zone}
          componentStyles={componentStyles}
          depth={depth}
          onDrop={() => onDropInZone(zone.index)}
        />
      ))}
    </>
  );
};

const DropZone = ({ zone, componentStyles, depth, onDrop }) => {
  const getZoneStyles = () => {
    const gap = parseInt(componentStyles.gap) || 0;
    
    switch (zone.type) {
      case 'grid-cell':
        return {
          position: 'absolute',
          inset: '4px',
          gridColumn: zone.style.gridColumn,
          gridRow: zone.style.gridRow,
          border: '2px dashed rgba(59, 130, 246, 0.5)',
          borderRadius: '8px',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          zIndex: 100 + depth
        };
      
      case 'flex-start':
        return {
          position: 'absolute',
          [componentStyles.flexDirection === 'column' ? 'top' : 'left']: '4px',
          [componentStyles.flexDirection === 'column' ? 'left' : 'top']: '4px',
          [componentStyles.flexDirection === 'column' ? 'right' : 'bottom']: '4px',
          [componentStyles.flexDirection === 'column' ? 'height' : 'width']: '60px',
          border: '2px dashed rgba(59, 130, 246, 0.5)',
          borderRadius: '8px',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          zIndex: 100 + depth
        };
      
      case 'flex-between':
      case 'flex-center':
        return {
          position: 'absolute',
          inset: '4px',
          border: '2px dashed rgba(59, 130, 246, 0.5)',
          borderRadius: '8px',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          zIndex: 100 + depth
        };
      
      case 'block-center':
      default:
        return {
          position: 'absolute',
          inset: '8px',
          border: '2px dashed rgba(59, 130, 246, 0.5)',
          borderRadius: '8px',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          zIndex: 100 + depth
        };
    }
  };
  
  return (
    <div
      className="drop-zone-indicator opacity-0 hover:opacity-100 transition-opacity duration-200"
      style={getZoneStyles()}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.opacity = '0';
        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
      }}
    >
      <div className="flex flex-col items-center gap-1 text-blue-600 font-medium text-xs pointer-events-none">
        <Plus className="w-5 h-5" />
        <span>Drop Here</span>
        {zone.index !== undefined && (
          <span className="text-[10px] opacity-70">Position {zone.index}</span>
        )}
      </div>
    </div>
  );
};

export default IntelligentDropZones;