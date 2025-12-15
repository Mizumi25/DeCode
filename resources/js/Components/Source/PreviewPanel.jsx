import React, { useState, useEffect } from 'react';
import {
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import componentLibraryService from '@/Services/ComponentLibraryService';

export default function PreviewPanel({ previewMode, setPreviewMode }) {
  const { project, frame } = usePage().props;
  const [isLoading, setIsLoading] = useState(true);
  const [canvasComponents, setCanvasComponents] = useState([]);
  
  // Load canvas components from current frame
  useEffect(() => {
    if (frame && frame.canvas_data) {
      setIsLoading(true);
      const components = frame.canvas_data.components || [];
      setCanvasComponents(components);
      
      // Simulate brief loading for smooth transition
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [frame]);
  
  const getPreviewDimensions = () => {
    switch (previewMode) {
      case 'mobile': return { width: '375px', height: '667px' };
      case 'tablet': return { width: '768px', height: '1024px' };
      case 'desktop': return { width: '100%', height: '100%' };
      default: return { width: '100%', height: '100%' };
    }
  };
  
  const dimensions = getPreviewDimensions();
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
      {/* Preview Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ 
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        <div className="flex items-center space-x-2">
          <Eye size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="text-sm font-semibold uppercase tracking-wide">Live Preview</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`p-1.5 rounded-md transition-all hover:scale-110 ${
              previewMode === 'desktop' 
                ? 'text-white shadow-lg' 
                : 'hover:text-[var(--color-primary)]'
            }`}
            style={{
              backgroundColor: previewMode === 'desktop' ? 'var(--color-primary)' : 'var(--color-primary-soft)',
              color: previewMode === 'desktop' ? 'white' : 'var(--color-primary)'
            }}
            title="Desktop View"
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setPreviewMode('tablet')}
            className={`p-1.5 rounded-md transition-all hover:scale-110 ${
              previewMode === 'tablet' 
                ? 'text-white shadow-lg' 
                : 'hover:text-[var(--color-primary)]'
            }`}
            style={{
              backgroundColor: previewMode === 'tablet' ? 'var(--color-primary)' : 'var(--color-primary-soft)',
              color: previewMode === 'tablet' ? 'white' : 'var(--color-primary)'
            }}
            title="Tablet View"
          >
            <Tablet size={14} />
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`p-1.5 rounded-md transition-all hover:scale-110 ${
              previewMode === 'mobile' 
                ? 'text-white shadow-lg' 
                : 'hover:text-[var(--color-primary)]'
            }`}
            style={{
              backgroundColor: previewMode === 'mobile' ? 'var(--color-primary)' : 'var(--color-primary-soft)',
              color: previewMode === 'mobile' ? 'white' : 'var(--color-primary)'
            }}
            title="Mobile View"
          >
            <Smartphone size={14} />
          </button>
          <div className="w-px h-4 bg-slate-300 mx-2"></div>
          <button
            className="p-1.5 rounded-md transition-all hover:scale-110 hover:text-[var(--color-primary)]"
            style={{
              backgroundColor: 'var(--color-bg-muted)',
              color: 'var(--color-text-muted)'
            }}
            title="Refresh Preview"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Preview Content - LIVE RENDERING */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="flex items-start justify-center p-4 min-h-full">
          <div
            className="relative bg-white rounded-lg shadow-2xl overflow-auto transition-all duration-300"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              minHeight: previewMode === 'desktop' ? '100%' : dimensions.height,
            }}
          >
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : canvasComponents.length > 0 ? (
              <div className="w-full h-full">
                {canvasComponents.map((component) => 
                  componentLibraryService.renderUnified(
                    component,
                    component.id
                  )
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)] opacity-50" />
                  <p className="text-[var(--color-text-muted)]">No components to preview</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-2">Add components in Forge to see live preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}