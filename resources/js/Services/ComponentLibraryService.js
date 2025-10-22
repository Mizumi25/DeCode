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

  // Dynamic component renderer with enhanced variant support
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
        
        // ✅ CRITICAL: Proper props merging with defaults
        const defaultProps = componentDef?.default_props || {};
        const instanceProps = props?.props || {};
        const directProps = { ...props };
        delete directProps.props; // Remove nested props
        delete directProps.children; // Preserve children separately
        
        const mergedProps = { 
            ...defaultProps,      // Component defaults
            ...instanceProps,     // Instance-specific props
            ...directProps,       // Direct props (style, animation, etc.)
        };
        
        console.log('🔧 Merged props for', componentDef.type, ':', mergedProps);
        
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
    
    
  
       renderLayoutContainer(componentDef, props, id, children) {
    // 🔥 FIX: Merge ALL style properties properly
    const baseStyle = {
        display: props.style?.display || this.getDefaultDisplay(componentDef.type),
        width: props.style?.width || '100%',
        minHeight: props.style?.minHeight || this.getDefaultMinHeight(componentDef.type),
        padding: props.style?.padding || this.getDefaultPadding(componentDef.type),
        backgroundColor: 'transparent',
    };
    
    // 🔥 CRITICAL: Merge ALL props.style into containerStyle
    const containerStyle = {
        ...baseStyle,
        ...props.style  // This ensures ALL style properties are applied
    };
        
        return React.createElement('div', {
            key: id,
            'data-layout-type': componentDef.type,
            'data-component-id': id,
            className: `layout-container ${componentDef.type}-container`,
            style: containerStyle
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
    const className = this.getButtonClasses(props);
    
    // 🔥 APPLY ALL LAYOUT STYLES
    const buttonStyle = this.applyLayoutStyles({
        maxWidth: '100%',
        wordBreak: 'break-word',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        ...layoutStyles
    }, props);
    
    return React.createElement('button', {
        key: id,
        className,
        style: buttonStyle,  // ✅ Now includes ALL layout properties
        'data-component-id': id,
        'data-component-type': 'button',
        'data-is-layout': false,
        onClick: (e) => e.stopPropagation(),
        disabled: props.disabled || false
    });
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

// 🔥 ENHANCED: Button with auto-wrapped text nodes
renderButton(props, id, layoutStyles = {}) {
    const className = this.getButtonClasses(props);
    const buttonText = props.content || props.text || props.children || 'Button';
    
    const buttonStyle = {
        maxWidth: '100%',
        wordBreak: 'break-word',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: props.width || 'fit-content',
        minWidth: props.minWidth || '60px',
        ...layoutStyles,
        ...props.style
    };
    
    // 🔥 CRITICAL: Render text as SEPARATE child text node
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
            cursor: 'text',
            userSelect: 'none',
            display: 'inline-block',
            pointerEvents: 'auto' // 🔥 ALLOW CLICKS
        },
        onClick: (e) => {
            e.stopPropagation();
            if (window.forgeSelectComponent) {
                window.forgeSelectComponent(textNodeId);
            }
        }
    }, buttonText);
    
    return React.createElement('button', {
        key: id,
        className,
        onClick: (e) => {
            e.stopPropagation();
            console.log(`Button ${id} clicked`);
        },
        disabled: props.disabled || false,
        style: buttonStyle,
        'data-component-id': id,
        'data-component-type': 'button',
        'data-is-layout': false,
    }, textNode); // 🔥 RENDER TEXT NODE AS CHILD
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

  generateReactTailwindCode(allComponents) {
  if (!allComponents || allComponents.length === 0) {
    return {
      react: `import React from 'react';

const GeneratedComponent = () => {
  return (
    <div className="w-full min-h-screen p-8">
      {/* No components yet */}
    </div>
  );
};

export default GeneratedComponent;`,
      tailwind: '// No components to generate classes for'
    };
  }

  // REMOVE the position absolute wrapper - just render components directly
  const reactComponents = allComponents.map(comp => {
    const classes = this.getComponentClasses(comp);
    return this.generateComponentJSX(comp, classes); // NO WRAPPER
  }).join('\n');

  return {
    react: `import React from 'react';

const GeneratedComponent = () => {
  return (
    <div className="w-full min-h-screen">
${reactComponents}
    </div>
  );
};

export default GeneratedComponent;`,
    tailwind: allComponents.map(comp => `// ${comp.name} (${comp.type})\n${this.getComponentClasses(comp)}`).join('\n\n')
  };
}

  generateReactCSSCode(allComponents) {
  // REMOVE position absolute wrapper
  const reactComponents = allComponents.map(comp => {
    return this.generateComponentJSX(comp, `btn btn-${comp.props.variant || 'primary'} btn-${comp.props.size || 'md'}`);
  }).join('\n');

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
    css: this.generateCSSStyles(allComponents)
  };
}

  generateHTMLCSSCode(allComponents) {
  // REMOVE position absolute wrapper
  const htmlComponents = allComponents.map(comp => {
    return this.generateComponentHTML(comp, `btn btn-${comp.props.variant || 'primary'} btn-${comp.props.size || 'md'}`);
  }).join('\n');

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
    css: this.generateCSSStyles(allComponents)
  };
}

  generateHTMLTailwindCode(allComponents) {
  // REMOVE position absolute wrapper
  const htmlComponents = allComponents.map(comp => {
    const classes = this.getComponentClasses(comp);
    return this.generateComponentHTML(comp, classes);
  }).join('\n');

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
    tailwind: allComponents.map(comp => `/* ${comp.name} (${comp.type}) */\n${this.getComponentClasses(comp)}`).join('\n\n')
  };
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


async saveProjectComponents(projectId, frameId, components) {
    try {
        console.log('=== SAVING TO DATABASE ===');
        console.log('Components to save:', components.length);
        
        // CRITICAL: Create a Set to track component IDs and prevent duplicates
        const seenIds = new Set();
        
        // CRITICAL: Flatten component tree for backend
        const flattenedComponents = this.flattenComponentTree(components, seenIds);
        
        console.log('Flattened components:', flattenedComponents.length);
        console.log('Duplicate IDs removed:', components.length - flattenedComponents.length);
        
        const response = await axios.post('/api/project-components/bulk-update', {
            project_id: projectId,
            frame_id: frameId,
            components: flattenedComponents.map((comp, index) => ({
                // CRITICAL: Map frontend fields to backend fields
                id: comp.id,                              
                type: comp.type,                          
                props: comp.props || {},
                name: comp.name || comp.type,
                zIndex: comp.zIndex || 0,
                sortOrder: index,                         
                variant: comp.variant || null,
                style: comp.style || {},
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

// ENHANCED: Flatten nested component tree with duplicate detection
flattenComponentTree(components, seenIds = new Set(), parentId = null) {
    const flattened = [];
    
    components.forEach(comp => {
        // CRITICAL: Skip duplicates
        if (seenIds.has(comp.id)) {
            console.warn('⚠️ Duplicate component ID detected, skipping:', comp.id);
            return;
        }
        
        // Mark as seen
        seenIds.add(comp.id);
        
        // Add current component with parent reference
        const flatComp = {
            ...comp,
            parentId: parentId
        };
        
        flattened.push(flatComp);
        
        // Recursively flatten children
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