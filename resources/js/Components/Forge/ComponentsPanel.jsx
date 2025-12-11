// @/Components/Forge/ComponentsPanel.jsx - FIXED Tab Switching Reset
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Code, Search, ChevronDown, ChevronRight, Square, User, Tag, 
  Layout, Menu, Zap, Move, Palette, Sparkles, MousePointer, Image, Play,
  Type, X, ChevronLeft 
} from 'lucide-react';
import axios from 'axios';

const iconMap = {
  Square, Code, Layers, User, Layout, Search, Menu, Zap, Tag, Palette, Sparkles, MousePointer, Image, Play
};

// Category definitions with icons and descriptions
const CATEGORIES = {
  layout: {
    icon: Layout,
    label: 'Layout',
    description: 'Structural elements and containers',
    color: '#10b981'
  },
  interactive: {
    icon: MousePointer,
    label: 'Interactive',
    description: 'Buttons, forms, and interactive elements',
    color: '#3b82f6'
  },
  media: {
    icon: Image,
    label: 'Media',
    description: 'Images, videos, and media elements',
    color: '#f59e0b'
  },
  display: {
    icon: Sparkles,
    label: 'Display',
    description: 'Text, badges, and visual elements',
    color: '#8b5cf6'
  },
  navigation: {
    icon: Menu,
    label: 'Navigation',
    description: 'Navigation bars and menus',
    color: '#ef4444'
  },
  form: {
    icon: Tag,
    label: 'Forms',
    description: 'Form inputs and controls',
    color: '#06b6d4'
  }
};



