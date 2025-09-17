import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Code, 
  Search, 
  ChevronLeft,
  Square,
  User,
  Tag,
  Layout,
  Menu,
  Zap,
  Move,
  Palette,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const iconMap = {
  Square,
  Code, 
  Layers,
  User,
  Layout,
  Search,
  Menu,
  Zap,
  Tag,
  Palette,
  Sparkles
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // FIXED: Internal state for tabs and search when not controlled externally
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab);
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm);

  // Use internal state if external handlers are not provided
  const currentActiveTab = onTabChange ? activeTab : internalActiveTab;
  const currentSearchTerm = onSearch ? searchTerm : internalSearchTerm;

  // Alphabet navigation - positioned absolutely on the left
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Tab configuration
  const tabConfig = {
    tabs: [
      {
        id: 'elements',
        label: 'Elements',
        icon: Square
      },
      {
        id: 'components',
        label: 'Components',
        icon: Code
      }
    ]
  };

  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };

    detectTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', detectTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', detectTheme);
    };
  }, []);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/components');
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const allComponents = response.data.data;
        
        // Group by component_type (elements vs components)
        const grouped = {
          elements: {},
          components: {}
        };
        
        // Process the data structure correctly
        Object.entries(allComponents).forEach(([componentType, letterGroups]) => {
          console.log(`Processing ${componentType}:`, letterGroups);
          
          if (letterGroups && typeof letterGroups === 'object') {
            Object.entries(letterGroups).forEach(([letter, componentList]) => {
              if (Array.isArray(componentList)) {
                if (!grouped[componentType][letter]) {
                  grouped[componentType][letter] = [];
                }
                
                // Process each component and ensure variants are properly handled
                const processedComponents = componentList.map(component => {
                  let variants = component.variants;
                  
                  // Handle variants - ensure it's always an array
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
        
        console.log('Grouped components:', grouped);
        setComponents(grouped);
      } else {
        console.error('API returned unsuccessful response:', response.data);
        setError('Failed to load components: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching components:', err);
      setError('Failed to load components: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredComponents = useMemo(() => {
    const currentTypeComponents = components[currentActiveTab] || {};
    
    if (!currentSearchTerm && !selectedLetter) {
      return currentTypeComponents;
    }

    const filtered = {};
    
    Object.entries(currentTypeComponents).forEach(([letter, letterComponents]) => {
      if (!Array.isArray(letterComponents)) {
        console.warn('letterComponents is not an array:', letter, letterComponents);
        return;
      }
      
      const matchingComponents = letterComponents.filter(component =>
        (!currentSearchTerm || 
         (component.name && component.name.toLowerCase().includes(currentSearchTerm.toLowerCase())) ||
         (component.description && component.description.toLowerCase().includes(currentSearchTerm.toLowerCase())) ||
         (component.category && component.category.toLowerCase().includes(currentSearchTerm.toLowerCase()))) &&
        (!selectedLetter || letter === selectedLetter)
      );
      
      if (matchingComponents.length > 0) {
        filtered[letter] = matchingComponents;
      }
    });
    
    return filtered;
  }, [components, currentActiveTab, currentSearchTerm, selectedLetter]);

  const availableLetters = useMemo(() => {
    return Object.keys(components[currentActiveTab] || {}).sort();
  }, [components, currentActiveTab]);

  const handleLetterClick = (letter) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null);
    } else {
      setSelectedLetter(letter);
    }
  };

  // FIXED: Tab change handler
  const handleTabChange = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
    // Reset letter selection when switching tabs
    setSelectedLetter(null);
    // Reset search when switching tabs
    if (onSearch) {
      onSearch('');
    } else {
      setInternalSearchTerm('');
    }
  };

  // FIXED: Search handler
  const handleSearch = (value) => {
    if (onSearch) {
      onSearch(value);
    } else {
      setInternalSearchTerm(value);
    }
  };

  const handleComponentClick = (component) => {
    console.log('Component clicked:', component.name, 'Variants:', component.variants);
    
    if (component.variants && Array.isArray(component.variants) && component.variants.length > 0) {
      setSelectedComponent(component);
      setShowVariants(true);
    } else {
      // Handle direct component selection for those without variants
      handleMainComponentDragStart(component);
    }
  };

  // Fixed drag handlers for main components (without variants)
  const handleMainComponentDragStart = (component) => {
    console.log('Starting drag for main component:', component.type);
    
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

    // Create a synthetic drag event
    const syntheticEvent = {
      dataTransfer: {
        effectAllowed: 'copy',
        setData: (type, data) => {
          console.log('Setting drag data:', dragData);
          return JSON.stringify(dragData);
        }
      }
    };

    if (onComponentDragStart) {
      onComponentDragStart(syntheticEvent, component.type, null);
    }
  };

  // FIXED: Enhanced variant drag start handler with proper HTML5 drag API and constrained preview
  const handleVariantDragStart = (e, component, variant) => {
    e.stopPropagation();
    console.log('Variant drag started:', variant.name, 'from component:', component.name);
    
    // Set drag data properly with complete component info
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
    
    console.log('Setting variant drag data:', dragData);
    
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    
    // FIXED: Create a compact drag preview showing only the UI component
    const dragPreview = document.createElement('div');
    dragPreview.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      z-index: 9999;
      padding: 8px;
      background: white;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      pointer-events: none;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: 2px solid #e5e7eb;
      max-width: 120px;
      max-height: 60px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // FIXED: Only show the actual UI preview, not the variant card
    if (variant.preview_code) {
      dragPreview.innerHTML = `
        <div style="transform: scale(0.8); transform-origin: center;">
          ${variant.preview_code.replace(/className=/g, 'class=')}
        </div>
      `;
    } else {
      dragPreview.innerHTML = `
        <div style="padding: 4px 8px; background: #f3f4f6; border-radius: 4px; font-size: 10px;">
          ${variant.name || component.name}
        </div>
      `;
    }
    
    document.body.appendChild(dragPreview);
    
    // Set the custom drag image
    e.dataTransfer.setDragImage(dragPreview, 60, 30);
    
    // Clean up the preview element after a short delay
    setTimeout(() => {
      if (document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview);
      }
    }, 100);
    
    // Call parent handler with variant data
    if (onComponentDragStart) {
      onComponentDragStart(e, component.type, variant, dragData);
    }
  };

  const handleVariantDragEnd = (e) => {
    console.log('Variant drag ended');
    
    if (onComponentDragEnd) {
      onComponentDragEnd(e);
    }
  };

  const handleBackClick = () => {
    setShowVariants(false);
    setSelectedComponent(null);
  };

  // Dynamic theme-aware styles using your custom colors
  const getThemeStyles = () => {
    if (isDarkMode) {
      return {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        surfaceHover: 'var(--color-bg-muted)',
        text: 'var(--color-text)',
        textMuted: 'var(--color-text-muted)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        primarySoft: 'var(--color-primary-soft)',
        bgMuted: 'var(--color-bg-muted)',
        accent: 'var(--color-accent)'
      };
    }
    return {
      background: 'var(--color-bg)',
      surface: 'var(--color-surface)',
      surfaceHover: 'var(--color-bg-muted)',
      text: 'var(--color-text)',
      textMuted: 'var(--color-text-muted)',
      border: 'var(--color-border)',
      primary: 'var(--color-primary)',
      primarySoft: 'var(--color-primary-soft)',
      bgMuted: 'var(--color-bg-muted)',
      accent: 'var(--color-accent)'
    };
  };

  const theme = getThemeStyles();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]" style={{ backgroundColor: theme.background }}>
        <div className="flex flex-col items-center space-y-4">
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" style={{ color: theme.primary }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span style={{ color: theme.textMuted }}>Loading components...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center" style={{ backgroundColor: theme.background }}>
        <div className="mb-2" style={{ color: theme.text }}>{error}</div>
        <button 
          onClick={fetchComponents}
          className="px-4 py-2 rounded transition-colors hover:opacity-90"
          style={{ 
            backgroundColor: theme.primary, 
            color: 'white'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative" style={{ backgroundColor: theme.background }}>
      {/* FIXED: Added Tabs Section */}
      <div className="p-4 border-b" style={{ borderColor: theme.border }}>
        <div className="relative rounded-xl p-1" style={{ backgroundColor: theme.bgMuted }}>
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg shadow-md"
            style={{ backgroundColor: theme.surface }}
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

      {/* FIXED: Added Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
          <input
            type="text"
            placeholder={`Search ${currentActiveTab}...`}
            value={currentSearchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border-0 border-b focus:outline-none transition-colors"
            style={{ 
              borderColor: theme.border,
              color: theme.text,
              '::placeholder': { color: theme.textMuted }
            }}
            onFocus={(e) => e.target.style.borderColor = theme.primary}
            onBlur={(e) => e.target.style.borderColor = theme.border}
          />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Alphabet Navigation - Absolute positioned on left */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-center z-10 pl-1">
          <div className="flex flex-col gap-1">
            {alphabet.map((letter) => {
              const isAvailable = availableLetters.includes(letter);
              const isSelected = selectedLetter === letter;
              
              return (
                <motion.button
                  key={letter}
                  onClick={() => isAvailable && handleLetterClick(letter)}
                  disabled={!isAvailable}
                  className={`relative w-6 h-6 text-xs font-medium rounded-full transition-all ${
                    isAvailable
                      ? isSelected
                        ? 'text-white'
                        : 'hover:scale-110'
                      : 'cursor-not-allowed'
                  }`}
                  style={{
                    color: isAvailable 
                      ? isSelected 
                        ? 'white' 
                        : theme.textMuted
                      : theme.border,
                  }}
                  whileHover={isAvailable ? { scale: 1.1 } : {}}
                  whileTap={isAvailable ? { scale: 0.95 } : {}}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute inset-0 rounded-full shadow-md"
                        style={{ backgroundColor: theme.primary }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative z-10">{letter}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col ml-8">
          <AnimatePresence mode="wait">
            {!showVariants ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-hidden"
              >
                {/* Components List with Before UI Design */}
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: theme.primarySoft }}>
                      <Square className="w-5 h-5" style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: theme.text }}>UI Components</h3>
                      <p className="text-xs" style={{ color: theme.textMuted }}>Click to explore variants or drag to canvas</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {Object.entries(filteredComponents).map(([letter, letterComponents]) => (
                        <motion.div
                          key={letter}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                          {!selectedLetter && (
                            <div className="text-sm font-medium mb-2 capitalize" style={{ color: theme.text }}>
                              {letter}
                            </div>
                          )}
                          
                          {letterComponents.map((component) => {
                            const IconComponent = iconMap[component.icon] || Square;
                            const variantCount = Array.isArray(component.variants) ? component.variants.length : 0;
                            
                            return (
                              <motion.div
                                key={component.id}
                                className="group p-4 border-2 border-dashed rounded-xl cursor-pointer hover:border-opacity-60 transition-all duration-300"
                                style={{ 
                                  borderColor: theme.border,
                                  backgroundColor: theme.bgMuted
                                }}
                                onClick={() => handleComponentClick(component)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = theme.primary;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = theme.border;
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                                    style={{ backgroundColor: theme.primary }}
                                  >
                                    <IconComponent className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1">
                                    <div 
                                      className="font-semibold group-hover:opacity-80 transition-opacity"
                                      style={{ color: theme.text }}
                                    >
                                      {component.name}
                                    </div>
                                    <div className="text-xs" style={{ color: theme.textMuted }}>
                                      {component.description}
                                    </div>
                                    {/* Show variant count at the bottom */}
                                    {variantCount > 0 && (
                                      <div className="mt-2 text-xs" style={{ color: theme.primary }}>
                                        {variantCount} variant{variantCount !== 1 ? 's' : ''} available
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Show available variants/options if they exist */}
                                {component.prop_definitions && component.prop_definitions.variant && (
                                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                                    {component.prop_definitions.variant.options.slice(0, 3).map((option) => (
                                      <span 
                                        key={option}
                                        className="px-2 py-1 text-xs rounded-full font-medium capitalize"
                                        style={{ 
                                          backgroundColor: option === 'primary' 
                                            ? theme.primarySoft
                                            : theme.bgMuted, 
                                          color: option === 'primary' 
                                            ? theme.primary
                                            : theme.textMuted
                                        }}
                                      >
                                        {option}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      ))}
                      
                      {Object.keys(filteredComponents).length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12"
                        >
                          <div style={{ color: theme.textMuted }}>
                            {currentSearchTerm ? `No ${currentActiveTab} found for "${currentSearchTerm}"` : `No ${currentActiveTab} available`}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="variants"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-hidden"
              >
                {/* Back Button */}
                <div className="p-3 border-b" style={{ borderColor: theme.border }}>
                  <motion.button
                    onClick={handleBackClick}
                    className="flex items-center space-x-2 transition-colors hover:opacity-80"
                    style={{ color: theme.textMuted }}
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm">Back to {currentActiveTab}</span>
                  </motion.button>
                  
                  <div className="mt-2">
                    <h3 className="font-semibold text-base" style={{ color: theme.text }}>
                      {selectedComponent?.name}
                    </h3>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      {selectedComponent?.description}
                    </p>
                  </div>
                </div>

                {/* FIXED: Enhanced Variants Grid - Only UI components are draggable */}
                <div className="flex-1 overflow-y-auto p-3">
                  <motion.div
                    className="rounded-xl p-3"
                    style={{ backgroundColor: theme.bgMuted }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="grid grid-cols-1 gap-2 max-w-full">
                      {selectedComponent?.variants?.map((variant, index) => (
                          <motion.div
                          key={`${selectedComponent.id}-${variant.name || index}`}
                          className="group relative max-w-full"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          draggable
                          onDragStart={(e) => handleVariantDragStart(e, selectedComponent, variant)}
                          onDragEnd={handleVariantDragEnd}
                        >
                           <div 
                              className="rounded-lg p-3 border transition-all duration-300 shadow-sm hover:shadow-lg relative overflow-hidden max-w-full backdrop-blur-sm cursor-grab active:cursor-grabbing"
                              style={{ 
                                backgroundColor: theme.surface,
                                borderColor: theme.border,
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                              }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = theme.accent;
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = theme.border;
                              e.currentTarget.style.transform = 'translateY(0px)';
                              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                            }}
                          >
                            {/* Gradient overlay on hover */}
                            <div 
                              className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"
                              style={{ 
                                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`
                              }}
                            />
                            
                            <div className="flex items-start gap-3 w-full min-w-0 relative z-10">
                              {/* FIXED: Variant Preview - Only this part is draggable */}
                              <div 
                                className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center border cursor-grab active:cursor-grabbing"
                                style={{ 
                                  background: `linear-gradient(135deg, ${theme.bgMuted}, ${theme.surface})`,
                                  width: '56px',
                                  height: '40px',
                                  borderColor: theme.border
                                }}
                                draggable
                                onDragStart={(e) => handleVariantDragStart(e, selectedComponent, variant)}
                                onDragEnd={handleVariantDragEnd}
                                title="Drag this component to canvas"
                              >
                                {variant.preview_code && (
                                  <div 
                                    className="transform scale-[0.4] origin-center w-full h-full flex items-center justify-center"
                                    style={{ 
                                      fontSize: '10px',
                                      maxWidth: '56px',
                                      maxHeight: '40px'
                                    }}
                                    dangerouslySetInnerHTML={{ 
                                      __html: variant.preview_code.replace(/className=/g, 'class=') 
                                    }}
                                  />
                                )}
                                {!variant.preview_code && (
                                  <div className="flex items-center justify-center">
                                    <Sparkles 
                                      className="w-4 h-4"
                                      style={{ color: theme.primary }}
                                    />
                                  </div>
                                )}
                                
                                {/* Enhanced Drag indicator - only shows on preview hover */}
                                <div className="absolute top-0 right-0 opacity-0 hover:opacity-100 transition-all duration-300 z-10">
                                  <div 
                                    className="p-1 rounded-full"
                                    style={{ backgroundColor: theme.accent }}
                                  >
                                    <Move className="w-2 h-2 text-white" />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Enhanced Variant Info - NOT draggable */}
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 
                                    className="font-semibold text-sm group-hover:opacity-90 transition-colors truncate"
                                    style={{ color: theme.text }}
                                    title={variant.name || `Variant ${index + 1}`}
                                  >
                                    {variant.name || `Variant ${index + 1}`}
                                  </h4>
                                  
                                  <motion.div
                                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    <div 
                                      className="w-5 h-5 rounded-full flex items-center justify-center"
                                      style={{ backgroundColor: theme.accent }}
                                    >
                                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                      </svg>
                                    </div>
                                  </motion.div>
                                </div>
                                
                                {/* Variant description if available */}
                                {variant.description && (
                                  <p className="text-xs mb-2 truncate" style={{ color: theme.textMuted }}>
                                    {variant.description}
                                  </p>
                                )}
                                
                                {/* Dynamic badges for variant properties */}
                                <div className="flex flex-wrap items-center gap-1 mb-2">
                                  {/* Animation badge */}
                                  {variant.has_animation && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                            style={{ 
                                              backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                                              color: '#22c55e' 
                                            }}>
                                        {variant.animation_type?.charAt(0).toUpperCase() + variant.animation_type?.slice(1) || 'Animated'}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Interactive badge */}
                                  {variant.is_interactive && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                          style={{ 
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                                            color: '#3b82f6' 
                                          }}>
                                      Interactive
                                    </span>
                                  )}
                                  
                                  {/* Responsive badge */}
                                  {variant.is_responsive && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                          style={{ 
                                            backgroundColor: 'rgba(168, 85, 247, 0.1)', 
                                            color: '#a855f7' 
                                          }}>
                                      Responsive
                                    </span>
                                  )}
                                  
                                  {/* Custom tags from variant */}
                                  {variant.tags && variant.tags.map((tag, tagIndex) => (
                                    <span 
                                      key={tagIndex}
                                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                      style={{ 
                                        backgroundColor: theme.primarySoft, 
                                        color: theme.primary 
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  
                                  {/* Size badge if available */}
                                  {variant.size && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                          style={{ 
                                            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                                            color: '#f59e0b' 
                                          }}>
                                      {variant.size}
                                    </span>
                                  )}
                                  
                                  {/* Style variant badge */}
                                  {variant.style_variant && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                          style={{ 
                                            backgroundColor: 'rgba(236, 72, 153, 0.1)', 
                                            color: '#ec4899'
                                          }}>
                                      {variant.style_variant}
                                    </span>
                                  )}
                                  
                                  {/* Theme badge */}
                                  {variant.theme && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                          style={{ 
                                            backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                                            color: '#6366f1' 
                                          }}>
                                      {variant.theme}
                                    </span>
                                  )}
                                  
                                  {/* Complexity badge */}
                                  {variant.complexity && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                          style={{ 
                                            backgroundColor: variant.complexity === 'simple' 
                                              ? 'rgba(34, 197, 94, 0.1)' 
                                              : variant.complexity === 'advanced' 
                                              ? 'rgba(239, 68, 68, 0.1)' 
                                              : 'rgba(245, 158, 11, 0.1)',
                                            color: variant.complexity === 'simple' 
                                              ? '#22c55e' 
                                              : variant.complexity === 'advanced' 
                                              ? '#ef4444' 
                                              : '#f59e0b'
                                          }}>
                                      {variant.complexity}
                                    </span>
                                  )}
                                  
                                  {/* Custom properties badge */}
                                  {variant.has_custom_props && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                          style={{ 
                                            backgroundColor: 'rgba(20, 184, 166, 0.1)', 
                                            color: '#14b8a6' 
                                          }}>
                                      Custom Props
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Drag hint - only shows for the preview area */}
                            <div 
                              className="absolute bottom-2 left-3 text-xs opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none"
                              style={{ color: theme.textMuted }}
                            >
                              ← Drag preview to canvas
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {(!selectedComponent?.variants || selectedComponent.variants.length === 0) && (
                      <div className="text-center py-8">
                        <div style={{ color: theme.textMuted }}>
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
    </div>
  );
};

export default ComponentsPanel;