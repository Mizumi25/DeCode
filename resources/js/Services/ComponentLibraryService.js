// @/Services/ComponentLibraryService.js
import axios from 'axios';
import React from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 COMPLETE DOM-LIKE UNIFIED RENDERING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ALL valid HTML5 elements mapped to themselves
 * This makes the system truly universal - supports ANY HTML element
 */
const ALL_HTML_ELEMENTS = [
  // Document structure
  'html', 'head', 'body', 'title', 'meta', 'link', 'style', 'script',
  
  // Sections
  'header', 'nav', 'main', 'section', 'article', 'aside', 'footer',
  
  // Content grouping
  'div', 'span', 'p', 'pre', 'blockquote', 'hr', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  
  // Text semantics
  'a', 'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup', 'code', 'kbd', 'samp', 'var', 'time', 'abbr', 'dfn', 'cite', 'q',
  
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  
  // Forms
  'form', 'input', 'textarea', 'button', 'select', 'option', 'optgroup', 'label', 'fieldset', 'legend', 'datalist', 'output', 'progress', 'meter',
  
  // Interactive
  'details', 'summary', 'dialog',
  
  // Embedded content
  'img', 'iframe', 'embed', 'object', 'param', 'video', 'audio', 'source', 'track', 'canvas', 'svg', 'math',
  
  // Tables
  'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'col', 'colgroup',
  
  // Other
  'figure', 'figcaption', 'picture', 'template', 'slot'
];

/**
 * Create self-mapping for ALL HTML elements
 * e.g., 'button' -> 'button', 'div' -> 'div', etc.
 */
const HTML_TAG_MAP = Object.fromEntries(
  ALL_HTML_ELEMENTS.map(tag => [tag, tag])
);

/**
 * Add custom component type mappings
 * These are your database component types that map to HTML elements
 */
Object.assign(HTML_TAG_MAP, {
  // Custom type aliases for elements
  'text-node': 'span',
  'link': 'a',
  'image': 'img',
  'gif': 'img',
  'checkbox': 'input',
  'radio': 'input',
  'toggle': 'input',
  'file-input': 'input',
  'range': 'input',
  
  // Layout aliases
  'container': 'div',
  'flex': 'div',
  'grid': 'div',
  
  // Complex components (wrapper divs - children defined in DB)
  'card': 'div',
  'badge': 'span',
  'avatar': 'div',
  'navbar': 'nav',
  'navbar-component': 'nav',
  'searchbar': 'div',
  'hero': 'section',
  'accordion': 'div',
  'tabs': 'div',
  'modal': 'div',
  'tooltip': 'div',
  'dropdown': 'div',
  'carousel': 'div',
  'sidebar': 'aside',
  'footer-component': 'footer',
  'cta': 'section',
  
  // Special
  'icon': 'span',
  'frame-component-instance': 'div'
});

/**
 * Maps component props to HTML attributes
 */
const PROP_TO_ATTR_MAP = {
  // Form attributes
  'placeholder': 'placeholder',
  'disabled': 'disabled',
  'value': 'value',
  'defaultValue': 'defaultValue',
  'checked': 'checked',
  'defaultChecked': 'defaultChecked',
  'type': 'type',
  'name': 'name',
  'id': 'id',
  'required': 'required',
  'readonly': 'readOnly',
  'min': 'min',
  'max': 'max',
  'step': 'step',
  'pattern': 'pattern',
  'accept': 'accept',
  'multiple': 'multiple',
  
  // Link/Media attributes
  'href': 'href',
  'target': 'target',
  'src': 'src',
  'alt': 'alt',
  'title': 'title',
  'autoplay': 'autoplay',
  'loop': 'loop',
  'controls': 'controls',
  'muted': 'muted',
  'poster': 'poster',
  
  // Accessibility
  'aria-label': 'aria-label',
  'aria-labelledby': 'aria-labelledby',
  'aria-describedby': 'aria-describedby',
  'role': 'role',
  'tabindex': 'tabIndex'
};

