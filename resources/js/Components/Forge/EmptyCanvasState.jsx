// @/Components/Forge/EmptyCanvasState.jsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const EmptyCanvasState = ({ 
  frameType = 'page', 
  onAddSection,
  onDragOver,
  onDrop,
  isDragOver = false,
  responsiveMode = 'desktop',
  frame
}) => {
  const showBrowserFrame = responsiveMode !== 'desktop';
  
  // Get canvas dimensions based on responsive mode
  const getCanvasDimensions = () => {
    switch (responsiveMode) {
      case 'mobile':
        return { width: '375px', height: '667px', minHeight: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px', minHeight: '1024px' };
      case 'desktop':
      default:
        return { width: '1440px', height: 'auto', minHeight: '900px' };
    }
  };
  
  const dimensions = getCanvasDimensions();
  const canvasStyle = frame?.canvas_style || {};
  
  return (
    <div 
      className="relative transition-all duration-300"
      style={{
        width: dimensions.width,
        minHeight: dimensions.minHeight,
        maxWidth: dimensions.width,
        backgroundColor: canvasStyle.backgroundColor || '#ffffff',
        fontFamily: canvasStyle.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: canvasStyle.lineHeight || '1.6',
        overflow: 'visible',
        position: 'relative',
        boxSizing: 'border-box',
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Browser Frame for mobile/tablet */}
      {showBrowserFrame && responsiveMode === 'mobile' && (
        <div className="mb-0 bg-white border-b">
          <div className="flex items-center px-3 py-2 gap-2">
            <div className="flex-1 px-3 py-1.5 rounded-full text-sm bg-gray-100 flex items-center gap-2">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs truncate">decode.app</span>
            </div>
          </div>
        </div>
      )}

      {/* Visual <body> Indicator */}
      <div 
        className="absolute top-2 left-2 text-xs font-mono opacity-30 select-none pointer-events-none z-10"
        style={{ color: 'var(--color-text-muted)' }}
      >
        &lt;body&gt;
      </div>
      
      {/* Empty State Content with Add Section Button */}
      <div className="flex items-center justify-center" style={{ minHeight: dimensions.minHeight }}>
        <div className="text-center">
          <button
            onClick={onAddSection}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Plus className="w-5 h-5" />
            Add Section
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Click to add a section or drag elements from the sidebar
          </p>
        </div>
      </div>

      {/* Active Drop Overlay */}
      {isDragOver && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '3px solid rgba(59, 130, 246, 0.5)',
            zIndex: 50
          }}
        >
          <div className="bg-white border-2 rounded-xl p-6 shadow-2xl" style={{ borderColor: '#3b82f6' }}>
            <Plus className="w-12 h-12 mx-auto mb-3 animate-pulse" style={{ color: '#3b82f6' }} />
            <div className="text-lg font-bold">Drop here</div>
          </div>
        </div>
      )}

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