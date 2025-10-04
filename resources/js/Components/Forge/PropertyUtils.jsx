import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PropertySection = ({ title, Icon, sectionKey, children, expandedSections, setExpandedSections }) => {
  const isExpanded = expandedSections[sectionKey];
  
  return (
    <div className="border rounded-lg mb-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
      <button
        onClick={() => setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))}
        className="w-full flex items-center justify-between p-3 transition-colors"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <span className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="p-3 border-t space-y-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export const InputField = ({ label, value, onChange, type = 'text', options = {} }) => {
  const baseInputClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-sm";
  
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
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)'
          }}
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
            style={{ borderColor: 'var(--color-border)' }}
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInputClasses} flex-1`}
            placeholder="#000000 or rgb() or hsl()"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
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
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: 'var(--color-primary)' }}
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
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)'
          }}
        />
      ) : type === 'checkbox' ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded focus:ring-2"
            style={{ accentColor: 'var(--color-primary)' }}
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
                className={`px-2 py-1 text-xs rounded border transition-colors`}
                style={value === presetValue ? {
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  borderColor: 'var(--color-primary)'
                } : {
                  backgroundColor: 'var(--color-bg-muted)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)'
                }}
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
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
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
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)'
          }}
        />
      )}
    </div>
  );
};

export const SubsectionHeader = ({ title }) => (
  <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
    {title}
  </h5>
);

export const ButtonGrid = ({ buttons, columns = 2 }) => (
  <div className={`grid grid-cols-${columns} gap-2`}>
    {buttons.map((button, index) => (
      <button
        key={index}
        onClick={button.onClick}
        className={`px-3 py-2 rounded-lg text-sm transition-colors`}
        style={button.style || {
          backgroundColor: 'var(--color-bg-muted)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)'
        }}
      >
        {button.icon && <button.icon className="w-4 h-4 mr-1 inline" />}
        {button.label}
      </button>
    ))}
  </div>
);

export const presetValues = {
  borderRadius: {
    none: '0px',
    sm: '2px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  textShadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
    md: '0 4px 8px rgba(0, 0, 0, 0.5)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
    glow: '0 0 10px currentColor',
    neon: '0 0 5px currentColor, 0 0 10px currentColor'
  }
};