class ComponentLibraryService {
  constructor() {
    this.components = new Map();
    this.componentDefinitions = new Map();
    
    // 🔥 Register frame-component-instance renderer
    this.registerFrameComponentInstance();
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 UNIFIED RENDERING METHODS - Replace 30+ specialized methods
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * 🔥 COMPLETE UNIFIED RENDERER - Handles EVERYTHING like a DOM
   * - Single HTML elements (button, input, div, etc.)
   * - Complex components (card, navbar, hero, etc.)
   * - ALL HTML5 elements
   * - Nested children (rendered React elements passed in)
   * 
   * This ONE method replaces 30+ specialized render methods
   */
  renderUnified(component, id, renderedChildren = null) {
    // 🔥 SPECIAL: Handle frame-component-instance (linked components)
    if (component.type === 'frame-component-instance' || component.component_type === 'frame-component-instance') {
      const projectComponents = component.props?.projectComponents || [];
      
      if (projectComponents.length === 0) {
        // Empty linked component - show placeholder
        return React.createElement('div', {
          key: id,
          'data-component-id': id,
          className: 'linked-component-empty',
          style: {
            padding: '20px',
            border: '2px dashed var(--color-border)',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            ...component.style
          }
        }, `📦 ${component.props?.sourceFrameName || 'Linked Component'} (Empty)`);
      }
      
      // Render the actual project components from the linked frame
      // Build tree structure from flat array
      const buildTree = (comps) => {
        const map = new Map();
        const roots = [];
        
        comps.forEach(c => map.set(c.id, { ...c, children: [] }));
        comps.forEach(c => {
          const node = map.get(c.id);
          if (c.parent_id && map.has(c.parent_id)) {
            map.get(c.parent_id).children.push(node);
          } else {
            roots.push(node);
          }
        });
        
        return roots;
      };
      
      const tree = buildTree(projectComponents);
      
      // Recursively render each component in the tree
      const renderTree = (comps, isRoot = true) => {
        return comps.map(comp => {
          let compStyle = typeof comp.style === 'string' ? JSON.parse(comp.style) : (comp.style || {});
          
          // 🔥 FIX: Reset absolute positioning for root-level components
          // Make them flow naturally in the parent container like normal DOM
          if (isRoot) {
            const { position, left, top, ...restStyle } = compStyle;
            compStyle = {
              ...restStyle,
              position: 'relative', // Change from absolute to relative
              // Remove left/top so it flows naturally
            };
          }
          
          const childComp = {
            id: comp.id,
            type: comp.component_type || comp.type,
            props: comp.props || {},
            style: compStyle,
            children: comp.children || []
          };
          
          const renderedChildren = comp.children?.length > 0 ? renderTree(comp.children, false) : null;
          return this.renderUnified(childComp, comp.id, renderedChildren);
        });
      };
      
      const children = renderTree(tree, true); // Pass isRoot=true for top-level
      
      // Wrap in container with linked component styles
      return React.createElement('div', {
        key: id,
        'data-component-id': id,
        'data-linked-component': true,
        className: 'linked-component-wrapper',
        style: {
          ...component.style,
          display: 'block', // Ensure block layout for children to flow
          position: 'relative' // Relative positioning so children flow inside
        }
      }, children);
    }
    
    // 1. Get component definition from database
    const componentDef = this.componentDefinitions.get(component.type);
    
    // 2. Check if this is a complex component with internal structure
    const isComplexComponent = componentDef?.component_type === 'component';
    
    // 3. Get HTML tag for this component type
    const htmlTag = this.getHTMLTag(component.type);
    
    // 4. Merge props with correct priority (defaults < variant < instance)
    const mergedProps = this.mergeComponentProps(component, componentDef);
    
    // 5. Build HTML attributes from props
    const htmlAttrs = this.getHTMLAttributes(mergedProps, id, component.type, componentDef);
    
    // 6. Get children content
    // Priority: renderedChildren (passed from CanvasComponent) > text content > null
    let children;
    if (renderedChildren) {
      // Use rendered React children passed from CanvasComponent
      children = renderedChildren;
    } else {
      // Fall back to text content from props
      children = this.getElementChildren(mergedProps, component.children);
    }
    
    // 7. Create React element - ONE universal pattern for ALL
    return React.createElement(htmlTag, htmlAttrs, children);
  }
  
  /**
   * Get HTML tag for component type
   * @param {string} type - Component type (button, input, card, navbar, hero, etc.)
   * @returns {string} HTML tag name
   * 
   * Supports ALL HTML5 elements + custom component types
   */
  getHTMLTag(type) {
    // Check if it's a known type (HTML element or custom component)
    if (HTML_TAG_MAP[type]) {
      return HTML_TAG_MAP[type];
    }
    
    // Unknown type - default to div (safest wrapper)
    console.warn(`Unknown component type: ${type}, defaulting to 'div'`);
    return 'div';
  }
  
  /**
   * Check if element type can accept children (like real DOM)
   * 🔥 Only self-closing elements can't have children
   */
  canAcceptChildren(type) {
    const selfClosingTypes = ['input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
    return !selfClosingTypes.includes(type);
  }
  
  /**
   * Merge component props with correct priority:
   * default_props (lowest) < variant.props < component.props < component.style (highest)
   */
  mergeComponentProps(component, componentDef) {
    const defaultProps = componentDef?.default_props || {};
    const instanceProps = component.props || {};
    const instanceStyle = component.style || {};
    
    // Merge all props
    let mergedProps = {
      ...defaultProps,
      ...instanceProps
    };
    
    // Build final styles with correct priority
    let finalStyle = {
      ...(defaultProps.style || {}),
      ...(instanceProps.style || {}),
      ...instanceStyle  // Instance style ALWAYS wins
    };
    
    mergedProps.style = finalStyle;
    
    return mergedProps;
  }
  
  /**
   * Convert component props to HTML attributes
   * Handles both simple elements and complex components
   */
  getHTMLAttributes(props, id, type, componentDef) {
    const attrs = {
      key: id,
      // 🔥 Add data attribute for SelectionOverlay to find the actual rendered component
      // But use different attribute name than wrapper to avoid drop detection confusion
      'data-component-element': id,
      'data-element-type': type,
      style: {
        ...(props.style || {}),
        // 🔥 REMOVED: Don't set pointer-events: none - it blocks children interaction!
        // Wrapper has pointer-events: auto and will capture events
      }
    };
    
    // Handle special input types (checkbox, radio, toggle, range, file-input)
    if (['checkbox', 'radio', 'toggle'].includes(type)) {
      attrs.type = type === 'toggle' ? 'checkbox' : type;
    } else if (type === 'range') {
      attrs.type = 'range';
    } else if (type === 'file-input') {
      attrs.type = 'file';
    }
    
    // Map props to HTML attributes
    Object.keys(props).forEach(propKey => {
      // Skip special props that aren't HTML attributes
      if ([
        'style', 
        'text', 
        'content', 
        'children', 
        'variant', 
        'isLayoutContainer',
        // Complex component props (these are for logic, not HTML)
        'title',
        'subtitle',
        'description',
        'logoText',
        'navLinks',
        'ctaText',
        'brandName',
        'items',
        'showDots',
        'showArrows',
        'position',
        'padding',
        'size'
      ].includes(propKey)) {
        return;
      }
      
      // Map to HTML attribute
      const attrKey = PROP_TO_ATTR_MAP[propKey] || propKey;
      const value = props[propKey];
      
      // Handle boolean attributes
      if (typeof value === 'boolean') {
        if (value) attrs[attrKey] = true;
      } else if (value !== null && value !== undefined) {
        attrs[attrKey] = value;
      }
    });
    
    // Add className if exists
    if (props.className) {
      attrs.className = props.className;
    }
    
    // Generate className for complex components (card, badge, navbar, hero, etc.)
    if (!attrs.className) {
      attrs.className = this.getComponentClassName(type, props, componentDef);
    }
    
    return attrs;
  }
  
  /**
   * Get className for component based on type and props
   * Handles both simple elements and complex components dynamically
   */
  getComponentClassName(type, props, componentDef) {
    const classNames = [];
    
    // 🔥 FIXED: Base classes WITHOUT hardcoded display/positioning
    // Let the component's style.display handle display, not Tailwind classes
    const typeClasses = {
      // Simple elements - NO display classes (use style.display instead)
      'button': '',  // No hardcoded classes - respect component.style
      'input': 'border border-gray-300 rounded px-3 py-2',
      'textarea': 'border border-gray-300 rounded px-3 py-2',
      'select': 'border border-gray-300 rounded px-3 py-2',
      
      // Layout elements - NO display classes (use style.display instead)
      'container': 'max-w-7xl mx-auto px-4',
      'flex': '',  // Display comes from style.display: 'flex'
      'grid': '',  // Display comes from style.display: 'grid'
      'section': '',  // Width comes from style.width
      
      // Complex components (minimal base - variants add more)
      'card': 'rounded-lg shadow-md border border-gray-200 p-4 bg-white',
      'badge': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      'avatar': 'rounded-full flex items-center justify-center overflow-hidden',
      'navbar': 'flex items-center justify-between p-4 bg-white border-b border-gray-200',
      'searchbar': 'flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white',
      'hero': 'min-h-screen flex items-center justify-center',
      'accordion': 'border border-gray-200 rounded-lg',
      'modal': 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50',
      'tooltip': 'absolute z-50 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg',
      'dropdown': 'absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg',
      'carousel': 'relative overflow-hidden',
      'tabs': 'border-b border-gray-200',
      'sidebar': 'w-64 h-screen bg-white border-r border-gray-200',
      'footer-component': 'w-full bg-gray-100 border-t border-gray-200 p-8',
      'cta': 'w-full py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white'
    };
    
    // Add base classes
    if (typeClasses[type]) {
      classNames.push(typeClasses[type]);
    }
    
    // Add variant-specific classes
    if (props.variant) {
      const variantClass = this.getVariantClassName(type, props.variant);
      if (variantClass) {
        classNames.push(variantClass);
      }
    }
    
    // Add padding classes (for complex components)
    if (props.padding) {
      const paddingMap = {
        'sm': 'p-2',
        'md': 'p-4',
        'lg': 'p-6',
        'xl': 'p-8'
      };
      if (paddingMap[props.padding]) {
        classNames.push(paddingMap[props.padding]);
      }
    }
    
    // Add size classes (for badges, buttons, etc.)
    if (props.size) {
      const sizeMap = {
        'sm': 'text-sm',
        'md': 'text-base',
        'lg': 'text-lg'
      };
      if (sizeMap[props.size]) {
        classNames.push(sizeMap[props.size]);
      }
    }
    
    return classNames.join(' ');
  }
  
  /**
   * Get variant-specific className
   */
  getVariantClassName(type, variant) {
    const variantMap = {
      // Badge variants
      'badge': {
        'default': 'bg-gray-100 text-gray-800',
        'primary': 'bg-blue-100 text-blue-800',
        'success': 'bg-green-100 text-green-800',
        'warning': 'bg-yellow-100 text-yellow-800',
        'danger': 'bg-red-100 text-red-800',
        'gradient': 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
      },
      // Button variants
      'button': {
        'primary': 'bg-blue-600 text-white hover:bg-blue-700',
        'secondary': 'bg-gray-600 text-white hover:bg-gray-700',
        'outline': 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
        'ghost': 'hover:bg-gray-100'
      },
      // Card variants
      'card': {
        'elevated': 'shadow-2xl',
        'outlined': 'border-2',
        'glass': 'bg-white/10 backdrop-blur-2xl border border-white/20',
        'gradient': 'bg-gradient-to-br from-purple-100 to-blue-100'
      },
      // Navbar variants
      'navbar': {
        'solid': 'bg-white border-b',
        'transparent': 'bg-transparent',
        'glass': 'bg-white/10 backdrop-blur-2xl border-b border-white/20'
      },
      // Hero variants
      'hero': {
        'centered': 'text-center',
        'split': 'grid md:grid-cols-2',
        'gradient': 'bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white'
      }
    };
    
    return variantMap[type]?.[variant] || '';
  }
  
  /**
   * Get element children (text content, options, or null for nested components)
   * Nested component children are handled by CanvasComponent recursively
   */
  getElementChildren(props, childrenArray) {
    // Text content takes priority
    if (props.text) return props.text;
    if (props.content) return props.content;
    if (props.children && typeof props.children === 'string') return props.children;
    
    // For select elements, render options
    if (props.options && Array.isArray(props.options)) {
      return props.options.map((opt, idx) => 
        React.createElement('option', { key: idx, value: opt.value || opt }, opt.label || opt)
      );
    }
    
    // For complex components with title/subtitle/description props, render them inline
    // (This is for components that don't have children array but have content props)
    if (props.title || props.subtitle || props.description) {
      const contentElements = [];
      
      if (props.title) {
        contentElements.push(
          React.createElement('div', { key: 'title', className: 'font-bold text-lg mb-2' }, props.title)
        );
      }
      
      if (props.subtitle) {
        contentElements.push(
          React.createElement('div', { key: 'subtitle', className: 'text-sm text-gray-600 mb-2' }, props.subtitle)
        );
      }
      
      if (props.description) {
        contentElements.push(
          React.createElement('p', { key: 'description', className: 'text-gray-700' }, props.description)
        );
      }
      
      // Only return if there are no children array (children take priority)
      if (!childrenArray || childrenArray.length === 0) {
        return contentElements.length > 0 ? contentElements : null;
      }
    }
    
    // For components with nested children array, return null
    // CanvasComponent will handle recursive rendering of children
    return null;
  }

  // 🔥 Register frame component instance as a special component type
  registerFrameComponentInstance() {
    const frameComponentDef = {
      type: 'frame-component-instance',
      name: 'Frame Component Instance',
      description: 'Instance of a linked frame component',
      default_props: {},
      variants: []
    };
    
    this.componentDefinitions.set('frame-component-instance', frameComponentDef);
    this.components.set('frame-component-instance', {
      id: 'frame-component-instance',
      name: 'Frame Component Instance',
      description: 'Instance of a linked frame component',
      render: (props, id) => {
        // Use unified renderer for frame component instances
        const component = {
          id,
          type: 'frame-component-instance',
          props,
          style: props.style || {},
          children: props.children || []
        };
        return this.renderUnified(component, id);
      },
      generateCode: (props) => `<!-- Frame Component Instance: ${props.sourceFrameName || 'Unknown'} -->`
    });
  }

  // Load all components from the API
    // REPLACE the loadComponents method in ComponentLibraryService.js (around line 50)
  
  
  
  
  
  
  async loadComponents() {
      try {
          
          
          const response = await axios.get('/api/components');
          if (response.data.success) {
              const componentsByCategory = response.data.data;
              
              
              let totalLoaded = 0;
              
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
  
                              
  
                              this.componentDefinitions.set(component.type, processedComponent);
                              this.components.set(component.type, this.createComponentRenderer(processedComponent));
                              totalLoaded++;
                          });
                      }
                  });
              });
              
              
              
              // Debug specific components
              ['button', 'card', 'badge', 'input'].forEach(type => {
                  const def = this.componentDefinitions.get(type);
                  if (def) {
                      
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
  
  
  
  
  

calculateResponsiveStyles(component, responsiveMode, canvasDimensions, parentStyles = {}) {
  // 🔥 NEW: Merge base styles with responsive overrides
  const baseStyles = { ...component.style };
  const responsiveOverrides = component[`style_${responsiveMode}`] || {};
  const mergedStyles = { ...baseStyles, ...responsiveOverrides };
  
  console.log(`🎨 calculateResponsiveStyles for ${component.type} in ${responsiveMode}:`, {
    baseStyles,
    responsiveOverrides,
    mergedStyles,
    hasOverrides: Object.keys(responsiveOverrides).length > 0
  });
  
  const isLayoutContainer = component.isLayoutContainer || 
                            ['section', 'container', 'div', 'flex', 'grid'].includes(component.type);
  
  // 🔥 UPDATED: Start with merged styles (base + responsive overrides)
  const responsiveStyles = { ...mergedStyles };
  
  // 🔥 ACTUAL RESPONSIVE TRANSFORMATIONS based on device mode
  if (responsiveMode === 'mobile') {
    // Mobile-specific adjustments
 if (['button', 'input', 'select', 'textarea'].includes(component.type)) {
  if (!responsiveStyles.minHeight) responsiveStyles.minHeight = '44px';
  if (!responsiveStyles.minWidth) responsiveStyles.minWidth = '44px';
  if (component.type === 'button' && !responsiveStyles.fontSize) {
    responsiveStyles.fontSize = '16px';
  }
  
  // 🔥 FIX: Ensure buttons don't overflow in mobile
  if (component.type === 'button') {
    // Scale down horizontal padding in mobile
    if (responsiveStyles.padding) {
      const [vertical, horizontal] = responsiveStyles.padding.split(' ');
      if (horizontal) {
        responsiveStyles.padding = `${vertical} ${Math.max(16, parseFloat(horizontal) * 0.7)}px`;
      }
    }
    // Ensure flex-shrink so buttons can compress
    if (!responsiveStyles.flexShrink) responsiveStyles.flexShrink = 1;
    if (!responsiveStyles.minWidth) responsiveStyles.minWidth = '80px';
    if (!responsiveStyles.maxWidth) responsiveStyles.maxWidth = '160px';
  }
}
    
    // Scale down font sizes for mobile (if not explicitly set)
    if (!responsiveStyles.fontSize && baseStyles.fontSize) {
      const fontSize = parseFloat(baseStyles.fontSize);
      if (!isNaN(fontSize)) {
        responsiveStyles.fontSize = `${Math.max(12, fontSize * 0.9)}px`;
      }
    }
    
    // Scale down padding/margins for mobile
    ['padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
     'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'].forEach(prop => {
      if (baseStyles[prop] && !responsiveStyles[prop]) {
        const value = baseStyles[prop];
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          responsiveStyles[prop] = `${Math.max(4, numValue * 0.8)}px`;
        }
      }
    });
    
    // Layout adjustments for mobile
    if (isLayoutContainer) {
      if (responsiveStyles.flexDirection === 'row') {
        responsiveStyles.flexDirection = 'column';
      }
      if (!responsiveStyles.width || responsiveStyles.width === 'auto') {
        responsiveStyles.width = '100%';
      }
    }
  } else if (responsiveMode === 'tablet') {
    // Tablet-specific adjustments (slight scaling)
    if (!responsiveStyles.fontSize && baseStyles.fontSize) {
      const fontSize = parseFloat(baseStyles.fontSize);
      if (!isNaN(fontSize)) {
        responsiveStyles.fontSize = `${fontSize * 0.95}px`;
      }
    }
    
    // Slightly reduce spacing for tablet
    ['padding', 'margin'].forEach(prop => {
      if (baseStyles[prop] && !responsiveStyles[prop]) {
        const value = baseStyles[prop];
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          responsiveStyles[prop] = `${numValue * 0.9}px`;
        }
      }
    });
  }
  // Desktop: no changes, use original styles
  
  // 🔥 Store responsive mode for debugging
  responsiveStyles._responsiveMode = responsiveMode;
  
  return responsiveStyles;
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

  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  
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

  

  return layoutElement;
}


    // ALSO fix the createComponentRenderer method to ensure proper defaults:
  createComponentRenderer(componentDef) {
      
      
      return {
          id: componentDef.type,
          name: componentDef.name,
          description: componentDef.description,
          icon: componentDef.icon,
          defaultProps: componentDef.default_props || {}, // Ensure this exists
          propDefinitions: componentDef.prop_definitions,
          variants: componentDef.variants || [],
          
          // 🔥 NEW: Unified render function (backwards compatible)
          renderUnified: (component, id) => {
              return this.renderUnified(component, id);
          },
          
          // OLD: Dynamic render function (kept for backwards compatibility)
          render: (props, id) => {
              return this.renderComponent(componentDef, props, id);
          },
  
          // Generate code function
          generateCode: (props, allComponents, style) => {
              return this.generateComponentCode(componentDef, props, allComponents, style);
          }
      };
  }

    /**
     * 🔥 REPLACED: Old renderComponent now uses unified renderer
     * This is kept for backwards compatibility with old code
     */
    renderComponent(componentDef, props, id) {
        // Get the component definition if not passed
        if (!componentDef && this.componentDefinitions.has(props.type || props.component_type)) {
            componentDef = this.componentDefinitions.get(props.type || props.component_type);
        }
        
        if (!componentDef) {
            console.warn('No component definition found for:', props.type || props.component_type);
            // Fallback: create minimal component object
            const fallbackComponent = {
                id: id,
                type: props.type || props.component_type || 'div',
                props: props,
                style: props.style || {},
                children: props.children || []
            };
            return this.renderUnified(fallbackComponent, id);
        }
        
        // Build component object for unified renderer
        const component = {
            id: id,
            type: componentDef.type,
            props: props,
            style: props.style || {},
            children: props.children || []
        };
        
        // 🔥 Use unified renderer for ALL components
        return this.renderUnified(component, id);
    }

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 CODE GENERATION METHODS
// ═══════════════════════════════════════════════════════════════════════════

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
  const styleMobile = comp.style_mobile || {};
  const styleTablet = comp.style_tablet || {};
  const styleDesktop = comp.style_desktop || {};
  const classes = [];
  
  // Helper function to get style classes for a specific breakpoint
  const getStyleClasses = (styleObj, prefix = '') => {
    const breakpointClasses = [];
    
    // Layout & Display
    if (styleObj.display) {
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
      breakpointClasses.push(displayMap[styleObj.display] || 'block');
    }
    
    // Flexbox properties
    if (styleObj.flexDirection === 'column') breakpointClasses.push('flex-col');
    if (styleObj.flexDirection === 'row-reverse') breakpointClasses.push('flex-row-reverse');
    if (styleObj.flexDirection === 'column-reverse') breakpointClasses.push('flex-col-reverse');
    
    if (styleObj.justifyContent) {
      const justifyMap = {
        'flex-start': 'justify-start',
        'center': 'justify-center',
        'flex-end': 'justify-end',
        'space-between': 'justify-between',
        'space-around': 'justify-around',
        'space-evenly': 'justify-evenly'
      };
      breakpointClasses.push(justifyMap[styleObj.justifyContent]);
    }
    
    if (styleObj.alignItems) {
      const alignMap = {
        'flex-start': 'items-start',
        'center': 'items-center',
        'flex-end': 'items-end',
        'stretch': 'items-stretch',
        'baseline': 'items-baseline'
      };
      breakpointClasses.push(alignMap[styleObj.alignItems]);
    }
    
    // Spacing (convert px to Tailwind)
    if (styleObj.gap) breakpointClasses.push(this.convertSpacingToTailwind('gap', styleObj.gap));
    if (styleObj.padding) breakpointClasses.push(this.convertSpacingToTailwind('p', styleObj.padding));
    if (styleObj.margin) breakpointClasses.push(this.convertSpacingToTailwind('m', styleObj.margin));
    
    // Sizing
    if (styleObj.width === '100%') breakpointClasses.push('w-full');
    else if (styleObj.width === 'auto') breakpointClasses.push('w-auto');
    else if (styleObj.width) breakpointClasses.push(`w-[${styleObj.width}]`);
    
    if (styleObj.height === '100%') breakpointClasses.push('h-full');
    else if (styleObj.height === 'auto') breakpointClasses.push('h-auto');
    else if (styleObj.height) breakpointClasses.push(`h-[${styleObj.height}]`);
    
    // Colors
    if (styleObj.backgroundColor) {
      breakpointClasses.push(this.convertColorToTailwind('bg', styleObj.backgroundColor));
    }
    if (styleObj.color) {
      breakpointClasses.push(this.convertColorToTailwind('text', styleObj.color));
    }
    
    // Border & Radius
    if (styleObj.borderRadius) {
      breakpointClasses.push(this.convertBorderRadiusToTailwind(styleObj.borderRadius));
    }
    if (styleObj.border || styleObj.borderWidth) {
      breakpointClasses.push('border');
      if (styleObj.borderColor) {
        breakpointClasses.push(this.convertColorToTailwind('border', styleObj.borderColor));
      }
    }
    
    // Typography
    if (styleObj.fontSize) breakpointClasses.push(this.convertFontSizeToTailwind(styleObj.fontSize));
    if (styleObj.fontWeight) breakpointClasses.push(this.convertFontWeightToTailwind(styleObj.fontWeight));
    if (styleObj.textAlign) breakpointClasses.push(`text-${styleObj.textAlign}`);
    
    // Shadow
    if (styleObj.boxShadow) breakpointClasses.push(this.convertShadowToTailwind(styleObj.boxShadow));
    
    // Add prefix to all classes if provided (for responsive breakpoints)
    return breakpointClasses.filter(Boolean).map(cls => prefix ? `${prefix}:${cls}` : cls);
  };
  
  // Add base styles (default/desktop for mobile-first, or base styles)
  classes.push(...getStyleClasses(style, ''));
  
  // Add mobile-specific styles (sm: breakpoint - 640px+)
  if (Object.keys(styleMobile).length > 0) {
    classes.push(...getStyleClasses(styleMobile, 'sm'));
  }
  
  // Add tablet-specific styles (md: breakpoint - 768px+)
  if (Object.keys(styleTablet).length > 0) {
    classes.push(...getStyleClasses(styleTablet, 'md'));
  }
  
  // Add desktop-specific styles (lg: breakpoint - 1024px+)
  if (Object.keys(styleDesktop).length > 0) {
    classes.push(...getStyleClasses(styleDesktop, 'lg'));
  }
  
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
generateReactCSSCode(allComponents, frameName = 'GeneratedComponent') {
  if (!allComponents || allComponents.length === 0) {
    const componentName = frameName.replace(/[^a-zA-Z0-9]/g, '');
    return {
      react: `import React from 'react';
import './${componentName}.css';

const ${componentName} = () => {
  return (
    <div className="canvas-container">
      {/* No components yet */}
    </div>
  );
};

export default ${componentName};`,
      css: this.generateModernCSS([])
    };
  }

  // 🔥 NEW: Collect frame-component-instances for imports
  const frameComponentInstances = allComponents.filter(c => c.type === 'frame-component-instance' || c.component_type === 'frame-component-instance');
  const componentImports = frameComponentInstances.map(instance => {
    const name = instance.props?.sourceFrameName || instance.name || 'Component';
    const componentName = name.replace(/[^a-zA-Z0-9]/g, '');
    return `import ${componentName} from './${componentName}';`;
  }).filter((v, i, a) => a.indexOf(v) === i);

  // 🔥 FIXED: Recursive React component rendering with CSS classes
  const renderReactTree = (components, depth = 0) => {
    return components.map(comp => {
      const indent = '  '.repeat(depth + 2);
      
      // 🔥 NEW: Handle frame-component-instance
      if (comp.type === 'frame-component-instance' || comp.component_type === 'frame-component-instance') {
        const name = comp.props?.sourceFrameName || comp.name || 'Component';
        const componentName = name.replace(/[^a-zA-Z0-9]/g, '');
        return `${indent}<${componentName} />`;
      }
      
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
  const componentName = frameName.replace(/[^a-zA-Z0-9]/g, '');
  const importsSection = componentImports.length > 0 ? componentImports.join('\n') + '\n' : '';
  const componentCount = allComponents.length;

  return {
    react: `import React from 'react';
${importsSection}import './${componentName}.css';

// Generated React Component for Frame: ${frameName}
function ${componentName}() {
  return (
    <div className="canvas-container">
${reactComponents || `      {/* ${componentCount} ${componentCount === 1 ? 'component' : 'components'} */}`}
    </div>
  );
}

export default ${componentName};`,
    css: this.generateModernCSS(allComponents)
  };
}

// Around line 800 - REPLACE generateHTMLCSSCode
generateHTMLCSSCode(allComponents, frameName = 'GeneratedComponent') {
  if (!allComponents || allComponents.length === 0) {
    return {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${frameName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="canvas-container">
      <!-- No components yet -->
    </div>
</body>
</html>`,
      css: this.generateModernCSS([]),
      componentLineMap: {}
    };
  }
  
  // 🔥 NEW: Line mapping tracking
  const componentLineMap = {};
  let htmlLine = 11; // Start after <body> and opening div
  let cssLine = 1; // Start at line 1 for CSS

  // 🔥 FIXED: Recursive HTML rendering with CSS classes
  const renderHTMLTree = (components, depth = 0) => {
    return components.map(comp => {
      const indent = '  '.repeat(depth + 2);
      
      // 🔥 NEW: Track start line
      const htmlStartLine = htmlLine;
      
      // 🔥 NEW: Handle frame-component-instance
      if (comp.type === 'frame-component-instance' || comp.component_type === 'frame-component-instance') {
        const name = comp.props?.sourceFrameName || comp.name || 'Component';
        const className = `component-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        htmlLine += 1;
        
        // Store line mapping
        componentLineMap[comp.id] = {
          html: { startLine: htmlStartLine, endLine: htmlLine - 1 }
        };
        
        return `${indent}<div class="${className}"><!-- ${name} component instance --></div>`;
      }
      
      // Handle text-node (no wrapper)
      if (comp.type === 'text-node') {
        const textContent = comp.props?.content || comp.props?.text || comp.text_content || '';
        htmlLine += 1;
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
      htmlLine += 1;
      
      if (hasChildren) {
        html += '\n' + renderHTMLTree(comp.children, depth + 1);
        html += `\n${indent}</${htmlTag}>`;
        htmlLine += 1;
      } else if (content) {
        html += content + `</${htmlTag}>`;
      } else {
        // Self-closing tags
        if (['input', 'img', 'br', 'hr'].includes(comp.type)) {
          const selfClosing = `${indent}<${htmlTag}${cssClass ? ` class="${cssClass}"` : ''}${attrs ? ` ${attrs}` : ''} />`;
          
          // Store line mapping
          componentLineMap[comp.id] = {
            html: { startLine: htmlStartLine, endLine: htmlLine - 1 }
          };
          
          return selfClosing;
        }
        html += `</${htmlTag}>`;
      }
      
      // Store line mapping
      componentLineMap[comp.id] = {
        html: { startLine: htmlStartLine, endLine: htmlLine - 1 }
      };
      
      return html;
    }).join('\n');
  };

  const htmlComponents = renderHTMLTree(allComponents);
  const componentCount = allComponents.length;

  return {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${frameName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Generated HTML for Frame: ${frameName} -->
    <div class="canvas-container">
${htmlComponents || `      <!-- ${componentCount} ${componentCount === 1 ? 'component' : 'components'} -->`}
    </div>
</body>
</html>`,
    css: this.generateModernCSS(allComponents),
    componentLineMap // 🔥 NEW: Include line mapping
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
}`;
  }

  const cssRules = [];
  
  // Add base canvas styles
  cssRules.push(`.canvas-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
}`);

  // Generate CSS for each component recursively
  const generateComponentCSS = (component) => {
    const className = this.generateCSSClassName(component);
    const baseStyles = component.style || {};
    
    // 🔥 NEW: Get responsive style overrides
    const mobileStyles = component.style_mobile || {};
    const tabletStyles = component.style_tablet || {};
    const desktopStyles = component.style_desktop || {};
    
    // Convert style object to CSS
    const cssProperties = Object.entries(baseStyles)
      .filter(([key]) => !key.startsWith('_')) // Skip internal properties
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `  ${cssKey}: ${value};`;
      })
      .join('\n');
    
    // Add base styles
    if (cssProperties) {
      cssRules.push(`.${className} {
${cssProperties}
}`);
    }
    
    // 🔥 NEW: Add mobile media query if exists
    if (Object.keys(mobileStyles).length > 0) {
      const mobileCssProperties = Object.entries(mobileStyles)
        .filter(([key]) => !key.startsWith('_'))
        .map(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `    ${cssKey}: ${value};`;
        })
        .join('\n');
      
      cssRules.push(`@media (max-width: 768px) {
  .${className} {
${mobileCssProperties}
  }
}`);
    }
    
    // 🔥 NEW: Add tablet media query if exists
    if (Object.keys(tabletStyles).length > 0) {
      const tabletCssProperties = Object.entries(tabletStyles)
        .filter(([key]) => !key.startsWith('_'))
        .map(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `    ${cssKey}: ${value};`;
        })
        .join('\n');
      
      cssRules.push(`@media (min-width: 769px) and (max-width: 1024px) {
  .${className} {
${tabletCssProperties}
  }
}`);
    }
    
    // 🔥 NEW: Add desktop media query if exists
    if (Object.keys(desktopStyles).length > 0) {
      const desktopCssProperties = Object.entries(desktopStyles)
        .filter(([key]) => !key.startsWith('_'))
        .map(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `    ${cssKey}: ${value};`;
        })
        .join('\n');
      
      cssRules.push(`@media (min-width: 1025px) {
  .${className} {
${desktopCssProperties}
  }
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
generateHTMLTailwindCode(allComponents, frameName = 'GeneratedComponent') {
  if (!allComponents || allComponents.length === 0) {
    return {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${frameName}</title>
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
    
    // 🔥 NEW: Handle frame-component-instance
    if (comp.type === 'frame-component-instance' || comp.component_type === 'frame-component-instance') {
      const name = comp.props?.sourceFrameName || comp.name || 'Component';
      return `${indent}<div class="component-instance"><!-- ${name} component instance --></div>`;
    }
    
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
  const componentCount = allComponents.length;

  return {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${frameName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- Generated HTML with Tailwind for Frame: ${frameName} -->
    <div class="w-full min-h-screen">
${htmlComponents || `      <!-- ${componentCount} ${componentCount === 1 ? 'component' : 'components'} -->`}
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
  
  // 🔥 NEW: Convenience method to check if unified rendering is available
  supportsUnifiedRendering(type) {
    return HTML_TAG_MAP.hasOwnProperty(type);
  }
  
  // 🔥 NEW: Get all supported component types for unified rendering
  getUnifiedRenderingTypes() {
    return Object.keys(HTML_TAG_MAP);
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
  // 🔥 NEW: Don't normalize frame-component-instance - preserve props as-is
  if (component.type === 'frame-component-instance' || component.component_type === 'frame-component-instance') {
    console.log('🔥 Skipping normalization for frame-component-instance:', component.name, component.props);
    return component;
  }

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
      
      normalized.style[prop] = normalized.props[prop];
      delete normalized.props[prop];
    }
  });
  
  // 🔥 ALSO check for Tailwind class strings that should be converted
  if (normalized.props.className) {
    
    // For now, just move it
    normalized.style.className = normalized.props.className;
    delete normalized.props.className;
  }
  
  return normalized;
}


// MODIFY: saveProjectComponents method (around line 750)
async saveProjectComponents(projectId, frameId, components, options = {}) {
    try {
        const { silent = false } = options; // 🔥 Add silent option
        
        const seenIds = new Set();
        
        // 🔥 CRITICAL: Normalize ALL components before flattening
        const normalizedComponents = components.map(comp => 
            this.normalizeComponentStyles(comp)
        );
        
        const flattenedComponents = this.flattenComponentTree(normalizedComponents, seenIds);
        
        
        
        const mappedComponents = flattenedComponents.map((comp, index) => {
            const mapped = {
                id: comp.id,                              
                type: comp.type,
                component_type: comp.component_type || comp.type, // 🔥 NEW: Include component_type for frame-component-instance
                props: comp.props || {},
                name: comp.name || comp.type,
                zIndex: comp.zIndex || 0,
                sortOrder: index,                         
                variant: comp.variant || null,
                style: comp.style || {}, // Base styles
                style_mobile: comp.style_mobile || {}, // 🔥 RESPONSIVE: Mobile styles
                style_tablet: comp.style_tablet || {}, // 🔥 RESPONSIVE: Tablet styles
                style_desktop: comp.style_desktop || {}, // 🔥 RESPONSIVE: Desktop styles
                animation: comp.animation || {},
                isLayoutContainer: comp.isLayoutContainer || false,
                children: comp.children || [],            
                parent_id: comp.parentId || null, // 🔥 CRITICAL FIX: Use parent_id (snake_case) for database
            };
            
            // 🔥 Log frame-component-instances
            if (mapped.component_type === 'frame-component-instance') {
                console.log('💾 Saving frame-component-instance:', {
                    name: mapped.name,
                    props: mapped.props,
                    style: mapped.style
                });
            }
            
            return mapped;
        });

        // 🔥 DEBUG: Log what we're sending
        console.log('📤 Sending to backend:', {
            totalComponents: mappedComponents.length,
            firstComponent: mappedComponents[0],
            componentsWithResponsive: mappedComponents.filter(c => 
                c.style_mobile || c.style_tablet || c.style_desktop
            ).length
        });
        
        const response = await axios.post('/api/project-components/bulk-update', {
            project_id: projectId,
            frame_id: frameId,
            components: mappedComponents,
            create_revision: false,
            silent: silent, // 🔥 Pass silent flag to backend
            session_id: window.currentSessionId || 'unknown' // 🔥 Pass session ID for filtering own events
        });
        
        if (response.data.success) {
            
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
          
          const response = await axios.get('/api/project-components', {
              params: { project_id: projectId, frame_id: frameId }
          });
          
          if (response.data.success) {
              const flatComponents = response.data.data;
              
              // CRITICAL: Rebuild tree structure
              const treeComponents = this.rebuildComponentTree(flatComponents);

              return treeComponents;
          }
          
          return [];
      } catch (error) {
          console.error('Failed to load project components:', error);
          return [];
      }
  }
  // 🔥 ADD: Unified client-side code generation method
  async clientSideCodeGeneration(components, style = 'react-css', frameName = 'GeneratedComponent') {
    try {
      if (!components || components.length === 0) {
        return {
          react: `// Generated React Code for Frame: ${frameName}\nfunction ${frameName}() {\n  return (\n    <div className="canvas-container">\n      {/* No components yet */}\n    </div>\n  );\n}\n\nexport default ${frameName};`,
          html: `<!-- Generated HTML for Frame: ${frameName} -->\n<div>\n  <!-- No components yet -->\n</div>`,
          css: `/* Generated CSS for Frame: ${frameName} */`,
          tailwind: `<!-- Generated Tailwind for Frame: ${frameName} -->\n<div>\n  <!-- No components yet -->\n</div>`
        };
      }

      switch (style) {
        case 'react-css':
          return this.generateReactCSSCode(components, frameName);
        
        case 'react-tailwind':
          return this.generateReactTailwindCode(components, frameName);
        
        case 'html-css':
          return this.generateHTMLCSSCode(components, frameName);
        
        case 'html-tailwind':
          return this.generateHTMLTailwindCode(components, frameName);
        
        default:
          return this.generateReactCSSCode(components, frameName);
      }
    } catch (error) {
      console.error('Code generation error:', error);
      return {
        react: `// Error generating code for Frame: ${frameName}\nfunction ${frameName}() {\n  return <div>Error generating code</div>;\n}`,
        html: `<!-- Error generating HTML -->`,
        css: `/* Error generating CSS */`,
        tailwind: `<!-- Error generating Tailwind -->`
      };
    }
  }

  // 🔥 GRADIENT FIX: Add the missing generateComponentCode method
  generateComponentCode(componentDef, props, allComponents, style) {
    // This method bridges individual component code generation
    // It's used by the createComponentRenderer method
    try {
      const component = {
        type: componentDef.type,
        props: props || {},
        style: props.style || {},
        children: props.children || []
      };

      // For Tailwind styles, use dynamic class generation with gradient support
      if (style === 'react-tailwind' || style === 'html-tailwind') {
        const classes = this.buildDynamicTailwindClasses(component);
        const tag = this.getHTMLTag(component.type);
        const content = this.extractComponentContent(component);
        
        if (style === 'react-tailwind') {
          return `<${tag}${classes ? ` className="${classes}"` : ''}>${content || ''}</${tag}>`;
        } else {
          return `<${tag}${classes ? ` class="${classes}"` : ''}>${content || ''}</${tag}>`;
        }
      } 
      
      // For CSS styles, generate inline styles with proper gradient handling
      else if (style === 'react-css' || style === 'html-css') {
        const inlineStyles = this.buildInlineStyles(component.style);
        const tag = this.getHTMLTag(component.type);
        const content = this.extractComponentContent(component);
        
        if (style === 'react-css') {
          return `<${tag}${inlineStyles ? ` style={${JSON.stringify(inlineStyles)}}` : ''}>${content || ''}</${tag}>`;
        } else {
          const cssStyle = Object.entries(inlineStyles || {})
            .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
            .join('; ');
          return `<${tag}${cssStyle ? ` style="${cssStyle}"` : ''}>${content || ''}</${tag}>`;
        }
      }
      
      return `<!-- ${componentDef.name || componentDef.type} -->`;
    } catch (error) {
      console.error('Error generating component code:', error);
      return `<!-- Error generating ${componentDef.type} -->`;
    }
  }

  // 🔥 GRADIENT FIX: Helper method to build inline styles (for CSS modes)
  buildInlineStyles(style) {
    if (!style || typeof style !== 'object') return {};
    
    // Convert style object, handling gradients properly
    const inlineStyles = { ...style };
    
    // Ensure gradients are properly formatted for inline styles
    if (style.backgroundImage) {
      inlineStyles.backgroundImage = style.backgroundImage;
    } else if (style.background && style.background.includes('gradient')) {
      inlineStyles.backgroundImage = style.background;
      delete inlineStyles.background;
    }
    
    return inlineStyles;
  }

  // 🔥 ADD: Generate React with Tailwind
  generateReactTailwindCode(allComponents, frameName = 'GeneratedComponent') {
    if (!allComponents || allComponents.length === 0) {
      return {
        react: `import React from 'react';\n\nfunction ${frameName}() {\n  return (\n    <div className="w-full min-h-screen">\n      {/* No components yet */}\n    </div>\n  );\n}\n\nexport default ${frameName};`,
        tailwind: ''
      };
    }

    const renderReactTree = (components, depth = 0) => {
      return components.map(comp => {
        const indent = '  '.repeat(depth + 3);
        
        if (comp.type === 'frame-component-instance' || comp.component_type === 'frame-component-instance') {
          const name = comp.props?.sourceFrameName || comp.name || 'Component';
          return `${indent}<div className="component-instance">{/* ${name} component */}</div>`;
        }
        
        if (comp.type === 'text-node') {
          const textContent = comp.props?.content || comp.props?.text || comp.text_content || '';
          return `${indent}{${JSON.stringify(textContent)}}`;
        }
        
        const classes = this.buildDynamicTailwindClasses(comp);
        const content = this.extractComponentContent(comp);
        const hasChildren = comp.children && comp.children.length > 0;
        const tag = this.getReactTag(comp.type);
        
        let jsx = `${indent}<${tag}`;
        if (classes) jsx += ` className="${classes}"`;
        
        const props = this.buildReactProps(comp);
        if (props) jsx += ` ${props}`;
        
        jsx += '>';
        
        if (hasChildren) {
          jsx += '\n' + renderReactTree(comp.children, depth + 1);
          jsx += `\n${indent}</${tag}>`;
        } else if (content) {
          jsx += content + `</${tag}>`;
        } else {
          if (['input', 'img', 'br', 'hr'].includes(comp.type)) {
            return `${indent}<${tag}${classes ? ` className="${classes}"` : ''}${props ? ` ${props}` : ''} />`;
          }
          jsx += `</${tag}>`;
        }
        
        return jsx;
      }).join('\n');
    };

    const reactComponents = renderReactTree(allComponents);
    
    return {
      react: `import React from 'react';\n\nfunction ${frameName}() {\n  return (\n    <div className="w-full min-h-screen">\n${reactComponents}\n    </div>\n  );\n}\n\nexport default ${frameName};`,
      tailwind: allComponents.map(comp => 
        `/* ${comp.name} (${comp.type}) */\n${this.buildDynamicTailwindClasses(comp)}`
      ).join('\n\n')
    };
  }
}

// Create singleton instance
export const componentLibraryService = new ComponentLibraryService();
export default componentLibraryService;