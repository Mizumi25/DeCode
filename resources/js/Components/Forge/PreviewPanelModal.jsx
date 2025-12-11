import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, Loader2 } from 'lucide-react';
import WindowPanel from '@/Components/WindowPanel';
import { useForgeStore } from '@/stores/useForgeStore';

export default function PreviewPanelModal({ 
  canvasComponents, 
  frame, 
  componentLibraryService,
  onClose 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const previewRef = useRef(null);
  const { previewPanelResponsiveMode, setPreviewPanelResponsiveMode } = useForgeStore();
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [canvasComponents]);
  
  const getPreviewDimensions = () => {
    switch (previewPanelResponsiveMode) {
      case 'mobile': return { width: '375px', height: '667px' };
      case 'tablet': return { width: '768px', height: '1024px' };
      case 'desktop': return { width: '1440px', height: '900px' };
      default: return { width: '1440px', height: '900px' };
    }
  };
  
  const dimensions = getPreviewDimensions();
  
  // Preview content with responsive controls
  const previewContent = (
    <div className="flex flex-col h-full">
      {/* Responsive Mode Toggle */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface)]">
          <button
            onClick={() => setPreviewPanelResponsiveMode('desktop')}
            className={`p-1.5 rounded transition-colors ${
              previewPanelResponsiveMode === 'desktop'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewPanelResponsiveMode('tablet')}
            className={`p-1.5 rounded transition-colors ${
              previewPanelResponsiveMode === 'tablet'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
            title="Tablet View"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewPanelResponsiveMode('mobile')}
            className={`p-1.5 rounded transition-colors ${
              previewPanelResponsiveMode === 'mobile'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
        
        <span className="text-sm text-[var(--color-text-muted)]">
          {dimensions.width} × {dimensions.height}
        </span>
      </div>
      
      {/* Preview Content */}
      <div className="relative flex-1 overflow-auto bg-[var(--color-bg)]">
        <div className="flex items-start justify-center p-8">
          <div
            ref={previewRef}
            className="relative bg-white rounded-lg shadow-2xl overflow-auto"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              maxHeight: 'calc(100vh - 250px)',
            }}
          >
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : (
              canvasComponents.map((component) => 
                componentLibraryService.renderUnified(
                  component,
                  component.id
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <WindowPanel
      isOpen={true}
      title="Preview"
      content={previewContent}
      onClose={onClose}
      initialMode="modal"
      initialSize={{ width: 1000, height: 700 }}
      minSize={{ width: 600, height: 400 }}
      maxSize={{ width: 1600, height: 1000 }}
      zIndexBase={9999}
    />
  );
}