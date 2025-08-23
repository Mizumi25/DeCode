// @/Services/ComponentLibraryService.js
import axios from 'axios';
import React from 'react';

class ComponentLibraryService {
  constructor() {
    this.components = new Map();
    this.componentDefinitions = new Map();
  }

  // Load all components from the API
  async loadComponents() {
    try {
      const response = await axios.get('/api/components');
      if (response.data.success) {
        const componentsByCategory = response.data.data;
        
        // Process both elements and components
        Object.entries(componentsByCategory).forEach(([categoryType, letterGroups]) => {
          Object.entries(letterGroups).forEach(([letter, componentList]) => {
            if (Array.isArray(componentList)) {
              componentList.forEach(component => {
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

                const processedComponent = {
                  ...component,
                  variants: variants
                };

                this.componentDefinitions.set(component.type, processedComponent);
                this.components.set(component.type, this.createComponentRenderer(processedComponent));
              });
            }
          });
        });
        
        console.log('Components loaded:', this.components.size);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load components:', error);
      throw error;
    }
  }

  // Create a renderer function for a component
  createComponentRenderer(componentDef) {
    return {
      id: componentDef.type,
      name: componentDef.name,
      description: componentDef.description,
      icon: componentDef.icon,
      defaultProps: componentDef.default_props,
      propDefinitions: componentDef.prop_definitions,
      variants: componentDef.variants,
      
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
    const mergedProps = { ...componentDef.default_props, ...props };
    
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
        
        // Merge variant props with default props
        if (variantData.props) {
          Object.assign(mergedProps, variantData.props);
        }
      }
    }
    
    switch (componentDef.type) {
      case 'button':
        return this.renderButton(mergedProps, id);
      case 'input':
        return this.renderInput(mergedProps, id);
      case 'card':
        return this.renderCard(mergedProps, id);
      case 'avatar':
        return this.renderAvatar(mergedProps, id);
      case 'badge':
        return this.renderBadge(mergedProps, id);
      case 'searchbar':
        return this.renderSearchbar(mergedProps, id);
      default:
        return this.renderGeneric(mergedProps, id, componentDef);
    }
  }

  // Button renderer with enhanced variant support
  renderButton(props, id) {
    const className = this.getButtonClasses(props);
    
    return React.createElement('button', {
      key: id,
      className,
      onClick: () => console.log(`Button ${id} clicked`),
      disabled: props.disabled || false,
      style: props.style
    }, props.text || 'Button');
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

  // Badge renderer
  renderBadge(props, id) {
    const className = this.getBadgeClasses(props);
    
    return React.createElement('span', {
      key: id,
      className,
      style: props.style
    }, props.text || 'Badge');
  }

  // Input renderer
  renderInput(props, id) {
    const className = this.getInputClasses(props);
    
    return React.createElement('input', {
      key: id,
      type: props.type || 'text',
      placeholder: props.placeholder || '',
      className,
      disabled: props.disabled || false,
      required: props.required || false,
      style: props.style
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
  renderCard(props, id) {
    const cardClassName = this.getCardClasses(props);
    
    return React.createElement('div', {
      key: id,
      className: cardClassName,
      style: props.style
    }, [
      props.title && React.createElement('h3', {
        key: `${id}-title`,
        className: 'font-semibold text-lg mb-2 text-gray-900'
      }, props.title),
      React.createElement('div', {
        key: `${id}-content`,
        className: 'text-gray-600'
      }, props.content || 'Card content')
    ]);
  }

  // Generic renderer for any component type
  renderGeneric(props, id, componentDef) {
    return React.createElement('div', {
      key: id,
      className: 'p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center',
      title: `${componentDef.name} component`,
      style: props.style
    }, [
      React.createElement('div', {
        key: `${id}-name`,
        className: 'font-semibold text-gray-700'
      }, componentDef.name),
      React.createElement('div', {
        key: `${id}-type`,
        className: 'text-xs text-gray-500 mt-1'
      }, `(${componentDef.type})`)
    ]);
  }

  // Enhanced class generators with variant support

  // Get Tailwind classes for button with variant support
  getButtonClasses(props) {
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
    
    const variant = props.variant || 'primary';
    const size = props.size || 'md';
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
  }

  // Get avatar classes with variant support
  getAvatarClasses(props) {
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
    
    const variant = props.variant || 'default';
    const size = props.size || 'md';
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
  }

  // Get badge classes with variant support
  getBadgeClasses(props) {
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
    
    const variant = props.variant || 'default';
    const size = props.size || 'md';
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
  }

  // Get Tailwind classes for input with variant support
  getInputClasses(props) {
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
    
    const variant = props.variant || 'default';
    const size = props.size || 'md';
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
  }

  // Get searchbar classes with variant support
  getSearchbarClasses(props) {
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
    
    const variant = props.variant || 'default';
    const size = props.size || 'md';
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
  }

  // Get Tailwind classes for card with variant support
  getCardClasses(props) {
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
    
    const variant = props.variant || 'default';
    const padding = props.padding || 'md';
    const shadow = (props.shadow && variant !== 'elevated') ? 'shadow-sm' : '';
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${paddingClasses[padding] || paddingClasses.md} ${shadow} ${props.className || ''}`;
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
      const response = await axios.post('/api/project-components/bulk-update', {
        project_id: projectId,
        frame_id: frameId,
        components: components.map(comp => ({
          component_instance_id: comp.id,
          component_type: comp.type,
          props: comp.props,
          position: comp.position,
          name: comp.name,
          z_index: comp.zIndex || 0,
          variant: comp.variant || null
        }))
      });
      
      return response.data.success;
    } catch (error) {
      console.error('Failed to save project components:', error);
      throw error;
    }
  }

  // Load project components from backend
  async loadProjectComponents(projectId, frameId) {
    try {
      const response = await axios.get('/api/project-components', {
        params: { project_id: projectId, frame_id: frameId }
      });
      
      if (response.data.success) {
        return response.data.data.map(comp => ({
          id: comp.component_instance_id,
          type: comp.component_type,
          props: comp.props,
          position: comp.position,
          name: comp.name,
          zIndex: comp.z_index,
          variant: comp.variant
        }));
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