// @/Services/ComponentLibraryService.js
import axios from 'axios';
import React from 'react';

class ComponentLibraryService {
  constructor() {
    this.components = new Map();
    this.componentDefinitions = new Map();
  }

  // Load all components from the API
    // REPLACE the loadComponents method in ComponentLibraryService.js (around line 50)
  
  
  
  
  
  
  async loadComponents() {
      try {
          console.log('=== LOADING COMPONENTS FROM DATABASE ===');
          
          const response = await axios.get('/api/components');
          if (response.data.success) {
              const componentsByCategory = response.data.data;
              console.log('Raw API response:', componentsByCategory);
              
              let totalLoaded = 0;
              
              // Process both elements and components
              Object.entries(componentsByCategory).forEach(([categoryType, letterGroups]) => {
                  console.log(`Processing category: ${categoryType}`);
                  
                  Object.entries(letterGroups).forEach(([letter, componentList]) => {
                      console.log(`Processing letter group: ${letter}, count: ${componentList.length}`);
                      
                      if (Array.isArray(componentList)) {
                          componentList.forEach(component => {
                              console.log('Processing component:', {
                                  name: component.name,
                                  type: component.type,
                                  hasDefaults: !!component.default_props,
                                  defaults: component.default_props
                              });
                              
                              // Ensure variants are properly parsed
                              let variants = component.variants;
                              if (typeof variants === 'string') {
                                  try {
                                      variants = JSON.parse(variants);
                                  } catch (e) {
                                      console.warn('Failed to parse variants for component:', component.name, e);
                                      variants = [];
                                  }
                              }
                              if (!Array.isArray(variants)) {
                                  variants = [];
                              }
  
                              // CRITICAL: Ensure default_props is properly handled
                              let defaultProps = component.default_props;
                              if (typeof defaultProps === 'string') {
                                  try {
                                      defaultProps = JSON.parse(defaultProps);
                                  } catch (e) {
                                      console.warn('Failed to parse default_props for component:', component.name, e);
                                      defaultProps = {};
                                  }
                              }
                              if (!defaultProps || typeof defaultProps !== 'object') {
                                  defaultProps = {};
                              }
  
                              const processedComponent = {
                                  ...component,
                                  default_props: defaultProps,
                                  variants: variants
                              };
  
                              console.log('Storing component definition:', component.type, {
                                  name: processedComponent.name,
                                  default_props: processedComponent.default_props,
                                  variants_count: processedComponent.variants.length
                              });
  
                              this.componentDefinitions.set(component.type, processedComponent);
                              this.components.set(component.type, this.createComponentRenderer(processedComponent));
                              totalLoaded++;
                          });
                      }
                  });
              });
              
              console.log('=== COMPONENT LOADING COMPLETE ===');
              console.log('Total components loaded:', totalLoaded);
              console.log('Component definitions map size:', this.componentDefinitions.size);
              console.log('Components map size:', this.components.size);
              
              // Debug specific components
              ['button', 'card', 'badge', 'input'].forEach(type => {
                  const def = this.componentDefinitions.get(type);
                  if (def) {
                      console.log(`${type} definition loaded:`, {
                          name: def.name,
                          default_props: def.default_props,
                          variants: def.variants?.length || 0
                      });
                  } else {
                      console.warn(`${type} definition NOT found!`);
                  }
              });
              
              return true;
          }
          
          console.error('API response not successful:', response.data);
          return false;
      } catch (error) {
          console.error('Failed to load components:', error);
          throw error;
      }
  }
  
  
  
  
  

// REPLACE calculateResponsiveStyles
calculateResponsiveStyles(component, responsiveMode, canvasDimensions, parentStyles = {}) {
  const baseStyles = { ...component.style };
  
  // 🔥 CRITICAL: NO automatic scaling - let CSS handle it
  const scaledStyles = { ...baseStyles };
  
  // Ensure minimum touch targets for mobile
  if (responsiveMode === 'mobile') {
    if (['button', 'input', 'select', 'textarea'].includes(component.type)) {
      if (!scaledStyles.minHeight) scaledStyles.minHeight = '44px';
      if (!scaledStyles.minWidth) scaledStyles.minWidth = '44px';
      if (component.type === 'button' && !scaledStyles.fontSize) {
        scaledStyles.fontSize = '16px';
      }
    }
  }
  
  // Add responsive layout adjustments (NOT scaling)
  if (responsiveMode === 'mobile') {
    const isLayoutContainer = component.isLayoutContainer || 
                              ['section', 'container', 'div', 'flex', 'grid'].includes(component.type);
    
    if (scaledStyles.flexDirection === 'row' && isLayoutContainer) {
      scaledStyles.flexDirection = 'column';
    }
    
    if (isLayoutContainer && (!scaledStyles.width || scaledStyles.width === 'auto')) {
      scaledStyles.width = '100%';
    }
  }
  
  return scaledStyles;
}

/**
 * Get device-specific canvas dimensions
 */
getDeviceCanvasDimensions(responsiveMode) {
  const dimensions = {
    desktop: { width: '100%', height: 'auto', maxWidth: 'none' },
    tablet: { width: 768, height: 1024, maxWidth: '768px' },
    mobile: { width: 375, height: 667, maxWidth: '375px' }
  };
  
  return dimensions[responsiveMode] || dimensions.desktop;
}
  
  
  
  
  renderIcon(props, id) {
    const iconStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: props.size ? `${props.size}px` : '24px',
      height: props.size ? `${props.size}px` : '24px',
      color: props.color || 'currentColor',
      ...props.style
    };
    
    // Handle different icon types
    if (props.iconType === 'svg' && props.svgData) {
      return React.createElement('div', {
        key: id,
        className: 'icon-svg',
        style: iconStyle,
        dangerouslySetInnerHTML: { __html: props.svgData }
      });
    }
    
    if (props.iconType === 'lottie') {
      // Lottie animation placeholder
      return React.createElement('div', {
        key: id,
        className: 'icon-lottie',
        style: iconStyle
      }, '🎬');
    }
    
    // For Lucide/Heroicons, show icon name placeholder
    return React.createElement('div', {
      key: id,
      className: 'icon-element',
      style: iconStyle,
      title: `${props.iconName} (${props.iconType})`
    }, React.createElement('span', {
      style: { fontSize: '12px' }
    }, '🎨'));
  }
  
  
    // In ComponentLibraryService.js - ADD this method
  createLayoutElement(type, props = {}) {
  const componentDef = this.componentDefinitions.get(type);
  if (!componentDef) {
      console.warn('No definition for layout type:', type);
      return null;
  }

  // 🔥 CRITICAL: Explicitly set isLayoutContainer to true
  const layoutElement = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      props: {
          ...componentDef.default_props,
          ...props
      },
      name: props.name || componentDef.name,
      style: {
          display: type === 'flex' ? 'flex' : type === 'grid' ? 'grid' : 'block',
          width: '100%',
          minHeight: type === 'section' ? '200px' : '100px',
          padding: props.style?.padding || '24px',
          backgroundColor: 'transparent',
          ...props.style
      },
      children: [],
      isLayoutContainer: true, // ✅ EXPLICITLY TRUE
      acceptsChildren: true,
      zIndex: props.zIndex || 0
  };

  console.log('✅ Created layout element:', {
    id: layoutElement.id,
    type: layoutElement.type,
    isLayoutContainer: layoutElement.isLayoutContainer
  });

  return layoutElement;
}


    // ALSO fix the createComponentRenderer method to ensure proper defaults:
  createComponentRenderer(componentDef) {
      console.log('Creating renderer for:', componentDef.type, {
          hasDefaults: !!componentDef.default_props,
          defaults: componentDef.default_props
      });
      
      return {
          id: componentDef.type,
          name: componentDef.name,
          description: componentDef.description,
          icon: componentDef.icon,
          defaultProps: componentDef.default_props || {}, // Ensure this exists
          propDefinitions: componentDef.prop_definitions,
          variants: componentDef.variants || [],
          
          // Dynamic render function
          render: (props, id) => {
              return this.renderComponent(componentDef, props, id);
          },
  
          // Generate code function
          generateCode: (props, allComponents, style) => {
              return this.generateComponentCode(componentDef, props, allComponents, style);
          }
      };
  }

    // REPLACE renderComponent method
    renderComponent(componentDef, props, id) {
        // CRITICAL: Add data attribute for selection system
        const baseDataAttrs = {
            'data-component-id': id,
            'data-component-type': componentDef?.type || props.type,
            'data-is-layout': props.isLayoutContainer || false,
        };
        
        // Get the component definition if not passed
        if (!componentDef && this.componentDefinitions.has(props.type || props.component_type)) {
            componentDef = this.componentDefinitions.get(props.type || props.component_type);
        }
        
        if (!componentDef) {
            console.warn('No component definition found for:', props.type || props.component_type);
            return this.renderGeneric(props, id, { name: props.type || 'Unknown', type: props.type || 'unknown' });
        }
        
                // ✅ CRITICAL FIX: Props merging priority
        // 1. Start with component defaults (lowest priority)
        // 2. Add variant styles (medium priority)
        // 3. Add instance styles (HIGHEST priority - should never be overwritten)
        
        const defaultProps = componentDef?.default_props || {};
        const instanceProps = props?.props || {};
        const directProps = { ...props };
        delete directProps.props;
        delete directProps.children;
        
        // 🔥 CRITICAL: Build styles with correct priority
        let finalStyle = {};
        
        // Step 1: Default styles from component definition
        if (defaultProps.style) {
            finalStyle = { ...defaultProps.style };
        }
        
        // Step 2: Variant styles (if variant exists)
        if (props.variant && props.variant.style) {
            console.log('🎨 Applying variant styles:', props.variant.name);
            finalStyle = {
                ...finalStyle,
                ...props.variant.style
            };
        }
        
        // Step 3: Instance styles (HIGHEST PRIORITY - overwrites everything)
        if (props.style) {
            console.log('⚡ Applying instance styles (highest priority):', Object.keys(props.style));
            finalStyle = {
                ...finalStyle,
                ...props.style  // ✅ Instance styles ALWAYS win
            };
        }
        
        const mergedProps = { 
            ...defaultProps,
            ...instanceProps,
            ...directProps,
            style: finalStyle,  // ✅ Final merged styles
        };
        
        console.log('🔧 Merged props for', componentDef.type, ':', {
            hasVariant: !!props.variant,
            variantName: props.variant?.name,
            instanceStyleKeys: Object.keys(props.style || {}),
            finalStyleKeys: Object.keys(finalStyle),
            display: finalStyle.display
        });
        
        // Check if this is a layout container
        const isLayoutContainer = props.isLayoutContainer || 
                                 ['section', 'container', 'div', 'flex', 'grid'].includes(componentDef.type);
        
        if (isLayoutContainer) {
            return this.renderLayoutContainer(componentDef, mergedProps, id, props.children || []);
        }
   
        
        console.log('Rendering component:', componentDef.type, 'with merged props:', mergedProps);
        
        // Check if there's a variant being used
        if (props.variant && componentDef.variants) {
            const variantData = componentDef.variants.find(v => v.name === props.variant.name);
            if (variantData) {
                // If variant has preview code, use it
                if (variantData.preview_code) {
                    return React.createElement('div', {
                        key: id,
                        dangerouslySetInnerHTML: {
                            __html: variantData.preview_code.replace(/className=/g, 'class=')
                        }
                    });
                }
                
                  // Merge variant props with merged props
                if (variantData.props) {
                    Object.assign(mergedProps, variantData.props);
                }
            }
        }
        
        
        
        
               switch (componentDef.type) {
          // ✅ EXISTING CASES...
          case 'button':
            return this.renderButton(mergedProps, id);
          case 'input':
            return this.renderInput(mergedProps, id);
            
          // 🔥 NEW TEXT ELEMENT CASES
          case 'text-node':
             return this.renderTextNode(mergedProps, id);
            
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            return this.renderHeading(componentDef.type, mergedProps, id);
            
          case 'p':
            return this.renderParagraph(mergedProps, id);
            
          case 'span':
            return this.renderSpan(mergedProps, id);
            
          case 'strong':
            return this.renderStrong(mergedProps, id);
            
          case 'em':
            return this.renderEm(mergedProps, id);
            
          case 'small':
            return this.renderSmall(mergedProps, id);
            
          case 'label':
            return this.renderLabel(mergedProps, id);
            
          case 'blockquote':
            return this.renderBlockquote(mergedProps, id);
            
          case 'link':
            return this.renderLink(mergedProps, id);
            
          case 'checkbox':
            return this.renderCheckbox(mergedProps, id);
            
          case 'radio':
            return this.renderRadio(mergedProps, id);
            
          case 'select':
            return this.renderSelect(mergedProps, id);
            
          case 'textarea':
            return this.renderTextarea(mergedProps, id);
            
          case 'toggle':
            return this.renderToggle(mergedProps, id);
            
          case 'file':
            return this.renderFileInput(mergedProps, id);
            
          case 'range':
            return this.renderRange(mergedProps, id);
            
          case 'badge':
            return this.renderBadge(mergedProps, id);
          
          case 'navbar':
             return this.renderNavbarComponent(mergedProps, id);
          
          // 🔥 SMART FALLBACK
          default:
            // Try smart code rendering first if variant has preview_code
            if (mergedProps.variant?.preview_code) {
              return this.smartCodeToUI(mergedProps.variant.preview_code, id);
            }
            
            // Final fallback
            return this.renderGeneric(mergedProps, id, componentDef);
        }
    }
    
    
    
    
    // ADD this new method after loadComponents
renderCanvasRoot(frame, canvasRef) {
  if (!frame || !canvasRef?.current) return;
  
  const canvasStyle = frame.canvas_style || {};
  const canvas = canvasRef.current;
  
  // Apply styles directly to canvas element
  Object.entries(canvasStyle).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    canvas.style[key] = value;
  });
  
  console.log('🎨 Canvas styles applied in real-time:', Object.keys(canvasStyle));
}
    
    
    
    
    
renderLayoutContainer(componentDef, props, id, children) {
    // 🔥 CRITICAL FIX: Apply ALL style properties including flexDirection
    const containerStyle = {
        // Start with essential defaults
        display: this.getDefaultDisplay(componentDef.type),
        width: '100%',
        minHeight: this.getDefaultMinHeight(componentDef.type),
        padding: this.getDefaultPadding(componentDef.type),
        
        // 🔥 CRITICAL: Apply ALL style props including flex properties
        // This MUST come last to override defaults
        ...props.style,
    };

    console.log('🎨 renderLayoutContainer FINAL style:', {
        type: componentDef.type,
        flexDirection: containerStyle.flexDirection,
        display: containerStyle.display,
        allKeys: Object.keys(containerStyle)
    });
    
    return React.createElement('div', {
        key: id,
        'data-layout-type': componentDef.type,
        'data-component-id': id,
        className: `layout-container ${componentDef.type}-container`,
        style: containerStyle  // 🔥 This now includes ALL styles including flexDirection
    }, children && children.length > 0 ? children.map(child => 
        this.renderComponent(this.componentDefinitions.get(child.type), child, child.id)
    ) : null);
}
    
    // Helper methods
    getDefaultDisplay(type) {
        const displayMap = {
            'flex': 'flex',
            'grid': 'grid',
            'section': 'block',
            'container': 'block',
            'div': 'block'
        };
        return displayMap[type] || 'block';
    }
    
    getDefaultMinHeight(type) {
        const minHeightMap = {
            'section': '200px',
            'container': '100px',
            'div': '50px',
            'flex': '100px',
            'grid': '100px'
        };
        return minHeightMap[type] || 'auto';
    }
    
    getDefaultPadding(type) {
        const paddingMap = {
            'section': '48px 24px',
            'container': '24px',
            'div': '16px',
            'flex': '16px',
            'grid': '16px'
        };
        return paddingMap[type] || '0';
    }

      
renderButton(props, id, layoutStyles = {}) {
    const buttonText = props.content || props.text || props.children || 'Button';
    
    // 🔥 CRITICAL: Use props.style directly (already merged with variant)
    const buttonStyle = {
        ...props.style,        // 🔥 This already contains variant styles
        ...layoutStyles,       // Layout positioning
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
    };
    
    console.log('🔘 Rendering button with style:', {
        id,
        styleKeys: Object.keys(buttonStyle),
        hasBackground: !!buttonStyle.background,
        hasPadding: !!buttonStyle.padding
    });
    
    // 🔥 Text node wrapper for independent selection
    const textNodeId = `${id}-text`;
    const textNode = React.createElement('span', {
      key: textNodeId,
      'data-component-id': textNodeId,
      'data-component-type': 'text-node',
      'data-parent-id': id,
      'data-is-layout': false,
      'data-is-pseudo': true,
      className: 'text-node-child',
      style: {
        cursor: 'pointer', // 🔥 CHANGED from 'text'
        userSelect: 'none',
        display: 'inline-block',
        pointerEvents: 'auto',
        position: 'relative', // 🔥 NEW
        zIndex: 10, // 🔥 NEW - ensure it's clickable
      },
      onClick: (e) => {
        e.stopPropagation();
        console.log('🎯 Text node clicked:', textNodeId);
        if (window.forgeSelectComponent) {
          window.forgeSelectComponent(textNodeId);
        }
      }
    }, buttonText);
    
    return React.createElement('button', {
        key: id,
        onClick: (e) => {
            e.stopPropagation();
        },
        disabled: props.disabled || false,
        style: buttonStyle,  // 🔥 All styles applied here
        'data-component-id': id,
        'data-component-type': 'button',
        'data-is-layout': false,
    }, textNode);
}




