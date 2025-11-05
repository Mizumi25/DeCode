import React, { useState, useRef, useEffect } from 'react';
import { X, Monitor, Tablet, Smartphone, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
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
  
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-[var(--color-surface)] rounded-2xl shadow-2xl overflow-hidden"
        style={{
          width: 'calc(100vw - 80px)',
          height: 'calc(100vh - 80px)',
          maxWidth: '1600px',
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Preview</h2>
            
            {/* Responsive Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-bg-muted)]">
              <button
                onClick={() => setPreviewPanelResponsiveMode('desktop')}
                className={`p-1.5 rounded transition-colors ${
                  previewPanelResponsiveMode === 'desktop'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
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
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            
            <span className="text-sm text-[var(--color-text-muted)]">
              {dimensions.width} × {dimensions.height}
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-text)]" />
          </button>
        </div>
        
        {/* Preview Content */}
        <div className="relative w-full h-[calc(100%-72px)] overflow-auto bg-[var(--color-bg)]">
          <div className="flex items-start justify-center p-8">
            <div
              ref={previewRef}
              className="relative bg-white rounded-lg shadow-2xl overflow-auto"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                maxHeight: 'calc(100vh - 200px)',
              }}
            >
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                </div>
              ) : (
                canvasComponents.map((component) => 
                  componentLibraryService.renderComponent(
                    componentLibraryService.getComponentDefinition(component.type),
                    component,
                    component.id
                  )
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}