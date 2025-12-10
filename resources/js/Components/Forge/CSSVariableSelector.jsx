import React, { useState, useEffect } from 'react';
import { Variable, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';

/**
 * CSS Variable Selector Component
 * Allows selecting CSS variables defined in StyleModal
 * Supports both CSS (var(--name)) and Tailwind (bg-[var(--name)]) formats
 */
const CSSVariableSelector = ({ 
  value, 
  onChange, 
  propertyType = 'color', // 'color', 'size', 'spacing', 'all'
  styleFramework = 'css' // 'css' or 'tailwind'
}) => {
  const { project } = usePage().props;
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUsingVariable, setIsUsingVariable] = useState(false);
  
  // Get style variables from project settings
  const styleVariables = project?.settings?.style_variables || {};
  
  // Default variables
  const defaultVariables = {
    '--color-primary': '#3b82f6',
    '--color-surface': '#ffffff',
    '--color-text': '#1f2937',
    '--color-border': '#e5e7eb',
    '--color-bg-muted': '#f9fafb',
    '--color-text-muted': '#6b7280',
    '--font-size-base': '14px',
    '--font-weight-normal': '400',
    '--line-height-base': '1.5',
    '--letter-spacing': '0',
    '--radius-md': '6px',
    '--radius-lg': '8px',
    '--container-width': '1200px',
    '--shadow-sm': '0 1px 2px rgba(0,0,0,0.05)',
    '--shadow-md': '0 4px 6px rgba(0,0,0,0.07)',
    '--shadow-lg': '0 10px 15px rgba(0,0,0,0.1)',
    '--spacing-xs': '4px',
    '--spacing-sm': '8px',
    '--spacing-md': '16px',
    '--spacing-lg': '24px',
    '--transition-duration': '200ms',
    '--transition-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--z-modal': '1000',
  };
  
  const allVariables = { ...defaultVariables, ...styleVariables };
  
  // Filter variables by type
  const filterVariablesByType = () => {
    if (propertyType === 'all') return allVariables;
    
    const filters = {
      color: ['--color-'],
      size: ['--font-size-', '--radius-', '--container-'],
      spacing: ['--spacing-'],
      shadow: ['--shadow-'],
      typography: ['--font-', '--line-', '--letter-'],
    };
    
    const prefixes = filters[propertyType] || [];
    if (prefixes.length === 0) return allVariables;
    
    return Object.fromEntries(
      Object.entries(allVariables).filter(([key]) =>
        prefixes.some(prefix => key.startsWith(prefix))
      )
    );
  };
  
  const filteredVariables = filterVariablesByType();
  
  // Check if current value is using a variable
  useEffect(() => {
    const isVar = value && (
      value.includes('var(--') || 
      value.includes('[var(--')
    );
    setIsUsingVariable(isVar);
  }, [value]);
  
  // Extract variable name from value
  const extractVariableName = (val) => {
    if (!val) return null;
    const match = val.match(/var\((--[^)]+)\)/);
    return match ? match[1] : null;
  };
  
  const currentVariable = extractVariableName(value);
  
  // Handle variable selection
  const handleSelectVariable = (varName) => {
    if (styleFramework === 'tailwind') {
      // For Tailwind: bg-[var(--color-primary)]
      onChange(`var(${varName})`);
    } else {
      // For CSS: var(--color-primary)
      onChange(`var(${varName})`);
    }
    setShowDropdown(false);
  };
  
  // Handle clearing variable
  const handleClearVariable = () => {
    onChange('');
    setIsUsingVariable(false);
    setShowDropdown(false);
  };
  
  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Variable Indicator */}
      {isUsingVariable && currentVariable && (
        <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 border border-purple-300 rounded text-xs text-purple-700">
          <Variable className="w-3 h-3" />
          <span className="font-mono">{currentVariable}</span>
          <button
            onClick={handleClearVariable}
            className="hover:bg-purple-200 rounded p-0.5"
            title="Clear variable"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      
      {/* Variable Selector Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`p-1.5 rounded border transition-colors ${
          isUsingVariable
            ? 'bg-purple-100 border-purple-400 text-purple-700'
            : 'bg-[var(--color-bg-muted)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-border)]'
        }`}
        title="Use CSS variable"
      >
        <Variable className="w-4 h-4" />
      </button>
      
      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
            <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]">
              <div className="text-sm font-semibold text-[var(--color-text)]">
                CSS Variables
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">
                Click to use in your {styleFramework === 'tailwind' ? 'Tailwind' : 'CSS'} styles
              </div>
            </div>
            
            <div className="p-2">
              {Object.keys(filteredVariables).length === 0 ? (
                <div className="text-sm text-[var(--color-text-muted)] text-center py-4">
                  No variables available for this property type
                </div>
              ) : (
                <div className="space-y-1">
                  {Object.entries(filteredVariables).map(([varName, varValue]) => (
                    <button
                      key={varName}
                      onClick={() => handleSelectVariable(varName)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-left rounded hover:bg-[var(--color-bg-muted)] transition-colors ${
                        currentVariable === varName ? 'bg-purple-100 border border-purple-300' : ''
                      }`}
                    >
                      {/* Color preview for color variables */}
                      {varName.includes('color') && (
                        <div 
                          className="w-5 h-5 rounded border border-[var(--color-border)] flex-shrink-0"
                          style={{ backgroundColor: varValue }}
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono text-[var(--color-text)] truncate">
                          {varName}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] truncate">
                          {varValue}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]">
              <div className="text-xs text-[var(--color-text-muted)]">
                <strong>Tip:</strong> Define more variables in the Style modal
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CSSVariableSelector;
