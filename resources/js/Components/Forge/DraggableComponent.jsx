import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { GripVertical } from 'lucide-react';

const DraggableComponent = ({ component, index, isSelected, onSelect, children }) => {
    return (
        <Draggable draggableId={component.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`
                        relative group
                        ${snapshot.isDragging ? 'opacity-50 scale-105 z-50' : ''}
                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                    `}
                    style={{
                        ...provided.draggableProps.style,
                        touchAction: 'none' // Enable touch dragging
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(component.id, e);
                    }}
                >
                    {/* Drag Handle - Always visible on mobile, hover on desktop */}
                    <div 
                        {...provided.dragHandleProps}
                        className="absolute -left-8 top-1/2 -translate-y-1/2 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity cursor-move z-50"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '4px',
                            padding: '4px'
                        }}
                    >
                        <GripVertical className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    
                    {children}
                </div>
            )}
        </Draggable>
    );
};

export default DraggableComponent;