// ADD NEW METHOD (around line 450):
applyLayoutStyles(baseStyle, props) {
    // 🔥 NEW: Apply ALL layout properties to ANY component
    return {
        ...baseStyle,
        // Position properties
        position: props.style?.position || baseStyle.position,
        top: props.style?.top,
        right: props.style?.right,
        bottom: props.style?.bottom,
        left: props.style?.left,
        zIndex: props.style?.zIndex || baseStyle.zIndex,
        
        // Display properties
        display: props.style?.display || baseStyle.display,
        
        // Flexbox (even for non-layout - needed for internal flex)
        flexDirection: props.style?.flexDirection,
        justifyContent: props.style?.justifyContent,
        alignItems: props.style?.alignItems,
        gap: props.style?.gap,
        
        // Size properties
        width: props.style?.width || baseStyle.width,
        height: props.style?.height || baseStyle.height,
        minWidth: props.style?.minWidth,
        maxWidth: props.style?.maxWidth,
        minHeight: props.style?.minHeight,
        maxHeight: props.style?.maxHeight,
        
        // Spacing
        margin: props.style?.margin,
        padding: props.style?.padding || baseStyle.padding,
        
        // All other style properties
        ...props.style
    };
}




  // Avatar renderer
  renderAvatar(props, id) {
    const className = this.getAvatarClasses(props);
    
    if (props.src) {
      return React.createElement('div', {
        key: id,
        className
      }, React.createElement('img', {
        src: props.src,
        alt: props.alt || 'Avatar',
        className: 'w-full h-full object-cover'
      }));
    }
    
    const initials = props.initials || props.name?.charAt(0) || 'A';
    return React.createElement('div', {
      key: id,
      className,
      style: props.style,
      // CRITICAL: Add these
        'data-component-id': id,
        'data-component-type': 'avatar',
        'data-is-layout': false,
    }, React.createElement('span', {
      className: 'font-medium'
    }, initials));
  }



  // Input renderer
  renderInput(props, id, layoutStyles = {}) {
      const className = this.getInputClasses(props);
      
      const inputStyle = {
          width: props.width || '100%',
          maxWidth: props.maxWidth || '250px',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('input', {
          key: id,
          type: props.type || 'text',
          placeholder: props.placeholder || '',
          className,
          disabled: props.disabled || false,
          required: props.required || false,
          style: inputStyle,
          // CRITICAL: Add these
          'data-component-id': id,
          'data-component-type': 'input',
          'data-is-layout': false,
      });
  }

  // Searchbar renderer
  renderSearchbar(props, id) {
    const className = this.getSearchbarClasses(props);
    
    return React.createElement('div', {
      key: id,
      className,
      style: props.style
    }, [
      React.createElement('input', {
        key: `${id}-input`,
        type: 'text',
        placeholder: props.placeholder || 'Search...',
        className: 'flex-1 bg-transparent outline-none'
      }),
      React.createElement('svg', {
        key: `${id}-icon`,
        className: 'w-5 h-5 text-gray-400',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      }, React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
      }))
    ]);
  }

  // Card renderer
  renderCard(props, id, layoutStyles = {}) {
      const cardClassName = this.getCardClasses(props);
      
      const cardStyle = {
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('div', {
          key: id,
          className: cardClassName,
          style: cardStyle,
          // CRITICAL: Add these
          'data-component-id': id,
          'data-component-type': 'card',
          'data-is-layout': false,
      }, [
          props.title && React.createElement('h3', {
              key: `${id}-title`,
              className: 'font-semibold text-lg mb-2 text-gray-900'
          }, props.title),
          React.createElement('div', {
              key: `${id}-content`,
              className: 'text-gray-600'
          }, props.content || props.children || 'Card content')
      ]);
  }
  
  
  

// @/Services/ComponentLibraryService.js - REPLACE renderTextNode method

renderTextNode(props, id) {
  const content = props.content || props.text_content || '';
  
  // 🔥 CRITICAL: Text node is ALWAYS independent with wrapper for selection
  return React.createElement('span', {
    key: id,
    'data-component-id': id,
    'data-component-type': 'text-node',
    'data-is-layout': false,
    'data-is-pseudo': true,
    className: 'text-node-independent inline-block min-w-[20px] min-h-[1em]',
    style: {
      cursor: 'grab',
      userSelect: 'none',
      display: 'inline-block',
      position: 'relative',
      ...props.style
    },
    onClick: (e) => {
      e.stopPropagation();
      if (window.forgeSelectComponent) {
        window.forgeSelectComponent(id);
      }
    },
    onDoubleClick: (e) => {
      e.stopPropagation();
      // Enable inline editing
      const span = e.currentTarget;
      span.contentEditable = true;
      span.focus();
      
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(span);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      
      const handleBlur = () => {
        span.contentEditable = false;
        const newContent = span.textContent;
        if (props.onContentChange) {
          props.onContentChange(id, newContent);
        }
      };
      
      span.addEventListener('blur', handleBlur, { once: true });
    }
  }, content || '\u00A0'); // Empty space if no content
}



renderHeading(level, props, id) {
  const content = props.content || props.text || '';
  
  const sizeClasses = {
    h1: 'text-6xl',
    h2: 'text-4xl',
    h3: 'text-3xl',
    h4: 'text-2xl',
    h5: 'text-xl',
    h6: 'text-lg'
  };
  
  const baseClasses = `${sizeClasses[level]} font-bold`;
  const variantClasses = props.variant === 'gradient' 
    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'
    : 'text-gray-900';
  
  // 🔥 WRAP TEXT IN TEXT NODE
  const textNode = this.wrapTextContent(level, props, id, content);
  
  return React.createElement(level, {
    key: id,
    className: `${baseClasses} ${variantClasses} ${props.className || ''}`,
    style: props.style,
    'data-component-id': id,
    'data-component-type': level,
    'data-is-layout': false,
  }, textNode); // 🔥 RENDER WRAPPED TEXT
}


// 🔥 PARAGRAPH RENDERER
renderParagraph(props, id) {
  const content = props.content || props.text || '';
  
  // 🔥 WRAP TEXT IN TEXT NODE
  const textNode = this.wrapTextContent('p', props, id, content);
  
  return React.createElement('p', {
    key: id,
    className: `text-base leading-relaxed text-gray-700 ${props.className || ''}`,
    style: props.style,
    'data-component-id': id,
    'data-component-type': 'p',
    'data-is-layout': false,
  }, textNode);
}





renderBadge(props, id, layoutStyles = {}) {
  const content = props.content || props.text || 'Badge';
  const hasIndicator = props.indicator !== false;
  
  const badgeStyle = {
    ...props.style,
    ...layoutStyles,
  };
  
  return React.createElement('span', {
    key: id,
    style: badgeStyle,
    'data-component-id': id,
    'data-component-type': 'badge',
    'data-is-layout': false,
  }, [
    hasIndicator && React.createElement('span', {
      key: `${id}-indicator`,
      style: {
        width: '8px',
        height: '8px',
        background: '#10b981',
        borderRadius: '50%',
      }
    }),
    content
  ]);
}

renderNavbar(props, id, layoutStyles = {}) {
  const logoText = props.logoText || 'Logo';
  const navLinks = props.navLinks || ['Home', 'About', 'Contact'];
  const ctaText = props.ctaText || 'Button';
  
  const navStyle = {
    ...props.style,
    ...layoutStyles,
  };
  
  return React.createElement('nav', {
    key: id,
    style: navStyle,
    'data-component-id': id,
    'data-component-type': 'navbar',
    'data-is-layout': true,
  }, [
    // Logo
    React.createElement('div', {
      key: `${id}-logo`,
      style: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#000000',
      }
    }, logoText),
    
    // Nav Links
    React.createElement('div', {
      key: `${id}-links`,
      style: {
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
      }
    }, navLinks.map((link, index) => 
      React.createElement('a', {
        key: `${id}-link-${index}`,
        href: '#',
        style: {
          fontSize: '16px',
          color: '#374151',
          textDecoration: 'none',
        },
        onClick: (e) => e.preventDefault(),
      }, link)
    )),
    
    // CTA Button
    React.createElement('button', {
      key: `${id}-cta`,
      style: {
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '9999px',
        background: '#000000',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
      }
    }, ctaText)
  ]);
}



renderNavbarComponent(props, id) {
  const logoText = props.logoText || 'Logo';
  const navLinks = props.navLinks || ['Home', 'About', 'Contact'];
  const ctaText = props.ctaText || 'Button';
  
  // 🔥 CRITICAL: Navbar is a FLEX container with children
  const navStyle = {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 48px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    position: props.style?.position || 'static',  // 🔥 Allow position override
    top: props.style?.top || 'auto',
    left: props.style?.left || 'auto',
    right: props.style?.right || 'auto',
    zIndex: props.style?.zIndex || 'auto',
    ...props.style,
  };
  
  return React.createElement('nav', {
    key: id,
    style: navStyle,
    'data-component-id': id,
    'data-component-type': 'navbar',
    'data-is-layout': true,
  }, [
    // Logo (text-node child)
    React.createElement('div', {
      key: `${id}-logo`,
      'data-component-id': `${id}-logo`,
      'data-component-type': 'text-node',
      'data-parent-id': id,
      style: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#000000',
      }
    }, logoText),
    
    // Nav Links Container
    React.createElement('div', {
      key: `${id}-links`,
      'data-component-id': `${id}-links-container`,
      'data-component-type': 'flex',
      'data-parent-id': id,
      'data-is-layout': true,
      style: {
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
      }
    }, navLinks.map((link, index) => 
      React.createElement('a', {
        key: `${id}-link-${index}`,
        'data-component-id': `${id}-link-${index}`,
        'data-component-type': 'link',
        'data-parent-id': `${id}-links-container`,
        href: '#',
        style: {
          fontSize: '16px',
          color: '#374151',
          textDecoration: 'none',
        },
        onClick: (e) => e.preventDefault(),
      }, link)
    )),
    
    // CTA Button
    React.createElement('button', {
      key: `${id}-cta`,
      'data-component-id': `${id}-cta`,
      'data-component-type': 'button',
      'data-parent-id': id,
      style: {
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '9999px',
        background: '#000000',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
      }
    }, ctaText)
  ]);
}




// 🔥 SPAN RENDERER
renderSpan(props, id) {
  const content = props.content || props.text || '';
  
  return React.createElement('span', {
    key: id,
    className: props.className || '',
    style: props.style,
    'data-component-id': id,
    'data-component-type': 'span',
    'data-is-layout': false,
  }, content);
}

// 🔥 STRONG RENDERER
renderStrong(props, id) {
  const content = props.content || props.text || '';
  
  return React.createElement('strong', {
    key: id,
    className: `font-bold ${props.className || ''}`,
    style: props.style,
    'data-component-id': id,
    'data-component-type': 'strong',
    'data-is-layout': false,
  }, content);
}

// 🔥 EM RENDERER
renderEm(props, id) {
  const content = props.content || props.text || '';
  
  return React.createElement('em', {
    key: id,
    className: `italic ${props.className || ''}`,
    style: props.style,
    'data-component-id': id,
    'data-component-type': 'em',
    'data-is-layout': false,
  }, content);
}

// 🔥 SMALL RENDERER
renderSmall(props, id) {
  const content = props.content || props.text || '';
  
  return React.createElement('small', {
    key: id,
    className: `text-sm text-gray-600 ${props.className || ''}`,
    style: props.style,
    'data-component-id': id,
    'data-component-type': 'small',
    'data-is-layout': false,
  }, content);
}

// 🔥 LABEL RENDERER
renderLabel(props, id) {
  const content = props.content || props.text || '';
  
  return React.createElement('label', {
    key: id,
    htmlFor: props.for || props.htmlFor,
    className: `block text-sm font-medium text-gray-700 ${props.className || ''}`,
    style: props.style,
    'data-component-id': id,
    'data-component-type': 'label',
    'data-is-layout': false,
  }, content);
}

// 🔥 BLOCKQUOTE RENDERER
renderBlockquote(props, id) {
  const content = props.content || props.text || '';
  const cite = props.cite || '';
  
  return React.createElement('blockquote', {
    key: id,
    className: `border-l-4 border-purple-600 pl-6 py-4 italic text-gray-700 ${props.className || ''}`,
    style: props.style,
    'data-component-id': id,
    'data-component-type': 'blockquote',
    'data-is-layout': false,
  }, [
    React.createElement('p', { key: `${id}-text`, className: 'text-lg mb-2' }, content),
    cite && React.createElement('cite', { key: `${id}-cite`, className: 'text-sm text-gray-500 not-italic' }, `— ${cite}`)
  ]);
}

// 🔥 LINK RENDERER
renderLink(props, id) {
  const content = props.content || props.text || 'Link';
  
  // 🔥 WRAP TEXT IN TEXT NODE
  const textNode = this.wrapTextContent('link', props, id, content);
  
  return React.createElement('a', {
    key: id,
    href: props.href || '#',
    target: props.target || '_self',
    className: `text-blue-600 hover:text-blue-800 underline ${props.className || ''}`,
    style: props.style,
    'data-component-id': id,
    'data-component-type': 'link',
    'data-is-layout': false,
    onClick: (e) => e.preventDefault()
  }, textNode);
}

// 🔥 CHECKBOX RENDERER
renderCheckbox(props, id) {
  const label = props.label || props.content || '';
  
  return React.createElement('label', {
    key: id,
    className: 'flex items-center gap-3 cursor-pointer',
    'data-component-id': id,
    'data-component-type': 'checkbox',
    'data-is-layout': false,
  }, [
    React.createElement('input', {
      key: `${id}-input`,
      type: 'checkbox',
      checked: props.checked || false,
      disabled: props.disabled || false,
      className: 'w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600/20',
      onChange: () => {} // Prevent errors in editor
    }),
    React.createElement('span', {
      key: `${id}-label`,
      className: 'text-gray-700'
    }, label)
  ]);
}

// 🔥 RADIO RENDERER
renderRadio(props, id) {
  const label = props.label || props.content || '';
  
  return React.createElement('label', {
    key: id,
    className: 'flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-600 transition',
    'data-component-id': id,
    'data-component-type': 'radio',
    'data-is-layout': false,
  }, [
    React.createElement('input', {
      key: `${id}-input`,
      type: 'radio',
      name: props.name || 'radio-group',
      checked: props.checked || false,
      className: 'w-5 h-5 text-blue-600',
      onChange: () => {}
    }),
    React.createElement('span', {
      key: `${id}-label`,
      className: 'font-semibold'
    }, label)
  ]);
}

// 🔥 SELECT RENDERER
renderSelect(props, id) {
  const options = props.options || ['Option 1', 'Option 2', 'Option 3'];
  
  return React.createElement('select', {
    key: id,
    className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none',
    style: props.style,
    'data-component-id': id,
    'data-component-type': 'select',
    'data-is-layout': false,
    disabled: props.disabled || false,
  }, options.map((opt, idx) => 
    React.createElement('option', { key: `${id}-opt-${idx}`, value: opt }, opt)
  ));
}

// 🔥 TEXTAREA RENDERER
renderTextarea(props, id) {
  const content = props.content || props.value || '';
  
  return React.createElement('textarea', {
    key: id,
    rows: props.rows || 4,
    placeholder: props.placeholder || '',
    value: content,
    className: 'block w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none resize-vertical',
    style: props.style,
    'data-component-id': id,
    'data-component-type': 'textarea',
    'data-is-layout': false,
    disabled: props.disabled || false,
    onChange: () => {}
  });
}

// 🔥 TOGGLE RENDERER
renderToggle(props, id) {
  const label = props.label || props.content || '';
  
  return React.createElement('label', {
    key: id,
    className: 'flex items-center justify-between cursor-pointer',
    'data-component-id': id,
    'data-component-type': 'toggle',
    'data-is-layout': false,
  }, [
    React.createElement('span', {
      key: `${id}-label`,
      className: 'text-gray-700'
    }, label),
    React.createElement('div', {
      key: `${id}-switch`,
      className: 'relative inline-block w-12 h-6'
    }, [
      React.createElement('input', {
        key: `${id}-input`,
        type: 'checkbox',
        checked: props.checked || false,
        className: 'sr-only peer',
        onChange: () => {}
      }),
      React.createElement('div', {
        key: `${id}-track`,
        className: 'w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[""] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all'
      })
    ])
  ]);
}

// 🔥 FILE INPUT RENDERER
renderFileInput(props, id) {
  return React.createElement('label', {
    key: id,
    className: 'flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition',
    'data-component-id': id,
    'data-component-type': 'file',
    'data-is-layout': false,
  }, [
    React.createElement('div', {
      key: `${id}-content`,
      className: 'flex flex-col items-center'
    }, [
      React.createElement('svg', {
        key: `${id}-icon`,
        className: 'w-10 h-10 mb-3 text-gray-400',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      }, React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
      })),
      React.createElement('p', {
        key: `${id}-text`,
        className: 'text-sm text-gray-500'
      }, 'Click to upload or drag and drop')
    ]),
    React.createElement('input', {
      key: `${id}-input`,
      type: 'file',
      className: 'hidden',
      multiple: props.multiple || false,
      accept: props.accept || ''
    })
  ]);
}

// 🔥 RANGE RENDERER
renderRange(props, id) {
  const value = props.value || 50;
  const min = props.min || 0;
  const max = props.max || 100;
  
  return React.createElement('div', {
    key: id,
    className: 'w-full',
    'data-component-id': id,
    'data-component-type': 'range',
    'data-is-layout': false,
  }, [
    props.showValue && React.createElement('div', {
      key: `${id}-header`,
      className: 'flex justify-between mb-2'
    }, [
      React.createElement('span', {
        key: `${id}-label`,
        className: 'text-sm font-semibold'
      }, props.label || 'Value'),
      React.createElement('span', {
        key: `${id}-value`,
        className: 'text-sm font-semibold'
      }, `${value}%`)
    ]),
    React.createElement('input', {
      key: `${id}-input`,
      type: 'range',
      min,
      max,
      value,
      step: props.step || 1,
      className: 'w-full h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full appearance-none cursor-pointer',
      onChange: () => {}
    })
  ]);
}
  
  
  

  // Enhanced generic renderer with size constraints
renderGeneric(props, id, componentDef) {
  const containerStyle = {
    maxWidth: '200px',
    overflow: 'hidden',
    ...props.style
  };
  
  return React.createElement('div', {
    key: id,
    className: 'p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center shrink-0',
    title: `${componentDef.name} component`,
    style: containerStyle
  }, [
    React.createElement('div', {
      key: `${id}-name`,
      className: 'font-semibold text-gray-700 truncate'
    }, componentDef.name),
    React.createElement('div', {
      key: `${id}-type`,
      className: 'text-xs text-gray-500 mt-1 truncate'
    }, `(${componentDef.type})`)
  ]);
}



/**
 * 🔥 SMART CODE TO UI RENDERER
 * Intelligently parses HTML/JSX code and renders it as UI
 */
smartCodeToUI(codeString, componentId) {
  try {
    // Parse HTML/JSX string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = codeString;
    
    const firstChild = tempDiv.firstElementChild;
    if (!firstChild) {
      // Pure text node
      return document.createTextNode(codeString);
    }
    
    // Extract tag, classes, styles, and content
    const tagName = firstChild.tagName.toLowerCase();
    const classes = firstChild.className;
    const inlineStyle = firstChild.getAttribute('style');
    const textContent = firstChild.textContent;
    
    // Create React element with parsed attributes
    return React.createElement(tagName, {
      key: componentId,
      className: classes,
      style: this.parseInlineStyle(inlineStyle),
      'data-component-id': componentId,
      dangerouslySetInnerHTML: { __html: firstChild.innerHTML }
    });
  } catch (error) {
    console.warn('Smart code parsing failed, falling back to raw display:', error);
    return React.createElement('div', {
      key: componentId,
      dangerouslySetInnerHTML: { __html: codeString }
    });
  }
}

/**
 * Parse inline style string to React style object
 */
parseInlineStyle(styleString) {
  if (!styleString) return {};
  
  const styles = {};
  styleString.split(';').forEach(rule => {
    const [prop, value] = rule.split(':').map(s => s.trim());
    if (prop && value) {
      // Convert kebab-case to camelCase
      const camelProp = prop.replace(/-([a-z])/g, g => g[1].toUpperCase());
      styles[camelProp] = value;
    }
  });
  
  return styles;
}



