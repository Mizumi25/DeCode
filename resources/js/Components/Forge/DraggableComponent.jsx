import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { GripVertical, Move } from 'lucide-react';

const DraggableComponent = ({ component, index, isSelected, onSelect, children, depth = 0 }) => {
    const [isLongPressing, setIsLongPressing] = useState(false);
    const [isDraggingManually, setIsDraggingManually] = useState(false);
    const longPressTimer = useRef(null);
    const touchStartPos = useRef({ x: 0, y: 0 });
    
    // Long press detection
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        touchStartPos.current = { x: touch.clientX, y: touch.clientY };
        
        longPressTimer.current = setTimeout(() => {
            setIsLongPressing(true);
            // Haptic feedback if available (silent fail if blocked)
            if ('vibrate' in navigator) {
                try {
                    navigator.vibrate(50);
                } catch (err) {
                    // Browser blocked vibration - ignore
                }
            }
        }, 500); // 500ms long press
    };
    
    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
        
        // Cancel long press if finger moved too much
        if (deltaX > 10 || deltaY > 10) {
            clearTimeout(longPressTimer.current);
            setIsLongPressing(false);
        }
    };
    
    const handleTouchEnd = () => {
        clearTimeout(longPressTimer.current);
        setTimeout(() => setIsLongPressing(false), 100);
    };
    
    useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        };
    }, []);
    
    return (
        <Draggable draggableId={component.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`
                        relative group
                        ${snapshot.isDragging || isLongPressing ? 'opacity-50 scale-105 z-50 shadow-2xl' : ''}
                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                        ${depth > 0 ? 'ml-4' : ''}
                    `}
                    style={{
                        ...provided.draggableProps.style,
                        touchAction: 'none',
                        transition: snapshot.isDragging ? 'none' : 'all 0.2s ease'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(component.id, e);
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Drag Handle - Enhanced visibility */}
                    <div 
                        {...provided.dragHandleProps}
                        className={`
                            absolute -left-8 top-1/2 -translate-y-1/2 
                            ${isLongPressing ? 'opacity-100 scale-125' : 'md:opacity-0 md:group-hover:opacity-100 opacity-100'} 
                            transition-all cursor-move z-50
                        `}
                        style={{
                            backgroundColor: isLongPressing ? 'var(--color-primary)' : 'var(--color-surface)',
                            border: `2px solid ${isLongPressing ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            borderRadius: '6px',
                            padding: '6px',
                            boxShadow: isLongPressing ? '0 4px 12px rgba(160, 82, 255, 0.4)' : 'none'
                        }}
                    >
                        {isLongPressing ? (
                            <Move className="w-4 h-4 text-white animate-pulse" />
                        ) : (
                            <GripVertical className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                        )}
                    </div>
                    
                    {/* Dragging indicator overlay */}
                    {(snapshot.isDragging || isLongPressing) && (
                        <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none z-40 animate-pulse" />
                    )}
                    
                    {children}
                </div>
            )}
        </Draggable>
    );
};

export default DraggableComponent;