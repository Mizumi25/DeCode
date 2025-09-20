// @/Services/ComponentLibraryService.js
import axios from 'axios';
import React from 'react';

class ComponentLibraryService {
  constructor() {
    this.components = new Map();
    this.componentDefinitions = new Map();
    
    // ADD: Save queue management to prevent conflicts
    this.saveQueue = new Map(); // frameId -> timeout
    this.isSaving = new Map(); // frameId -> boolean
    this.saveDebounceTime = 1000; // 1 second debounce
    
    // CRITICAL: Add undo/redo operation tracking
    this.undoRedoInProgress = new Map(); 
  
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
        // Get the component definition if not passed
        if (!componentDef && this.componentDefinitions.has(props.type || props.component_type)) {
            componentDef = this.componentDefinitions.get(props.type || props.component_type);
        }
        
        if (!componentDef) {
            console.warn('No component definition found for:', props.type || props.component_type);
            return this.renderGeneric(props, id, { name: props.type || 'Unknown', type: props.type || 'unknown' });
        }
        
        // CRITICAL FIX: Properly merge default props with instance props
        const mergedProps = { 
            ...componentDef.default_props,  // Start with component definition defaults
            ...props.props,                 // Then apply instance props
            ...props                        // Then apply any direct props
        };
        
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
        
        // Apply custom styles if present
        const layoutStyles = {
            display: props.style?.display || mergedProps.display || 'block',
            position: props.style?.position || 'relative',
            width: props.style?.width || mergedProps.width || 'auto',
            height: props.style?.height || mergedProps.height || 'auto',
            ...props.style // Apply any additional custom styles
        };
        
        switch (componentDef.type) {
            case 'button':
                return this.renderButton(mergedProps, id, layoutStyles);
            case 'input':
                return this.renderInput(mergedProps, id, layoutStyles);
            case 'card':
                return this.renderCard(mergedProps, id, layoutStyles);
            case 'avatar':
                return this.renderAvatar(mergedProps, id, layoutStyles);
            case 'badge':
                return this.renderBadge(mergedProps, id, layoutStyles);
            case 'searchbar':
                return this.renderSearchbar(mergedProps, id, layoutStyles);
            default:
                return this.renderGeneric(mergedProps, id, componentDef, layoutStyles);
        }
    }
  
    // Button renderer with enhanced variant support
    renderButton(props, id, layoutStyles = {}) {
        const className = this.getButtonClasses(props);
        
        const buttonStyle = {
            maxWidth: '100%',
            wordBreak: 'break-word',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: props.width || 'fit-content',
            minWidth: props.minWidth || '60px',
            ...layoutStyles, // Apply layout styles
            ...props.style   // Allow override
        };
        
        return React.createElement('button', {
            key: id,
            className,
            onClick: () => console.log(`Button ${id} clicked`),
            disabled: props.disabled || false,
            style: buttonStyle
        }, props.text || props.children || 'Button');
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
      style: props.style
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
          style: inputStyle
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
          style: cardStyle
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

// Enhanced button renderer with overflow prevention
renderButton(props, id) {
  const className = this.getButtonClasses(props);
  
  // Enhanced style with overflow prevention
  const buttonStyle = {
    maxWidth: '100%',
    wordBreak: 'break-word',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: props.width || 'fit-content',
    minWidth: props.minWidth || '60px',
    ...props.style
  };
  
  return React.createElement('button', {
    key: id,
    className,
    onClick: () => console.log(`Button ${id} clicked`),
    disabled: props.disabled || false,
    style: buttonStyle
  }, props.text || 'Button');
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
  clientSideCodeGeneration(allComponents, style) {
    console.log('Generating code for', allComponents.length, 'components with style:', style);
    
    switch (style) {
      case 'react-tailwind':
        return this.generateReactTailwindCode(allComponents);
      case 'react-css':
        return this.generateReactCSSCode(allComponents);
      case 'html-css':
        return this.generateHTMLCSSCode(allComponents);
      case 'html-tailwind':
        return this.generateHTMLTailwindCode(allComponents);
      default:
        return this.generateReactTailwindCode(allComponents);
    }
  }

  generateReactTailwindCode(allComponents) {
    if (!allComponents || allComponents.length === 0) {
      return {
        react: `import React from 'react';

const GeneratedComponent = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
      {/* No components yet */}
    </div>
  );
};

export default GeneratedComponent;`,
        tailwind: '// No components to generate classes for'
      };
    }

    const reactComponents = allComponents.map(comp => {
      const classes = this.getComponentClasses(comp);
      return `        <div style={{ position: 'absolute', left: '${comp.position.x}px', top: '${comp.position.y}px' }}>
          ${this.generateComponentJSX(comp, classes)}
        </div>`;
    }).join('\n');

    return {
      react: `import React from 'react';

const GeneratedComponent = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
${reactComponents}
    </div>
  );
};

export default GeneratedComponent;`,
      tailwind: allComponents.map(comp => `// ${comp.name} (${comp.type})\n${this.getComponentClasses(comp)}`).join('\n\n')
    };
  }

  generateReactCSSCode(allComponents) {
    const reactComponents = allComponents.map(comp => {
      return `        <div style={{ position: 'absolute', left: '${comp.position.x}px', top: '${comp.position.y}px' }}>
          ${this.generateComponentJSX(comp, `btn btn-${comp.props.variant || 'primary'} btn-${comp.props.size || 'md'}`)}
        </div>`;
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
    const htmlComponents = allComponents.map(comp => {
      return `    <div style="position: absolute; left: ${comp.position.x}px; top: ${comp.position.y}px;">
      ${this.generateComponentHTML(comp, `btn btn-${comp.props.variant || 'primary'} btn-${comp.props.size || 'md'}`)}
    </div>`;
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
    const htmlComponents = allComponents.map(comp => {
      const classes = this.getComponentClasses(comp);
      return `    <div style="position: absolute; left: ${comp.position.x}px; top: ${comp.position.y}px;">
      ${this.generateComponentHTML(comp, classes)}
    </div>`;
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
    <div class="relative w-full h-full min-h-[400px] bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
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

// Save project components to backend
async saveProjectComponents(projectId, frameId, components) {
    try {
      console.log('ComponentLibraryService: Save requested for frame:', frameId, 'with', components.length, 'components');
      
      // CRITICAL: Don't auto-save if undo/redo is in progress
      if (this.isUndoRedoInProgress(frameId)) {
        console.log('ComponentLibraryService: Skipping save - undo/redo in progress');
        return true;
      }
      
      // Clear any existing save timeout for this frame
      if (this.saveQueue.has(frameId)) {
        clearTimeout(this.saveQueue.get(frameId));
        console.log('ComponentLibraryService: Cleared previous save timeout for frame:', frameId);
      }
      
      // Check if already saving this frame
      if (this.isSaving.get(frameId)) {
        console.log('ComponentLibraryService: Save already in progress for frame:', frameId, '- queuing new save');
        
        // Queue the new save
        const timeoutId = setTimeout(() => {
          this.saveQueue.delete(frameId);
          this.executeSave(projectId, frameId, components);
        }, this.saveDebounceTime);
        
        this.saveQueue.set(frameId, timeoutId);
        return true;
      }
      
      // Execute immediate save
      return await this.executeSave(projectId, frameId, components);
      
    } catch (error) {
      console.error('ComponentLibraryService: Save failed:', error);
      this.isSaving.set(frameId, false);
      throw error;
    }
  }
  
  // NEW: Execute the actual save operation
   async executeSave(projectId, frameId, components) {
    try {
      this.isSaving.set(frameId, true);
      
      console.log('ComponentLibraryService: Executing save for frame:', frameId);
      
      const response = await axios.post('/api/project-components/bulk-update', {
        project_id: projectId,
        frame_id: frameId,
        components: components.map(comp => {
          // Get component definition for validation
          const componentDef = this.componentDefinitions.get(comp.type);
          
          return {
            component_instance_id: comp.id,
            component_type: comp.type,
            props: comp.props || {},
            position: comp.position,
            name: comp.name || componentDef?.name || comp.type,
            z_index: comp.zIndex || 0,
            variant: comp.variant || null,
            style: comp.style || {},
            animation: comp.animation || {}
          };
        }),
        create_revision: false // Don't create revisions for auto-saves
      });
      
      if (response.data.success) {
        console.log('ComponentLibraryService: Successfully saved', components.length, 'components to database');
        return true;
      } else {
        console.error('ComponentLibraryService: Backend save failed:', response.data.message);
        return false;
      }
      
    } catch (error) {
      console.error('ComponentLibraryService: Save execution failed:', error);
      throw error;
    } finally {
      this.isSaving.set(frameId, false);
      
      // Process any queued saves
      if (this.saveQueue.has(frameId)) {
        const timeoutId = this.saveQueue.get(frameId);
        console.log('ComponentLibraryService: Queued save will execute for frame:', frameId);
      }
    }
  }

  // Load project components from backend
  async loadProjectComponents(projectId, frameId) {
    try {
        console.log('ComponentLibraryService: Loading components for frame:', frameId);
        
        // Wait for any ongoing saves to complete to avoid conflicts
        if (this.isSaving.get(frameId)) {
            console.log('ComponentLibraryService: Waiting for save to complete before loading');
            await new Promise(resolve => {
                const checkSave = () => {
                    if (!this.isSaving.get(frameId)) {
                        resolve();
                    } else {
                        setTimeout(checkSave, 100);
                    }
                };
                checkSave();
            });
        }
        
        const response = await axios.get('/api/project-components', {
            params: { project_id: projectId, frame_id: frameId }
        });
        
        if (response.data.success) {
            const components = response.data.data;
            console.log('ComponentLibraryService: Loaded', components.length, 'components from backend');
            
            // Transform backend data to frontend format
            return components.map(comp => {
                // Get component definition for proper rendering
                const componentDef = this.componentDefinitions.get(comp.type);
                
                return {
                    id: comp.id,
                    type: comp.type,
                    props: {
                      ...componentDef?.default_props, // Apply component defaults first
                        ...comp.props                   // Then apply saved props
                    },
                    position: comp.position,
                    name: comp.name,
                    zIndex: comp.zIndex || 0,
                    variant: comp.variant,
                    style: comp.style || {},
                    animation: comp.animation || {}
                };
            });
        }
        
        return [];
    } catch (error) {
        console.error('ComponentLibraryService: Load failed:', error);
        return [];
    }
  }
    // NEW: Force save (for undo/redo operations)
  async forceSave(projectId, frameId, components, options = {}) {
    try {
      console.log('ComponentLibraryService: FORCE SAVE requested for frame:', frameId);
      
      // Mark as undo/redo operation to prevent auto-save conflicts
      this.undoRedoInProgress.set(frameId, true);
      
      // Clear any pending saves
      if (this.saveQueue.has(frameId)) {
        clearTimeout(this.saveQueue.get(frameId));
        this.saveQueue.delete(frameId);
      }
      
      // Wait for current save to complete if any
      if (this.isSaving.get(frameId)) {
        console.log('ComponentLibraryService: Waiting for current save to complete');
        await new Promise(resolve => {
          const checkSave = () => {
            if (!this.isSaving.get(frameId)) {
              resolve();
            } else {
              setTimeout(checkSave, 50);
            }
          };
          checkSave();
        });
      }
      
      // Execute immediate save
      const result = await this.executeSave(projectId, frameId, components);
      
      console.log('ComponentLibraryService: Force save completed for frame:', frameId);
      return result;
      
    } catch (error) {
      console.error('ComponentLibraryService: Force save failed:', error);
      throw error;
    } finally {
      // Clear undo/redo flag after a delay
      setTimeout(() => {
        this.undoRedoInProgress.set(frameId, false);
      }, 1000);
    }
  }
  
  isUndoRedoInProgress(frameId) {
    return this.undoRedoInProgress.get(frameId) || false;
  }
  
  clearSaveQueue(frameId) {
    if (this.saveQueue.has(frameId)) {
      clearTimeout(this.saveQueue.get(frameId));
      this.saveQueue.delete(frameId);
      console.log('ComponentLibraryService: Cleared save queue for frame:', frameId);
    }
    
    // Mark as undo/redo in progress to prevent auto-saves
    this.undoRedoInProgress.set(frameId, true);
    
    // Clear the flag after a delay
    setTimeout(() => {
      this.undoRedoInProgress.set(frameId, false);
    }, 2000);
  }

  // NEW: Check if frame has pending saves
  hasPendingSave(frameId) {
    return this.saveQueue.has(frameId) || 
           this.isSaving.get(frameId) || 
           this.isUndoRedoInProgress(frameId);
  }
  
  
    // Add these methods to ComponentLibraryService class
  
  // Enhanced component dropping with section validation
  validateComponentDrop(componentType, dropTarget, frameType) {
      const layoutElements = ['div', 'section', 'container', 'flex', 'grid'];
      const isLayoutElement = layoutElements.includes(componentType);
      
      if (frameType === 'page') {
          // For pages, enforce section-first rule
          if (dropTarget === 'canvas-root') {
              return {
                  allowed: isLayoutElement,
                  message: isLayoutElement 
                      ? null 
                      : 'Pages must start with Layout elements (Section, Container, etc.)'
              };
          }
          
          // Inside sections, allow any component
          if (dropTarget?.startsWith('section-') || dropTarget?.startsWith('container-')) {
              return { allowed: true, message: null };
          }
      }
      
      if (frameType === 'component') {
          // Components can start with any element
          return { allowed: true, message: null };
      }
      
      return { allowed: true, message: null };
  }
  
  // Create layout element with proper defaults
  createLayoutElement(elementType, props = {}) {
      const layoutDefaults = {
          section: {
              display: 'block',
              width: '100%',
              minHeight: '200px',
              padding: '48px 24px',
              backgroundColor: '#ffffff',
              margin: '0 0 32px 0'
          },
          container: {
              display: 'block',
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 24px'
          },
          flex: {
              display: 'flex',
              flexDirection: 'row',
              gap: '16px',
              alignItems: 'stretch'
          },
          grid: {
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px'
          },
          div: {
              display: 'block',
              minHeight: '50px',
              padding: '16px',
              border: '2px dashed #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb'
          }
      };
  
      return {
          id: `${elementType}_${Date.now()}`,
          type: elementType,
          props: {
              ...this.getComponentDefinition(elementType)?.default_props,
              ...props
          },
          position: { x: 0, y: 0 },
          name: this.getComponentDefinition(elementType)?.name || elementType,
          style: layoutDefaults[elementType] || {},
          animation: {},
          children: []
      };
  }
}

// Create singleton instance
export const componentLibraryService = new ComponentLibraryService();
export default componentLibraryService;