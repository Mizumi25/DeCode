// @/Components/Forge/ComponentsPanel.jsx
import React, { useState, useEffect } from 'react';
import { Square, Code, Layers, Type, Layout, Loader } from 'lucide-react';
import axios from 'axios';

const iconMap = {
  Square,
  Code, 
  Layers,
  Type,
  Layout
};

const ComponentsPanel = ({ onComponentDragStart, onComponentDragEnd }) => {
  const [components, setComponents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await axios.get('/api/components');
      if (response.data.success) {
        setComponents(response.data.data);
      }
    } catch (err) {
      setError('Failed to load components');
      console.error('Error fetching components:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} />
        <span className="ml-2" style={{ color: 'var(--color-text-muted)' }}>Loading components...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">{error}</div>
        <button 
          onClick={fetchComponents}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

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
      
      {Object.entries(components).map(([category, categoryComponents]) => (
        <div key={category} className="space-y-3">
          <div className="text-sm font-medium mb-2 capitalize" style={{ color: 'var(--color-text)' }}>
            {category}
          </div>
          
          {categoryComponents.map((component) => {
            const IconComponent = iconMap[component.icon] || Square;
            
            return (
              <div 
                key={component.id}
                className="group p-4 border-2 border-dashed rounded-xl cursor-grab hover:border-opacity-60 transition-all duration-300 active:cursor-grabbing"
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg)'
                }}
                draggable
                onDragStart={(e) => onComponentDragStart(e, component.type)}
                onDragEnd={onComponentDragEnd}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold group-hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text)' }}>
                      {component.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {component.description}
                    </div>
                  </div>
                </div>
                
                {/* Show available variants/options if they exist */}
                {component.prop_definitions && component.prop_definitions.variant && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {component.prop_definitions.variant.options.slice(0, 3).map((option) => (
                      <span 
                        key={option}
                        className="px-2 py-1 text-xs rounded-full font-medium capitalize"
                        style={{ 
                          backgroundColor: option === 'primary' 
                            ? 'var(--color-primary-soft)' 
                            : 'var(--color-bg-muted)', 
                          color: option === 'primary' 
                            ? 'var(--color-primary)' 
                            : 'var(--color-text-muted)' 
                        }}
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ComponentsPanel;