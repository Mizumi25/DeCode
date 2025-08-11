// @/Components/Forge/LayersPanel.jsx
import React from 'react';
import { Eye, Layers } from 'lucide-react';

const LayersPanel = ({ canvasComponents, selectedComponent, onComponentSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
          <Eye className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Layer Tree</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Page hierarchy</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-lg transition-colors" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--color-primary)' }}></div>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Canvas Container</span>
        </div>
        
        {canvasComponents.map((component, index) => (
          <div 
            key={component.id}
            className={`flex items-center gap-3 p-3 ml-4 rounded-lg transition-all cursor-pointer ${
              selectedComponent === component.id 
                ? 'border-l-4' 
                : ''
            }`}
            style={{
              backgroundColor: selectedComponent === component.id ? 'var(--color-primary-soft)' : 'var(--color-bg)',
              borderLeftColor: selectedComponent === component.id ? 'var(--color-primary)' : 'transparent',
              color: selectedComponent === component.id ? 'var(--color-primary)' : 'var(--color-text)'
            }}
            onClick={() => onComponentSelect(component.id)}
          >
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--color-accent)' }}></div>
            <span className="text-sm font-medium">{component.name} {index + 1}</span>
            <div className="ml-auto text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {component.position.x}, {component.position.y}
            </div>
          </div>
        ))}
        
        {canvasComponents.length === 0 && (
          <div className="text-sm italic p-4 text-center border-2 border-dashed rounded-lg" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
            <div className="mb-2">
              <Layers className="w-6 h-6 mx-auto opacity-50" />
            </div>
            No components yet
            <br />
            <span className="text-xs">Drag from Components panel</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayersPanel;