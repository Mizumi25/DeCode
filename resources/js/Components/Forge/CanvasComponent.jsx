import React, { useRef, useEffect, useState } from 'react';
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
  
  // Track canvas dimensions for overflow prevention
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 500 });
  
  useEffect(() => {
    if (canvasRef?.current) {
      const updateDimensions = () => {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasDimensions({ width: rect.width, height: rect.height });
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [canvasRef]);
  
  // Apply styles to a component element with overflow prevention
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
    
    // Calculate available width for the component
    const availableWidth = canvasDimensions.width - component.position.x - 40; // 40px margin
    const maxComponentWidth = Math.max(100, Math.min(availableWidth, 400)); // Min 100px, max 400px or available
    
    return {
      // Layout & Position with overflow prevention
      width: styles.width || 'fit-content',
      maxWidth: `${maxComponentWidth}px`,
      height: styles.height || 'auto',
      display: styles.display || 'block',
      position: styles.position || 'relative',
      zIndex: styles.zIndex || 'auto',
      overflow: 'hidden', // Prevent content overflow
      
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
      
      // Typography with overflow handling
      fontFamily: styles.fontFamily || 'inherit',
      fontSize: styles.fontSize || 'inherit',
      fontWeight: styles.fontWeight || 'inherit',
      lineHeight: styles.lineHeight || 'inherit',
      letterSpacing: styles.letterSpacing || 'normal',
      textAlign: styles.textAlign || 'left',
      textTransform: styles.textTransform || 'none',
      textDecoration: styles.textDecoration || 'none',
      wordBreak: 'break-word',
      wordWrap: 'break-word',
      
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
      initial: { opacity: 0, scale: 0.8 },
      animate: {
        opacity: 1,
        scale: selectedComponent === component.id ? 1.05 : 1,
      },
      exit: { scale: 0.8, opacity: 0 },
      whileHover: { scale: 1.02 },
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
        animationProps.initial = { opacity: 0, x: -30 };
        animationProps.animate = { ...animationProps.animate, x: 0 };
        break;
      
      case 'bounce':
        animationProps.transition.type = 'spring';
        animationProps.transition.bounce = 0.4;
        break;
      
      case 'scale':
        animationProps.initial = { opacity: 0, scale: 0.8 };
        break;
      
      case 'rotate':
        animationProps.initial = { opacity: 0, rotate: -90 };
        animationProps.animate = { ...animationProps.animate, rotate: 0 };
        break;
      
      case 'flip':
        animationProps.initial = { opacity: 0, rotateY: -45 };
        animationProps.animate = { ...animationProps.animate, rotateY: 0 };
        break;
    }

    return animationProps;
  };

  // Enhanced component rendering that properly handles variants and prevents overflow
  const renderComponent = (component) => {
    console.log('Rendering component:', component.type, 'with variant:', component.variant);
    
    // Container styles to prevent overflow
    const containerStyle = {
      maxWidth: '100%',
      overflow: 'hidden',
      display: 'inline-block',
      boxSizing: 'border-box',
    };
    
    const componentRenderer = componentLibraryService?.getComponent(component.type);
    
    // If component has a variant with preview code, prioritize that
    if (component.variant?.preview_code) {
      try {
        return (
          <div
            style={containerStyle}
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
            style={containerStyle}
            dangerouslySetInnerHTML={{
              __html: component.variant.html.replace(/className=/g, 'class=')
            }}
          />
        );
      }
    }
    
    // Wrap the component to prevent overflow
    const renderedComponent = renderComponentByType(component, renderProps);
    
    return (
      <div style={containerStyle}>
        {renderedComponent}
      </div>
    );
  };

  // Dynamic component renderer based on type with overflow prevention
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

  // Button renderer with variant support and overflow prevention
  const renderButton = (component, props, variantName) => {
    const buttonClasses = getButtonClasses(variantName, props.size || 'md');
    const text = props.text || component.variant?.text || 'Button';
    
    // Calculate available width
    const availableWidth = canvasDimensions.width - component.position.x - 40;
    const maxWidth = Math.max(60, Math.min(availableWidth, 300));
    
    const buttonStyle = {
      maxWidth: `${maxWidth}px`,
      wordBreak: 'break-word',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: props.width || 'fit-content',
      minWidth: '60px',
      ...props.style
    };
    
    return (
      <button 
        className={`${buttonClasses} ${props.className || ''}`}
        disabled={props.disabled}
        style={buttonStyle}
        title={text} // Show full text on hover
      >
        {text}
      </button>
    );
  };

  // Avatar renderer with variant support and size constraints
  const renderAvatar = (component, props, variantName) => {
    const avatarClasses = getAvatarClasses(variantName, props.size || 'md');
    const initials = props.initials || props.name?.charAt(0) || 'A';
    
    if (props.src) {
      return (
        <div className={avatarClasses} style={props.style}>
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

  // Badge renderer with variant support and overflow prevention
  const renderBadge = (component, props, variantName) => {
    const badgeClasses = getBadgeClasses(variantName, props.size || 'md');
    const text = props.text || component.variant?.text || 'Badge';
    
    const badgeStyle = {
      maxWidth: '150px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      ...props.style
    };
    
    return (
      <span 
        className={`${badgeClasses} ${props.className || ''}`} 
        style={badgeStyle}
        title={text}
      >
        {text}
      </span>
    );
  };

  // Card renderer with variant support and width constraints
  const renderCard = (component, props, variantName) => {
    const cardClasses = getCardClasses(variantName, props.padding || 'md', props.size || 'md');
    
    // Calculate available width for card
    const availableWidth = canvasDimensions.width - component.position.x - 40;
    const maxWidth = Math.max(200, Math.min(availableWidth, 400));
    
    const cardStyle = {
      maxWidth: `${maxWidth}px`,
      width: props.width || 'fit-content',
      ...props.style
    };
    
    return (
      <div className={`${cardClasses} ${props.className || ''}`} style={cardStyle}>
        {props.title && (
          <h3 className="font-semibold text-lg mb-2 text-gray-900 truncate">
            {props.title}
          </h3>
        )}
        <div className="text-gray-600 overflow-hidden">
          <div className="line-clamp-3">
            {props.content || 'Card content'}
          </div>
        </div>
      </div>
    );
  };

  // Input renderer with variant support and width constraints
  const renderInput = (component, props, variantName) => {
    const inputClasses = getInputClasses(variantName, props.size || 'md');
    
    // Calculate available width
    const availableWidth = canvasDimensions.width - component.position.x - 40;
    const maxWidth = Math.max(150, Math.min(availableWidth, 300));
    
    const inputStyle = {
      maxWidth: `${maxWidth}px`,
      width: props.width || '100%',
      ...props.style
    };
    
    return (
      <input 
        type={props.type || 'text'}
        placeholder={props.placeholder || ''}
        className={`${inputClasses} ${props.className || ''}`}
        disabled={props.disabled}
        required={props.required}
        style={inputStyle}
      />
    );
  };

  // Searchbar renderer with variant support and width constraints
  const renderSearchbar = (component, props, variantName) => {
    const searchClasses = getSearchbarClasses(variantName, props.size || 'md');
    
    // Calculate available width
    const availableWidth = canvasDimensions.width - component.position.x - 40;
    const maxWidth = Math.max(200, Math.min(availableWidth, 350));
    
    const searchStyle = {
      maxWidth: `${maxWidth}px`,
      width: props.width || '100%',
      ...props.style
    };
    
    return (
      <div className={`${searchClasses} ${props.className || ''}`} style={searchStyle}>
        <input 
          type="text"
          placeholder={props.placeholder || 'Search...'}
          className="flex-1 bg-transparent outline-none min-w-0"
        />
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    );
  };

  // Generic renderer for unknown components with size constraints
  const renderGeneric = (component, props, variantName) => {
    const containerStyle = {
      maxWidth: '200px',
      overflow: 'hidden',
      ...props.style
    };
    
    return (
      <div 
        className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center"
        style={containerStyle}
      >
        <div className="font-semibold text-gray-700 truncate" title={component.name}>
          {component.name}
        </div>
        <div className="text-xs text-gray-500 mt-1 truncate">
          ({component.type})
        </div>
        {variantName !== 'default' && (
          <div className="text-xs text-blue-500 mt-1 truncate" title={variantName}>
            {variantName}
          </div>
        )}
      </div>
    );
  };

  // Get button classes based on variant with size constraints
  const getButtonClasses = (variant, size) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shrink-0";
    
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
      xs: "px-2 py-1 text-xs min-w-[40px] max-w-[120px]",
      sm: "px-3 py-1.5 text-sm min-w-[50px] max-w-[150px]",
      md: "px-6 py-2.5 text-base min-w-[60px] max-w-[200px]",
      lg: "px-8 py-4 text-lg min-w-[80px] max-w-[250px]",
      xl: "px-10 py-5 text-xl min-w-[100px] max-w-[300px]"
    };
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md}`;
  };

  // Get avatar classes based on variant with fixed dimensions
  const getAvatarClasses = (variant, size) => {
    const baseClasses = "rounded-full flex items-center justify-center overflow-hidden shrink-0";
    
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

  // Get badge classes based on variant with width constraints
  const getBadgeClasses = (variant, size) => {
    const baseClasses = "inline-block rounded-full font-medium shrink-0";
    
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
      xs: "px-1.5 py-0.5 text-xs max-w-[80px]",
      sm: "px-2 py-0.5 text-xs max-w-[100px]",
      md: "px-2.5 py-1 text-sm max-w-[120px]",
      lg: "px-3 py-1.5 text-base max-w-[150px]"
    };
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md}`;
  };

  // Get card classes based on variant with size constraints
  const getCardClasses = (variant, padding, size) => {
    const baseClasses = "rounded-lg shrink-0";
    
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
    
    const sizeClasses = {
      sm: "max-w-[200px]",
      md: "max-w-[300px]",
      lg: "max-w-[400px]",
      xl: "max-w-[500px]"
    };
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${paddingClasses[padding] || paddingClasses.md} ${sizeClasses[size] || sizeClasses.md}`;
  };

  // Get input classes based on variant with width constraints
  const getInputClasses = (variant, size) => {
    const baseClasses = "block rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 shrink-0";
    
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

  // Get searchbar classes based on variant with width constraints
  const getSearchbarClasses = (variant, size) => {
    const baseClasses = "flex items-center rounded-lg border transition-colors duration-200 shrink-0";
    
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

      {/* Enhanced Canvas Area with overflow prevention */}
      <div
        ref={canvasRef}
        className={`relative w-full h-[500px] border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden ${
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

        {/* Enhanced component rendering with styles, animations, and overflow prevention */}
        <AnimatePresence>
          {canvasComponents.map((component) => {
            const animationProps = getAnimationProps(component);
            const componentStyles = applyStylesToComponent(component);

            // Calculate safe position to prevent component from going outside canvas
            const safeX = Math.max(0, Math.min(component.position.x, canvasDimensions.width - 60));
            const safeY = Math.max(0, Math.min(component.position.y, canvasDimensions.height - 40));

            return (
              <motion.div
                key={component.id}
                {...animationProps}
                className={`absolute cursor-pointer transition-all duration-300 ${
                  selectedComponent === component.id ? 'ring-4 ring-offset-2' : ''
                }`}
                style={{
                  left: safeX,
                  top: safeY,
                  ringColor: selectedComponent === component.id ? 'var(--color-primary)' : 'transparent',
                  boxShadow:
                    selectedComponent === component.id ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                  ...componentStyles
                }}
                onClick={(e) => onComponentClick(component.id, e)}
              >
                {/* Enhanced component rendering with overflow prevention */}
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
                    className="absolute -top-6 left-0 px-2 py-1 text-xs font-medium rounded-md max-w-[200px] overflow-hidden"
                    style={{ 
                      backgroundColor: 'var(--color-primary)', 
                      color: 'white',
                      fontSize: '10px'
                    }}
                  >
                    <span className="truncate block">
                      {component.name}
                      {component.variant && (
                        <span className="opacity-75"> • {component.variant.name}</span>
                      )}
                    </span>
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
                  <span style={{ color: 'var(--color-text-muted)' }} className="truncate max-w-[200px]">
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
                  Overflow Protected
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