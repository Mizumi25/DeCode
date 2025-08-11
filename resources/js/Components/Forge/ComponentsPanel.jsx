// @/Components/Forge/ComponentsPanel.jsx
import React from 'react';
import { Square, Code, Layers } from 'lucide-react';

const ComponentsPanel = ({ onComponentDragStart, onComponentDragEnd }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
          <Square className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>UI Components</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Drag to canvas to build</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Buttons</div>
        <div 
          className="group p-4 border-2 border-dashed rounded-xl cursor-grab hover:border-opacity-60 transition-all duration-300 active:cursor-grabbing"
          style={{ 
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg)'
          }}
          draggable
          onDragStart={(e) => onComponentDragStart(e, 'button')}
          onDragEnd={onComponentDragEnd}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
              <Square className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold group-hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text)' }}>Button</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Interactive button with variants</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>Primary</span>
            <span className="px-2 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' }}>Secondary</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Success</span>
          </div>
        </div>
        
        <div className="p-4 border rounded-xl opacity-60 cursor-not-allowed" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-border)' }}>
              <Code className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div>
              <div className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>Input Field</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Coming soon</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-xl opacity-60 cursor-not-allowed" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-border)' }}>
              <Layers className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div>
              <div className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>Card</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentsPanel;