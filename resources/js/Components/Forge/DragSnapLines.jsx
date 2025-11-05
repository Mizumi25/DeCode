// @/Components/Forge/DragSnapLines.jsx - PROFESSIONAL SNAP SYSTEM
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/stores/useEditorStore';

/**
 * Professional drag snap lines system inspired by Figma/Framer
 * Features:
 * - Smart magnetic snapping to edges, centers, and spacing
 * - Distance measurements between components
 * - Visual feedback for valid drop zones
 * - Intelligent spacing suggestions
 * - Multi-directional snap detection
 */
const DragSnapLines = ({ 
  dragPosition, 
  canvasComponents, 
  canvasRef, 
  isDragging,
  draggedComponentId = null,
  ghostBounds = null 
}) => {
  const [snapLines, setSnapLines] = useState([]);
  const [spacingGuides, setSpacingGuides] = useState([]);
  const [hoveredTarget, setHoveredTarget] = useState(null);
  const [magneticSnap, setMagneticSnap] = useState(null);
  const [distanceMeasurements, setDistanceMeasurements] = useState([]);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  
  const { responsiveMode, getResponsiveScaleFactor, gridVisible } = useEditorStore();
  const lastSnapPosition = useRef(null);
  const snapThrottleTimer = useRef(null);

  // Configuration constants
  const CONFIG = useMemo(() => ({
    SNAP_THRESHOLD: 8, // Pixels within which snapping occurs
    MAGNETIC_THRESHOLD: 15, // Distance for magnetic pull effect
    HOVER_DISTANCE: 50, // Distance to show drop zone highlight
    SPACING_DETECTION: 30, // Distance to detect spacing patterns
    SMART_ALIGN_THRESHOLD: 100, // Distance for smart alignment suggestions
    MEASUREMENT_MIN_DISTANCE: 20, // Minimum distance to show measurements
    THROTTLE_MS: 16, // ~60fps throttling for performance
  }), []);

  // Colors for different snap types
  const COLORS = useMemo(() => ({
    EDGE_SNAP: '#3b82f6', // Blue for edge snaps
    CENTER_SNAP: '#8b5cf6', // Purple for center snaps
    SPACING_SNAP: '#10b981', // Green for spacing snaps
    CANVAS_SNAP: '#f59e0b', // Orange for canvas edges
    MAGNETIC_PULL: '#ec4899', // Pink for magnetic attraction
    DROP_ZONE: '#06b6d4', // Cyan for drop zones
    MEASUREMENT: '#6b7280', // Gray for measurements
  }), []);

  /**
   * Get all potential snap points from components
   */
  const getComponentSnapPoints = useCallback((component, canvasRect, scale) => {
    const element = document.querySelector(`[data-component-id="${component.id}"]`);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const relative = {
      top: (rect.top - canvasRect.top) / scale,
      left: (rect.left - canvasRect.left) / scale,
      right: (rect.right - canvasRect.left) / scale,
      bottom: (rect.bottom - canvasRect.top) / scale,
      centerX: ((rect.left + rect.right) / 2 - canvasRect.left) / scale,
      centerY: ((rect.top + rect.bottom) / 2 - canvasRect.top) / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    };

    return {
      id: component.id,
      name: component.name,
      type: component.type,
      isLayoutContainer: component.isLayoutContainer,
      bounds: relative,
      snapPoints: {
        // Horizontal snap points
        left: relative.left,
        right: relative.right,
        centerX: relative.centerX,
        // Vertical snap points
        top: relative.top,
        bottom: relative.bottom,
        centerY: relative.centerY,
      }
    };
  }, []);

  /**
   * Calculate canvas edge snap points
   */
  const getCanvasSnapPoints = useCallback((canvasRect, scale) => {
    const width = canvasRect.width / scale;
    const height = canvasRect.height / scale;

    return {
      snapPoints: {
        left: 0,
        right: width,
        centerX: width / 2,
        top: 0,
        bottom: height,
        centerY: height / 2,
      },
      grid: gridVisible ? {
        gridSize: 20,
        color: COLORS.CANVAS_SNAP,
      } : null,
    };
  }, [gridVisible, COLORS.CANVAS_SNAP]);

  /**
   * Detect spacing patterns between components
   */
  const detectSpacingPatterns = useCallback((snapData, dragPos) => {
    const patterns = [];
    const components = snapData.filter(d => d.id !== draggedComponentId);

    // Sort by distance to drag position
    const sorted = components.sort((a, b) => {
      const distA = Math.hypot(
        a.bounds.centerX - dragPos.x,
        a.bounds.centerY - dragPos.y
      );
      const distB = Math.hypot(
        b.bounds.centerX - dragPos.x,
        b.bounds.centerY - dragPos.y
      );
      return distA - distB;
    });

    // Detect horizontal spacing patterns
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      
      // Check if components are roughly aligned horizontally
      if (Math.abs(current.bounds.centerY - next.bounds.centerY) < 50) {
        const spacing = Math.abs(next.bounds.left - current.bounds.right);
        
        if (spacing > 10 && spacing < CONFIG.SPACING_DETECTION) {
          patterns.push({
            type: 'horizontal',
            spacing,
            between: [current.id, next.id],
            suggestedPosition: {
              x: current.bounds.right + spacing,
              y: current.bounds.centerY
            }
          });
        }
      }
    }

    // Detect vertical spacing patterns
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      
      // Check if components are roughly aligned vertically
      if (Math.abs(current.bounds.centerX - next.bounds.centerX) < 50) {
        const spacing = Math.abs(next.bounds.top - current.bounds.bottom);
        
        if (spacing > 10 && spacing < CONFIG.SPACING_DETECTION) {
          patterns.push({
            type: 'vertical',
            spacing,
            between: [current.id, next.id],
            suggestedPosition: {
              x: current.bounds.centerX,
              y: current.bounds.bottom + spacing
            }
          });
        }
      }
    }

    return patterns;
  }, [CONFIG.SPACING_DETECTION, draggedComponentId]);

  /**
   * Calculate distance measurements to nearby components
   */
  const calculateDistanceMeasurements = useCallback((snapData, dragPos, ghostSize) => {
    const measurements = [];
    const ghostBounds = {
      left: dragPos.x - (ghostSize?.width || 100) / 2,
      right: dragPos.x + (ghostSize?.width || 100) / 2,
      top: dragPos.y - (ghostSize?.height || 50) / 2,
      bottom: dragPos.y + (ghostSize?.height || 50) / 2,
    };

    snapData.forEach(comp => {
      if (comp.id === draggedComponentId) return;

      const bounds = comp.bounds;

      // Horizontal distances
      if (Math.abs(bounds.centerY - dragPos.y) < 100) {
        // Distance to left edge
        if (bounds.right < ghostBounds.left) {
          const distance = ghostBounds.left - bounds.right;
          if (distance >= CONFIG.MEASUREMENT_MIN_DISTANCE) {
            measurements.push({
              type: 'horizontal',
              distance: Math.round(distance),
              start: { x: bounds.right, y: bounds.centerY },
              end: { x: ghostBounds.left, y: bounds.centerY },
              label: `${Math.round(distance)}px`,
            });
          }
        }
        // Distance to right edge
        else if (bounds.left > ghostBounds.right) {
          const distance = bounds.left - ghostBounds.right;
          if (distance >= CONFIG.MEASUREMENT_MIN_DISTANCE) {
            measurements.push({
              type: 'horizontal',
              distance: Math.round(distance),
              start: { x: ghostBounds.right, y: bounds.centerY },
              end: { x: bounds.left, y: bounds.centerY },
              label: `${Math.round(distance)}px`,
            });
          }
        }
      }

      // Vertical distances
      if (Math.abs(bounds.centerX - dragPos.x) < 100) {
        // Distance to top edge
        if (bounds.bottom < ghostBounds.top) {
          const distance = ghostBounds.top - bounds.bottom;
          if (distance >= CONFIG.MEASUREMENT_MIN_DISTANCE) {
            measurements.push({
              type: 'vertical',
              distance: Math.round(distance),
              start: { x: bounds.centerX, y: bounds.bottom },
              end: { x: bounds.centerX, y: ghostBounds.top },
              label: `${Math.round(distance)}px`,
            });
          }
        }
        // Distance to bottom edge
        else if (bounds.top > ghostBounds.bottom) {
          const distance = bounds.top - ghostBounds.bottom;
          if (distance >= CONFIG.MEASUREMENT_MIN_DISTANCE) {
            measurements.push({
              type: 'vertical',
              distance: Math.round(distance),
              start: { x: bounds.centerX, y: ghostBounds.bottom },
              end: { x: bounds.centerX, y: bounds.top },
              label: `${Math.round(distance)}px`,
            });
          }
        }
      }
    });

    return measurements;
  }, [CONFIG.MEASUREMENT_MIN_DISTANCE, draggedComponentId]);

  /**
   * Find the best snap target
   */
  const findSnapTarget = useCallback((snapData, canvasSnaps, dragPos) => {
    const allSnaps = [];

    // Component snaps
    snapData.forEach(comp => {
      if (comp.id === draggedComponentId) return;

      Object.entries(comp.snapPoints).forEach(([key, value]) => {
        const isVertical = ['left', 'right', 'centerX'].includes(key);
        const distance = Math.abs(
          isVertical ? dragPos.x - value : dragPos.y - value
        );

        if (distance < CONFIG.SNAP_THRESHOLD) {
          allSnaps.push({
            type: isVertical ? 'vertical' : 'horizontal',
            position: value,
            distance,
            snapType: key,
            color: key.includes('center') ? COLORS.CENTER_SNAP : COLORS.EDGE_SNAP,
            source: comp.name,
            sourceId: comp.id,
            priority: key.includes('center') ? 2 : 1,
          });
        }
      });
    });

    // Canvas edge snaps
    Object.entries(canvasSnaps.snapPoints).forEach(([key, value]) => {
      const isVertical = ['left', 'right', 'centerX'].includes(key);
      const distance = Math.abs(
        isVertical ? dragPos.x - value : dragPos.y - value
      );

      if (distance < CONFIG.SNAP_THRESHOLD) {
        allSnaps.push({
          type: isVertical ? 'vertical' : 'horizontal',
          position: value,
          distance,
          snapType: key,
          color: COLORS.CANVAS_SNAP,
          source: 'Canvas',
          sourceId: 'canvas',
          priority: 0,
        });
      }
    });

    // Sort by priority and distance
    allSnaps.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.distance - b.distance;
    });

    return allSnaps;
  }, [CONFIG.SNAP_THRESHOLD, COLORS, draggedComponentId]);

  /**
   * Find valid drop targets (layout containers)
   */
  const findDropTargets = useCallback((snapData, dragPos) => {
    let closestTarget = null;
    let minDistance = CONFIG.HOVER_DISTANCE;

    snapData.forEach(comp => {
      if (!comp.isLayoutContainer || comp.id === draggedComponentId) return;

      const bounds = comp.bounds;
      const center = { x: bounds.centerX, y: bounds.centerY };
      const distance = Math.hypot(dragPos.x - center.x, dragPos.y - center.y);

      // Check if mouse is within bounds
      const isInside = 
        dragPos.x >= bounds.left &&
        dragPos.x <= bounds.right &&
        dragPos.y >= bounds.top &&
        dragPos.y <= bounds.bottom;

      if (isInside || distance < minDistance) {
        minDistance = distance;
        closestTarget = {
          id: comp.id,
          name: comp.name,
          type: comp.type,
          bounds,
          distance,
          isInside,
        };
      }
    });

    return closestTarget;
  }, [CONFIG.HOVER_DISTANCE, draggedComponentId]);

  /**
   * Check for magnetic snap effect
   */
  const checkMagneticSnap = useCallback((snapLines) => {
    if (snapLines.length === 0) return null;

    const strongestSnap = snapLines[0]; // Already sorted by priority
    
    if (strongestSnap.distance < CONFIG.MAGNETIC_THRESHOLD) {
      return {
        position: strongestSnap.position,
        type: strongestSnap.type,
        strength: 1 - (strongestSnap.distance / CONFIG.MAGNETIC_THRESHOLD),
        source: strongestSnap.source,
      };
    }

    return null;
  }, [CONFIG.MAGNETIC_THRESHOLD]);

  /**
   * Generate smart alignment suggestions
   */
  const generateSmartSuggestions = useCallback((snapData, dragPos) => {
    const suggestions = [];
    const nearbyComponents = snapData.filter(comp => {
      if (comp.id === draggedComponentId) return false;
      const distance = Math.hypot(
        comp.bounds.centerX - dragPos.x,
        comp.bounds.centerY - dragPos.y
      );
      return distance < CONFIG.SMART_ALIGN_THRESHOLD;
    });

    // Suggest horizontal alignment
    const horizontalGroups = {};
    nearbyComponents.forEach(comp => {
      const yKey = Math.round(comp.bounds.centerY / 10) * 10;
      if (!horizontalGroups[yKey]) horizontalGroups[yKey] = [];
      horizontalGroups[yKey].push(comp);
    });

    Object.entries(horizontalGroups).forEach(([y, group]) => {
      if (group.length >= 2) {
        suggestions.push({
          type: 'horizontal-align',
          position: parseFloat(y),
          count: group.length,
          components: group.map(c => c.id),
        });
      }
    });

    // Suggest vertical alignment
    const verticalGroups = {};
    nearbyComponents.forEach(comp => {
      const xKey = Math.round(comp.bounds.centerX / 10) * 10;
      if (!verticalGroups[xKey]) verticalGroups[xKey] = [];
      verticalGroups[xKey].push(comp);
    });

    Object.entries(verticalGroups).forEach(([x, group]) => {
      if (group.length >= 2) {
        suggestions.push({
          type: 'vertical-align',
          position: parseFloat(x),
          count: group.length,
          components: group.map(c => c.id),
        });
      }
    });

    return suggestions;
  }, [CONFIG.SMART_ALIGN_THRESHOLD, draggedComponentId]);

  /**
   * Main calculation effect - throttled for performance
   */
  useEffect(() => {
    if (!isDragging || !dragPosition || !canvasRef.current) {
      setSnapLines([]);
      setSpacingGuides([]);
      setHoveredTarget(null);
      setMagneticSnap(null);
      setDistanceMeasurements([]);
      setSmartSuggestions([]);
      lastSnapPosition.current = null;
      return;
    }

    // Throttle calculations for performance
    if (snapThrottleTimer.current) {
      clearTimeout(snapThrottleTimer.current);
    }

    snapThrottleTimer.current = setTimeout(() => {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const scale = responsiveMode !== 'desktop' ? getResponsiveScaleFactor() : 1;

      // Gather all snap data
      const snapData = canvasComponents
        .map(comp => getComponentSnapPoints(comp, canvasRect, scale))
        .filter(Boolean);

      const canvasSnaps = getCanvasSnapPoints(canvasRect, scale);

      // Find snap lines
      const foundSnaps = findSnapTarget(snapData, canvasSnaps, dragPosition);
      setSnapLines(foundSnaps);

      // Check magnetic snap
      const magnetic = checkMagneticSnap(foundSnaps);
      setMagneticSnap(magnetic);

      // Find drop target
      const dropTarget = findDropTargets(snapData, dragPosition);
      setHoveredTarget(dropTarget);

      // Detect spacing patterns
      const patterns = detectSpacingPatterns(snapData, dragPosition);
      setSpacingGuides(patterns);

      // Calculate distance measurements
      const measurements = calculateDistanceMeasurements(
        snapData, 
        dragPosition, 
        ghostBounds
      );
      setDistanceMeasurements(measurements);

      // Generate smart suggestions
      const suggestions = generateSmartSuggestions(snapData, dragPosition);
      setSmartSuggestions(suggestions);

      lastSnapPosition.current = dragPosition;
    }, CONFIG.THROTTLE_MS);

    return () => {
      if (snapThrottleTimer.current) {
        clearTimeout(snapThrottleTimer.current);
      }
    };
  }, [
    isDragging,
    dragPosition,
    canvasRef,
    canvasComponents,
    responsiveMode,
    getResponsiveScaleFactor,
    ghostBounds,
    CONFIG.THROTTLE_MS,
    getComponentSnapPoints,
    getCanvasSnapPoints,
    findSnapTarget,
    checkMagneticSnap,
    findDropTargets,
    detectSpacingPatterns,
    calculateDistanceMeasurements,
    generateSmartSuggestions,
  ]);

  // Don't render anything if not dragging
  if (!isDragging || !dragPosition) return null; // 🔥 ADD dragPosition check

return (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 9998 }}> 
     {/* Smart Drop Zone - Visual Box Based on Container Style */}
<AnimatePresence>
  {hoveredTarget && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute pointer-events-none"
      style={{
        top: hoveredTarget.bounds.top,
        left: hoveredTarget.bounds.left,
        width: hoveredTarget.bounds.width,
        height: hoveredTarget.bounds.height,
        border: `2px dashed ${COLORS.DROP_ZONE}`,
        borderRadius: '8px',
        backgroundColor: `${COLORS.DROP_ZONE}08`,
      }}
    >
      {/* Smart Drop Position Indicator */}
      {(() => {
        const containerStyle = hoveredTarget.computedStyle || {};
        const isFlexRow = containerStyle.flexDirection === 'row';
        const isFlexColumn = containerStyle.flexDirection === 'column';
        const isGrid = containerStyle.display === 'grid';
        
        // Calculate available drop positions based on style
        const dropPositions = [];
        
        if (isFlexRow) {
          // Show horizontal slots
          const childCount = hoveredTarget.childCount || 0;
          const slotWidth = hoveredTarget.bounds.width / (childCount + 1);
          for (let i = 0; i <= childCount; i++) {
            dropPositions.push({
              x: hoveredTarget.bounds.left + (slotWidth * i),
              y: hoveredTarget.bounds.centerY,
              type: 'flex-row',
              index: i
            });
          }
        } else if (isFlexColumn) {
          // Show vertical slots
          const childCount = hoveredTarget.childCount || 0;
          const slotHeight = hoveredTarget.bounds.height / (childCount + 1);
          for (let i = 0; i <= childCount; i++) {
            dropPositions.push({
              x: hoveredTarget.bounds.centerX,
              y: hoveredTarget.bounds.top + (slotHeight * i),
              type: 'flex-column',
              index: i
            });
          }
        } else if (isGrid) {
          // Show grid cells
          const cols = parseInt(containerStyle.gridTemplateColumns?.split(' ').length || 2);
          const cellWidth = hoveredTarget.bounds.width / cols;
          const cellHeight = 100; // Estimate
          
          for (let i = 0; i < cols; i++) {
            dropPositions.push({
              x: hoveredTarget.bounds.left + (cellWidth * i) + (cellWidth / 2),
              y: hoveredTarget.bounds.top + 50,
              type: 'grid',
              index: i
            });
          }
        }
        
        // Find closest drop position to drag position
        const closest = dropPositions.reduce((prev, curr) => {
          const prevDist = Math.hypot(
            prev.x - dragPosition.x,
            prev.y - dragPosition.y
          );
          const currDist = Math.hypot(
            curr.x - dragPosition.x,
            curr.y - dragPosition.y
          );
          return currDist < prevDist ? curr : prev;
        }, dropPositions[0] || null);
        
        if (!closest) return null;
        
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute"
            style={{
              left: closest.x - hoveredTarget.bounds.left - 2,
              top: closest.y - hoveredTarget.bounds.top - 2,
              width: closest.type === 'flex-row' ? '4px' : '40px',
              height: closest.type === 'flex-column' ? '4px' : '40px',
              backgroundColor: COLORS.DROP_ZONE,
              borderRadius: '2px',
              boxShadow: `0 0 12px ${COLORS.DROP_ZONE}`,
            }}
          />
        );
      })()}
      
      {/* Corner indicators only */}
      {['top-left', 'top-right', 'bottom-right', 'bottom-left'].map(corner => {
        const positions = {
          'top-left': { top: -4, left: -4 },
          'top-right': { top: -4, right: -4 },
          'bottom-right': { bottom: -4, right: -4 },
          'bottom-left': { bottom: -4, left: -4 },
        };
        
        return (
          <motion.div
            key={corner}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              ...positions[corner],
              backgroundColor: COLORS.DROP_ZONE,
              boxShadow: `0 0 8px ${COLORS.DROP_ZONE}`,
            }}
          />
        );
      })}
    </motion.div>
  )}
</AnimatePresence>

      {/* Snap Lines - Minimal and clean */}
      <AnimatePresence>
        {snapLines.slice(0, 4).map((line, idx) => (
          <motion.div
            key={`${line.type}-${line.position}-${idx}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className="absolute"
            style={{
              ...(line.type === 'vertical' ? {
                left: line.position,
                top: 0,
                bottom: 0,
                width: '1px',
              } : {
                top: line.position,
                left: 0,
                right: 0,
                height: '1px',
              }),
              backgroundColor: line.color,
              boxShadow: `0 0 4px ${line.color}`,
            }}
          >
            {/* Snap Point Indicator */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: line.color,
                boxShadow: `0 0 8px ${line.color}`,
                ...(line.type === 'vertical' ? {
                  top: dragPosition.y - 4,
                  left: -4,
                } : {
                  left: dragPosition.x - 4,
                  top: -4,
                }),
              }}
            />

            {/* Snap Label */}
            {idx === 0 && (
              <motion.div
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute px-2 py-0.5 rounded text-xs font-medium shadow-sm whitespace-nowrap"
                style={{
                  backgroundColor: line.color,
                  color: 'white',
                  ...(line.type === 'vertical' ? {
                    top: 8,
                    left: 8,
                  } : {
                    left: 8,
                    top: 8,
                  }),
                }}
              >
                {line.snapType} • {line.source}
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Magnetic Snap Indicator */}
      <AnimatePresence>
        {magneticSnap && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0, 1, 0.8],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute w-6 h-6 rounded-full border-2 pointer-events-none"
            style={{
              ...(magneticSnap.type === 'vertical' ? {
                left: magneticSnap.position - 12,
                top: dragPosition.y - 12,
              } : {
                left: dragPosition.x - 12,
                top: magneticSnap.position - 12,
              }),
              borderColor: COLORS.MAGNETIC_PULL,
              backgroundColor: `${COLORS.MAGNETIC_PULL}20`,
              boxShadow: `0 0 20px ${COLORS.MAGNETIC_PULL}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Distance Measurements */}
      <AnimatePresence>
        {distanceMeasurements.map((measurement, idx) => (
          <motion.g
            key={`measurement-${idx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 48 }}
            >
              {/* Measurement Line */}
              <line
                x1={measurement.start.x}
                y1={measurement.start.y}
                x2={measurement.end.x}
                y2={measurement.end.y}
                stroke={COLORS.MEASUREMENT}
                strokeWidth="1"
                strokeDasharray="4 2"
                opacity="0.6"
              />

              {/* End caps */}
              <circle
                cx={measurement.start.x}
                cy={measurement.start.y}
                r="2"
                fill={COLORS.MEASUREMENT}
                opacity="0.6"
              />
              <circle
                cx={measurement.end.x}
                cy={measurement.end.y}
                r="2"
                fill={COLORS.MEASUREMENT}
                opacity="0.6"
              />

              {/* Label background */}
              <rect
                x={(measurement.start.x + measurement.end.x) / 2 - 20}
                y={(measurement.start.y + measurement.end.y) / 2 - 10}
                width="40"
                height="20"
                rx="4"
                fill={COLORS.MEASUREMENT}
                opacity="0.9"
              />

              {/* Label text */}
              <text
                x={(measurement.start.x + measurement.end.x) / 2}
                y={(measurement.start.y + measurement.end.y) / 2 + 4}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="600"
              >
                {measurement.label}
              </text>
            </svg>
          </motion.g>
        ))}
      </AnimatePresence>

      {/* Spacing Pattern Guides */}
      <AnimatePresence>
        {spacingGuides.slice(0, 2).map((pattern, idx) => (
          <motion.div
            key={`spacing-${idx}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute border-2 border-dashed rounded"
            style={{
              ...(pattern.type === 'horizontal' ? {
                left: pattern.suggestedPosition.x - 10,
                top: pattern.suggestedPosition.y - 25,
                width: 20,
                height: 50,
              } : {
                left: pattern.suggestedPosition.x - 25,
                top: pattern.suggestedPosition.y - 10,
                width: 50,
                height: 20,
              }),
              borderColor: COLORS.SPACING_SNAP,
              backgroundColor: `${COLORS.SPACING_SNAP}10`,
            }}
          >
            {/* Spacing indicator */}
            <div
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap"
              style={{
                backgroundColor: COLORS.SPACING_SNAP,
                color: 'white',
              }}
            >
              {Math.round(pattern.spacing)}px
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Smart Alignment Suggestions */}
      <AnimatePresence>
        {smartSuggestions.slice(0, 2).map((suggestion, idx) => (
          <motion.div
            key={`suggestion-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 0.4, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute border border-dashed"
            style={{
              ...(suggestion.type === 'horizontal-align' ? {
                left: 0,
                right: 0,
                top: suggestion.position,
                height: '1px',
              } : {
                left: suggestion.position,
                top: 0,
                bottom: 0,
                width: '1px',
              }),
              borderColor: COLORS.CENTER_SNAP,
              opacity: 0.3,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DragSnapLines;