// Enhanced button classes with proper width constraints
getButtonClasses(props) {
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
  
  // Enhanced size classes with max-width constraints
  const sizeClasses = {
    xs: "px-2 py-1 text-xs min-w-[40px] max-w-[120px]",
    sm: "px-3 py-1.5 text-sm min-w-[50px] max-w-[150px]", 
    md: "px-6 py-2.5 text-base min-w-[60px] max-w-[200px]",
    lg: "px-8 py-4 text-lg min-w-[80px] max-w-[250px]",
    xl: "px-10 py-5 text-xl min-w-[100px] max-w-[300px]"
  };
  
  const variant = props.variant || 'primary';
  const size = props.size || 'md';
  
  return `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
}





// 🔥 NEW: Auto-wrap text content for any element
wrapTextContent(elementType, props, id, textContent) {
    if (!textContent || typeof textContent !== 'string') return textContent;
    
    const textNodeId = `${id}-text`;
    
    return React.createElement('span', {
        key: textNodeId,
        'data-component-id': textNodeId,
        'data-component-type': 'text-node',
        'data-parent-id': id,
        'data-is-layout': false,
        'data-is-pseudo': true,
        'data-auto-wrapped': true, // 🔥 FLAG
        className: 'text-node-child inline-block',
        style: {
            cursor: 'text',
            userSelect: 'none',
            pointerEvents: 'auto',
            minWidth: '1ch',
            minHeight: '1em'
        },
        onClick: (e) => {
            e.stopPropagation();
            if (window.forgeSelectComponent) {
                window.forgeSelectComponent(textNodeId);
            }
        },
        onDoubleClick: (e) => {
            e.stopPropagation();
            if (window.forgeHandleDoubleClickText) {
                window.forgeHandleDoubleClickText(e, textNodeId, id);
            }
        }
    }, textContent);
}



// Enhanced avatar classes with size constraints
getAvatarClasses(props) {
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
  
  // Fixed size classes with exact dimensions
  const sizeClasses = {
    xs: "w-6 h-6 text-xs min-w-[24px] max-w-[24px]",
    sm: "w-8 h-8 text-sm min-w-[32px] max-w-[32px]",
    md: "w-12 h-12 text-base min-w-[48px] max-w-[48px]",
    lg: "w-16 h-16 text-lg min-w-[64px] max-w-[64px]",
    xl: "w-20 h-20 text-xl min-w-[80px] max-w-[80px]"
  };
  
  const variant = props.variant || 'default';
  const size = props.size || 'md';
  
  return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
}

// Enhanced badge classes with size constraints
getBadgeClasses(props) {
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
  
  // Size classes with max-width to prevent overflow
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-xs max-w-[80px]",
    sm: "px-2 py-0.5 text-xs max-w-[100px]",
    md: "px-2.5 py-1 text-sm max-w-[120px]",
    lg: "px-3 py-1.5 text-base max-w-[150px]"
  };
  
  const variant = props.variant || 'default';
  const size = props.size || 'md';
  
  return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
}

// Enhanced input classes with width constraints
getInputClasses(props) {
  const baseClasses = "block rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 shrink-0";
  
  const variantClasses = {
    default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
    error: "border-red-300 focus:border-red-500 focus:ring-red-500",
    success: "border-green-300 focus:border-green-500 focus:ring-green-500",
    minimal: "border-0 border-b-2 border-gray-300 rounded-none focus:border-blue-500",
    filled: "bg-gray-100 border-gray-100 focus:bg-white focus:border-blue-500"
  };
  
  // Size classes with width constraints
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm w-full max-w-[200px]",
    md: "px-4 py-2.5 text-base w-full max-w-[250px]",
    lg: "px-5 py-3 text-lg w-full max-w-[300px]"
  };
  
  const variant = props.variant || 'default';
  const size = props.size || 'md';
  
  return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
}

// Enhanced searchbar classes with width constraints
getSearchbarClasses(props) {
  const baseClasses = "flex items-center rounded-lg border transition-colors duration-200 shrink-0";
  
  const variantClasses = {
    default: "bg-white border-gray-300 focus-within:border-blue-500",
    filled: "bg-gray-100 border-gray-100 focus-within:bg-white focus-within:border-blue-500",
    minimal: "bg-transparent border-0 border-b-2 border-gray-300 rounded-none focus-within:border-blue-500",
    elevated: "bg-white shadow-md border-0 focus-within:shadow-lg"
  };
  
  // Size classes with width constraints
  const sizeClasses = {
    sm: "px-3 py-1.5 w-full max-w-[200px]",
    md: "px-4 py-2.5 w-full max-w-[250px]",
    lg: "px-5 py-3 w-full max-w-[300px]"
  };
  
  const variant = props.variant || 'default';
  const size = props.size || 'md';
  
  return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
}

// Enhanced card classes with width constraints
getCardClasses(props) {
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
  
  // Size constraints for cards
  const sizeClasses = {
    sm: "max-w-[200px]",
    md: "max-w-[300px]", 
    lg: "max-w-[400px]",
    xl: "max-w-[500px]",
    full: "w-full max-w-full"
  };
  
  const variant = props.variant || 'default';
  const padding = props.padding || 'md';
  const size = props.size || 'md';
  const shadow = (props.shadow && variant !== 'elevated') ? 'shadow-sm' : '';
  
  return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${paddingClasses[padding] || paddingClasses.md} ${sizeClasses[size] || sizeClasses.md} ${shadow} ${props.className || ''}`;
}



  // Enhanced code generation with variant support
  async generateComponentCode(componentDef, props, allComponents, style) {
    try {
      // Try server-side generation first
      const response = await axios.post('/api/components/generate-code', {
        components: allComponents,
        style: style
      });
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.warn('Server-side code generation failed, using client-side fallback:', error);
    }
    
    // Fallback to client-side generation
    return this.clientSideCodeGeneration(allComponents, style);
  }

  // Client-side code generation with enhanced variant support
  // Around line 500 in ComponentLibraryService.js
    clientSideCodeGeneration(allComponents, style) {
        console.log('Generating code for', allComponents.length, 'components with style:', style);
        
        const codeMap = {
          'react-tailwind': () => this.generateReactTailwindCode(allComponents),
          'react-css': () => this.generateReactCSSCode(allComponents),
          'html-css': () => this.generateHTMLCSSCode(allComponents),
          'html-tailwind': () => this.generateHTMLTailwindCode(allComponents)
        };
        
        return codeMap[style]?.() || { react: '', html: '', css: '', tailwind: '' };
    }
    
    // ADD THIS NEW METHOD right after clientSideCodeGeneration
    getTabsForStyle(style) {
        const tabMap = {
          'react-tailwind': ['react'], // Single combined tab
          'react-css': ['react', 'css'], // Two separate tabs
          'html-css': ['html', 'css'], // Two separate tabs
          'html-tailwind': ['html'] // Single combined tab
        };
        
        return tabMap[style] || ['react'];
    }

// ENHANCE the sanitizeClassName method
sanitizeClassName(className) {
  if (!className || typeof className !== 'string') return '';
  
  return className
    .split(' ') // Split by spaces for multiple classes
    .map(cls => cls
      .replace(/[^a-zA-Z0-9-_:/.]/g, '') // Keep only safe characters
      .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
      .trim()
    )
    .filter(cls => cls.length > 0) // Remove empty strings
    .join(' ');
}

// REPLACE the generateReactTailwindCode method
generateReactTailwindCode(allComponents) {
  if (!allComponents || allComponents.length === 0) {
    return {
      react: `import React from 'react';\n\nconst GeneratedComponent = () => {\n  return (\n    <div className="w-full min-h-screen">\n      {/* No components yet */}\n    </div>\n  );\n};\n\nexport default GeneratedComponent;`,
      tailwind: '// No components to generate classes for'
    };
  }

  const renderComponentTree = (components, depth = 0) => {
    return components.map(comp => {
      const indent = '  '.repeat(depth + 2);
      
      // 🔥 CRITICAL FIX: Handle text nodes properly
      if (comp.type === 'text-node') {
        const textContent = comp.props?.content || comp.props?.text || comp.text_content || '';
        return `${indent}${this.escapeJSXText(textContent)}`;
      }
      
      const classes = this.sanitizeClassName(this.buildDynamicTailwindClasses(comp));
      const content = this.extractComponentContent(comp);
      const hasChildren = comp.children && comp.children.length > 0;
      
      const reactTag = this.getComponentTag(comp.type);
      
      let jsx = `${indent}<${reactTag}`;
      
      // Add className if it exists
      if (classes) {
        jsx += ` className="${classes}"`;
      }
      
      // Add other props
      const otherProps = this.buildReactProps(comp);
      if (otherProps) {
        jsx += ` ${otherProps}`;
      }
      
      // Handle self-closing tags
      const selfClosingTags = ['input', 'img', 'br', 'hr'];
      if (selfClosingTags.includes(comp.type) && !hasChildren && !content) {
        jsx += ' />';
        return jsx;
      }
      
      jsx += '>';
      
      // Handle content and children
      if (hasChildren) {
        jsx += '\n' + renderComponentTree(comp.children, depth + 1);
        jsx += `\n${indent}</${reactTag}>`;
      } else if (content) {
        jsx += `\n${indent}  ${this.escapeJSXText(content)}\n${indent}</${reactTag}>`;
      } else {
        jsx += `</${reactTag}>`;
      }
      
      return jsx;
    }).join('\n');
  };

  const reactComponents = renderComponentTree(allComponents);

  return {
    react: `import React from 'react';\n\nconst GeneratedComponent = () => {\n  return (\n    <div className="w-full min-h-screen">\n${reactComponents}\n    </div>\n  );\n};\n\nexport default GeneratedComponent;`,
    tailwind: allComponents.map(comp => 
      `// ${comp.name} (${comp.type})\n${this.sanitizeClassName(this.buildDynamicTailwindClasses(comp))}`
    ).join('\n\n')
  };
}

// ADD this helper method for escaping JSX text
escapeJSXText(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}



// 🔥 NEW: Build Tailwind classes from style object
buildDynamicTailwindClasses(comp) {
  const style = comp.style || {};
  const classes = [];
  
  // Layout & Display
  if (style.display) {
    const displayMap = {
      'flex': 'flex',
      'inline-flex': 'inline-flex',
      'grid': 'grid',
      'inline-grid': 'inline-grid',
      'block': 'block',
      'inline-block': 'inline-block',
      'inline': 'inline',
      'none': 'hidden'
    };
    classes.push(displayMap[style.display] || 'block');
  }
  // Flexbox properties
  if (style.flexDirection === 'column') classes.push('flex-col');
  if (style.flexDirection === 'row-reverse') classes.push('flex-row-reverse');
  if (style.flexDirection === 'column-reverse') classes.push('flex-col-reverse');
  
  if (style.justifyContent) {
    const justifyMap = {
      'flex-start': 'justify-start',
      'center': 'justify-center',
      'flex-end': 'justify-end',
      'space-between': 'justify-between',
      'space-around': 'justify-around',
      'space-evenly': 'justify-evenly'
    };
    classes.push(justifyMap[style.justifyContent]);
  }
  
  if (style.alignItems) {
    const alignMap = {
      'flex-start': 'items-start',
      'center': 'items-center',
      'flex-end': 'items-end',
      'stretch': 'items-stretch',
      'baseline': 'items-baseline'
    };
    classes.push(alignMap[style.alignItems]);
  }
  // Spacing (convert px to Tailwind)
  if (style.gap) classes.push(this.convertSpacingToTailwind('gap', style.gap));
  if (style.padding) classes.push(this.convertSpacingToTailwind('p', style.padding));
  if (style.margin) classes.push(this.convertSpacingToTailwind('m', style.margin));
  
  // Sizing
  if (style.width === '100%') classes.push('w-full');
  else if (style.width === 'auto') classes.push('w-auto');
  else if (style.width) classes.push(`w-[${style.width}]`);
  
  if (style.height === '100%') classes.push('h-full');
  else if (style.height === 'auto') classes.push('h-auto');
  else if (style.height) classes.push(`h-[${style.height}]`);
  
  // Colors
  if (style.backgroundColor) {
    classes.push(this.convertColorToTailwind('bg', style.backgroundColor));
  }
  if (style.color) {
    classes.push(this.convertColorToTailwind('text', style.color));
  }
  
  // Border & Radius
  if (style.borderRadius) {
    classes.push(this.convertBorderRadiusToTailwind(style.borderRadius));
  }
  if (style.border || style.borderWidth) {
    classes.push('border');
    if (style.borderColor) {
      classes.push(this.convertColorToTailwind('border', style.borderColor));
    }
  }
  // Typography
  if (style.fontSize) classes.push(this.convertFontSizeToTailwind(style.fontSize));
  if (style.fontWeight) classes.push(this.convertFontWeightToTailwind(style.fontWeight));
  if (style.textAlign) classes.push(`text-${style.textAlign}`);
  
  // Shadow
  if (style.boxShadow) classes.push(this.convertShadowToTailwind(style.boxShadow));
  
  return classes.filter(Boolean).join(' ');
}



