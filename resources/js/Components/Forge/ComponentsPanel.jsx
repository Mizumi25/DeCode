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
  Move
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
  Tag
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

  // Alphabet navigation - positioned absolutely on the left
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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
    const currentTypeComponents = components[activeTab] || {};
    
    if (!searchTerm && !selectedLetter) {
      return currentTypeComponents;
    }

    const filtered = {};
    
    Object.entries(currentTypeComponents).forEach(([letter, letterComponents]) => {
      if (!Array.isArray(letterComponents)) {
        console.warn('letterComponents is not an array:', letter, letterComponents);
        return;
      }
      
      const matchingComponents = letterComponents.filter(component =>
        (!searchTerm || 
         (component.name && component.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
         (component.description && component.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
         (component.category && component.category.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (!selectedLetter || letter === selectedLetter)
      );
      
      if (matchingComponents.length > 0) {
        filtered[letter] = matchingComponents;
      }
    });
    
    return filtered;
  }, [components, activeTab, searchTerm, selectedLetter]);

  const availableLetters = useMemo(() => {
    return Object.keys(components[activeTab] || {}).sort();
  }, [components, activeTab]);

  const handleLetterClick = (letter) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null);
    } else {
      setSelectedLetter(letter);
    }
  };

  const handleComponentClick = (component) => {
    console.log('Component clicked:', component.name, 'Variants:', component.variants);
    
    if (component.variants && Array.isArray(component.variants) && component.variants.length > 0) {
      setSelectedComponent(component);
      setShowVariants(true);
    } else {
      // Handle direct component selection for those without variants
      onComponentDragStart?.(null, component.type);
    }
  };

  const handleVariantDragStart = (e, component, variant) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Variant drag started:', variant.name, 'from component:', component.name);
    
    // Create a synthetic drag event for the variant
    onComponentDragStart?.(e, component.type, variant);
  };

  const handleBackClick = () => {
    setShowVariants(false);
    setSelectedComponent(null);
  };

  // Dynamic theme-aware styles
  const getThemeStyles = () => {
    if (isDarkMode) {
      return {
        background: '#111827',
        surface: '#1f2937',
        surfaceHover: '#374151',
        text: '#f9fafb',
        textMuted: '#9ca3af',
        border: '#374151',
        primary: '#3b82f6',
        primarySoft: '#1e40af',
        bgMuted: '#1f2937'
      };
    }
    return {
      background: '#ffffff',
      surface: '#ffffff',
      surfaceHover: '#f9fafb',
      text: '#111827',
      textMuted: '#6b7280',
      border: '#e5e7eb',
      primary: '#3b82f6',
      primarySoft: '#dbeafe',
      bgMuted: '#f9fafb'
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
    <div className="h-full flex relative" style={{ backgroundColor: theme.background }}>
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
              {/* Components List */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <motion.div 
                  className="space-y-4"
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
                    >
                      {!selectedLetter && (
                        <div className="text-xs font-semibold mb-2 uppercase tracking-wider" 
                             style={{ color: theme.textMuted }}>
                          {letter}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {letterComponents.map((component) => {
                          const IconComponent = iconMap[component.icon] || Square;
                          const variantCount = Array.isArray(component.variants) ? component.variants.length : 0;
                          
                          return (
                            <motion.div
                              key={component.id}
                              className="group cursor-pointer"
                              onClick={() => handleComponentClick(component)}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div 
                                className="p-3 border-2 border-transparent rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                                style={{ 
                                  backgroundColor: theme.bgMuted,
                                  borderColor: 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = theme.primarySoft;
                                  e.currentTarget.style.backgroundColor = theme.surface;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = 'transparent';
                                  e.currentTarget.style.backgroundColor = theme.bgMuted;
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm"
                                    style={{ backgroundColor: theme.primary }}
                                  >
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div 
                                      className="font-medium text-sm group-hover:opacity-80 transition-colors"
                                      style={{ color: theme.text }}
                                    >
                                      {component.name}
                                    </div>
                                    <div className="text-xs truncate" style={{ color: theme.textMuted }}>
                                      {component.description}
                                    </div>
                                    {component.has_animation && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                          {component.animation_type?.toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {variantCount > 0 && (
                                    <div 
                                      className="text-xs px-2 py-1 rounded-full font-medium"
                                      style={{ 
                                        backgroundColor: theme.primarySoft, 
                                        color: theme.primary 
                                      }}
                                    >
                                      {variantCount}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                  
                  {Object.keys(filteredComponents).length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div style={{ color: theme.textMuted }}>
                        {searchTerm ? `No ${activeTab} found for "${searchTerm}"` : `No ${activeTab} available`}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
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
                  <span className="text-sm">Back to {activeTab}</span>
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

              {/* Compact Variants Grid */}
              <div className="flex-1 overflow-y-auto p-3">
                <motion.div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: theme.bgMuted }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {selectedComponent?.variants?.map((variant, index) => (
                      <motion.div
                        key={index}
                        className="group cursor-move"
                        draggable
                        onDragStart={(e) => handleVariantDragStart(e, selectedComponent, variant)}
                        onDragEnd={onComponentDragEnd}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div 
                          className="rounded-lg p-2 border transition-all duration-300 shadow-sm hover:shadow-md relative"
                          style={{ 
                            backgroundColor: theme.surface,
                            borderColor: theme.border
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = theme.primary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = theme.border;
                          }}
                        >
                          {/* Drag indicator */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Move className="w-3 h-3" style={{ color: theme.textMuted }} />
                          </div>
                          
                          {/* Compact Variant Preview */}
                          <div 
                            className="mb-2 p-2 rounded-md overflow-hidden"
                            style={{ 
                              background: `linear-gradient(135deg, ${theme.bgMuted}, ${theme.surface})`,
                              minHeight: '40px'
                            }}
                          >
                            <div className="flex items-center justify-center h-full">
                              {variant.preview_code && (
                                <div 
                                  className="transform scale-50 origin-center w-full"
                                  style={{ fontSize: '10px' }}
                                  dangerouslySetInnerHTML={{ 
                                    __html: variant.preview_code.replace(/className=/g, 'class=') 
                                  }}
                                />
                              )}
                              {!variant.preview_code && (
                                <div 
                                  className="w-8 h-6 rounded-sm"
                                  style={{ backgroundColor: theme.primary }}
                                />
                              )}
                            </div>
                          </div>
                          
                          {/* Compact Variant Info */}
                          <div>
                            <h4 
                              className="font-medium text-xs mb-1 group-hover:opacity-80 transition-colors truncate"
                              style={{ color: theme.text }}
                              title={variant.name || `Variant ${index + 1}`}
                            >
                              {variant.name || `Variant ${index + 1}`}
                            </h4>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                {variant.has_animation && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                      {variant.animation_type?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <motion.div
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                whileHover={{ scale: 1.1 }}
                              >
                                <div 
                                  className="w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: theme.primary }}
                                >
                                  <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                  </svg>
                                </div>
                              </motion.div>
                            </div>
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
  );
};

export default ComponentsPanel;