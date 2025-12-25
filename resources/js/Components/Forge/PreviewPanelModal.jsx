import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, Loader2 } from 'lucide-react';
import WindowPanel from '@/Components/WindowPanel';
import { useForgeStore } from '@/stores/useForgeStore';
import AnimatedComponent, { generatePreviewKeyframes } from './AnimatedComponent';

export default function PreviewPanelModal({ 
  canvasComponents, 
  frame, 
  componentLibraryService,
  onClose,
  initialMode = "modal" // Allow passing initial mode (modal, window, fullscreen)
}) {
  const [isLoading, setIsLoading] = useState(true);
  const previewRef = useRef(null);
  const { previewPanelResponsiveMode, setPreviewPanelResponsiveMode } = useForgeStore();
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [canvasComponents]);
  
  // 🎬 Generate CSS keyframes for all animated components
  const keyframesCSS = generatePreviewKeyframes(canvasComponents);

  const getPreviewDimensions = () => {
    switch (previewPanelResponsiveMode) {
      case 'mobile': return { width: '375px', height: '667px' };
      case 'tablet': return { width: '768px', height: '1024px' };
      case 'desktop': return { width: '1440px', height: '900px' };
      default: return { width: '1440px', height: '900px' };
    }
  };

  const dimensions = getPreviewDimensions();
  
  // Build a proper tree (roots with children) like the Canvas does
  const buildTree = (components = []) => {
    const map = new Map();
    const roots = [];

    components.forEach(c => map.set(c.id, { ...c, children: c.children ? [...c.children] : [] }));

    components.forEach(c => {
      const node = map.get(c.id);
      const parentId = c.parentId || c.parent_id || null;
      if (parentId && map.has(parentId)) {
        const parent = map.get(parentId);
        parent.children = parent.children || [];
        // Avoid duplicates if children already present
        if (!parent.children.some(ch => ch.id === node.id)) parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  // Render recursively, applying the same responsive style calculation as CanvasComponent
  const renderTree = (component, parentStyles = {}) => {
    const responsiveStyles = componentLibraryService?.calculateResponsiveStyles
      ? componentLibraryService.calculateResponsiveStyles(
          component,
          previewPanelResponsiveMode,
          dimensions,
          parentStyles
        )
      : (component.style || {});

    const renderedChildren = component.children?.length
      ? component.children.map(child => renderTree(child, responsiveStyles))
      : null;

    const renderedComponent = componentLibraryService.renderUnified(
      { ...component, style: responsiveStyles },
      component.id,
      renderedChildren
    );

    // Wrap with AnimatedComponent if animations are enabled
    if (component.props?.animation?.enabled) {
      return (
        <AnimatedComponent key={component.id} component={component} isPreview={true}>
          {renderedComponent}
        </AnimatedComponent>
      );
    }

    return renderedComponent;
  };
  
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
              <>
                {/* 🎬 Inject CSS Keyframes */}
                {keyframesCSS.length > 0 && (
                  <style>{keyframesCSS.join('\n\n')}</style>
                )}
                
                {/* Render components (same hierarchy + responsive styles as Canvas) */}
                <div style={{ pointerEvents: 'none' }}>
                  {buildTree(canvasComponents).map(root => renderTree(root, {}))}
                </div>
              </>
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
      initialMode={initialMode}
      initialSize={{ width: 1000, height: 700 }}
      minSize={{ width: 600, height: 400 }}
      maxSize={{ width: 1600, height: 1000 }}
      zIndexBase={9999}
    />
  );
}