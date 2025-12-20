// @/Services/ComponentLibraryService.js
import axios from 'axios';
import React from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 HERO ICONS SVG MAP - For HTML embedding
// ═══════════════════════════════════════════════════════════════════════════
const HERO_ICONS_SVG = {
  'HomeIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>',
  'AcademicCapIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>',
  'ChevronLeftIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>',
  'ChevronRightIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>',
  'ChevronUpIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>',
  'ChevronDownIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>',
  'XMarkIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>',
  'CheckIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>',
  'MagnifyingGlassIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>',
  'Bars3Icon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>',
  'UserIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>',
  'HeartIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>',
  'StarIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>',
  'BellIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>',
  'CogIcon': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 COMPLETE DOM-LIKE UNIFIED RENDERING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ALL valid HTML5 elements mapped to themselves
 * This makes the system truly universal - supports ANY HTML element
 */
// 🔥 ALL HTML5 Elements - Complete List (110+ elements)
const ALL_HTML_ELEMENTS = [
  // Document structure
  'html', 'head', 'body', 'title', 'meta', 'link', 'style', 'script', 'noscript', 'base',
  
  // Sections
  'header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'address', 'hgroup',
  
  // Content grouping
  'div', 'span', 'p', 'pre', 'blockquote', 'hr', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'menu',
  
  // Text semantics
  'a', 'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup', 'code', 'kbd', 'samp', 'var', 'time', 'abbr', 'dfn', 'cite', 'q', 'ins', 'del', 'data', 'bdi', 'bdo', 'ruby', 'rt', 'rp', 'wbr',
  
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  
  // Forms
  'form', 'input', 'textarea', 'button', 'select', 'option', 'optgroup', 'label', 'fieldset', 'legend', 'datalist', 'output', 'progress', 'meter',
  
  // Interactive
  'details', 'summary', 'dialog',
  
  // Embedded content
  'img', 'iframe', 'embed', 'object', 'param', 'video', 'audio', 'source', 'track', 'canvas', 'svg', 'math', 'picture', 'area', 'map',
  
  // Tables
  'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'col', 'colgroup',
  
  // Scripting
  'script', 'noscript', 'template', 'slot', 'canvas',
  
  // Other semantic elements
  'figure', 'figcaption', 'search'
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
  
  // Media and assets
  '3d-model': 'div',
  '3d': 'div',
  'gltf': 'div',
  'glb': 'div',
  'lottie': 'lottie-player',
  'document': 'div',
  'pdf': 'div',
  
  // Special
  'icon': 'span',
  'icon-element': 'span', // 🔥 FIX: Icon drag creates type 'icon-element'
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
    
    // 7. Special renderers for media types
    // 🎮 3D Model Viewer - Using react-three-fiber Canvas
    if (component.type === '3d-model' || component.type === '3d' || component.type === 'gltf' || component.type === 'glb') {
      // Use React.lazy for dynamic import (works in browser)
      const ThreeDModelViewer = React.lazy(() => import('@/Components/Forge/viewers/ThreeDModelViewer'));
      
      const modelStyle = {
        width: htmlAttrs.style?.width || '400px',
        height: htmlAttrs.style?.height || '400px',
        ...htmlAttrs.style,
        position: htmlAttrs.style?.position || 'relative'
      };
      
      return React.createElement('div', {
        ...htmlAttrs,
        style: modelStyle,
        className: '3d-model-viewer-wrapper'
      }, 
        React.createElement(React.Suspense, {
          fallback: React.createElement('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              background: '#f3f4f6',
              borderRadius: '8px'
            }
          }, '🎮 Loading 3D Model...')
        },
          React.createElement(ThreeDModelViewer, {
            src: mergedProps.src,
            alt: mergedProps.alt || '3D Model'
          })
        )
      );
    }
    
    // ✨ Lottie Animation - Using lottie-player web component
    if (component.type === 'lottie' || component.type === 'json') {
      // Load Lottie player script if not loaded
      if (typeof window !== 'undefined' && !window.LottiePlayer) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
        script.async = true;
        document.body.appendChild(script);
      }
      
      const lottieStyle = {
        width: htmlAttrs.style?.width || '300px',
        height: htmlAttrs.style?.height || '300px',
        ...htmlAttrs.style
      };
      
      return React.createElement('lottie-player', {
        key: htmlAttrs.key,
        'data-component-element': htmlAttrs['data-component-element'],
        'data-element-type': htmlAttrs['data-element-type'],
        src: mergedProps.src,
        background: 'transparent',
        speed: mergedProps.speed || '1',
        style: lottieStyle,
        loop: mergedProps.loop !== false,
        autoplay: mergedProps.autoplay !== false,
        controls: mergedProps.controls || false
      });
    }
    
    // 📄 Document Viewer - PDF and other documents
    if (component.type === 'document' || component.type === 'pdf') {
      const DocumentViewer = React.lazy(() => import('@/Components/Forge/viewers/DocumentViewer'));
      
      const docStyle = {
        width: htmlAttrs.style?.width || '100%',
        minHeight: htmlAttrs.style?.minHeight || '200px',
        ...htmlAttrs.style,
        position: htmlAttrs.style?.position || 'relative'
      };
      
      return React.createElement('div', {
        ...htmlAttrs,
        style: docStyle,
        className: 'document-viewer-wrapper'
      }, 
        React.createElement(React.Suspense, {
          fallback: React.createElement('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              minHeight: '200px',
              background: '#f9fafb',
              borderRadius: '8px'
            }
          }, '📄 Loading Document...')
        },
          React.createElement(DocumentViewer, {
            src: mergedProps.src,
            alt: mergedProps.alt || 'Document',
            type: component.type === 'pdf' ? 'pdf' : 'document'
          })
        )
      );
    }
    
    // 🎨 Icon/SVG Renderer - Handles Lucide, Hero Icons, and custom SVGs
    if (component.type === 'icon' || component.type === 'icon-element' || component.type === 'svg') {
      // Check for SVG content (custom SVG or uploaded icon)
      if (mergedProps.svgData || mergedProps.svgContent) {
        const svgContent = mergedProps.svgData || mergedProps.svgContent;
        
        // 🔥 FIX: Override default width:100% for icons - use proper sizing
        const iconStyle = {
          display: 'inline-block',
          width: htmlAttrs.style?.width || '24px',
          height: htmlAttrs.style?.height || '24px',
          ...htmlAttrs.style
        };
        
        return React.createElement('span', {
          ...htmlAttrs,
          style: iconStyle,
          dangerouslySetInnerHTML: { __html: svgContent }
        });
      }
      
      // Check for Lucide or Hero icon (iconType + iconName)
      if (mergedProps.iconType && mergedProps.iconName) {
        const iconStyle = {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: htmlAttrs.style?.width || '24px',
          height: htmlAttrs.style?.height || '24px',
          ...htmlAttrs.style
        };
        
        // Try to dynamically import icon from lucide-react or heroicons
        if (mergedProps.iconType === 'lucide' || mergedProps.iconType === 'lucide-react') {
          try {
            // Dynamically import Lucide icon
            const LucideIcon = React.lazy(() => 
              import('lucide-react').then(mod => {
                const IconComponent = mod[mergedProps.iconName];
                if (!IconComponent) {
                  console.warn(`Lucide icon not found: ${mergedProps.iconName}`);
                  return { default: () => React.createElement('span', null, '?') };
                }
                return { default: IconComponent };
              })
            );
            
            return React.createElement('span', {
              ...htmlAttrs,
              style: iconStyle
            },
              React.createElement(React.Suspense, {
                fallback: React.createElement('span', { style: { opacity: 0.5 } }, '⏳')
              },
                React.createElement(LucideIcon, {
                  size: parseInt(iconStyle.width) || 24,
                  color: htmlAttrs.style?.color || 'currentColor'
                })
              )
            );
          } catch (err) {
            console.warn('Failed to load Lucide icon:', mergedProps.iconName, err);
          }
        } else if (mergedProps.iconType === 'heroicon' || mergedProps.iconType === 'heroicons') {
          try {
            // Dynamically import Hero icon
            const HeroIcon = React.lazy(() => 
              import('@heroicons/react/24/outline').then(mod => {
                const IconComponent = mod[mergedProps.iconName];
                if (!IconComponent) {
                  console.warn(`Hero icon not found: ${mergedProps.iconName}`);
                  return { default: () => React.createElement('span', null, '?') };
                }
                return { default: IconComponent };
              })
            );
            
            return React.createElement('span', {
              ...htmlAttrs,
              style: iconStyle
            },
              React.createElement(React.Suspense, {
                fallback: React.createElement('span', { style: { opacity: 0.5 } }, '⏳')
              },
                React.createElement(HeroIcon, {
                  width: parseInt(iconStyle.width) || 24,
                  height: parseInt(iconStyle.height) || 24,
                  color: htmlAttrs.style?.color || 'currentColor'
                })
              )
            );
          } catch (err) {
            console.warn('Failed to load Hero icon:', mergedProps.iconName, err);
          }
        }
      }
      
      // Fallback: render small placeholder (not full width!)
      return React.createElement('span', {
        ...htmlAttrs,
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: htmlAttrs.style?.width || '24px',
          height: htmlAttrs.style?.height || '24px',
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#9ca3af',
          flexShrink: 0 // Prevent shrinking
        }
      }, '🎨');
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
    return !this.isSelfClosing(type);
  }
  
  // 🔥 DYNAMIC: Check if component type is self-closing
  isSelfClosing(type) {
    const htmlTag = this.getHTMLTag(type);
    return this.isSelfClosingTag(htmlTag);
  }
  
  // 🔥 NEW: Check if an HTML tag name is self-closing
  isSelfClosingTag(tagName) {
    // HTML5 void elements (self-closing tags)
    const VOID_ELEMENTS = [
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ];
    return VOID_ELEMENTS.includes(tagName.toLowerCase());
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
  // 🔥 FIXED: Explicit overrides ALWAYS win over auto-transforms
  const baseStyles = { ...component.style };
  const explicitOverrides = component[`style_${responsiveMode}`] || {};
  
  // Debug logging (only if enabled)
  if (typeof window !== 'undefined' && window.__DEBUG_RESPONSIVE__) {
    console.log(`🎨 calculateResponsiveStyles for ${component.type} in ${responsiveMode}:`, {
      baseStyles,
      explicitOverrides,
      hasExplicitOverrides: Object.keys(explicitOverrides).length > 0
    });
  }
  
  const isLayoutContainer = component.isLayoutContainer || 
                            ['section', 'container', 'div', 'flex', 'grid'].includes(component.type);
  
  // 🔥 STEP 1: Start with base styles, then apply auto-transforms
  const responsiveStyles = { ...baseStyles };
  
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
  
  // 🔥 STEP 2: Explicit overrides ALWAYS win (merge on top of auto-transforms)
  const finalStyles = { ...responsiveStyles, ...explicitOverrides };
  
  // Store responsive mode for debugging
  finalStyles._responsiveMode = responsiveMode;
  
  return finalStyles;
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
    
    // Colors & Gradients
    // 🔥 GRADIENT FIX: Check for gradient in BOTH backgroundImage AND background properties
    const gradientSource = styleObj.backgroundImage || styleObj.background;
    if (gradientSource && gradientSource.includes('gradient')) {
      const gradientClasses = this.convertGradientToTailwind(gradientSource);
      if (gradientClasses) {
        breakpointClasses.push(gradientClasses);
      }
    } else if (styleObj.backgroundColor) {
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
  
  // 🔥 NEW: Add missing Tailwind conversions (transforms, animations, positioning, filters)
  const getAdvancedStyleClasses = (styleObj, prefix = '') => {
    const breakpointClasses = [];
    
    // 🔥 POSITIONING
    if (styleObj.position) {
      const posMap = { 'static': 'static', 'relative': 'relative', 'absolute': 'absolute', 'fixed': 'fixed', 'sticky': 'sticky' };
      if (posMap[styleObj.position]) breakpointClasses.push(posMap[styleObj.position]);
    }
    if (styleObj.top) breakpointClasses.push(`top-[${styleObj.top}]`);
    if (styleObj.right) breakpointClasses.push(`right-[${styleObj.right}]`);
    if (styleObj.bottom) breakpointClasses.push(`bottom-[${styleObj.bottom}]`);
    if (styleObj.left) breakpointClasses.push(`left-[${styleObj.left}]`);
    if (styleObj.zIndex) breakpointClasses.push(`z-[${styleObj.zIndex}]`);
    
    // 🔥 TRANSFORMS (rotate, scale, translate)
    if (styleObj.transform) {
      const transforms = styleObj.transform.match(/(rotate|scale|translate[XY]?|skew[XY]?)\(([^)]+)\)/g);
      if (transforms) {
        transforms.forEach(t => {
          if (t.includes('rotate')) {
            const deg = t.match(/-?\d+/)?.[0];
            if (deg) breakpointClasses.push(`rotate-[${deg}deg]`);
          }
          if (t.includes('scale')) {
            const scale = t.match(/[\d.]+/)?.[0];
            if (scale) breakpointClasses.push(`scale-[${scale}]`);
          }
          if (t.includes('translateX')) {
            const val = t.match(/[^()]+(?=\))/)?.[0];
            if (val) breakpointClasses.push(`translate-x-[${val}]`);
          }
          if (t.includes('translateY')) {
            const val = t.match(/[^()]+(?=\))/)?.[0];
            if (val) breakpointClasses.push(`translate-y-[${val}]`);
          }
        });
      }
    }
    
    // 🔥 TRANSITIONS & ANIMATIONS
    if (styleObj.transition) {
      if (styleObj.transition.includes('all')) breakpointClasses.push('transition-all');
      else breakpointClasses.push('transition');
      
      if (styleObj.transition.includes('ease-in-out')) breakpointClasses.push('ease-in-out');
      else if (styleObj.transition.includes('ease-in')) breakpointClasses.push('ease-in');
      else if (styleObj.transition.includes('ease-out')) breakpointClasses.push('ease-out');
    }
    
    if (styleObj.animation) {
      if (styleObj.animation.includes('spin')) breakpointClasses.push('animate-spin');
      else if (styleObj.animation.includes('ping')) breakpointClasses.push('animate-ping');
      else if (styleObj.animation.includes('pulse')) breakpointClasses.push('animate-pulse');
      else if (styleObj.animation.includes('bounce')) breakpointClasses.push('animate-bounce');
    }
    
    // 🔥 FILTERS
    if (styleObj.filter) {
      // 🔥 FIX: Check if filter is a string before calling .match()
      const filterString = typeof styleObj.filter === 'string' ? styleObj.filter : '';
      if (filterString) {
        const filters = filterString.match(/(blur|brightness|contrast|grayscale|invert)\(([^)]+)\)/g);
        if (filters) {
          filters.forEach(f => {
            if (f.includes('blur')) {
              const val = f.match(/\d+/)?.[0];
              if (val) breakpointClasses.push(`blur-[${val}px]`);
            }
            if (f.includes('brightness')) {
              const val = f.match(/[\d.]+/)?.[0];
              if (val) breakpointClasses.push(`brightness-[${val}]`);
            }
            if (f.includes('grayscale')) breakpointClasses.push('grayscale');
            if (f.includes('invert')) breakpointClasses.push('invert');
          });
        }
      }
    }
    
    // 🔥 BACKDROP FILTER
    if (styleObj.backdropFilter && styleObj.backdropFilter.includes('blur')) {
      const val = styleObj.backdropFilter.match(/\d+/)?.[0];
      if (val) breakpointClasses.push(`backdrop-blur-[${val}px]`);
    }
    
    // 🔥 OVERFLOW
    if (styleObj.overflow) breakpointClasses.push(`overflow-${styleObj.overflow}`);
    if (styleObj.overflowX) breakpointClasses.push(`overflow-x-${styleObj.overflowX}`);
    if (styleObj.overflowY) breakpointClasses.push(`overflow-y-${styleObj.overflowY}`);
    
    // 🔥 GRID TEMPLATES
    if (styleObj.gridTemplateColumns) {
      const cols = styleObj.gridTemplateColumns.match(/repeat\((\d+)/)?.[1];
      if (cols) breakpointClasses.push(`grid-cols-${cols}`);
      else breakpointClasses.push(`grid-cols-[${styleObj.gridTemplateColumns}]`);
    }
    if (styleObj.gridTemplateRows) breakpointClasses.push(`grid-rows-[${styleObj.gridTemplateRows}]`);
    
    return breakpointClasses.filter(Boolean).map(cls => prefix ? `${prefix}:${cls}` : cls);
  };
  
  // Add base styles (default/desktop for mobile-first, or base styles)
  classes.push(...getStyleClasses(style, ''));
  classes.push(...getAdvancedStyleClasses(style, '')); // 🔥 Add advanced styles
  
  // Add mobile-specific styles (sm: breakpoint - 640px+)
  if (Object.keys(styleMobile).length > 0) {
    classes.push(...getStyleClasses(styleMobile, 'sm'));
    classes.push(...getAdvancedStyleClasses(styleMobile, 'sm')); // 🔥 Add advanced styles
  }
  
  // Add tablet-specific styles (md: breakpoint - 768px+)
  if (Object.keys(styleTablet).length > 0) {
    classes.push(...getStyleClasses(styleTablet, 'md'));
    classes.push(...getAdvancedStyleClasses(styleTablet, 'md')); // 🔥 Add advanced styles
  }
  
  // Add desktop-specific styles (lg: breakpoint - 1024px+)
  if (Object.keys(styleDesktop).length > 0) {
    classes.push(...getStyleClasses(styleDesktop, 'lg'));
    classes.push(...getAdvancedStyleClasses(styleDesktop, 'lg')); // 🔥 Add advanced styles
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
  
  if (comp.type === 'img' || comp.type === 'image') {
    if (comp.props?.src) props.push(`src="${comp.props.src}"`);
    if (comp.props?.alt) props.push(`alt="${comp.props.alt}"`);
  }
  
  if (comp.type === 'video') {
    if (comp.props?.src) props.push(`src="${comp.props.src}"`);
    if (comp.props?.controls) props.push('controls');
    if (comp.props?.autoplay) props.push('autoplay');
    if (comp.props?.loop) props.push('loop');
    if (comp.props?.muted) props.push('muted');
  }
  
  if (comp.type === 'audio') {
    if (comp.props?.src) props.push(`src="${comp.props.src}"`);
    if (comp.props?.controls) props.push('controls');
    if (comp.props?.autoplay) props.push('autoplay');
    if (comp.props?.loop) props.push('loop');
  }
  
  // 3D Model props
  if (['3d-model', '3d', 'gltf', 'glb'].includes(comp.type)) {
    if (comp.props?.src) props.push(`src="${comp.props.src}"`);
    if (comp.props?.alt) props.push(`alt="${comp.props.alt}"`);
  }
  
  // Lottie animation props
  if (comp.type === 'lottie' || comp.type === 'json') {
    if (comp.props?.src) props.push(`src="${comp.props.src}"`);
    if (comp.props?.autoplay !== false) props.push('autoplay');
    if (comp.props?.loop !== false) props.push('loop');
    if (comp.props?.controls) props.push('controls');
    if (comp.props?.speed) props.push(`speed="${comp.props.speed}"`);
  }
  
  // Document props
  if (comp.type === 'document' || comp.type === 'pdf') {
    if (comp.props?.src) props.push(`src="${comp.props.src}"`);
    if (comp.props?.alt) props.push(`title="${comp.props.alt}"`);
  }
  
  return props.join('\n      ');
}


