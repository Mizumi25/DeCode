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
    console.log('Rendering component:', component.type, 'with variant:', component.variant);
    
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
      
      // If variant has custom HTML, use it
      if (component.variant.html) {
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: component.variant.html.replace(/className=/g, 'class=')
            }}
          />
        );
      }
    }
    
    // Dynamic component rendering based on type and variant
    return renderComponentByType(component, renderProps);
  };

  // Dynamic component renderer based on type
  const renderComponentByType = (component, props) => {
    const variantName = component.variant?.name || 'default';
    
    switch (component.type) {
      case 'button':
        return renderButton(component, props, variantName);
      case 'avatar':
        return renderAvatar(component, props, variantName);
      case 'badge':
        return renderBadge(component, props, variantName);
      case 'card':
        return renderCard(component, props, variantName);
      case 'input':
        return renderInput(component, props, variantName);
      case 'searchbar':
        return renderSearchbar(component, props, variantName);
      default:
        return renderGeneric(component, props, variantName);
    }
  };

  // Button renderer with variant support
  const renderButton = (component, props, variantName) => {
    const buttonClasses = getButtonClasses(variantName, props.size || 'md');
    const text = props.text || component.variant?.text || 'Button';
    
    return (
      <button 
        className={`${buttonClasses} ${props.className || ''}`}
        disabled={props.disabled}
        style={props.style}
      >
        {text}
      </button>
    );
  };

  // Avatar renderer with variant support
  const renderAvatar = (component, props, variantName) => {
    const avatarClasses = getAvatarClasses(variantName, props.size || 'md');
    const initials = props.initials || props.name?.charAt(0) || 'A';
    
    if (props.src) {
      return (
        <div className={avatarClasses}>
          <img src={props.src} alt={props.alt || 'Avatar'} className="w-full h-full object-cover" />
        </div>
      );
    }
    
    return (
      <div className={avatarClasses} style={props.style}>
        <span className="font-medium">{initials}</span>
      </div>
    );
  };

  // Badge renderer with variant support
  const renderBadge = (component, props, variantName) => {
    const badgeClasses = getBadgeClasses(variantName, props.size || 'md');
    const text = props.text || component.variant?.text || 'Badge';
    
    return (
      <span className={`${badgeClasses} ${props.className || ''}`} style={props.style}>
        {text}
      </span>
    );
  };

  // Card renderer with variant support
  const renderCard = (component, props, variantName) => {
    const cardClasses = getCardClasses(variantName, props.padding || 'md');
    
    return (
      <div className={`${cardClasses} ${props.className || ''}`} style={props.style}>
        {props.title && (
          <h3 className="font-semibold text-lg mb-2 text-gray-900">
            {props.title}
          </h3>
        )}
        <div className="text-gray-600">
          {props.content || 'Card content'}
        </div>
      </div>
    );
  };

  // Input renderer with variant support
  const renderInput = (component, props, variantName) => {
    const inputClasses = getInputClasses(variantName, props.size || 'md');
    
    return (
      <input 
        type={props.type || 'text'}
        placeholder={props.placeholder || ''}
        className={`${inputClasses} ${props.className || ''}`}
        disabled={props.disabled}
        required={props.required}
        style={props.style}
      />
    );
  };

  // Searchbar renderer with variant support
  const renderSearchbar = (component, props, variantName) => {
    const searchClasses = getSearchbarClasses(variantName, props.size || 'md');
    
    return (
      <div className={`${searchClasses} ${props.className || ''}`} style={props.style}>
        <input 
          type="text"
          placeholder={props.placeholder || 'Search...'}
          className="flex-1 bg-transparent outline-none"
        />
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    );
  };

  // Generic renderer for unknown components
  const renderGeneric = (component, props, variantName) => {
    return (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
        <div className="font-semibold text-gray-700">{component.name}</div>
        <div className="text-xs text-gray-500 mt-1">({component.type})</div>
        {variantName !== 'default' && (
          <div className="text-xs text-blue-500 mt-1">{variantName}</div>
        )}
      </div>
    );
  };

  // Get button classes based on variant
  const getButtonClasses = (variant, size) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantClasses = {
      primary: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500 shadow-lg hover:shadow-xl",
      secondary: "bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-50 focus:ring-gray-500 shadow-sm hover:shadow-md",
      success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500 shadow-lg hover:shadow-xl",
      warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 focus:ring-amber-500 shadow-lg hover:shadow-xl",
      danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500 shadow-lg hover:shadow-xl",
      ghost: "bg-transparent text-purple-600 hover:bg-purple-50 focus:ring-purple-500 border border-transparent hover:border-purple-200",
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all",
      neon: "bg-black border-2 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/50 hover:shadow-cyan-400/75",
      glass: "bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl",
      outline: "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
      minimal: "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
      default: "bg-gray-100 text-gray-900 hover:bg-gray-200"
    };
    
    const sizeClasses = {
      xs: "px-2 py-1 text-xs",
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-4 text-lg",
      xl: "px-10 py-5 text-xl"
    };
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md}`;
  };

  // Get avatar classes based on variant
  const getAvatarClasses = (variant, size) => {
    const baseClasses = "rounded-full flex items-center justify-center overflow-hidden";
    
    const variantClasses = {
      default: "bg-gray-300 text-gray-600",
      primary: "bg-purple-100 text-purple-600",
      success: "bg-green-100 text-green-600",
      warning: "bg-yellow-100 text-yellow-600",
      danger: "bg-red-100 text-red-600",
      gradient: "bg-gradient-to-r from-purple-400 to-pink-400 text-white",
      bordered: "bg-white border-2 border-gray-300 text-gray-600"
    };
    
    const sizeClasses = {
      xs: "w-6 h-6 text-xs",
      sm: "w-8 h-8 text-sm",
      md: "w-12 h-12 text-base",
      lg: "w-16 h-16 text-lg",
      xl: "w-20 h-20 text-xl"
    };
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md}`;
  };

  // Get badge classes based on variant
  const getBadgeClasses = (variant, size) => {
    const baseClasses = "inline-block rounded-full font-medium";
    
    const variantClasses = {
      default: "bg-gray-100 text-gray-800",
      primary: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      danger: "bg-red-100 text-red-800",
      info: "bg-cyan-100 text-cyan-800",
      gradient: "bg-gradient-to-r from-purple-400 to-pink-400 text-white",
      outline: "border-2 border-gray-300 bg-transparent text-gray-700"
    };
    
    const sizeClasses = {
      xs: "px-1.5 py-0.5 text-xs",
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base"
    };
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md}`;
  };

  // Get card classes based on variant
  const getCardClasses = (variant, padding) => {
    const baseClasses = "rounded-lg";
    
    const variantClasses = {
      default: "bg-white border border-gray-200",
      outlined: "bg-transparent border-2 border-gray-300",
      elevated: "bg-white shadow-lg border-0",
      flat: "bg-gray-50 border-0",
      gradient: "bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200",
      glass: "bg-white/20 backdrop-blur-md border border-white/30"
    };
    
    const paddingClasses = {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8"
    };
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${paddingClasses[padding] || paddingClasses.md}`;
  };

  // Get input classes based on variant
  const getInputClasses = (variant, size) => {
    const baseClasses = "block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";
    
    const variantClasses = {
      default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      error: "border-red-300 focus:border-red-500 focus:ring-red-500",
      success: "border-green-300 focus:border-green-500 focus:ring-green-500",
      minimal: "border-0 border-b-2 border-gray-300 rounded-none focus:border-blue-500",
      filled: "bg-gray-100 border-gray-100 focus:bg-white focus:border-blue-500"
    };
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-5 py-3 text-lg"
    };
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md}`;
  };

  // Get searchbar classes based on variant
  const getSearchbarClasses = (variant, size) => {
    const baseClasses = "flex items-center rounded-lg border transition-colors duration-200";
    
    const variantClasses = {
      default: "bg-white border-gray-300 focus-within:border-blue-500",
      filled: "bg-gray-100 border-gray-100 focus-within:bg-white focus-within:border-blue-500",
      minimal: "bg-transparent border-0 border-b-2 border-gray-300 rounded-none focus-within:border-blue-500",
      elevated: "bg-white shadow-md border-0 focus-within:shadow-lg"
    };
    
    const sizeClasses = {
      sm: "px-3 py-1.5",
      md: "px-4 py-2.5",
      lg: "px-5 py-3"
    };
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md}`;
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