// @/Components/Forge/ComponentLibrary.js
import React from 'react';
import { Square } from 'lucide-react';

// Helper function to get Tailwind classes for button
const getButtonTailwindClasses = (props) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-50 focus:ring-gray-500 shadow-sm hover:shadow-md",
    success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500 shadow-lg hover:shadow-xl",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 focus:ring-amber-500 shadow-lg hover:shadow-xl",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500 shadow-lg hover:shadow-xl",
    ghost: "bg-transparent text-purple-600 hover:bg-purple-50 focus:ring-purple-500 border border-transparent hover:border-purple-200"
  }
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-4 text-lg"
  }
  
  return `${baseClasses} ${variantClasses[props.variant] || variantClasses.primary} ${sizeClasses[props.size] || sizeClasses.md} ${props.className || ''}`
}

// Enhanced component library with multiple code generation styles
export const componentLibrary = {
  button: {
    id: 'button',
    name: 'Button',
    description: 'Interactive button component',
    icon: Square,
    defaultProps: {
      text: 'Click me',
      variant: 'primary',
      size: 'md',
      className: ''
    },
    render: (props, id) => (
      <button
        key={id}
        className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          props.variant === 'primary' 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500 shadow-lg hover:shadow-xl'
            : props.variant === 'secondary'
            ? 'bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-50 focus:ring-gray-500 shadow-sm hover:shadow-md'
            : props.variant === 'success'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500 shadow-lg hover:shadow-xl'
            : props.variant === 'warning'
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 focus:ring-amber-500 shadow-lg hover:shadow-xl'
            : props.variant === 'danger'
            ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500 shadow-lg hover:shadow-xl'
            : 'bg-transparent text-purple-600 hover:bg-purple-50 focus:ring-purple-500 border border-transparent hover:border-purple-200'
        } ${
          props.size === 'sm' ? 'px-3 py-1.5 text-sm' :
          props.size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-2.5 text-base'
        } ${props.className}`}
      >
        {props.text}
      </button>
    ),
    generateCode: (props, allComponents, style) => {
      const generateReactTailwind = () => {
        const reactComponents = allComponents.map(comp => {
          return `        <div style={{ position: 'absolute', left: '${comp.position.x}px', top: '${comp.position.y}px' }}>
          <button className="${getButtonTailwindClasses(comp.props)}">
            ${comp.props.text}
          </button>
        </div>`
        }).join('\n')

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
          tailwind: allComponents.map(comp => getButtonTailwindClasses(comp.props)).join('\n\n// Next component:\n')
        }
      }

      const generateReactCSS = () => {
        const reactComponents = allComponents.map(comp => {
          return `        <div style={{ position: 'absolute', left: '${comp.position.x}px', top: '${comp.position.y}px' }}>
          <button className="btn btn-${comp.props.variant} btn-${comp.props.size}">
            ${comp.props.text}
          </button>
        </div>`
        }).join('\n')

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
          css: `.canvas-container {
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
}`
        }
      }

      const generateHTMLCSS = () => {
        const htmlComponents = allComponents.map(comp => {
          return `    <div style="position: absolute; left: ${comp.position.x}px; top: ${comp.position.y}px;">
      <button class="btn btn-${comp.props.variant} btn-${comp.props.size}">${comp.props.text}</button>
    </div>`
        }).join('\n')

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
          css: `.canvas-container {
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
}`
        }
      }

      const generateHTMLTailwind = () => {
        const htmlComponents = allComponents.map(comp => {
          return `    <div style="position: absolute; left: ${comp.position.x}px; top: ${comp.position.y}px;">
      <button class="${getButtonTailwindClasses(comp.props)}">${comp.props.text}</button>
    </div>`
        }).join('\n')

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
          tailwind: `/* Tailwind CSS Classes Used */
${allComponents.map(comp => `
/* ${comp.props.text} Button */
${getButtonTailwindClasses(comp.props)}
`).join('\n')}`
        }
      }

      switch (style) {
        case 'react-tailwind':
          return generateReactTailwind()
        case 'react-css':
          return generateReactCSS()
        case 'html-css':
          return generateHTMLCSS()
        case 'html-tailwind':
          return generateHTMLTailwind()
        default:
          return generateReactTailwind()
      }
    }
  }
}