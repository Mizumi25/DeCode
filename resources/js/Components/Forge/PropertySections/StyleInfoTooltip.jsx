import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

const StyleInfoTooltip = ({ cssProperty, currentValue, tailwindClasses = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block" style={{ zIndex: isOpen ? 9999 : 1 }}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => e.stopPropagation()} // Prevent dropdown toggle
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to catch mouse leave */}
          <div 
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onMouseEnter={() => setIsOpen(false)}
          />
          
          <div 
            className="fixed mt-2 w-64 rounded-lg shadow-xl border"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              zIndex: 9999,
              // Position relative to the button
              top: 'auto',
              left: 'auto'
            }}
            onMouseLeave={() => setIsOpen(false)}
          >
            {/* Arrow pointer */}
            <div 
              className="absolute -top-2 left-4 w-4 h-4 rotate-45 border-l border-t"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            />
            
            <div className="relative p-3 space-y-3">
              {/* CSS Section */}
              <div>
                <div className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  CSS
                </div>
                <div 
                  className="text-xs font-mono p-2 rounded break-all"
                  style={{ 
                    backgroundColor: 'var(--color-bg-muted)',
                    color: 'var(--color-text)'
                  }}
                >
                  {cssProperty}: {currentValue || 'default'};
                </div>
              </div>

              {/* Tailwind Section */}
              {tailwindClasses.length > 0 && (
                <div>
                  <div className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    Tailwind
                  </div>
                  <div 
                    className="text-xs font-mono p-2 rounded flex flex-wrap gap-1"
                    style={{ 
                      backgroundColor: 'var(--color-bg-muted)',
                      color: 'var(--color-text)'
                    }}
                  >
                    {tailwindClasses.map((cls, idx) => (
                      <span 
                        key={idx}
                        className="px-1.5 py-0.5 rounded"
                        style={{ 
                          backgroundColor: 'var(--color-primary-soft)',
                          color: 'var(--color-primary)'
                        }}
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StyleInfoTooltip;