convertSpacingToTailwind(prefix, value) {
  if (!value) return '';
  const px = parseInt(value);
  if (isNaN(px)) return '';
  
  const spacingMap = {
    0: '0', 4: '1', 8: '2', 12: '3', 16: '4', 20: '5', 24: '6',
    28: '7', 32: '8', 36: '9', 40: '10', 44: '11', 48: '12',
    56: '14', 64: '16', 80: '20', 96: '24', 112: '28', 128: '32'
  };
  
  return spacingMap[px] ? `${prefix}-${spacingMap[px]}` : `${prefix}-[${value}]`;
}

convertColorToTailwind(prefix, color) {
  if (!color) return '';
  
  // Check for common colors
  const colorMap = {
    '#ffffff': 'white', '#000000': 'black',
    'rgb(255, 255, 255)': 'white', 'rgb(0, 0, 0)': 'black'
  };
  
  if (colorMap[color.toLowerCase()]) {
    return `${prefix}-${colorMap[color.toLowerCase()]}`;
  }
  
  // Use arbitrary value for custom colors
  return `${prefix}-[${color}]`;
}

convertBorderRadiusToTailwind(radius) {
  const radiusMap = {
    '0px': 'rounded-none', '2px': 'rounded-sm', '4px': 'rounded',
    '6px': 'rounded-md', '8px': 'rounded-lg', '12px': 'rounded-xl',
    '16px': 'rounded-2xl', '24px': 'rounded-3xl', '9999px': 'rounded-full'
  };
  
  return radiusMap[radius] || `rounded-[${radius}]`;
}



convertFontSizeToTailwind(size) {
  const sizeMap = {
    '12px': 'text-xs', '14px': 'text-sm', '16px': 'text-base',
    '18px': 'text-lg', '20px': 'text-xl', '24px': 'text-2xl',
    '30px': 'text-3xl', '36px': 'text-4xl', '48px': 'text-5xl'
  };
  
  return sizeMap[size] || `text-[${size}]`;
}

convertFontWeightToTailwind(weight) {
  const weightMap = {
    '300': 'font-light', '400': 'font-normal', '500': 'font-medium',
    '600': 'font-semibold', '700': 'font-bold', '800': 'font-extrabold'
  };
  
  return weightMap[weight] || `font-[${weight}]`;
}



convertShadowToTailwind(shadow) {
  const shadowMap = {
    'none': 'shadow-none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)': 'shadow-sm',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1)': 'shadow',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1)': 'shadow-md',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1)': 'shadow-lg',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1)': 'shadow-xl',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)': 'shadow-2xl'
  };
  
  return shadowMap[shadow] || 'shadow';
}

// 🔥 NEW: Extract component content (text, props.content, etc.)
extractComponentContent(comp) {
  // Priority: text_content > props.content > props.text > props.children
  if (comp.text_content) return comp.text_content;
  if (comp.props?.content) return comp.props.content;
  if (comp.props?.text) return comp.props.text;
  if (comp.props?.children && typeof comp.props.children === 'string') {
    return comp.props.children;
  }
  const defaultContent = {
    'button': 'Button',
    'h1': 'Heading 1',
    'h2': 'Heading 2',
    'h3': 'Heading 3',
    'h4': 'Heading 4',
    'h5': 'Heading 5',
    'h6': 'Heading 6',
    'p': 'Paragraph text',
    'span': 'Text',
    'a': 'Link',
    'label': 'Label'
  };
  
  return defaultContent[comp.type] || '';
}

buildDynamicProps(comp) {
  const props = [];
  
  // Add type-specific props
  if (comp.type === 'input') {
    if (comp.props?.type) props.push(`type="${comp.props.type}"`);
    if (comp.props?.placeholder) props.push(`placeholder="${comp.props.placeholder}"`);
    if (comp.props?.disabled) props.push('disabled');
  }
  
  if (comp.type === 'button' && comp.props?.disabled) {
    props.push('disabled');
  }
  
  if (comp.type === 'a' && comp.props?.href) {
    props.push(`href="${comp.props.href}"`);
    if (comp.props?.target) props.push(`target="${comp.props.target}"`);
  }
  
  if (comp.type === 'img') {
    if (comp.props?.src) props.push(`src="${comp.props.src}"`);
    if (comp.props?.alt) props.push(`alt="${comp.props.alt}"`);
  }
  
  return props.join('\n      ');
}


getComponentTag(type) {
  const tagMap = {
    'text-node': 'span',
    'section': 'section',
    'container': 'div',
    'div': 'div',
    'flex': 'div',
    'grid': 'div',
    'button': 'button',
    'input': 'input',
    'textarea': 'textarea',
    'select': 'select',
    'link': 'a',
    'p': 'p',
    'span': 'span',
    'h1': 'h1',
    'h2': 'h2',
    'h3': 'h3',
    'h4': 'h4',
    'h5': 'h5',
    'h6': 'h6',
    'label': 'label',
    'strong': 'strong',
    'em': 'em',
    'small': 'small',
    'blockquote': 'blockquote'
  };
  
  return tagMap[type] || 'div';
}


  // Around line 750 - REPLACE generateReactCSSCode
generateReactCSSCode(allComponents) {
  if (!allComponents || allComponents.length === 0) {
    return {
      react: `import React from 'react';
import './GeneratedComponent.css';

const GeneratedComponent = () => {
  return (
    <div className="canvas-container">
      {/* No components yet */}
    </div>
  );
};

export default GeneratedComponent;`,
      css: this.generateModernCSS([])
    };
  }

  // 🔥 FIXED: Recursive React component rendering with CSS classes
  const renderReactTree = (components, depth = 0) => {
    return components.map(comp => {
      const indent = '  '.repeat(depth + 2);
      
      // Handle text-node (no wrapper)
      if (comp.type === 'text-node') {
        const textContent = comp.props?.content || comp.props?.text || comp.text_content || '';
        return `${indent}${textContent}`;
      }
      
      // Generate unique CSS class for this component
      const cssClass = this.generateCSSClassName(comp);
      const content = this.extractComponentContent(comp);
      const hasChildren = comp.children && comp.children.length > 0;
      
      // Get React tag (section, div, button, etc.)
      const reactTag = this.getReactTag(comp.type);
      
      let jsx = `${indent}<${reactTag}`;
      
      // Add className
      if (cssClass) {
        jsx += `\n${indent}  className="${cssClass}"`;
      }
      
      // Add other props
      const otherProps = this.buildReactProps(comp);
      if (otherProps) {
        jsx += `\n${indent}  ${otherProps}`;
      }
      
      jsx += `\n${indent}>`;
      
      if (hasChildren) {
        jsx += '\n' + renderReactTree(comp.children, depth + 1);
        jsx += `\n${indent}</${reactTag}>`;
      } else if (content) {
        jsx += `\n${indent}  ${content}\n${indent}</${reactTag}>`;
      } else {
        jsx += `</${reactTag}>`;
      }
      
      return jsx;
    }).join('\n');
  };

  const reactComponents = renderReactTree(allComponents);

  return {
    react: `import React from 'react';
import './GeneratedComponent.css';

const GeneratedComponent = () => {
  return (
    <div className="canvas-container">
${reactComponents}
    </div>
  );
};

export default GeneratedComponent;`,
    css: this.generateModernCSS(allComponents)
  };
}

