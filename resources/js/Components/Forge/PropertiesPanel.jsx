// @/Components/Forge/PropertiesPanel.jsx
import React from 'react';
import { Settings, Square, Trash2 } from 'lucide-react';

const PropertiesPanel = ({ 
  canvasComponents, 
  selectedComponent, 
  onPropertyUpdate, 
  onComponentDelete,
  onGenerateCode 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
          <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Properties</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Customize elements</p>
        </div>
      </div>
      
      {selectedComponent ? (() => {
        const component = canvasComponents.find(c => c.id === selectedComponent)
        if (!component) return <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Component not found</div>
        
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-muted)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <Square className="w-4 h-4" />
                </div>
                <h4 className="font-semibold" style={{ color: 'var(--color-text)' }}>{component.name}</h4>
              </div>
              <p className="text-xs font-mono px-2 py-1 rounded" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>
                #{component.id.split('_').pop()}
              </p>
            </div>
            
            {component.type === 'button' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Button Text</label>
                  <input 
                    type="text" 
                    value={component.props.text}
                    onChange={(e) => onPropertyUpdate(component.id, 'text', e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ 
                      borderColor: 'var(--color-border)', 
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="Enter button text..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Style Variant</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['primary', 'secondary', 'success', 'warning', 'danger', 'ghost'].map(variant => (
                      <button
                        key={variant}
                        onClick={() => onPropertyUpdate(component.id, 'variant', variant)}
                        className="p-2 rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor: component.props.variant === variant ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                          color: component.props.variant === variant ? 'white' : 'var(--color-text)'
                        }}
                      >
                        {variant.charAt(0).toUpperCase() + variant.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Size</label>
                  <div className="flex gap-2">
                    {['sm', 'md', 'lg'].map(size => (
                      <button
                        key={size}
                        onClick={() => onPropertyUpdate(component.id, 'size', size)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1"
                        style={{
                          backgroundColor: component.props.size === size ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                          color: component.props.size === size ? 'white' : 'var(--color-text)'
                        }}
                      >
                        {size.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>X</label>
                      <input
                        type="number"
                        value={component.position.x}
                        onChange={(e) => onPropertyUpdate(component.id, 'position', { 
                          ...component.position, 
                          x: parseInt(e.target.value) || 0 
                        })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                        style={{ 
                          borderColor: 'var(--color-border)', 
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text)'
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Y</label>
                      <input
                        type="number"
                        value={component.position.y}
                        onChange={(e) => onPropertyUpdate(component.id, 'position', { 
                          ...component.position, 
                          y: parseInt(e.target.value) || 0 
                        })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                        style={{ 
                          borderColor: 'var(--color-border)', 
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={() => onComponentDelete(component.id)}
              className="w-full mt-6 px-4 py-3 text-white border-0 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: '#ef4444' }}
            >
              <Trash2 className="w-4 h-4" />
              Delete Component
            </button>
          </div>
        )
      })() : (
        <div className="text-center p-8 border-2 border-dashed rounded-xl" style={{ borderColor: 'var(--color-border)' }}>
          <div className="mb-4">
            <Settings className="w-12 h-12 mx-auto opacity-50" style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Select a component from the canvas or layers panel to edit its properties
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;