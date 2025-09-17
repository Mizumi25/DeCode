// Enhanced Drop Handler for CSS-based positioning
export const createEnhancedDropHandler = (onAddComponent, canvasRef) => {
  
  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add visual feedback
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.backgroundColor = 'rgba(59, 130, 246, 0.02)';
      canvas.style.borderColor = 'rgba(59, 130, 246, 0.3)';
    }
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Remove visual feedback
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.backgroundColor = '';
      canvas.style.borderColor = '';
    }

    try {
      const componentData = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (!componentData) {
        console.warn('No component data found in drop event');
        return;
      }

      // Get drop position relative to canvas
      const canvasRect = canvas.getBoundingClientRect();
      const dropX = e.clientX - canvasRect.left;
      const dropY = e.clientY - canvasRect.top;

      // Create the new component with CSS-based positioning
      const newComponent = createComponentWithCSSPositioning(
        componentData, 
        dropX, 
        dropY, 
        canvasRect
      );

      console.log('Dropping component:', newComponent);
      onAddComponent(newComponent);

    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const createComponentWithCSSPositioning = (componentData, dropX, dropY, canvasRect) => {
    const componentId = `${componentData.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine positioning strategy based on component type and drop location
    const positioningStrategy = determinePositioningStrategy(componentData.type, dropX, dropY, canvasRect);
    
    const newComponent = {
      id: componentId,
      type: componentData.type,
      name: componentData.name || getDefaultName(componentData.type),
      props: {
        ...getDefaultProps(componentData.type),
        ...(componentData.variant?.props || {}),
        ...(componentData.props || {})
      },
      style: {
        ...getDefaultStyles(componentData.type),
        ...applyPositioningStrategy(positioningStrategy, dropX, dropY, canvasRect),
        ...(componentData.variant?.style || {}),
        ...(componentData.style || {})
      },
      variant: componentData.variant || null,
      animation: componentData.animation || {},
      zIndex: componentData.zIndex || 1
    };

    return newComponent;
  };

  const determinePositioningStrategy = (componentType, dropX, dropY, canvasRect) => {
    // Block-level elements that should flow naturally
    const blockElements = ['div', 'section', 'header', 'main', 'footer', 'nav', 'article', 'aside'];
    const headingElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const textElements = ['p', 'span'];
    const formElements = ['input', 'textarea', 'button'];
    const mediaElements = ['img', 'video', 'iframe'];

    // Determine if we should use absolute positioning or let it flow naturally
    const isNearEdge = dropX < 50 || dropY < 50 || 
                       dropX > (canvasRect.width - 50) || 
                       dropY > (canvasRect.height - 50);

    // Small components that might need precise positioning
    const smallComponents = ['button', 'input', 'badge', 'avatar'];
    
    if (blockElements.includes(componentType)) {
      return {
        type: 'flow', // Let it flow naturally in document
        insertionPoint: calculateInsertionPoint(dropY, canvasRect)
      };
    }
    
    if (smallComponents.includes(componentType) || isNearEdge) {
      return {
        type: 'absolute', // Position absolutely for precise control
        coordinates: { x: dropX, y: dropY }
      };
    }

    // Default to flow positioning for most elements
    return {
      type: 'flow',
      insertionPoint: calculateInsertionPoint(dropY, canvasRect)
    };
  };

  const calculateInsertionPoint = (dropY, canvasRect) => {
    // Calculate where in the document flow this should be inserted
    const relativeY = dropY / canvasRect.height;
    
    if (relativeY < 0.2) return 'top';
    if (relativeY > 0.8) return 'bottom';
    return 'middle';
  };

  const applyPositioningStrategy = (strategy, dropX, dropY, canvasRect) => {
    const styles = {};
    
    switch (strategy.type) {
      case 'absolute':
        styles.position = 'absolute';
        styles.left = `${Math.max(0, dropX)}px`;
        styles.top = `${Math.max(0, dropY)}px`;
        styles.zIndex = 10;
        break;
        
      case 'flow':
      default:
        // Let the element flow naturally
        styles.position = 'static';
        
        // Add appropriate margins based on insertion point
        switch (strategy.insertionPoint) {
          case 'top':
            styles.marginTop = '0';
            styles.marginBottom = '2rem';
            break;
          case 'bottom':
            styles.marginTop = '2rem';
            styles.marginBottom = '0';
            break;
          case 'middle':
          default:
            styles.marginTop = '1rem';
            styles.marginBottom = '1rem';
            break;
        }
        break;
    }
    
    return styles;
  };

  const getDefaultName = (type) => {
    const names = {
      div: 'Container',
      section: 'Section',
      header: 'Header',
      main: 'Main Content',
      footer: 'Footer',
      nav: 'Navigation',
      article: 'Article',
      aside: 'Sidebar',
      h1: 'Main Heading',
      h2: 'Subheading', 
      h3: 'Section Title',
      h4: 'Subsection Title',
      h5: 'Minor Heading',
      h6: 'Small Heading',
      p: 'Paragraph',
      span: 'Text Span',
      a: 'Link',
      button: 'Button',
      input: 'Input Field',
      textarea: 'Text Area',
      img: 'Image',
      video: 'Video',
      iframe: 'Embed',
      avatar: 'Avatar',
      badge: 'Badge',
      card: 'Card',
      searchbar: 'Search Bar'
    };
    
    return names[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getDefaultProps = (type) => {
    const defaults = {
      // Layout Elements
      div: { showPlaceholder: true },
      section: { showPlaceholder: true },
      header: { showPlaceholder: true },
      main: { showPlaceholder: true },
      footer: { showPlaceholder: true },
      article: { showPlaceholder: true },
      aside: { showPlaceholder: true },
      nav: { showPlaceholder: true },
      
      // Typography
      h1: { text: 'Your Main Heading' },
      h2: { text: 'Your Subheading' },
      h3: { text: 'Section Title' },
      h4: { text: 'Subsection Title' },
      h5: { text: 'Minor Heading' },
      h6: { text: 'Small Heading' },
      p: { text: 'Add your paragraph text here. Click to edit and customize your content.' },
      span: { text: 'Text span' },
      a: { 
        text: 'Link Text', 
        href: 'https://example.com',
        target: '_blank',
        rel: 'noopener noreferrer'
      },
      
      // Interactive Elements
      button: { text: 'Click Me' },
      input: { 
        type: 'text', 
        placeholder: 'Enter text here...',
        required: false,
        disabled: false
      },
      textarea: { 
        placeholder: 'Enter your message...',
        rows: 4,
        required: false,
        disabled: false
      },
      
      // Media Elements
      img: { 
        src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
        alt: 'Placeholder image',
        width: '400',
        height: '300'
      },
      video: { 
        src: '',
        controls: true,
        autoPlay: false,
        loop: false,
        muted: false
      },
      iframe: { 
        src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        width: '560',
        height: '315',
        title: 'Embedded content',
        frameBorder: '0',
        allowFullScreen: true
      },

      // Components
      avatar: {
        size: 'md',
        variant: 'default',
        initials: 'U',
        src: ''
      },
      badge: {
        text: 'Badge',
        variant: 'default',
        size: 'md'
      },
      card: {
        title: 'Card Title',
        content: 'Card content goes here. You can customize this text and add more elements.',
        variant: 'default',
        size: 'md'
      },
      searchbar: {
        placeholder: 'Search...',
        variant: 'default',
        size: 'md'
      }
    };
    
    return defaults[type] || {};
  };

  const getDefaultStyles = (type) => {
    const defaults = {
      // Layout Containers
      div: {
        display: 'block',
        width: '100%',
        minHeight: '100px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '24px',
        margin: '0 0 16px 0'
      },
      section: {
        display: 'block',
        width: '100%',
        minHeight: '200px',
        backgroundColor: '#ffffff',
        padding: '48px 24px',
        margin: '0 0 32px 0'
      },
      header: {
        display: 'block',
        width: '100%',
        minHeight: '80px',
        backgroundColor: '#1e293b',
        color: '#ffffff',
        padding: '24px',
        margin: '0 0 0 0'
      },
      main: {
        display: 'block',
        width: '100%',
        minHeight: '400px',
        backgroundColor: '#ffffff',
        padding: '48px 24px',
        margin: '0'
      },
      footer: {
        display: 'block',
        width: '100%',
        minHeight: '120px',
        backgroundColor: '#334155',
        color: '#ffffff',
        padding: '32px 24px',
        margin: '32px 0 0 0'
      },
      nav: {
        display: 'flex',
        width: '100%',
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        alignItems: 'center',
        padding: '0 24px',
        margin: '0 0 0 0'
      },
      article: {
        display: 'block',
        width: '100%',
        minHeight: '300px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '32px',
        margin: '0 0 24px 0'
      },
      aside: {
        display: 'block',
        width: '300px',
        minHeight: '200px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '24px',
        margin: '0 0 16px 16px'
      },

      // Typography
      h1: {
        fontSize: '3rem',
        fontWeight: '800',
        lineHeight: '1.2',
        color: '#0f172a',
        margin: '0 0 24px 0'
      },
      h2: {
        fontSize: '2.25rem',
        fontWeight: '700',
        lineHeight: '1.3',
        color: '#1e293b',
        margin: '0 0 20px 0'
      },
      h3: {
        fontSize: '1.875rem',
        fontWeight: '600',
        lineHeight: '1.4',
        color: '#334155',
        margin: '0 0 16px 0'
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: '600',
        lineHeight: '1.4',
        color: '#475569',
        margin: '0 0 14px 0'
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: '500',
        lineHeight: '1.5',
        color: '#64748b',
        margin: '0 0 12px 0'
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: '500',
        lineHeight: '1.5',
        color: '#64748b',
        margin: '0 0 10px 0'
      },
      p: {
        fontSize: '1rem',
        lineHeight: '1.7',
        color: '#475569',
        margin: '0 0 16px 0'
      },
      span: {
        fontSize: '1rem',
        color: '#64748b'
      },
      a: {
        color: '#3b82f6',
        textDecoration: 'underline',
        cursor: 'pointer'
      },

      // Interactive Elements
      button: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 24px',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        margin: '0 8px 8px 0'
      },
      input: {
        display: 'block',
        width: '100%',
        maxWidth: '400px',
        padding: '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '1rem',
        backgroundColor: '#ffffff',
        margin: '0 0 16px 0'
      },
      textarea: {
        display: 'block',
        width: '100%',
        maxWidth: '500px',
        padding: '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '1rem',
        backgroundColor: '#ffffff',
        resize: 'vertical',
        margin: '0 0 16px 0'
      },

      // Media Elements
      img: {
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '8px',
        margin: '0 0 16px 0'
      },
      video: {
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '8px',
        margin: '0 0 16px 0'
      },
      iframe: {
        display: 'block',
        border: 'none',
        borderRadius: '8px',
        margin: '0 0 16px 0'
      },

      // Components get their default styles from the component library
      avatar: {},
      badge: {},
      card: {},
      searchbar: {}
    };
    
    return defaults[type] || {
      display: 'block',
      margin: '0 0 16px 0'
    };
  };

  return {
    handleCanvasDragOver,
    handleCanvasDrop
  };
};

// Utility function to handle component updates with CSS positioning
export const handleComponentUpdate = (componentId, property, value, components, setComponents) => {
  setComponents(prevComponents => 
    prevComponents.map(comp => {
      if (comp.id === componentId) {
        const updatedComponent = { ...comp };
        
        if (property === 'style') {
          updatedComponent.style = { ...comp.style, ...value };
        } else if (property === 'props') {
          updatedComponent.props = { ...comp.props, ...value };
        } else {
          updatedComponent[property] = value;
        }
        
        return updatedComponent;
      }
      return comp;
    })
  );
};

// Helper to convert old position system to CSS positioning
export const migratePositionToCss = (component) => {
  if (component.position && typeof component.position === 'object' && component.position.x !== undefined) {
    // Convert old x/y positioning to CSS
    const migratedComponent = { ...component };
    
    if (!migratedComponent.style) {
      migratedComponent.style = {};
    }
    
    // Only convert if not already using CSS positioning
    if (!migratedComponent.style.position || migratedComponent.style.position === 'static') {
      migratedComponent.style.position = 'absolute';
      migratedComponent.style.left = `${component.position.x}px`;
      migratedComponent.style.top = `${component.position.y}px`;
    }
    
    // Remove old position property
    delete migratedComponent.position;
    
    return migratedComponent;
  }
  
  return component;
};

// Enhanced component positioning utilities
export const getComponentBounds = (elementRef) => {
  if (!elementRef.current) return null;
  
  const rect = elementRef.current.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    right: rect.right,
    bottom: rect.bottom
  };
};

// Smart positioning based on content type
export const getSmartPosition = (componentType, dropPosition, canvasRect, existingComponents = []) => {
  const { x: dropX, y: dropY } = dropPosition;
  
  // Block elements should typically flow naturally
  const flowElements = [
    'div', 'section', 'header', 'main', 'footer', 'nav', 'article', 'aside',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'
  ];
  
  // Small elements that benefit from absolute positioning
  const absoluteElements = ['button', 'badge', 'avatar'];
  
  // Media elements that might need specific placement
  const mediaElements = ['img', 'video', 'iframe'];
  
  if (flowElements.includes(componentType)) {
    return {
      position: 'static',
      display: getDefaultDisplay(componentType),
      margin: getDefaultMargin(componentType)
    };
  }
  
  if (absoluteElements.includes(componentType)) {
    return {
      position: 'absolute',
      left: `${Math.max(0, Math.min(dropX, canvasRect.width - 100))}px`,
      top: `${Math.max(0, Math.min(dropY, canvasRect.height - 50))}px`,
      zIndex: 10
    };
  }
  
  // Default to relative positioning for flexibility
  return {
    position: 'relative',
    margin: '1rem 0'
  };
};

const getDefaultDisplay = (componentType) => {
  const displayMap = {
    'nav': 'flex',
    'header': 'block',
    'main': 'block',
    'section': 'block',
    'footer': 'block',
    'div': 'block',
    'article': 'block',
    'aside': 'block',
    'h1': 'block',
    'h2': 'block',
    'h3': 'block',
    'h4': 'block',
    'h5': 'block',
    'h6': 'block',
    'p': 'block',
    'span': 'inline',
    'a': 'inline',
    'button': 'inline-flex',
    'input': 'block',
    'textarea': 'block',
    'img': 'block',
    'video': 'block',
    'iframe': 'block'
  };
  
  return displayMap[componentType] || 'block';
};

const getDefaultMargin = (componentType) => {
  const marginMap = {
    'header': '0 0 0 0',
    'nav': '0 0 0 0', 
    'main': '0',
    'section': '0 0 2rem 0',
    'footer': '2rem 0 0 0',
    'div': '0 0 1rem 0',
    'article': '0 0 1.5rem 0',
    'aside': '0 0 1rem 1rem',
    'h1': '0 0 1.5rem 0',
    'h2': '0 0 1.25rem 0',
    'h3': '0 0 1rem 0',
    'h4': '0 0 0.875rem 0',
    'h5': '0 0 0.75rem 0',
    'h6': '0 0 0.625rem 0',
    'p': '0 0 1rem 0',
    'button': '0 0.5rem 0.5rem 0',
    'input': '0 0 1rem 0',
    'textarea': '0 0 1rem 0',
    'img': '0 0 1rem 0',
    'video': '0 0 1rem 0',
    'iframe': '0 0 1rem 0'
  };
  
  return marginMap[componentType] || '0 0 1rem 0';
}