// Around line 800 - REPLACE generateHTMLCSSCode
generateHTMLCSSCode(allComponents) {
  if (!allComponents || allComponents.length === 0) {
    return {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Component</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="canvas-container">
      <!-- No components yet -->
    </div>
</body>
</html>`,
      css: this.generateModernCSS([])
    };
  }

  // 🔥 FIXED: Recursive HTML rendering with CSS classes
  const renderHTMLTree = (components, depth = 0) => {
    return components.map(comp => {
      const indent = '  '.repeat(depth + 2);
      
      // Handle text-node (no wrapper)
      if (comp.type === 'text-node') {
        const textContent = comp.props?.content || comp.props?.text || comp.text_content || '';
        return `${indent}${textContent}`;
      }
      
      // Generate unique CSS class for this component
      const cssClass = this.generateCSSClassName(comp);
      const content = this.extractComponentContent(comp);
      const hasChildren = comp.children && comp.children.length > 0;
      
      // Get HTML tag
      const htmlTag = this.getHTMLTag(comp.type);
      
      let html = `${indent}<${htmlTag}`;
      
      // Add class
      if (cssClass) {
        html += ` class="${cssClass}"`;
      }
      
      // Add HTML attributes
      const attrs = this.buildHTMLAttributes(comp);
      if (attrs) {
        html += ` ${attrs}`;
      }
      
      html += `>`;
      
      if (hasChildren) {
        html += '\n' + renderHTMLTree(comp.children, depth + 1);
        html += `\n${indent}</${htmlTag}>`;
      } else if (content) {
        html += content + `</${htmlTag}>`;
      } else {
        // Self-closing tags
        if (['input', 'img', 'br', 'hr'].includes(comp.type)) {
          return `${indent}<${htmlTag}${cssClass ? ` class="${cssClass}"` : ''}${attrs ? ` ${attrs}` : ''} />`;
        }
        html += `</${htmlTag}>`;
      }
      
      return html;
    }).join('\n');
  };

  const htmlComponents = renderHTMLTree(allComponents);

  return {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Component</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="canvas-container">
${htmlComponents}
    </div>
</body>
</html>`,
    css: this.generateModernCSS(allComponents)
  };
}

generateCSSClassName(component) {
  // Create valid CSS class name (no special characters)
  const baseName = (component.name || component.type)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')  // Replace ALL non-alphanumeric with hyphens
    .replace(/-+/g, '-')         // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
  
  const uniqueId = component.id.split('_').pop().substring(0, 6);
  return `${baseName}-${uniqueId}`;
}

getReactTag(type) {
  const reactMap = {
    'button': 'button',
    'input': 'input',
    'textarea': 'textarea',
    'select': 'select',
    'link': 'a',
    'section': 'section',
    'container': 'div',
    'div': 'div',
    'flex': 'div',
    'grid': 'div',
    'p': 'p',
    'span': 'span',
    'h1': 'h1',
    'h2': 'h2',
    'h3': 'h3',
    'h4': 'h4',
    'h5': 'h5',
    'h6': 'h6',
    'label': 'label',
    'strong': 'strong',
    'em': 'em',
    'small': 'small',
    'blockquote': 'blockquote'
  };
  
  return reactMap[type] || 'div';
}

buildReactProps(component) {
  const props = [];
  
  // Type-specific props
  if (component.type === 'input') {
    if (component.props?.type) props.push(`type="${component.props.type}"`);
    if (component.props?.placeholder) props.push(`placeholder="${component.props.placeholder}"`);
    if (component.props?.disabled) props.push('disabled');
  }
  
  if (component.type === 'button' && component.props?.disabled) {
    props.push('disabled');
  }
  
  if (component.type === 'link' || component.type === 'a') {
    props.push(`href="${component.props?.href || '#'}"`);
    if (component.props?.target) props.push(`target="${component.props.target}"`);
  }
  
  return props.join('\n      ');
}

generateModernCSS(allComponents) {
  if (!allComponents || allComponents.length === 0) {
    return `.canvas-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}`;
  }

  const cssRules = [];
  
  // Add base canvas styles
  cssRules.push(`.canvas-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}`);

  // Generate CSS for each component recursively
  const generateComponentCSS = (component) => {
    const className = this.generateCSSClassName(component);
    const styles = component.style || {};
    
    // Convert style object to CSS
    const cssProperties = Object.entries(styles)
      .filter(([key]) => !key.startsWith('_')) // Skip internal properties
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `  ${cssKey}: ${value};`;
      })
      .join('\n');
    
    if (cssProperties) {
      cssRules.push(`.${className} {
${cssProperties}
}`);
    }
    
    // Recursively process children
    if (component.children && component.children.length > 0) {
      component.children.forEach(child => generateComponentCSS(child));
    }
  };
  
  allComponents.forEach(comp => generateComponentCSS(comp));
  
  return cssRules.join('\n\n');
}

  // REPLACE generateHTMLTailwindCode method
