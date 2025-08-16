// @/Components/Forge/PropertiesPanel.jsx
import React from 'react';
import { Settings, Trash2, Code, Move, Lock, Unlock } from 'lucide-react';

const PropertiesPanel = ({ 
  canvasComponents, 
  selectedComponent, 
  onPropertyUpdate, 
  onComponentDelete, 
  onGenerateCode,
  componentLibraryService
}) => {
  const selectedComponentData = canvasComponents.find(c => c.id === selectedComponent);

  if (!selectedComponent || !selectedComponentData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Properties</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Select a component to edit</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No component selected.<br />
            Click on a component to see its properties.
          </p>
        </div>
      </div>
    );
  }

  const componentDefinition = componentLibraryService.getComponentDefinition(selectedComponentData.type);

  if (!componentDefinition) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-500">
          Component definition not found for {selectedComponentData.type}
        </p>
      </div>
    );
  }

  const handlePropertyChange = (propName, value) => {
    onPropertyUpdate(selectedComponent, propName, value);
  };

  const handlePositionChange = (axis, value) => {
    const newPosition = {
      ...selectedComponentData.position,
      [axis]: parseFloat(value) || 0
    };
    onPropertyUpdate(selectedComponent, 'position', newPosition);
  };

  const renderPropertyInput = (propName, propDef, currentValue) => {
    const baseInputClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";

    switch (propDef.type) {
      case 'string':
        return (
          <input
            type="text"
            value={currentValue || propDef.default || ''}
            onChange={(e) => handlePropertyChange(propName, e.target.value)}
            className={baseInputClasses}
            placeholder={propDef.default || ''}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={currentValue || propDef.default || ''}
            onChange={(e) => handlePropertyChange(propName, e.target.value)}
            className={`${baseInputClasses} resize-vertical min-h-[80px]`}
            placeholder={propDef.default || ''}
            rows={3}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentValue || propDef.default || 0}
            onChange={(e) => handlePropertyChange(propName, parseFloat(e.target.value) || 0)}
            className={baseInputClasses}
            step={propDef.step || 1}
            min={propDef.min}
            max={propDef.max}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={currentValue !== undefined ? currentValue : propDef.default}
              onChange={(e) => handlePropertyChange(propName, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label className="ml-2 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {propDef.label}
            </label>
          </div>
        );

      case 'select':
        return (
          <select
            value={currentValue || propDef.default || ''}
            onChange={(e) => handlePropertyChange(propName, e.target.value)}
            className={baseInputClasses}
          >
            {propDef.options.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );

      case 'color':
        return (
          <div className="flex gap-2">
            <input
              type="color"
              value={currentValue || propDef.default || '#000000'}
              onChange={(e) => handlePropertyChange(propName, e.target.value)}
              className="w-12 h-10 border rounded cursor-pointer"
            />
            <input
              type="text"
              value={currentValue || propDef.default || ''}
              onChange={(e) => handlePropertyChange(propName, e.target.value)}
              className={`${baseInputClasses} flex-1`}
              placeholder="#000000"
            />
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={propDef.min || 0}
              max={propDef.max || 100}
              step={propDef.step || 1}
              value={currentValue || propDef.default || 0}
              onChange={(e) => handlePropertyChange(propName, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
              {currentValue || propDef.default || 0}
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={currentValue || propDef.default || ''}
            onChange={(e) => handlePropertyChange(propName, e.target.value)}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
          <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Properties</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {componentDefinition.name} #{selectedComponent.split('_').pop()}
          </p>
        </div>
      </div>

      {/* Component Info */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium" style={{ color: 'var(--color-text)' }}>
            {componentDefinition.name}
          </span>
          <span className="text-xs px-2 py-1 rounded-full" style={{ 
            backgroundColor: 'var(--color-primary-soft)', 
            color: 'var(--color-primary)' 
          }}>
            {componentDefinition.category}
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {componentDefinition.description}
        </p>
      </div>

      {/* Position Controls */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Move className="w-4 h-4" />
          Position
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
              X Position
            </label>
            <input
              type="number"
              value={selectedComponentData.position.x}
              onChange={(e) => handlePositionChange('x', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              step="1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
              Y Position
            </label>
            <input
              type="number"
              value={selectedComponentData.position.y}
              onChange={(e) => handlePositionChange('y', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Component Properties */}
      {componentDefinition.prop_definitions && Object.keys(componentDefinition.prop_definitions).length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
            Component Properties
          </h4>
          
          {Object.entries(componentDefinition.prop_definitions).map(([propName, propDef]) => (
            <div key={propName} className="space-y-2">
              {propDef.type !== 'boolean' && (
                <label className="block text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {propDef.label || propName.charAt(0).toUpperCase() + propName.slice(1)}
                </label>
              )}
              
              {renderPropertyInput(
                propName, 
                propDef, 
                selectedComponentData.props[propName]
              )}
              
              {propDef.description && (
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {propDef.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Component Name */}
      <div className="space-y-2">
        <label className="block text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Component Name
        </label>
        <input
          type="text"
          value={selectedComponentData.name}
          onChange={(e) => onPropertyUpdate(selectedComponent, 'name', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Component name"
        />
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => onGenerateCode([selectedComponentData])}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Code className="w-4 h-4" />
          Generate Code
        </button>
        
        <button
          onClick={() => onComponentDelete(selectedComponent)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Component
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;