// 🔥 NEW: VARIANT SLIDE PANEL COMPONENT
const VariantSlidePanel = ({ 
  isOpen, 
  component, 
  dockPosition = 'left', 
  onClose,
  onVariantDragStart,
  onVariantDragEnd 
}) => {
  const [hoveredVariant, setHoveredVariant] = useState(null);
  const panelRef = useRef(null);
  const dragImageRef = useRef(null);
  
  const slideDirection = dockPosition === 'left' ? 1 : -1;
  const slideX = slideDirection * 100;
  
  const panelPosition = dockPosition === 'left' 
    ? { left: '320px', right: 'auto' } 
    : { right: '320px', left: 'auto' };

  const handleDragStart = (e, variant) => {
  const dragData = {
    componentType: component.type,
    variant,
    component: {
      id: component.id,
      name: component.name,
      type: component.type,
      description: component.description,
      default_props: component.default_props,
      prop_definitions: component.prop_definitions,
      category: component.category,
      icon: component.icon
    }
  };

  try {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  } catch {}

  // 🔥 FIXED: Create drag image from VARIANT PREVIEW ONLY (no card wrapper)
  try {
    const dragImg = document.createElement('div');
    dragImg.style.cssText = `
      position: absolute;
      top: -10000px;
      left: -10000px;
      background: transparent;
      pointer-events: none;
    `;

    // 🔥 CRITICAL: Get ONLY the preview element, not the card
    const previewHTML = variant?.preview_code || '<div style="width:40px;height:40px;background:#e5e7eb;border-radius:4px;"></div>';
    dragImg.innerHTML = previewHTML.replace(/className=/g, 'class=');

    document.body.appendChild(dragImg);
    dragImageRef.current = dragImg;

    requestAnimationFrame(() => {
      try {
        const rect = dragImg.getBoundingClientRect();
        
        // Use actual rendered size, no scaling needed
        const offsetX = Math.round(rect.width / 2);
        const offsetY = Math.round(rect.height / 2);
        
        e.dataTransfer.setDragImage(dragImg, offsetX, offsetY);
      } catch {}
    });
  } catch {}

  onVariantDragStart?.(e, component.type, variant, dragData);
};


  const handleDragEnd = (e) => {
    // Cleanup drag image
    try {
      if (dragImageRef.current && dragImageRef.current.parentNode) {
        dragImageRef.current.parentNode.removeChild(dragImageRef.current);
      }
      dragImageRef.current = null;
    } catch {}

    onVariantDragEnd?.(e);
  };

  if (!component || !component.variants || component.variants.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[5]"
            onClick={onClose}
          />
          
          <motion.div
            ref={panelRef}
            initial={{ x: slideX, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slideX, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
            className="fixed top-10 bottom-0 w-[200px] z-[10] overflow-hidden"
            style={{
              ...panelPosition,
              backgroundColor: 'var(--color-surface)',
              borderLeft: dockPosition === 'right' ? '1px solid var(--color-border)' : 'none',
              borderRight: dockPosition === 'left' ? '1px solid var(--color-border)' : 'none',
              boxShadow: dockPosition === 'left' 
                ? '4px 0 24px rgba(0,0,0,0.1)' 
                : '-4px 0 24px rgba(0,0,0,0.1)'
            }}
          >
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{ 
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)' 
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg transition-colors hover:bg-black/5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {dockPosition === 'left' ? (
                    <ChevronLeft className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
                
                <div>
                  <h3 
                    className="font-semibold text-base"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {component.name}
                  </h3>
                  <p 
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {component.variants.length} variant{component.variants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              
            </div>
            
            <div className="overflow-y-auto h-[calc(100vh-120px)] p-4">
              <div className="grid grid-cols-1 gap-3">
                {component.variants.map((variant, index) => (
                  <motion.div
                    key={`${component.id}-${variant.name || index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group cursor-grab active:cursor-grabbing"
                    onMouseEnter={() => setHoveredVariant(index)}
                    onMouseLeave={() => setHoveredVariant(null)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, variant)}
                    onDragEnd={handleDragEnd}
                  >
                    <div
                      className="relative overflow-hidden rounded-xl border-2 transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: hoveredVariant === index 
                          ? 'var(--color-primary)' 
                          : 'var(--color-border)',
                        aspectRatio: '1',
                        boxShadow: hoveredVariant === index 
                          ? '0 8px 24px rgba(0,0,0,0.12)' 
                          : '0 2px 8px rgba(0,0,0,0.06)'
                      }}
                      data-variant-card
                    >
                      <div 
                        className="absolute inset-0 flex items-center justify-center p-4"
                        style={{
                          background: 'linear-gradient(135deg, var(--color-bg-muted), var(--color-surface))'
                        }}
                      >
                        {variant.preview_code ? (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ fontSize: '14px' }}
                            data-variant-preview
                            dangerouslySetInnerHTML={{ 
                              __html: variant.preview_code.replace(/className=/g, 'class=') 
                            }}
                          />
                        ) : (
                          <div data-variant-preview>
                            <Sparkles 
                              className="w-12 h-12"
                              style={{ color: 'var(--color-primary)' }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ 
                          y: hoveredVariant === index ? 0 : 100,
                          opacity: hoveredVariant === index ? 1 : 0
                        }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-x-0 bottom-0 p-3"
                        style={{
                          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        <h4 className="font-semibold text-sm text-white truncate">
                          {variant.name || `Variant ${index + 1}`}
                        </h4>
                        {variant.description && (
                          <p className="text-xs text-white/80 truncate mt-0.5">
                            {variant.description}
                          </p>
                        )}
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: hoveredVariant === index ? 1 : 0 
                        }}
                        className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'white'
                        }}
                      >
                        Drag
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {component.variants.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles 
                    className="w-12 h-12 mx-auto mb-3"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    No variants available
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};



const ComponentsPanel = ({ 
  onComponentDragStart, 
  onComponentDragEnd,
  activeTab = 'elements',
  searchTerm = '',
  onTabChange,
  onSearch,
  dockPosition = 'left' // 🔥 ADD THIS LINE
}) => {
  const [components, setComponents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showVariants, setShowVariants] = useState(false);
  const [expandedVariantComponent, setExpandedVariantComponent] = useState(null); // For desktop inline variants
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    layout: false, // Layout expanded by default
    interactive: false,
    media: false,
    display: false,
    navigation: false,
    form: false
  });

  // Internal state for tabs and search when not controlled externally
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab);
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm);

  // Use internal state if external handlers are not provided
  const currentActiveTab = onTabChange ? activeTab : internalActiveTab;
  const currentSearchTerm = onSearch ? searchTerm : internalSearchTerm;

  // Tab configuration
  const tabConfig = {
    tabs: [
      { id: 'elements', label: 'Elements', icon: Square },
      { id: 'components', label: 'Components', icon: Code }
    ]
  };
  
  // CLEANER FIX: Use a ref to track tab changes and avoid the useEffect loop
  const previousTabRef = useRef(currentActiveTab);
  
  // 🔥 Detect mobile vs desktop for variant display
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only reset if the tab actually changed
    if (previousTabRef.current !== currentActiveTab) {
      console.log('ComponentsPanel: Tab changed from', previousTabRef.current, 'to:', currentActiveTab);
      setShowVariants(false);
      setSelectedComponent(null);
      setExpandedVariantComponent(null); // Also close expanded variants
      previousTabRef.current = currentActiveTab;
    }
  }, [currentActiveTab]); // Remove showVariants from dependencies

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/components');
      
      if (response.data.success) {
        const allComponents = response.data.data;
        
        // Group by component_type (elements vs components)
        const grouped = { elements: {}, components: {} };
        
        Object.entries(allComponents).forEach(([componentType, letterGroups]) => {
          if (letterGroups && typeof letterGroups === 'object') {
            Object.entries(letterGroups).forEach(([letter, componentList]) => {
              if (Array.isArray(componentList)) {
                if (!grouped[componentType][letter]) {
                  grouped[componentType][letter] = [];
                }
                
                const processedComponents = componentList.map(component => {
                  let variants = component.variants;
                  if (typeof variants === 'string') {
                    try {
                      variants = JSON.parse(variants);
                    } catch (e) {
                      variants = [];
                    }
                  }
                  if (!Array.isArray(variants)) {
                    variants = [];
                  }
                  
                  return {
                    ...component,
                    variants: variants,
                    alphabet_group: component.alphabet_group || component.name?.charAt(0)?.toUpperCase() || 'A'
                  };
                });
                
                grouped[componentType][letter] = [...grouped[componentType][letter], ...processedComponents];
              }
            });
          }
        });
        
        setComponents(grouped);
      } else {
        setError('Failed to load components: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Failed to load components: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group components by category
  const componentsByCategory = useMemo(() => {
    const currentTypeComponents = components[currentActiveTab] || {};
    const categorized = {};
    
    // Initialize all categories
    Object.keys(CATEGORIES).forEach(category => {
      categorized[category] = [];
    });
    
    // Sort components into categories
    Object.entries(currentTypeComponents).forEach(([letter, letterComponents]) => {
      if (!Array.isArray(letterComponents)) return;
      
      letterComponents.forEach(component => {
        // Skip if search term doesn't match
        if (currentSearchTerm && 
            !component.name?.toLowerCase().includes(currentSearchTerm.toLowerCase()) &&
            !component.description?.toLowerCase().includes(currentSearchTerm.toLowerCase()) &&
            !component.category?.toLowerCase().includes(currentSearchTerm.toLowerCase())) {
          return;
        }

        const category = component.category || 'layout';
        if (categorized[category]) {
          categorized[category].push(component);
        } else {
          categorized['layout'].push(component); // Fallback to layout
        }
      });
    });
    
    return categorized;
  }, [components, currentActiveTab, currentSearchTerm]);

  // FIXED: Enhanced tab change handler with proper reset
  const handleTabChange = (tab) => {
    console.log('ComponentsPanel: handleTabChange called with tab:', tab);
    
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
    
    // CRITICAL: Always reset variants view when changing tabs
    setShowVariants(false);
    setSelectedComponent(null);
    setSelectedLetter(null);
    
    // Clear search as well
    if (onSearch) {
      onSearch('');
    } else {
      setInternalSearchTerm('');
    }
    
    console.log('ComponentsPanel: Tab change completed, variants view reset');
  };

  const handleSearch = (value) => {
    if (onSearch) {
      onSearch(value);
    } else {
      setInternalSearchTerm(value);
    }
  };

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const handleComponentClick = (component) => {
    if (component.variants && Array.isArray(component.variants) && component.variants.length > 0) {
      console.log('ComponentsPanel: Showing variants for component:', component.name);
      
      if (isMobile) {
        // 📱 Mobile: Use VariantSlidePanel as modal
        setSelectedComponent(component);
        setShowVariants(true);
      } else {
        // 🖥️ Desktop: Toggle inline variants
        if (expandedVariantComponent?.type === component.type) {
          // Clicking same component again - collapse
          setExpandedVariantComponent(null);
        } else {
          // Expand this component's variants
          setExpandedVariantComponent(component);
        }
      }
    } else {
      console.log('ComponentsPanel: No variants, starting drag for component:', component.name);
      handleMainComponentDragStart(component);
    }
  };

  const handleMainComponentDragStart = (component) => {
    const dragData = {
      componentType: component.type,
      variant: null,
      component: {
        name: component.name,
        type: component.type,
        description: component.description,
        default_props: component.default_props,
        prop_definitions: component.prop_definitions
      }
    };

    const syntheticEvent = {
      dataTransfer: {
        effectAllowed: 'copy',
        setData: (type, data) => JSON.stringify(dragData)
      }
    };

    if (onComponentDragStart) {
      onComponentDragStart(syntheticEvent, component.type, null);
    }
  };

 

 

 // 🔥 ADD: Variant drag handlers for slide panel
const handleVariantDragStart = (e, componentType, variant, dragData) => {
  console.log('🎬 Variant drag started:', variant.name);
  if (onComponentDragStart) {
    onComponentDragStart(e, componentType, variant, dragData);
  }
};

const handleVariantDragEnd = (e) => {
  console.log('🎯 Variant drag ended');
  setShowVariants(false); // Close slide panel after drop
  if (onComponentDragEnd) {
    onComponentDragEnd(e);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center space-y-4">
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-primary)' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span style={{ color: 'var(--color-text-muted)' }}>Loading components...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="mb-2" style={{ color: 'var(--color-text)' }}>{error}</div>
        <button 
          onClick={fetchComponents}
          className="px-4 py-2 rounded transition-colors hover:opacity-90"
          style={{ 
            backgroundColor: 'var(--color-primary)', 
            color: 'white'
          }}
        >
          Retry
        </button>
      </div>
    );
  }


    return (
  <>
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Main Content with improved transitions */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!showVariants && (
            <motion.div
              key="category-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
            >
            
            {/* 🔥 ADD: Special Pseudo-Element Section at TOP */}
            {!showVariants && (
              <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  SPECIAL ELEMENTS
                </div>
                {(() => {
                  // Find text-node component
                  const textNode = Object.values(components[currentActiveTab] || {})
                    .flat()
                    .find(c => c.type === 'text-node');
                  
                  if (!textNode) return null;
                  
                  return (
                    <motion.div
                      className="group p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      style={{ 
                        borderColor: 'var(--color-primary)',
                        backgroundColor: 'var(--color-primary-soft)'
                      }}
                      onClick={() => handleComponentClick(textNode)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          <Type className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                            {textNode.name}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {textNode.description}
                          </div>
                          <div className="mt-1 text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                            ⚠️ Pseudo-element (no wrapper)
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </div>
            )}

              {/* Categories with Dropdowns */}
              <div className="space-y-2 p-4">
                {Object.entries(CATEGORIES).map(([categoryKey, categoryInfo]) => {
                  const categoryComponents = componentsByCategory[categoryKey] || [];
                  const isExpanded = expandedCategories[categoryKey];
                  const hasComponents = categoryComponents.length > 0;
                  const CategoryIcon = categoryInfo.icon;

                  if (!hasComponents && currentSearchTerm) return null; // Hide empty categories when searching

                  return (
                    <div key={categoryKey} className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(categoryKey)}
                        className="w-full flex items-center justify-between p-3 transition-all hover:opacity-80"
                        style={{ 
                          backgroundColor: hasComponents ? 'var(--color-surface)' : 'var(--color-bg-muted)',
                          opacity: hasComponents ? 1 : 0.5
                        }}
                        disabled={!hasComponents}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: categoryInfo.color }}
                          >
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                              {categoryInfo.label}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                              {hasComponents ? `${categoryComponents.length} items` : 'No items'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full" style={{ 
                            backgroundColor: hasComponents ? categoryInfo.color + '20' : 'var(--color-bg-muted)', 
                            color: hasComponents ? categoryInfo.color : 'var(--color-text-muted)'
                          }}>
                            {categoryComponents.length}
                          </span>
                          {hasComponents && (
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                            </motion.div>
                          )}
                        </div>
                      </button>

                      {/* Category Content */}
                      <AnimatePresence>
                        {isExpanded && hasComponents && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 space-y-2" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                              {categoryComponents.map((component) => {
                                const IconComponent = iconMap[component.icon] || Square;
                                const variantCount = Array.isArray(component.variants) ? component.variants.length : 0;
                                
                                return (
                                  <motion.div
                                    key={component.id}
                                    className="group p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                                    style={{ 
                                      borderColor: 'var(--color-border)',
                                      backgroundColor: 'var(--color-surface)'
                                    }}
                                    onClick={() => handleComponentClick(component)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = categoryInfo.color;
                                      e.currentTarget.style.boxShadow = `0 4px 20px ${categoryInfo.color}20`;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = 'var(--color-border)';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      {/* Preview Thumbnail */}
                                      {component.preview_code ? (
                                        <div 
                                          className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden border"
                                          style={{ 
                                            backgroundColor: 'var(--color-bg)',
                                            borderColor: categoryInfo.color + '40'
                                          }}
                                          dangerouslySetInnerHTML={{ 
                                            __html: component.preview_code.replace(/className=/g, 'class=') 
                                          }}
                                        />
                                      ) : (
                                        <div 
                                          className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold"
                                          style={{ backgroundColor: categoryInfo.color }}
                                        >
                                          <IconComponent className="w-8 h-8" />
                                        </div>
                                      )}
                                      
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm group-hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text)' }}>
                                          {component.name}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                          {component.description}
                                        </div>
                                        {variantCount > 0 && (
                                          <div className="mt-1 text-xs" style={{ color: categoryInfo.color }}>
                                            {variantCount} variant{variantCount !== 1 ? 's' : ''} →
                                          </div>
                                        )}
                                      </div>
                                      <div className="w-2 h-2 rounded-full group-hover:scale-150 transition-transform" style={{ backgroundColor: categoryInfo.color }}></div>
                                    </div>
                                    
                                    {/* 🖥️ Desktop: Inline Variants */}
                                    {!isMobile && expandedVariantComponent?.type === component.type && (
                                      <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
                                        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                          Drag a variant to canvas:
                                        </div>
                                        {component.variants.map((variant, idx) => (
                                          <div
                                            key={idx}
                                            className="p-2 rounded-lg border transition-all"
                                            style={{ 
                                              borderColor: categoryInfo.color + '40',
                                              backgroundColor: 'var(--color-bg)',
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.borderColor = categoryInfo.color;
                                              e.currentTarget.style.backgroundColor = categoryInfo.color + '10';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.borderColor = categoryInfo.color + '40';
                                              e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                                            }}
                                          >
                                            {/* Variant Preview Thumbnail - Draggable Only */}
                                            <div
                                              draggable
                                              onDragStart={(e) => {
                                                // Set drag image to be smaller
                                                const dragImage = e.currentTarget.cloneNode(true);
                                                dragImage.style.width = '80px';
                                                dragImage.style.height = '80px';
                                                dragImage.style.transform = 'scale(0.5)';
                                                dragImage.style.opacity = '0.8';
                                                document.body.appendChild(dragImage);
                                                e.dataTransfer.setDragImage(dragImage, 40, 40);
                                                setTimeout(() => document.body.removeChild(dragImage), 0);
                                                
                                                handleVariantDragStart(e, component.type, variant, {
                                                  component: {
                                                    name: component.name,
                                                    type: component.type,
                                                    description: component.description,
                                                    default_props: component.default_props,
                                                    prop_definitions: component.prop_definitions
                                                  }
                                                });
                                              }}
                                              className="cursor-grab active:cursor-grabbing"
                                            >
                                              {variant.preview_code ? (
                                                <div 
                                                  className="w-full aspect-square rounded-lg flex items-center justify-center overflow-hidden"
                                                  style={{ 
                                                    backgroundColor: 'var(--color-surface)',
                                                  }}
                                                  dangerouslySetInnerHTML={{ 
                                                    __html: variant.preview_code.replace(/className=/g, 'class=') 
                                                  }}
                                                />
                                              ) : (
                                                <div 
                                                  className="w-full aspect-square rounded-lg flex items-center justify-center"
                                                  style={{ 
                                                    backgroundColor: categoryInfo.color + '20',
                                                  }}
                                                >
                                                  <Sparkles className="w-8 h-8" style={{ color: categoryInfo.color }} />
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* Empty State */}
                {Object.values(componentsByCategory).every(category => category.length === 0) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                      <Search className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <div style={{ color: 'var(--color-text-muted)' }}>
                      {currentSearchTerm ? `No ${currentActiveTab} found for "${currentSearchTerm}"` : `No ${currentActiveTab} available`}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          
         
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* 🔥 ADD: Variant Slide Panel */}
    <VariantSlidePanel
      isOpen={showVariants}
      component={selectedComponent}
      dockPosition={dockPosition}
      onClose={() => setShowVariants(false)}
      onVariantDragStart={handleVariantDragStart}
      onVariantDragEnd={handleVariantDragEnd}
    />
    </>
  );
};

export default ComponentsPanel;