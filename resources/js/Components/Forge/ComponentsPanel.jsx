// @/Components/Forge/ComponentsPanel.jsx - Enhanced with Category Dropdowns
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Code, 
  Search, 
  ChevronDown,
  ChevronRight,
  Square,
  User,
  Tag,
  Layout,
  Menu,
  Zap,
  Move,
  Palette,
  Sparkles,
  MousePointer,
  Image,
  Play
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

const ComponentsPanel = ({ 
  onComponentDragStart, 
  onComponentDragEnd,
  activeTab = 'elements',
  searchTerm = '',
  onTabChange,
  onSearch
}) => {
  const [components, setComponents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showVariants, setShowVariants] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    layout: true, // Layout expanded by default
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
  
  useEffect(() => {
    if (showVariants) {
      setShowVariants(false);
      setSelectedComponent(null);
    }
  }, [currentActiveTab]);

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

  const handleTabChange = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
    setSelectedLetter(null);
    if (onSearch) {
      onSearch('');
    } else {
      setInternalSearchTerm('');
    }
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
      setSelectedComponent(component);
      setShowVariants(true);
    } else {
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

  const handleVariantDragStart = (e, component, variant) => {
    e.stopPropagation();
    
    const dragData = {
      componentType: component.type,
      variant: variant,
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
    
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    
    // Create drag preview
    const dragPreview = document.createElement('div');
    dragPreview.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      z-index: 9999;
      padding: 8px;
      background: var(--color-surface);
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      pointer-events: none;
      box-shadow: var(--shadow-lg);
      border: 2px solid var(--color-border);
      max-width: 120px;
      max-height: 60px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    if (variant.preview_code) {
      dragPreview.innerHTML = `
        <div style="transform: scale(0.8); transform-origin: center;">
          ${variant.preview_code.replace(/className=/g, 'class=')}
        </div>
      `;
    } else {
      dragPreview.innerHTML = `
        <div style="padding: 4px 8px; background: var(--color-bg-muted); border-radius: 4px; font-size: 10px; color: var(--color-text);">
          ${variant.name || component.name}
        </div>
      `;
    }
    
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 60, 30);
    
    setTimeout(() => {
      if (document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview);
      }
    }, 100);
    
    if (onComponentDragStart) {
      onComponentDragStart(e, component.type, variant, dragData);
    }
  };

  const handleVariantDragEnd = (e) => {
    if (onComponentDragEnd) {
      onComponentDragEnd(e);
    }
  };

  const handleBackClick = () => {
    setShowVariants(false);
    setSelectedComponent(null);
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
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Tabs Section */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="relative rounded-xl p-1" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg shadow-md"
            style={{ backgroundColor: 'var(--color-surface)' }}
            initial={false}
            animate={{
              left: currentActiveTab === tabConfig.tabs[0].id ? '4px' : 'calc(50% + 2px)',
              width: 'calc(50% - 6px)'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          
          <div className="relative z-10 grid grid-cols-2 gap-1">
            {tabConfig.tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = currentActiveTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)]'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder={`Search ${currentActiveTab}...`}
            value={currentSearchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border-0 border-b focus:outline-none transition-colors"
            style={{ 
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-bg)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!showVariants ? (
            <motion.div
              key="category-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
            >
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
                                      <div 
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                        style={{ backgroundColor: categoryInfo.color }}
                                      >
                                        <IconComponent className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm group-hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text)' }}>
                                          {component.name}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                          {component.description}
                                        </div>
                                        {variantCount > 0 && (
                                          <div className="mt-1 text-xs" style={{ color: categoryInfo.color }}>
                                            {variantCount} variant{variantCount !== 1 ? 's' : ''}
                                          </div>
                                        )}
                                      </div>
                                      <div className="w-2 h-2 rounded-full group-hover:scale-150 transition-transform" style={{ backgroundColor: categoryInfo.color }}></div>
                                    </div>
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
          ) : (
            <motion.div
              key="variants"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-hidden"
            >
              {/* Back Button */}
              <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <motion.button
                  onClick={handleBackClick}
                  className="flex items-center space-x-2 transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-text-muted)' }}
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span className="text-sm">Back to {currentActiveTab}</span>
                </motion.button>
                
                <div className="mt-2">
                  <h3 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                    {selectedComponent?.name}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {selectedComponent?.description}
                  </p>
                </div>
              </div>

              {/* Variants Grid */}
              <div className="flex-1 overflow-y-auto p-3">
                <motion.div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="grid grid-cols-1 gap-2">
                    {selectedComponent?.variants?.map((variant, index) => (
                      <motion.div
                        key={`${selectedComponent.id}-${variant.name || index}`}
                        className="group relative"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        draggable
                        onDragStart={(e) => handleVariantDragStart(e, selectedComponent, variant)}
                        onDragEnd={handleVariantDragEnd}
                      >
                        <div 
                          className="rounded-lg p-3 border transition-all duration-300 shadow-sm hover:shadow-lg relative overflow-hidden backdrop-blur-sm cursor-grab active:cursor-grabbing"
                          style={{ 
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                            e.currentTarget.style.transform = 'translateY(0px)';
                          }}
                        >
                          <div className="flex items-start gap-3 w-full min-w-0 relative z-10">
                            {/* Variant Preview */}
                            <div 
                              className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center border cursor-grab active:cursor-grabbing"
                              style={{ 
                                background: `linear-gradient(135deg, var(--color-bg-muted), var(--color-surface))`,
                                width: '56px',
                                height: '40px',
                                borderColor: 'var(--color-border)'
                              }}
                              draggable
                              onDragStart={(e) => handleVariantDragStart(e, selectedComponent, variant)}
                              onDragEnd={handleVariantDragEnd}
                              title="Drag this component to canvas"
                            >
                              {variant.preview_code && (
                                <div 
                                  className="transform scale-[0.4] origin-center w-full h-full flex items-center justify-center"
                                  style={{ fontSize: '10px' }}
                                  dangerouslySetInnerHTML={{ 
                                    __html: variant.preview_code.replace(/className=/g, 'class=') 
                                  }}
                                />
                              )}
                              {!variant.preview_code && (
                                <Sparkles 
                                  className="w-4 h-4"
                                  style={{ color: 'var(--color-primary)' }}
                                />
                              )}
                              
                              <div className="absolute top-0 right-0 opacity-0 hover:opacity-100 transition-all duration-300">
                                <div 
                                  className="p-1 rounded-full"
                                  style={{ backgroundColor: 'var(--color-primary)' }}
                                >
                                  <Move className="w-2 h-2 text-white" />
                                </div>
                              </div>
                            </div>
                            
                            {/* Variant Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 
                                  className="font-semibold text-sm group-hover:opacity-90 transition-colors truncate"
                                  style={{ color: 'var(--color-text)' }}
                                  title={variant.name || `Variant ${index + 1}`}
                                >
                                  {variant.name || `Variant ${index + 1}`}
                                </h4>
                              </div>
                              
                              {variant.description && (
                                <p className="text-xs mb-2 truncate" style={{ color: 'var(--color-text-muted)' }}>
                                  {variant.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {(!selectedComponent?.variants || selectedComponent.variants.length === 0) && (
                    <div className="text-center py-8">
                      <div style={{ color: 'var(--color-text-muted)' }}>
                        No variants available for this component
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ComponentsPanel;