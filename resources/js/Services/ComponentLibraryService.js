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
        
        // Flatten and store components
        Object.values(componentsByCategory).flat().forEach(component => {
          this.componentDefinitions.set(component.type, component);
          this.components.set(component.type, this.createComponentRenderer(component));
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

  // Dynamic component renderer
  renderComponent(componentDef, props, id) {
    const mergedProps = { ...componentDef.default_props, ...props };
    
    switch (componentDef.type) {
      case 'button':
        return this.renderButton(mergedProps, id);
      case 'input':
        return this.renderInput(mergedProps, id);
      case 'card':
        return this.renderCard(mergedProps, id);
      default:
        return this.renderGeneric(mergedProps, id, componentDef);
    }
  }

  // Button renderer
  renderButton(props, id) {
    const className = this.getButtonClasses(props);
    
    return React.createElement('button', {
      key: id,
      className,
      onClick: () => console.log(`Button ${id} clicked`),
      disabled: props.disabled || false
    }, props.text || 'Button');
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
      required: props.required || false
    });
  }

  // Card renderer
  renderCard(props, id) {
    const cardClassName = this.getCardClasses(props);
    
    return React.createElement('div', {
      key: id,
      className: cardClassName
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
      title: `${componentDef.name} component`
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

  // Get Tailwind classes for button
  getButtonClasses(props) {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantClasses = {
      primary: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500 shadow-lg hover:shadow-xl",
      secondary: "bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-50 focus:ring-gray-500 shadow-sm hover:shadow-md",
      success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500 shadow-lg hover:shadow-xl",
      warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 focus:ring-amber-500 shadow-lg hover:shadow-xl",
      danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500 shadow-lg hover:shadow-xl",
      ghost: "bg-transparent text-purple-600 hover:bg-purple-50 focus:ring-purple-500 border border-transparent hover:border-purple-200"
    };
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-4 text-lg"
    };
    
    return `${baseClasses} ${variantClasses[props.variant] || variantClasses.primary} ${sizeClasses[props.size] || sizeClasses.md} ${props.className || ''}`;
  }

  // Get Tailwind classes for input
  getInputClasses(props) {
    const baseClasses = "block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";
    
    const variantClasses = {
      default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      error: "border-red-300 focus:border-red-500 focus:ring-red-500",
      success: "border-green-300 focus:border-green-500 focus:ring-green-500"
    };
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-5 py-3 text-lg"
    };
    
    return `${baseClasses} ${variantClasses[props.variant] || variantClasses.default} ${sizeClasses[props.size] || sizeClasses.md}`;
  }

  // Get Tailwind classes for card
  getCardClasses(props) {
    const baseClasses = "rounded-lg border bg-white";
    
    const variantClasses = {
      default: "border-gray-200",
      outlined: "border-gray-300 bg-transparent",
      elevated: "border-transparent shadow-lg"
    };
    
    const paddingClasses = {
      sm: "p-3",
      md: "p-4",
      lg: "p-6"
    };
    
    const shadowClass = props.shadow && props.variant !== 'elevated' ? 'shadow-sm' : '';
    
    return `${baseClasses} ${variantClasses[props.variant] || variantClasses.default} ${paddingClasses[props.padding] || paddingClasses.md} ${shadowClass}`;
  }

  // Generate code for components
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

  // Client-side code generation
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

  generateComponentJSX(comp, classes) {
    const componentDef = this.componentDefinitions.get(comp.type);
    if (!componentDef) return `<div className="${classes}">${comp.name || comp.type}</div>`;

    switch (comp.type) {
      case 'button':
        return `<button className="${classes}" ${comp.props.disabled ? 'disabled' : ''}>${comp.props.text || 'Button'}</button>`;
      case 'input':
        return `<input type="${comp.props.type || 'text'}" placeholder="${comp.props.placeholder || ''}" className="${classes}" ${comp.props.required ? 'required' : ''} ${comp.props.disabled ? 'disabled' : ''} />`;
      case 'card':
        return `<div className="${classes}">
            ${comp.props.title ? `<h3 className="font-semibold text-lg mb-2 text-gray-900">${comp.props.title}</h3>` : ''}
            <div className="text-gray-600">${comp.props.content || 'Card content'}</div>
          </div>`;
      default:
        return `<div className="${classes}">${comp.name || componentDef.name}</div>`;
    }
  }

  generateComponentHTML(comp, classes) {
    const componentDef = this.componentDefinitions.get(comp.type);
    if (!componentDef) return `<div class="${classes}">${comp.name || comp.type}</div>`;

    switch (comp.type) {
      case 'button':
        return `<button class="${classes}" ${comp.props.disabled ? 'disabled' : ''}>${comp.props.text || 'Button'}</button>`;
      case 'input':
        return `<input type="${comp.props.type || 'text'}" placeholder="${comp.props.placeholder || ''}" class="${classes}" ${comp.props.required ? 'required' : ''} ${comp.props.disabled ? 'disabled' : ''} />`;
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

/* Input styles */
.input {
  display: block;
  width: 100%;
  padding: 10px 12px;
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
}`;
  }

  getComponentClasses(comp) {
    switch (comp.type) {
      case 'button':
        return this.getButtonClasses(comp.props);
      case 'input':
        return this.getInputClasses(comp.props);
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
          z_index: comp.zIndex || 0
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
          zIndex: comp.z_index
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