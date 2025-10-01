// @/Components/Forge/EmptyCanvasState.jsx
import React from 'react';
import { Layout, Plus, Sparkles, Layers } from 'lucide-react';

const EmptyCanvasState = ({ 
  frameType = 'page', 
  onAddSection,
  onDragOver,
  onDrop,
  isDragOver = false 
}) => {
  const isPageType = frameType === 'page';
  
  return (
    <div 
      className={`
        w-full min-h-screen relative transition-all duration-300
        ${isDragOver ? 'bg-blue-50/50' : 'bg-white'}
      `}
      style={{
        backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.05)' : '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: '1.6'
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Visual <body> Indicator */}
      <div 
        className="absolute top-2 left-2 text-xs font-mono opacity-30 select-none pointer-events-none"
        style={{ color: 'var(--color-text-muted)' }}
      >
        &lt;body&gt;
      </div>
      
      {/* Base Section - Always visible as first droppable root */}
      <div 
        className={`
          min-h-[400px] m-8 rounded-lg border-2 border-dashed transition-all duration-300
          ${isDragOver ? 'border-blue-400 bg-blue-50/30' : 'border-gray-300 bg-gray-50/30'}
        `}
        style={{ 
          position: 'relative',
          padding: '48px 24px'
        }}
      >
        {/* Section Label */}
        <div 
          className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium bg-white border"
          style={{ 
            color: 'var(--color-text-muted)',
            borderColor: 'var(--color-border)'
          }}
        >
          <Layers className="w-3 h-3 inline mr-1" />
          Section (Root)
        </div>

        {/* Drop Instructions */}
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <div className="text-center max-w-md space-y-6">
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary-soft)' }}
            >
              <Layout className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Drop elements here to start
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                This is your <strong>Base Section</strong> - the root container of your page.
                Drop layout containers or elements here to build your design.
              </p>
            </div>
            
            {/* Quick Start Options */}
            <div className="space-y-3">
              <button
                onClick={onAddSection}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <Plus className="w-4 h-4" />
                Add Nested Section
              </button>
              
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Or drag <strong>Section</strong>, <strong>Container</strong>, <strong>Flex</strong>, or <strong>Grid</strong> from the sidebar
              </div>
            </div>

            {/* Visual Hierarchy Guide */}
            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                Layout Hierarchy
              </h3>
              
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  { name: 'Layouts', desc: 'Can contain other layouts', color: '#10b981' },
                  { name: 'Elements', desc: 'Go inside layouts', color: '#3b82f6' },
                  { name: 'Auto-wrap', desc: 'Elements wrap if needed', color: '#8b5cf6' }
                ].map((item) => (
                  <div 
                    key={item.name}
                    className="p-3 rounded-lg border text-center"
                    style={{ 
                      backgroundColor: 'var(--color-bg-muted)',
                      borderColor: item.color + '30'
                    }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="font-medium" style={{ color: item.color }}>
                      {item.name}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)' }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Drop Overlay */}
        {isDragOver && (
          <div 
            className="absolute inset-0 flex items-center justify-center rounded-lg"
            style={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '3px solid rgba(59, 130, 246, 0.5)'
            }}
          >
            <div 
              className="bg-white border-2 rounded-xl p-6 shadow-2xl"
              style={{ 
                borderColor: 'var(--color-primary)',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <Plus 
                className="w-12 h-12 mx-auto mb-3 animate-pulse" 
                style={{ color: 'var(--color-primary)' }} 
              />
              <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                Drop into Base Section
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Closing </body> tag */}
      <div 
        className="absolute bottom-2 left-2 text-xs font-mono opacity-30 select-none pointer-events-none"
        style={{ color: 'var(--color-text-muted)' }}
      >
        &lt;/body&gt;
      </div>
    </div>
  );
};

export default EmptyCanvasState;