// 🔥 REMOVED: This method duplicated getHTMLTag()
// Now all code generation uses the UNIVERSAL getHTMLTag() method
// which reads from HTML_TAG_MAP at the top of the file


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
  
  // 🔥 NEW: Collect icon imports from all components (including nested)
  const collectIcons = (components) => {
    const icons = [];
    components.forEach(comp => {
      if ((comp.type === 'icon' || comp.type === 'icon-element') && comp.props?.iconType && comp.props?.iconName) {
        icons.push({
          type: comp.props.iconType,
          name: comp.props.iconName
        });
      }
      if (comp.children && comp.children.length > 0) {
        icons.push(...collectIcons(comp.children));
      }
    });
    return icons;
  };
  
  const icons = collectIcons(allComponents);
  // 🔥 FIX: iconName already contains the correct library name (e.g., "Home", "AcademicCapIcon")
  // No need to convert or add suffix - just use it directly
  const lucideIcons = [...new Set(icons.filter(i => i.type === 'lucide' || i.type === 'lucide-react').map(i => i.name))];
  const heroIcons = [...new Set(icons.filter(i => i.type === 'heroicons' || i.type === 'heroicon').map(i => i.name))];
  
  const iconImports = [];
  if (lucideIcons.length > 0) {
    iconImports.push(`import { ${lucideIcons.join(', ')} } from 'lucide-react';`);
  }
  if (heroIcons.length > 0) {
    iconImports.push(`import { ${heroIcons.join(', ')} } from '@heroicons/react/24/outline';`);
  }

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
      
      // 🔥 FIX: Handle icon components specially (they need component syntax, not just tags)
      if (comp.type === 'icon' || comp.type === 'icon-element') {
        const cssClass = this.generateCSSClassName(comp);
        const iconName = comp.props?.iconName || comp.name;
        const iconType = comp.props?.iconType || 'lucide';
        
        // Custom SVG icon - embed directly
        if (comp.props?.svgData || comp.props?.svgContent) {
          const svgData = comp.props.svgData || comp.props.svgContent;
          return `${indent}<span className="${cssClass}" dangerouslySetInnerHTML={{ __html: \`${svgData.replace(/`/g, '\\`')}\` }}></span>`;
        }
        
        // Lucide or Hero icon component
        if (iconType === 'lucide' || iconType === 'lucide-react') {
          const componentName = iconName || 'HelpCircle';
          return `${indent}<${componentName} className="${cssClass}" size={${comp.props?.size || 24}} ${comp.props?.color ? `color="${comp.props.color}"` : ''} />`;
        } else if (iconType === 'heroicons' || iconType === 'heroicon') {
          const componentName = iconName || 'QuestionMarkCircleIcon';
          return `${indent}<${componentName} className="${cssClass}" style={{ width: '${comp.props?.size || 24}px', height: '${comp.props?.size || 24}px'${comp.props?.color ? `, color: '${comp.props.color}'` : ''} }} />`;
        }
        
        // Fallback
        return `${indent}<span className="${cssClass}">{/* Icon: ${iconName} */}</span>`;
      }
      
      // Generate unique CSS class for this component
      const cssClass = this.generateCSSClassName(comp);
      const content = this.extractComponentContent(comp);
      const hasChildren = comp.children && comp.children.length > 0;
      
      // 🔥 UNIFIED: Get HTML tag using the SAME method as rendering
      const reactTag = this.getHTMLTag(comp.type);
      
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
  const iconImportsSection = iconImports.length > 0 ? iconImports.join('\n') + '\n' : '';
  const componentCount = allComponents.length;

  return {
    react: `import React from 'react';
${iconImportsSection}${importsSection}import './${componentName}.css';

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
      
      // 🔥 Handle icon type
      if (comp.type === 'icon' || comp.type === 'icon-element') {
        const iconName = comp.props?.iconName || comp.name;
        const iconType = comp.props?.iconType || 'lucide';
        const cssClass = this.generateCSSClassName(comp);
        
        if (comp.props?.svgData || comp.props?.svgContent) {
          // Custom SVG icon - embed directly
          const svgData = comp.props.svgData || comp.props.svgContent;
          htmlLine += 1;
          componentLineMap[comp.id] = {
            html: { startLine: htmlStartLine, endLine: htmlLine - 1 }
          };
          return `${indent}<span${cssClass ? ` class="${cssClass}"` : ''}>${svgData}</span>`;
        }
        
        // For library icons, show comment (HTML doesn't support React components)
        htmlLine += 1;
        componentLineMap[comp.id] = {
          html: { startLine: htmlStartLine, endLine: htmlLine - 1 }
        };
        return `${indent}<span${cssClass ? ` class="${cssClass}"` : ''}><!-- ${iconType}: ${iconName || 'Icon'} --></span>`;
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
        // 🔥 DYNAMIC: Check if tag is self-closing using HTML standard
        const isSelfClosing = this.isSelfClosingTag(htmlTag);
        
        if (isSelfClosing) {
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

  // 🔥 Check if we need Lucide CSS
  const collectIcons = (components) => {
    const icons = { lucide: false, heroicons: false };
    const checkComp = (comp) => {
      if ((comp.type === 'icon' || comp.type === 'icon-element') && comp.props?.iconType) {
        if (comp.props.iconType === 'lucide' || comp.props.iconType === 'lucide-react') {
          icons.lucide = true;
        }
        if (comp.props.iconType === 'heroicons' || comp.props.iconType === 'heroicon') {
          icons.heroicons = true;
        }
      }
      if (comp.children) comp.children.forEach(checkComp);
    };
    components.forEach(checkComp);
    return icons;
  };
  
  const iconsUsed = collectIcons(allComponents);
  const lucideLink = iconsUsed.lucide ? '\n    <link rel="stylesheet" href="https://unpkg.com/lucide-static@latest/font/lucide.css" />' : '';

  return {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${frameName}</title>
    <link rel="stylesheet" href="styles.css">${lucideLink}
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

// 🔥 REMOVED: This method duplicated getHTMLTag()
// Now React code generation uses the UNIVERSAL getHTMLTag() method
// which automatically handles ALL HTML5 elements + custom types

// 🔥 DYNAMIC: Build React props for ANY component type (no hardcoding)
buildReactProps(component) {
  const props = [];
  
  if (!component.props) return '';
  
  // 🔥 UNIVERSAL: Map ALL component props to HTML attributes dynamically
  Object.entries(component.props).forEach(([key, value]) => {
    // Skip props that aren't HTML attributes or are internal/component-specific
    if ([
      'style', 
      'text', 
      'content', 
      'children', 
      'className',
      // 🔥 FIX: Skip icon-specific props (these are used for rendering, not JSX attributes)
      'iconType',
      'iconName',
      'svgData',
      'svgContent',
      'size', // Icon size
      'color', // Icon color
      // Skip other component-specific props
      'variant',
      'isLayoutContainer',
      'projectComponents',
      'sourceFrameName',
      'frameId'
    ].includes(key)) {
      return;
    }
    
    // Map prop name to HTML attribute name
    const attrName = PROP_TO_ATTR_MAP[key] || key;
    
    // Handle boolean attributes (disabled, checked, required, etc.)
    if (typeof value === 'boolean') {
      if (value) props.push(attrName);
    }
    // Handle string/number attributes
    else if (value !== null && value !== undefined) {
      props.push(`${attrName}="${value}"`);
    }
  });
  
  return props.join(' ');
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
    
    // 🔥 Handle icon type
    if (comp.type === 'icon') {
      const iconName = comp.props?.iconName || comp.name;
      const iconType = comp.props?.iconType || 'lucide';
      const classes = this.buildDynamicTailwindClasses(comp);
      
      if (comp.props?.svgData || comp.props?.svgContent) {
        // Custom SVG icon - embed directly
        const svgData = comp.props.svgData || comp.props.svgContent;
        return `${indent}<span${classes ? ` class="${classes}"` : ''}>${svgData}</span>`;
      }
      
      // For library icons, show comment (HTML doesn't support React components)
      return `${indent}<span${classes ? ` class="${classes}"` : ''}><!-- ${iconType}: ${iconName || 'Icon'} --></span>`;
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
      if (['input', 'img', 'image', 'br', 'hr'].includes(comp.type)) {
        return `${indent}<${htmlTag}${classes ? ` class="${classes}"` : ''}${attrs ? ` ${attrs}` : ''} />`;
      }
      html += `</${htmlTag}>`;
    }
    
    return html;
  }).join('\n');
};



  const htmlComponents = renderHTMLTree(allComponents);
  const componentCount = allComponents.length;

  // 🔥 Check if we need Lucide CSS
  const collectIcons = (components) => {
    const icons = { lucide: false, heroicons: false };
    const checkComp = (comp) => {
      if ((comp.type === 'icon' || comp.type === 'icon-element') && comp.props?.iconType) {
        if (comp.props.iconType === 'lucide' || comp.props.iconType === 'lucide-react') {
          icons.lucide = true;
        }
        if (comp.props.iconType === 'heroicons' || comp.props.iconType === 'heroicon') {
          icons.heroicons = true;
        }
      }
      if (comp.children) comp.children.forEach(checkComp);
    };
    components.forEach(checkComp);
    return icons;
  };
  
  const iconsUsed = collectIcons(allComponents);
  const lucideLink = iconsUsed.lucide ? '\n    <link rel="stylesheet" href="https://unpkg.com/lucide-static@latest/font/lucide.css" />' : '';

  return {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${frameName}</title>
    <script src="https://cdn.tailwindcss.com"></script>${lucideLink}
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

// 🔥 NOTE: getHTMLTag() is ALREADY defined at line 402 (near the top)
// It uses HTML_TAG_MAP which supports ALL HTML5 elements automatically
// NO need for duplicate method here!



// 🔥 DYNAMIC: Build HTML attributes for ANY component type (no hardcoding)
buildHTMLAttributes(comp) {
  const attrs = [];
  
  if (!comp.props) return '';
  
  // 🔥 UNIVERSAL: Map ALL component props to HTML attributes dynamically
  Object.entries(comp.props).forEach(([key, value]) => {
    // Skip props that aren't HTML attributes or are internal/component-specific
    if ([
      'style', 
      'text', 
      'content', 
      'children', 
      'className', 
      'class',
      // 🔥 FIX: Skip icon-specific props (these are used for rendering, not HTML attributes)
      'iconType',
      'iconName',
      'svgData',
      'svgContent',
      'size', // Icon size
      'color', // Icon color
      // Skip other component-specific props
      'variant',
      'isLayoutContainer',
      'projectComponents',
      'sourceFrameName',
      'frameId'
    ].includes(key)) {
      return;
    }
    
    // Handle boolean attributes (disabled, checked, required, controls, autoplay, etc.)
    if (typeof value === 'boolean') {
      if (value) attrs.push(key);
    }
    // Handle string/number attributes
    else if (value !== null && value !== undefined) {
      // Escape double quotes in attribute values
      const escapedValue = String(value).replace(/"/g, '&quot;');
      attrs.push(`${key}="${escapedValue}"`);
    }
  });
  
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
      case 'icon':
      case 'icon-element':
        // 🔥 FIX: Render icon based on library type (Lucide or Heroicons)
        const iconName = comp.props.iconName || comp.name;
        const iconType = comp.props.iconType || 'lucide';
        
        if (comp.props.svgData || comp.props.svgContent) {
          // Custom SVG icon - embed directly
          const svgData = comp.props.svgData || comp.props.svgContent;
          return `<span className="${classes}" dangerouslySetInnerHTML={{ __html: \`${svgData.replace(/`/g, '\\`')}\` }}></span>`;
        }
        
        // Lucide or Heroicons library icons
        if (iconType === 'lucide' || iconType === 'lucide-react') {
          // 🔥 FIX: iconName is already the component name (e.g., "Home", "ChevronLeft")
          const componentName = iconName || 'HelpCircle';
          return `<${componentName} className="${classes}" size={${comp.props.size || 24}} ${comp.props.color ? `color="${comp.props.color}"` : ''} />`;
        } else if (iconType === 'heroicons' || iconType === 'heroicon') {
          // 🔥 FIX: iconName is already the full component name (e.g., "ChevronLeftIcon")
          const componentName = iconName || 'QuestionMarkCircleIcon';
          return `<${componentName} className="${classes}" style={{ width: '${comp.props.size || 24}px', height: '${comp.props.size || 24}px'${comp.props.color ? `, color: '${comp.props.color}'` : ''} }} />`;
        }
        
        // Fallback
        return `<span className="${classes}">{/* ${iconName || 'Icon'} */}</span>`;
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
      case 'icon':
      case 'icon-element':
        // 🔥 FIX: Render icon for HTML output
        const iconNameHTML = comp.props.iconName || comp.name;
        const iconTypeHTML = comp.props.iconType || 'lucide';
        
        if (comp.props.svgData || comp.props.svgContent) {
          // Custom SVG icon - embed directly
          const svgData = comp.props.svgData || comp.props.svgContent;
          return `<span class="${classes}">${svgData}</span>`;
        }
        
        // 🔥 NEW: Lucide icons - use CSS font
        if (iconTypeHTML === 'lucide' || iconTypeHTML === 'lucide-react') {
          const lucideIconName = iconNameHTML ? iconNameHTML.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') : 'help-circle';
          return `<i class="${classes} lucide-${lucideIconName}"></i>`;
        }
        
        // 🔥 NEW: Hero icons - inline SVG from map
        if (iconTypeHTML === 'heroicons' || iconTypeHTML === 'heroicon') {
          const heroSvg = HERO_ICONS_SVG[iconNameHTML];
          if (heroSvg) {
            // We have the SVG - embed it
            return `<span class="${classes}">${heroSvg}</span>`;
          } else {
            // Icon not in map - show placeholder with note
            return `<span class="${classes}"><!-- heroicons: ${iconNameHTML} (SVG not in map) --></span>`;
          }
        }
        
        // Fallback
        return `<span class="${classes}"><!-- ${iconTypeHTML}: ${iconNameHTML || 'Icon'} --></span>`;
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
        
        console.log('🌳 Tree BEFORE flattening:', normalizedComponents.map(c => ({ 
            id: c.id, 
            name: c.name, 
            parentId: c.parentId, 
            childrenCount: c.children?.length || 0 
        })));
        
        const flattenedComponents = this.flattenComponentTree(normalizedComponents, seenIds);
        
        console.log('📏 AFTER flattening:', flattenedComponents.map(c => ({ 
            id: c.id, 
            name: c.name, 
            parentId: c.parentId 
        })));
        
        
        
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
                style_mobile: comp.style_mobile || null, // 🔥 FIXED: Use null to preserve existing DB values
                style_tablet: comp.style_tablet || null, // 🔥 FIXED: Use null to preserve existing DB values
                style_desktop: comp.style_desktop || null, // 🔥 FIXED: Use null to preserve existing DB values
                animation: comp.animation || {},
                isLayoutContainer: comp.isLayoutContainer || false,
                children: comp.children || [],            
                parentId: comp.parentId || null, // 🔥 CRITICAL FIX: Send parentId (camelCase) to match backend validation
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
            ).length,
            allComponents: mappedComponents.map(c => ({ 
                id: c.id, 
                name: c.name, 
                parentId: c.parentId,
                hasChildren: c.children?.length > 0 
            }))
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
        
        // 🔥 CRITICAL FIX: The parentId parameter is the SOURCE OF TRUTH
        // If this component is in a parent's children array, the parameter tells us the correct parent
        // The component's own parentId might be stale from a previous operation
        const flatComp = {
            ...comp,
            parentId: parentId, // ✅ Use the parameter - it represents the actual tree structure
            style: comp.style || {}, // ✅ Explicitly preserve
            props: comp.props || {}, // ✅ Explicitly preserve
        };
        
        flattened.push(flatComp);
        
        if (comp.children && comp.children.length > 0) {
            // Pass comp.id as parentId for children - this establishes the parent-child relationship
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
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      console.error('Style requested:', style);
      console.error('Components count:', components?.length);
      return {
        react: `// Error generating code for Frame: ${frameName}\n// Error: ${error.message}\nfunction ${frameName}() {\n  return <div>Error generating code</div>;\n}`,
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

  // 🔥 GRADIENT FIX: Helper to parse gradient from backgroundImage
  parseGradient(backgroundImage) {
    if (!backgroundImage || typeof backgroundImage !== 'string') return null;
    
    // Check if it's a gradient
    const gradientMatch = backgroundImage.match(/(linear|radial|conic)-gradient\(([^)]+)\)/);
    if (!gradientMatch) return null;
    
    const type = gradientMatch[1]; // linear, radial, or conic
    const gradientContent = gradientMatch[2];
    
    // Extract direction (for linear gradients)
    let direction = 'to right'; // default
    const directionMatch = gradientContent.match(/^(to\s+\w+|[\d.]+deg),?\s*/);
    if (directionMatch) {
      direction = directionMatch[1];
    }
    
    // Extract colors
    const colorMatches = gradientContent.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/g);
    const colors = colorMatches || [];
    
    return {
      type,
      direction,
      colors,
      raw: backgroundImage
    };
  }

  // 🔥 GRADIENT FIX: Convert gradient to Tailwind classes
  convertGradientToTailwind(backgroundImage) {
    const gradient = this.parseGradient(backgroundImage);
    if (!gradient) return null;
    
    const classes = [];
    
    // Map direction to Tailwind gradient direction
    const directionMap = {
      'to right': 'bg-gradient-to-r',
      'to left': 'bg-gradient-to-l',
      'to top': 'bg-gradient-to-t',
      'to bottom': 'bg-gradient-to-b',
      'to top right': 'bg-gradient-to-tr',
      'to top left': 'bg-gradient-to-tl',
      'to bottom right': 'bg-gradient-to-br',
      'to bottom left': 'bg-gradient-to-bl',
      '90deg': 'bg-gradient-to-r',
      '180deg': 'bg-gradient-to-b',
      '270deg': 'bg-gradient-to-l',
      '0deg': 'bg-gradient-to-t',
      '45deg': 'bg-gradient-to-tr',
      '135deg': 'bg-gradient-to-br',
      '225deg': 'bg-gradient-to-bl',
      '315deg': 'bg-gradient-to-tl',
    };
    
    // Add gradient direction class
    classes.push(directionMap[gradient.direction] || 'bg-gradient-to-r');
    
    // Convert colors to Tailwind from-/via-/to- classes
    if (gradient.colors.length >= 2) {
      // First color = from
      const fromColor = this.convertColorToTailwind('from', gradient.colors[0]);
      if (fromColor) classes.push(fromColor);
      
      // Last color = to
      const toColor = this.convertColorToTailwind('to', gradient.colors[gradient.colors.length - 1]);
      if (toColor) classes.push(toColor);
      
      // Middle colors = via (if more than 2 colors)
      if (gradient.colors.length > 2) {
        const viaColor = this.convertColorToTailwind('via', gradient.colors[1]);
        if (viaColor) classes.push(viaColor);
      }
    }
    
    return classes.filter(Boolean).join(' ');
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
    
    // 🔥 Collect icon imports from all components (including nested)
    const collectIcons = (components) => {
      const icons = [];
      components.forEach(comp => {
        if ((comp.type === 'icon' || comp.type === 'icon-element') && comp.props?.iconType && comp.props?.iconName) {
          icons.push({
            type: comp.props.iconType,
            name: comp.props.iconName
          });
        }
        if (comp.children && comp.children.length > 0) {
          icons.push(...collectIcons(comp.children));
        }
      });
      return icons;
    };
    
    const icons = collectIcons(allComponents);
    // 🔥 FIX: iconName already contains the correct library name - use directly
    const lucideIcons = [...new Set(icons.filter(i => i.type === 'lucide' || i.type === 'lucide-react').map(i => i.name))];
    const heroIcons = [...new Set(icons.filter(i => i.type === 'heroicons' || i.type === 'heroicon').map(i => i.name))];
    
    const iconImports = [];
    if (lucideIcons.length > 0) {
      iconImports.push(`import { ${lucideIcons.join(', ')} } from 'lucide-react';`);
    }
    if (heroIcons.length > 0) {
      iconImports.push(`import { ${heroIcons.join(', ')} } from '@heroicons/react/24/outline';`);
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
        
        // 🔥 Handle icon type specially
        if (comp.type === 'icon' || comp.type === 'icon-element') {
          const iconName = comp.props?.iconName || comp.name;
          const iconType = comp.props?.iconType || 'lucide';
          const classes = this.buildDynamicTailwindClasses(comp);
          
          if (comp.props?.svgData || comp.props?.svgContent) {
            // Custom SVG icon
            const svgData = comp.props.svgData || comp.props.svgContent;
            return `${indent}<span${classes ? ` className="${classes}"` : ''} dangerouslySetInnerHTML={{ __html: \`${svgData.replace(/`/g, '\\`')}\` }} />`;
          }
          
          // 🔥 FIX: iconName is already the correct component name - use directly
          if (iconType === 'lucide' || iconType === 'lucide-react') {
            const componentName = iconName || 'HelpCircle';
            return `${indent}<${componentName}${classes ? ` className="${classes}"` : ''} size={${comp.props?.size || 24}}${comp.props?.color ? ` color="${comp.props.color}"` : ''} />`;
          } else if (iconType === 'heroicons' || iconType === 'heroicon') {
            const componentName = iconName || 'QuestionMarkCircleIcon';
            return `${indent}<${componentName}${classes ? ` className="${classes}"` : ''} style={{ width: '${comp.props?.size || 24}px', height: '${comp.props?.size || 24}px'${comp.props?.color ? `, color: '${comp.props.color}'` : ''} }} />`;
          }
          
          // Fallback
          return `${indent}<span${classes ? ` className="${classes}"` : ''}>{/* ${iconName || 'Icon'} */}</span>`;
        }
        
        const classes = this.buildDynamicTailwindClasses(comp);
        const content = this.extractComponentContent(comp);
        const hasChildren = comp.children && comp.children.length > 0;
        // 🔥 UNIFIED: Use the SAME method as rendering for ALL HTML elements
        const tag = this.getHTMLTag(comp.type);
        
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
          if (['input', 'img', 'image', 'br', 'hr'].includes(comp.type)) {
            return `${indent}<${tag}${classes ? ` className="${classes}"` : ''}${props ? ` ${props}` : ''} />`;
          }
          jsx += `</${tag}>`;
        }
        
        return jsx;
      }).join('\n');
    };

    const reactComponents = renderReactTree(allComponents);
    const iconImportsSection = iconImports.length > 0 ? iconImports.join('\n') + '\n' : '';
    
    return {
      react: `import React from 'react';\n${iconImportsSection}\nfunction ${frameName}() {\n  return (\n    <div className="w-full min-h-screen">\n${reactComponents}\n    </div>\n  );\n}\n\nexport default ${frameName};`,
      tailwind: allComponents.map(comp => 
        `/* ${comp.name} (${comp.type}) */\n${this.buildDynamicTailwindClasses(comp)}`
      ).join('\n\n')
    };
  }
}

// Create singleton instance
export const componentLibraryService = new ComponentLibraryService();
export default componentLibraryService;