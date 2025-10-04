// @/Components/Forge/LayersPanel.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, ChevronRight, ChevronDown, Layers, Lock, Unlock } from 'lucide-react';

const LayerItem = ({ component, depth = 0, isSelected, onSelect, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = children && children.length > 0;
  
  return (
    <div>
      <div 
        className={`flex items-center gap-2 p-2 ml-${depth * 4} rounded-lg transition-all cursor-pointer group ${
          isSelected ? 'border-l-4' : ''
        }`}
        style={{
          backgroundColor: isSelected ? 'var(--color-primary-soft)' : 'var(--color-bg)',
          borderLeftColor: isSelected ? 'var(--color-primary)' : 'transparent',
          color: isSelected ? 'var(--color-primary)' : 'var(--color-text)'
        }}
        onClick={() => onSelect(component.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        )}
        
        <div 
          className="w-3 h-3 rounded flex-shrink-0" 
          style={{ backgroundColor: component.isLayoutContainer ? 'var(--color-primary)' : 'var(--color-accent)' }}
        />
        
        <span className="text-sm font-medium flex-1 truncate">{component.name}</span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-gray-200 rounded">
            <Eye className="w-3 h-3" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded">
            <Lock className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {children.map((child) => (
            <LayerItem
              key={child.id}
              component={child}
              depth={depth + 1}
              isSelected={isSelected}
              onSelect={onSelect}
              children={child.children}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LayersPanel = ({ canvasComponents, selectedComponent, onComponentSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
          <Layers className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Layer Tree</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Document hierarchy</p>
        </div>
      </div>
      
      <div className="space-y-1">
        {canvasComponents.length > 0 ? (
          canvasComponents.map((component) => (
            <LayerItem
              key={component.id}
              component={component}
              isSelected={selectedComponent === component.id}
              onSelect={onComponentSelect}
              children={component.children}
            />
          ))
        ) : (
          <div className="text-sm italic p-8 text-center border-2 border-dashed rounded-lg" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No layers yet
          </div>
        )}
      </div>
    </div>
  );
};

export default LayersPanel;