import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Property Section Container
export const PropertySection = ({ title, Icon, sectionKey, children, expandedSections, setExpandedSections }) => {
  const isExpanded = expandedSections[sectionKey];
  
  const toggleSection = () => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };
  
  return (
    <div className="border rounded-lg mb-3" style={{ borderColor: 'var(--color-border)' }}>
      <button
        onClick={toggleSection}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <span className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
            {title}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        ) : (
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        )}
      </button>
      {isExpanded && (
        <div className="p-3 border-t space-y-4" style={{ borderColor: 'var(--color-border)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// Input Field Component
export const InputField = ({ label, value, onChange, type = 'text', options = {} }) => {
  const baseInputClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm";
  
  return (
    <div className="space-y-1">
      {type !== 'checkbox' && (
        <label className="block text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </label>
      )}
      
      {type === 'select' ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClasses}
        >
          <option value="">Default</option>
          {options.values?.map((option) => (
            <option key={option} value={option}>
              {typeof option === 'object' ? option.label : option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      ) : type === 'color' ? (
        <div className="flex gap-2">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 border rounded cursor-pointer"
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInputClasses} flex-1`}
            placeholder="#000000 or rgb() or hsl()"
          />
        </div>
      ) : type === 'range' ? (
        <div className="space-y-2">
          <input
            type="range"
            min={options.min || 0}
            max={options.max || 100}
            step={options.step || 1}
            value={value || options.min || 0}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
            {value || options.min || 0}{options.unit || ''}
          </div>
        </div>
      ) : type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInputClasses} resize-vertical min-h-[80px]`}
          rows={3}
        />
      ) : type === 'checkbox' ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label className="ml-2 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {label}
          </label>
        </div>
      ) : type === 'preset' ? (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(options.presets || {}).map(([key, presetValue]) => (
              <button
                key={key}
                onClick={() => onChange(presetValue)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  value === presetValue 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
            placeholder="Custom value..."
          />
        </div>
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          className={baseInputClasses}
          step={type === 'number' ? (options.step || 1) : undefined}
          min={type === 'number' ? options.min : undefined}
          max={type === 'number' ? options.max : undefined}
          placeholder={options.placeholder}
        />
      )}
    </div>
  );
};

// Subsection Header
export const SubsectionHeader = ({ title }) => (
  <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
    {title}
  </h5>
);

// Button Grid for presets/actions
export const ButtonGrid = ({ buttons, columns = 2 }) => (
  <div className={`grid grid-cols-${columns} gap-2`}>
    {buttons.map((button, index) => (
      <button
        key={index}
        onClick={button.onClick}
        className={`px-3 py-2 rounded-lg text-sm transition-colors ${button.className || 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
      >
        {button.icon && <button.icon className="w-4 h-4 mr-1 inline" />}
        {button.label}
      </button>
    ))}
  </div>
);

// Preset Values (can be imported by sections)
export const presetValues = {
  borderRadius: {
    none: '0px',
    sm: '2px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
    custom: ''
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    custom: ''
  },
  textShadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
    md: '0 4px 8px rgba(0, 0, 0, 0.5)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
    glow: '0 0 10px currentColor',
    neon: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor',
    custom: ''
  },
  gradients: {
    none: 'none',
    'gradient-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
    'gradient-to-l': 'linear-gradient(to left, var(--tw-gradient-stops))',
    'gradient-to-t': 'linear-gradient(to top, var(--tw-gradient-stops))',
    'gradient-to-b': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
    'gradient-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
    'gradient-to-bl': 'linear-gradient(to bottom left, var(--tw-gradient-stops))',
    'gradient-to-tr': 'linear-gradient(to top right, var(--tw-gradient-stops))',
    'gradient-to-tl': 'linear-gradient(to top left, var(--tw-gradient-stops))',
    radial: 'radial-gradient(var(--tw-gradient-stops))',
    conic: 'conic-gradient(var(--tw-gradient-stops))',
    custom: ''
  }
};