// Around line 850 - REPLACE generateHTMLTailwindCode
generateHTMLTailwindCode(allComponents) {
  if (!allComponents || allComponents.length === 0) {
    return {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Component</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="w-full min-h-screen">
      <!-- No components yet -->
    </div>
</body>
</html>`,
      tailwind: ''
    };
  }

 // Around line 850 - REPLACE the renderHTMLTree function
const renderHTMLTree = (components, depth = 0) => {
  return components.map(comp => {
    const indent = '  '.repeat(depth + 2);
    
    // 🔥 CRITICAL: Handle text-node specially (NO wrapper element)
    if (comp.type === 'text-node') {
      const textContent = comp.props?.content || comp.props?.text || comp.text_content || '';
      return `${indent}${textContent}`; // ✅ Just raw text, no tags
    }
    
    const classes = this.buildDynamicTailwindClasses(comp);
    const content = this.extractComponentContent(comp);
    const hasChildren = comp.children && comp.children.length > 0;
    
    // Get actual HTML tag (button, div, p, etc.)
    const htmlTag = this.getHTMLTag(comp.type);
    
    let html = `${indent}<${htmlTag}`;
    
    if (classes) {
      html += ` class="${classes}"`;
    }
    
    // Add HTML-specific attributes
    const attrs = this.buildHTMLAttributes(comp);
    if (attrs) {
      html += ` ${attrs}`;
    }
    
    html += `>`;
    
    if (hasChildren) {
      html += '\n' + renderHTMLTree(comp.children, depth + 1);
      html += `\n${indent}</${htmlTag}>`;
    } else if (content) {
      html += content + `</${htmlTag}>`;
    } else {
      // Self-closing tags for empty elements
      if (['input', 'img', 'br', 'hr'].includes(comp.type)) {
        return `${indent}<${htmlTag}${classes ? ` class="${classes}"` : ''}${attrs ? ` ${attrs}` : ''} />`;
      }
      html += `</${htmlTag}>`;
    }
    
    return html;
  }).join('\n');
};



  const htmlComponents = renderHTMLTree(allComponents);

  return {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Component</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="w-full min-h-screen">
${htmlComponents}
    </div>
</body>
</html>`,
    tailwind: allComponents.map(comp => 
      `/* ${comp.name} (${comp.type}) */\n${this.buildDynamicTailwindClasses(comp)}`
    ).join('\n\n')
  };
}

// 🔥 ADD NEW METHOD (around line 920)
getHTMLTag(type) {
  const htmlMap = {
    'button': 'button',
    'input': 'input',
    'textarea': 'textarea',
    'select': 'select',
    'link': 'a',
    'section': 'section',
    'container': 'div',
    'div': 'div',
    'flex': 'div',
    'grid': 'div',
    'p': 'p',
    'span': 'span',
    'h1': 'h1',
    'h2': 'h2',
    'h3': 'h3',
    'h4': 'h4',
    'h5': 'h5',
    'h6': 'h6',
    'label': 'label',
    'strong': 'strong',
    'em': 'em',
    'small': 'small',
    'blockquote': 'blockquote'
  };
  
  return htmlMap[type] || 'div';
}



// 🔥 NEW: Build HTML attributes
buildHTMLAttributes(comp) {
  const attrs = [];
  
  if (comp.type === 'input') {
    if (comp.props?.type) attrs.push(`type="${comp.props.type}"`);
    if (comp.props?.placeholder) attrs.push(`placeholder="${comp.props.placeholder}"`);
    if (comp.props?.disabled) attrs.push('disabled');
  }
  
  if (comp.type === 'button' && comp.props?.disabled) {
    attrs.push('disabled');
  }
  
  if (comp.type === 'a') {
    attrs.push(`href="${comp.props?.href || '#'}"`);
    if (comp.props?.target) attrs.push(`target="${comp.props.target}"`);
  }
  
  if (comp.type === 'img') {
    attrs.push(`src="${comp.props?.src || ''}"`);
    attrs.push(`alt="${comp.props?.alt || ''}"`);
  }
  
  return attrs.join(' ');
}





  // Enhanced JSX generation with variant support
  generateComponentJSX(comp, classes) {
    const componentDef = this.componentDefinitions.get(comp.type);
    if (!componentDef) return `<div className="${classes}">${comp.name || comp.type}</div>`;

    // Handle variant-specific rendering
    if (comp.variant && comp.variant.preview_code) {
      return comp.variant.preview_code;
    }

    switch (comp.type) {
      case 'button':
        return `<button className="${classes}" ${comp.props.disabled ? 'disabled' : ''}>${comp.props.text || comp.variant?.text || 'Button'}</button>`;
      case 'avatar':
        if (comp.props.src) {
          return `<div className="${classes}"><img src="${comp.props.src}" alt="${comp.props.alt || 'Avatar'}" className="w-full h-full object-cover" /></div>`;
        }
        const initials = comp.props.initials || comp.props.name?.charAt(0) || 'A';
        return `<div className="${classes}"><span className="font-medium">${initials}</span></div>`;
      case 'badge':
        return `<span className="${classes}">${comp.props.text || comp.variant?.text || 'Badge'}</span>`;
      case 'input':
        return `<input type="${comp.props.type || 'text'}" placeholder="${comp.props.placeholder || ''}" className="${classes}" ${comp.props.required ? 'required' : ''} ${comp.props.disabled ? 'disabled' : ''} />`;
      case 'searchbar':
        return `<div className="${classes}">
          <input type="text" placeholder="${comp.props.placeholder || 'Search...'}" className="flex-1 bg-transparent outline-none" />
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>`;
      case 'card':
        return `<div className="${classes}">
            ${comp.props.title ? `<h3 className="font-semibold text-lg mb-2 text-gray-900">${comp.props.title}</h3>` : ''}
            <div className="text-gray-600">${comp.props.content || 'Card content'}</div>
          </div>`;
      default:
        return `<div className="${classes}">${comp.name || componentDef.name}</div>`;
    }
  }

  // Enhanced HTML generation with variant support
  generateComponentHTML(comp, classes) {
    const componentDef = this.componentDefinitions.get(comp.type);
    if (!componentDef) return `<div class="${classes}">${comp.name || comp.type}</div>`;

    // Handle variant-specific rendering
    if (comp.variant && comp.variant.preview_code) {
      return comp.variant.preview_code.replace(/className=/g, 'class=');
    }

    switch (comp.type) {
      case 'button':
        return `<button class="${classes}" ${comp.props.disabled ? 'disabled' : ''}>${comp.props.text || comp.variant?.text || 'Button'}</button>`;
      case 'avatar':
        if (comp.props.src) {
          return `<div class="${classes}"><img src="${comp.props.src}" alt="${comp.props.alt || 'Avatar'}" class="w-full h-full object-cover" /></div>`;
        }
        const initials = comp.props.initials || comp.props.name?.charAt(0) || 'A';
        return `<div class="${classes}"><span class="font-medium">${initials}</span></div>`;
      case 'badge':
        return `<span class="${classes}">${comp.props.text || comp.variant?.text || 'Badge'}</span>`;
      case 'input':
        return `<input type="${comp.props.type || 'text'}" placeholder="${comp.props.placeholder || ''}" class="${classes}" ${comp.props.required ? 'required' : ''} ${comp.props.disabled ? 'disabled' : ''} />`;
      case 'searchbar':
        return `<div class="${classes}">
          <input type="text" placeholder="${comp.props.placeholder || 'Search...'}" class="flex-1 bg-transparent outline-none" />
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>`;
      case 'card':
        return `<div class="${classes}">
        ${comp.props.title ? `<h3 class="font-semibold text-lg mb-2 text-gray-900">${comp.props.title}</h3>` : ''}
        <div class="text-gray-600">${comp.props.content || 'Card content'}</div>
      </div>`;
      default:
        return `<div class="${classes}">${comp.name || componentDef.name}</div>`;
    }
  }

  generateCSSStyles(allComponents) {
    return `.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}

.btn-ghost {
  background: transparent;
  color: #7c3aed;
  border: 1px solid transparent;
}

.btn-ghost:hover {
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.btn-gradient {
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
  transform: translateY(0);
  transition: all 0.2s ease;
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.6);
}

.btn-neon {
  background: black;
  border: 2px solid #06b6d4;
  color: #06b6d4;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}

.btn-neon:hover {
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.8);
}

.btn-glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.btn-outline {
  background: transparent;
  border: 2px solid #7c3aed;
  color: #7c3aed;
}

.btn-outline:hover {
  background: #7c3aed;
  color: white;
}

.btn-minimal {
  background: transparent;
  border: none;
  color: #374151;
}

.btn-minimal:hover {
  background: #f3f4f6;
  color: #111827;
}

.btn-xs {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.btn-md {
  padding: 10px 24px;
  font-size: 1rem;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 1.125rem;
}

.btn-xl {
  padding: 20px 40px;
  font-size: 1.25rem;
}

/* Avatar styles */
.avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #d1d5db;
  color: #6b7280;
}

/* Badge styles */
.badge {
  display: inline-block;
  border-radius: 9999px;
  font-weight: 500;
}

.badge-default {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.badge-primary {
  background-color: #dbeafe;
  color: #1d4ed8;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.badge-success {
  background-color: #dcfce7;
  color: #166534;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.badge-warning {
  background-color: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.badge-danger {
  background-color: #fee2e2;
  color: #991b1b;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* Input styles */
.input {
  display: block;
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Card styles */
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Searchbar styles */
.searchbar {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

.searchbar:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.component-default {
  padding: 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background-color: #f9fafb;
  text-align: center;
}`;
  }

  getComponentClasses(comp) {
    switch (comp.type) {
      case 'button':
        return this.getButtonClasses(comp.props);
      case 'avatar':
        return this.getAvatarClasses(comp.props);
      case 'badge':
        return this.getBadgeClasses(comp.props);
      case 'input':
        return this.getInputClasses(comp.props);
      case 'searchbar':
        return this.getSearchbarClasses(comp.props);
      case 'card':
        return this.getCardClasses(comp.props);
      default:
        return 'p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50';
    }
  }

  // Get component by type
  getComponent(type) {
    return this.components.get(type);
  }

  // Get component definition
  getComponentDefinition(type) {
    return this.componentDefinitions.get(type);
  }

  // Get all components
  getAllComponents() {
    return Object.fromEntries(this.components);
  }

  // Get all component definitions
  getAllComponentDefinitions() {
    return Object.fromEntries(this.componentDefinitions);
  }


// @/Services/ComponentLibraryService.js - ADD/REPLACE this method (around line 100)

normalizeComponentStyles(component) {
  // 🔥 CRITICAL: Move ANY style-related properties from props to style
  const styleProps = [
    // Display & Positioning
    'display', 'position', 'top', 'right', 'bottom', 'left', 'zIndex',
    
    // Flexbox & Grid
    'flexDirection', 'justifyContent', 'alignItems', 'alignContent', 
    'gap', 'rowGap', 'columnGap', 'flex', 'flexGrow', 'flexShrink', 'flexBasis',
    'gridTemplateColumns', 'gridTemplateRows', 'gridColumn', 'gridRow',
    
    // Size
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    
    // Spacing
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    
    // Background
    'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition',
    'backgroundRepeat', 'background',
    
    // Border
    'border', 'borderWidth', 'borderStyle', 'borderColor', 'borderRadius',
    'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
    
    // Typography
    'color', 'fontSize', 'fontWeight', 'fontFamily', 'lineHeight', 'letterSpacing',
    'textAlign', 'textDecoration', 'textTransform',
    
    // Visual Effects
    'boxShadow', 'opacity', 'transform', 'transition', 'filter', 'backdropFilter',
    
    // Overflow & Visibility
    'overflow', 'overflowX', 'overflowY', 'visibility',
    
    // Cursor & Interaction
    'cursor', 'pointerEvents', 'userSelect',
  ];
  
  const normalized = {
    ...component,
    style: { ...(component.style || {}) },
    props: { ...(component.props || {}) }
  };
  
  // 🔥 Move ALL style props from props to style
  styleProps.forEach(prop => {
    if (normalized.props[prop] !== undefined) {
      console.log(`⚠️ Moving ${prop} from props to style:`, normalized.props[prop]);
      normalized.style[prop] = normalized.props[prop];
      delete normalized.props[prop];
    }
  });
  
  // 🔥 ALSO check for Tailwind class strings that should be converted
  if (normalized.props.className) {
    console.log('⚠️ Converting className to inline styles');
    // You can add Tailwind-to-CSS conversion here if needed
    // For now, just move it
    normalized.style.className = normalized.props.className;
    delete normalized.props.className;
  }
  
  return normalized;
}


// MODIFY: saveProjectComponents method (around line 750)
async saveProjectComponents(projectId, frameId, components) {
    try {
        console.log('=== SAVING TO DATABASE ===');
        console.log('Components to save:', components.length);
        
        const seenIds = new Set();
        
        // 🔥 CRITICAL: Normalize ALL components before flattening
        const normalizedComponents = components.map(comp => 
            this.normalizeComponentStyles(comp)
        );
        
        const flattenedComponents = this.flattenComponentTree(normalizedComponents, seenIds);
        
        console.log('Flattened components:', flattenedComponents.length);
        console.log('Duplicate IDs removed:', components.length - flattenedComponents.length);
        
        const response = await axios.post('/api/project-components/bulk-update', {
            project_id: projectId,
            frame_id: frameId,
            components: flattenedComponents.map((comp, index) => ({
                id: comp.id,                              
                type: comp.type,                          
                props: comp.props || {},
                name: comp.name || comp.type,
                zIndex: comp.zIndex || 0,
                sortOrder: index,                         
                variant: comp.variant || null,
                style: comp.style || {}, // 🔥 This should now contain ALL styles
                animation: comp.animation || {},
                isLayoutContainer: comp.isLayoutContainer || false,
                children: comp.children || [],            
                parentId: comp.parentId || null,
            })),
            create_revision: false
        });
        
        if (response.data.success) {
            console.log('✅ Successfully saved to database');
            return true;
        }
        
        console.error('❌ Save failed:', response.data.message);
        return false;
    } catch (error) {
        console.error('❌ Failed to save components:', error.response?.data || error.message);
        throw error;
    }
}


// MODIFY: flattenComponentTree to ensure styles are preserved (around line 830)
flattenComponentTree(components, seenIds = new Set(), parentId = null) {
    const flattened = [];
    
    components.forEach(comp => {
        if (seenIds.has(comp.id)) {
            console.warn('⚠️ Duplicate component ID detected, skipping:', comp.id);
            return;
        }
        
        seenIds.add(comp.id);
        
        // 🔥 ENSURE styles are preserved during flattening
        const flatComp = {
            ...comp,
            parentId: parentId,
            style: comp.style || {}, // ✅ Explicitly preserve
            props: comp.props || {}, // ✅ Explicitly preserve
        };
        
        flattened.push(flatComp);
        
        if (comp.children && comp.children.length > 0) {
            const childrenFlat = this.flattenComponentTree(comp.children, seenIds, comp.id);
            flattened.push(...childrenFlat);
        }
    });
    
    return flattened;
}

// ENHANCED: Rebuild tree from flattened database records with duplicate prevention
rebuildComponentTree(flatComponents) {
    const componentMap = new Map();
    const rootComponents = [];
    const seenIds = new Set();
    
    // First pass: Create map of all components, skip duplicates
    flatComponents.forEach(comp => {
        if (seenIds.has(comp.id)) {
            console.warn('⚠️ Duplicate component in database response, skipping:', comp.id);
            return;
        }
        
        seenIds.add(comp.id);
        componentMap.set(comp.id, {
            ...comp,
            children: []
        });
    });
    
    // Second pass: Build parent-child relationships
    flatComponents.forEach(comp => {
        if (!seenIds.has(comp.id)) return; // Skip duplicates
        
        const component = componentMap.get(comp.id);
        
        if (comp.parentId) {
            const parent = componentMap.get(comp.parentId);
            if (parent) {
                parent.children.push(component);
            } else {
                // Parent not found, treat as root
                rootComponents.push(component);
            }
        } else {
            rootComponents.push(component);
        }
    });
    
    return rootComponents;
}

    // ENHANCED: Load with tree reconstruction
  async loadProjectComponents(projectId, frameId) {
      try {
          console.log('Loading project components for:', { projectId, frameId });
          
          const response = await axios.get('/api/project-components', {
              params: { project_id: projectId, frame_id: frameId }
          });
          
          if (response.data.success) {
              const flatComponents = response.data.data;
              console.log('Loaded', flatComponents.length, 'components from backend');
              
              // CRITICAL: Rebuild tree structure
              const treeComponents = this.rebuildComponentTree(flatComponents);
              
              console.log('Rebuilt tree with', treeComponents.length, 'root components');
              
              return treeComponents;
          }
          
          return [];
      } catch (error) {
          console.error('Failed to load project components:', error);
          return [];
      }
  }
}

// Create singleton instance
export const componentLibraryService = new ComponentLibraryService();
export default componentLibraryService;