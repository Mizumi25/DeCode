import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Sparkles } from 'lucide-react';

const CanvasComponent = ({
  canvasRef,
  canvasComponents,
  selectedComponent,
  dragState,
  componentLibraryService,
  onCanvasDragOver,
  onCanvasDrop,
  onCanvasClick,
  onComponentClick
}) => {
  
  // Apply styles to a component element
  const applyStylesToComponent = (component) => {
    const styles = component.style || {};
    const animation = component.animation || {};
    
    // Convert filter object to CSS string if needed
    let filterString = '';
    if (styles.filter && typeof styles.filter === 'object') {
      const filters = [];
      if (styles.filter.blur) filters.push(`blur(${styles.filter.blur}px)`);
      if (styles.filter.brightness) filters.push(`brightness(${styles.filter.brightness})`);
      if (styles.filter.contrast) filters.push(`contrast(${styles.filter.contrast})`);
      if (styles.filter.saturate) filters.push(`saturate(${styles.filter.saturate})`);
      filterString = filters.join(' ') || 'none';
    }
    
    // Build transform string
    let transformString = '';
    const transforms = [];
    if (styles.scale && styles.scale !== 1) transforms.push(`scale(${styles.scale})`);
    if (styles.rotate && styles.rotate !== 0) transforms.push(`rotate(${styles.rotate}deg)`);
    if (styles.translateX) transforms.push(`translateX(${styles.translateX})`);
    if (styles.translateY) transforms.push(`translateY(${styles.translateY})`);
    transformString = transforms.join(' ') || 'none';
    
    return {
      // Layout & Position
      width: styles.width || 'auto',
      height: styles.height || 'auto',
      display: styles.display || 'block',
      position: styles.position || 'relative',
      zIndex: styles.zIndex || 'auto',
      
      // Colors & Appearance
      backgroundColor: styles.backgroundColor || 'transparent',
      color: styles.color || 'inherit',
      borderColor: styles.borderColor || 'transparent',
      
      // Background
      backgroundImage: styles.backgroundImage || 'none',
      backgroundSize: styles.backgroundSize || 'auto',
      backgroundPosition: styles.backgroundPosition || 'center',
      backgroundRepeat: styles.backgroundRepeat || 'no-repeat',
      
      // Border
      borderWidth: styles.borderWidth || '0',
      borderStyle: styles.borderStyle || 'solid',
      borderRadius: styles.borderRadius || '0',
      
      // Typography
      fontFamily: styles.fontFamily || 'inherit',
      fontSize: styles.fontSize || 'inherit',
      fontWeight: styles.fontWeight || 'inherit',
      lineHeight: styles.lineHeight || 'inherit',
      letterSpacing: styles.letterSpacing || 'normal',
      textAlign: styles.textAlign || 'left',
      textTransform: styles.textTransform || 'none',
      textDecoration: styles.textDecoration || 'none',
      
      // Effects
      opacity: styles.opacity !== undefined ? styles.opacity : 1,
      boxShadow: styles.boxShadow || 'none',
      textShadow: styles.textShadow || 'none',
      filter: filterString || styles.filter || 'none',
      backdropFilter: styles.backdropFilter || 'none',
      
      // Transform
      transform: transformString || styles.transform || 'none',
      
      // Transitions
      transitionProperty: styles.transitionProperty || 'all',
      transitionDuration: styles.transitionDuration || '0.3s',
      transitionTimingFunction: styles.transitionTimingFunction || 'ease',
      transitionDelay: styles.transitionDelay || '0s'
    };
  };

  // Get Framer Motion animation props
  const getAnimationProps = (component) => {
    const animation = component.animation || {};
    const animationProps = {
      initial: { opacity: 0, scale: 0, rotate: -10 },
      animate: {
        opacity: 1,
        scale: selectedComponent === component.id ? 1.1 : 1,
        rotate: 0
      },
      exit: { scale: 0, opacity: 0, rotate: 10 },
      whileHover: { scale: 1.05 },
      transition: {
        duration: animation.duration || 0.3,
        delay: animation.delay || 0,
        ease: animation.ease || 'easeOut'
      }
    };

    // Apply specific animation types
    switch (animation.type) {
      case 'fadeIn':
        animationProps.initial = { opacity: 0 };
        animationProps.animate = { ...animationProps.animate, opacity: 1 };
        break;
      
      case 'slideIn':
        animationProps.initial = { opacity: 0, x: -50 };
        animationProps.animate = { ...animationProps.animate, x: 0 };
        break;
      
      case 'bounce':
        animationProps.transition.type = 'spring';
        animationProps.transition.bounce = 0.6;
        break;
      
      case 'scale':
        animationProps.initial = { opacity: 0, scale: 0 };
        break;
      
      case 'rotate':
        animationProps.initial = { opacity: 0, rotate: -180 };
        break;
      
      case 'flip':
        animationProps.initial = { opacity: 0, rotateY: -90 };
        animationProps.animate = { ...animationProps.animate, rotateY: 0 };
        break;
    }

    // Apply hover effects
    if (animation.hover?.type && animation.hover.type !== 'none') {
      switch (animation.hover.type) {
        case 'scale':
          animationProps.whileHover = { 
            scale: animation.hover.scale || 1.1,
            transition: { duration: 0.2 }
          };
          break;
        
        case 'rotate':
          animationProps.whileHover = { 
            rotate: 5,
            transition: { duration: 0.2 }
          };
          break;
        
        case 'lift':
          animationProps.whileHover = { 
            y: -5,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            transition: { duration: 0.2 }
          };
          break;
        
        case 'glow':
          animationProps.whileHover = { 
            boxShadow: '0 0 20px rgba(160, 82, 255, 0.5)', // Using CSS variable would be better but can't access here
            transition: { duration: 0.2 }
          };
          break;
        
        case 'shake':
          animationProps.whileHover = { 
            x: [0, -2, 2, -2, 2, 0],
            transition: { duration: 0.4, repeat: Infinity }
          };
          break;
      }
    }

    // Apply scroll trigger animations
    if (animation.scrollTrigger?.enabled) {
      // This would need to be implemented with intersection observer
      // For now, we'll just apply the initial animation
    }

    return animationProps;
  };

  // Enhanced component rendering that properly handles variants
  const renderComponent = (component) => {
    const componentRenderer = componentLibraryService?.getComponent(component.type);
    
    // If component has a variant with preview code, prioritize that
    if (component.variant?.preview_code) {
      try {
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: component.variant.preview_code.replace(/className=/g, 'class=')
            }}
          />
        );
      } catch (error) {
        console.warn('Error rendering variant preview:', error);
      }
    }
    
    // If component has variant props, merge them with default props
    let renderProps = { ...component.props };
    if (component.variant) {
      // Apply variant-specific props
      if (component.variant.props) {
        renderProps = { ...renderProps, ...component.variant.props };
      }
      
      // Apply variant styles if available
      if (component.variant.style) {
        renderProps.style = { ...renderProps.style, ...component.variant.style };
      }
      
      // Apply variant className if available
      if (component.variant.className) {
        renderProps.className = `${renderProps.className || ''} ${component.variant.className}`.trim();
      }
    }
    
    // Render using the component library service
    if (componentRenderer) {
      return componentRenderer.render(renderProps, component.id);
    }
    
    // Fallback for unknown components
    return (
      <div className="p-2 bg-red-100 border border-red-300 rounded">
        Unknown Component: {component.type}
        {component.variant && (
          <div className="text-xs mt-1">Variant: {component.variant.name}</div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="text-center space-y-6 mb-8">
        <div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(to right, var(--color-primary), #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Visual Builder
          </h1>
          <div
            className="w-24 h-1 rounded-full mx-auto"
            style={{ background: 'linear-gradient(to right, var(--color-primary), #7c3aed)' }}
          ></div>
        </div>
        <p
          className="text-lg max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Drag components from the sidebar to build your interface.
          <span
            className="font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            {' '}Select and customize
          </span>{' '}
          elements in real-time with advanced styling options.
        </p>
      </div>

      {/* Enhanced Canvas Area */}
      <div
        ref={canvasRef}
        className={`relative w-full h-[500px] border-2 border-dashed rounded-2xl transition-all duration-300 ${
          dragState.isDragging ? 'scale-105' : ''
        }`}
        style={{
          borderColor: dragState.isDragging ? 'var(--color-primary)' : 'var(--color-border)',
          backgroundColor: dragState.isDragging ? 'var(--color-primary-soft)' : 'var(--color-surface)',
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(155, 155, 155, 0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          boxShadow: 'var(--shadow-lg)'
        }}
        onDragOver={onCanvasDragOver}
        onDrop={onCanvasDrop}
        onClick={onCanvasClick}
      >
        {canvasComponents.length === 0 && !dragState.isDragging && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="mb-4">
                <Square
                  className="w-16 h-16 mx-auto opacity-50"
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </div>
              <div
                className="text-lg font-medium"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Drop components here to start building
              </div>
              <div
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Your canvas awaits your creativity
              </div>
            </div>
          </div>
        )}

        {dragState.isDragging && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <div className="animate-bounce">
                <Sparkles
                  className="w-12 h-12 mx-auto"
                  style={{ color: 'var(--color-primary)' }}
                />
              </div>
              <div
                className="font-bold text-xl"
                style={{ color: 'var(--color-primary)' }}
              >
                Drop {dragState.draggedComponent?.variant?.name || dragState.draggedComponent?.name || 'component'} here
              </div>
              <div
                className="text-sm"
                style={{ color: 'var(--color-primary)' }}
              >
                {dragState.draggedComponent?.variant 
                  ? `${dragState.draggedComponent.variant.name} variant of ${dragState.draggedComponent.component?.name || 'component'}`
                  : 'Release to add to your design'
                }
              </div>
            </div>
          </div>
        )}

        {/* Enhanced component rendering with styles and animations */}
        <AnimatePresence>
          {canvasComponents.map((component) => {
            // Enhanced component rendering with styles and animations
            const animationProps = getAnimationProps(component);
            const componentStyles = applyStylesToComponent(component);

            return (
              <motion.div
                key={component.id}
                {...animationProps}
                className={`absolute cursor-pointer transition-all duration-300 ${
                  selectedComponent === component.id ? 'ring-4 ring-offset-2' : ''
                }`}
                style={{
                  left: component.position.x,
                  top: component.position.y,
                  ringColor: selectedComponent === component.id ? 'var(--color-primary)' : 'transparent',
                  boxShadow:
                    selectedComponent === component.id ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                  ...componentStyles
                }}
                onClick={(e) => onComponentClick(component.id, e)}
              >
                {/* Enhanced component rendering */}
                {renderComponent(component)}
                
                {/* Selection indicator */}
                {selectedComponent === component.id && (
                  <div 
                    className="absolute -inset-1 border-2 border-dashed rounded-lg pointer-events-none"
                    style={{ borderColor: 'var(--color-primary)' }}
                  />
                )}
                
                {/* Component label when selected */}
                {selectedComponent === component.id && (
                  <div 
                    className="absolute -top-6 left-0 px-2 py-1 text-xs font-medium rounded-md"
                    style={{ 
                      backgroundColor: 'var(--color-primary)', 
                      color: 'white',
                      fontSize: '10px'
                    }}
                  >
                    {component.name}
                    {component.variant && (
                      <span className="opacity-75"> • {component.variant.name}</span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Enhanced stats bar */}
      {canvasComponents.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div
            className="border rounded-full px-6 py-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#A052FF' }}
                ></div>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {canvasComponents.length} Component
                  {canvasComponents.length !== 1 ? 's' : ''}
                </span>
              </div>
              {selectedComponent && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  ></div>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    Selected: {canvasComponents.find((c) => c.id === selectedComponent)?.name}
                    {canvasComponents.find((c) => c.id === selectedComponent)?.variant && (
                      <span className="opacity-75">
                        {' '}• {canvasComponents.find((c) => c.id === selectedComponent)?.variant.name}
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Enhanced with CSS & Animations
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasComponent;