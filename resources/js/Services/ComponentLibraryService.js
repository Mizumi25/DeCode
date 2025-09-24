// @/Services/ComponentLibraryService.js - FIXED RENDERING
import axios from 'axios';
import React from 'react';
import { ComponentLibraryServiceExtension } from './ComponentLibraryServiceExtension';


class ComponentLibraryService {
  constructor() {
    this.components = new Map();
    this.componentDefinitions = new Map();
    
    // Initialize extension
    this.extension = new ComponentLibraryServiceExtension(this);
    
    
    // Save queue management to prevent conflicts
    this.saveQueue = new Map(); // frameId -> timeout
    this.isSaving = new Map(); // frameId -> boolean
    this.saveDebounceTime = 1000; // 1 second debounce
    
    // Add undo/redo operation tracking
    this.undoRedoInProgress = new Map(); 
  }

  // Load all components from the API
  async loadComponents() {
    try {
      console.log('=== LOADING COMPONENTS FROM DATABASE ===');
      
      const response = await axios.get('/api/components');
      if (response.data.success) {
        const componentsByCategory = response.data.data;
        console.log('Raw API response:', componentsByCategory);
        
        let totalLoaded = 0;
        
        // Process both elements and components
        Object.entries(componentsByCategory).forEach(([categoryType, letterGroups]) => {
          console.log(`Processing category: ${categoryType}`);
          
          Object.entries(letterGroups).forEach(([letter, componentList]) => {
            console.log(`Processing letter group: ${letter}, count: ${componentList.length}`);
            
            if (Array.isArray(componentList)) {
              componentList.forEach(component => {
                console.log('Processing component:', {
                  name: component.name,
                  type: component.type,
                  hasDefaults: !!component.default_props,
                  defaults: component.default_props
                });
                
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

                console.log('Storing component definition:', component.type, {
                  name: processedComponent.name,
                  default_props: processedComponent.default_props,
                  variants_count: processedComponent.variants.length
                });

                this.componentDefinitions.set(component.type, processedComponent);
                this.components.set(component.type, this.createComponentRenderer(processedComponent));
                totalLoaded++;
              });
            }
          });
        });
        
        console.log('=== COMPONENT LOADING COMPLETE ===');
        console.log('Total components loaded:', totalLoaded);
        
        return true;
      }
      
      console.error('API response not successful:', response.data);
      return false;
    } catch (error) {
      console.error('Failed to load components:', error);
      throw error;
    }
  }

  createComponentRenderer(componentDef) {
    console.log('Creating renderer for:', componentDef.type, {
      hasDefaults: !!componentDef.default_props,
      defaults: componentDef.default_props
    });
    
    return {
      id: componentDef.type,
      name: componentDef.name,
      description: componentDef.description,
      icon: componentDef.icon,
      defaultProps: componentDef.default_props || {},
      propDefinitions: componentDef.prop_definitions,
      variants: componentDef.variants || [],
      
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

   // Enhanced component renderer that uses extension
  renderComponent(componentDef, props, id) {
    // Get the component definition if not passed
    if (!componentDef && this.componentDefinitions.has(props.type || props.component_type)) {
      componentDef = this.componentDefinitions.get(props.type || props.component_type);
    }
    
    if (!componentDef) {
      console.warn('No component definition found for:', props.type || props.component_type);
      return this.renderGeneric(props, id, { name: props.type || 'Unknown', type: props.type || 'unknown' });
    }
    
    // Try extension first for new component types
    const extendedComponent = this.extension.renderComponentExtension(componentDef, props, id);
    if (extendedComponent) {
      return extendedComponent;
    }
    
    // Fall back to original renderer for basic components
    const mergedProps = { 
      ...componentDef.default_props,
      ...props.props,
      ...props
    };
    
    console.log('Rendering component:', componentDef.type, 'with merged props:', mergedProps);
    
    // Check if there's a variant being used
    if (props.variant && componentDef.variants) {
      const variantData = componentDef.variants.find(v => v.name === props.variant.name);
      if (variantData) {
        if (variantData.preview_code) {
          return React.createElement('div', {
            key: id,
            dangerouslySetInnerHTML: {
              __html: variantData.preview_code.replace(/className=/g, 'class=')
            }
          });
        }
        
        if (variantData.props) {
          Object.assign(mergedProps, variantData.props);
        }
      }
    }
    
    // Apply custom styles if present
    const layoutStyles = {
      display: props.style?.display || mergedProps.display || 'block',
      position: props.style?.position || 'relative',
      width: props.style?.width || mergedProps.width || 'auto',
      height: props.style?.height || mergedProps.height || 'auto',
      ...props.style
    };
    
    // Route to specific renderers (original component types)
    switch (componentDef.type) {
      case 'button':
        return this.renderButton(mergedProps, id, layoutStyles);
      case 'input':
        return this.renderInput(mergedProps, id, layoutStyles);
      case 'card':
        return this.renderCard(mergedProps, id, layoutStyles);
      case 'avatar':
        return this.renderAvatar(mergedProps, id, layoutStyles);
      case 'badge':
        return this.renderBadge(mergedProps, id, layoutStyles);
      case 'searchbar':
        return this.renderSearchbar(mergedProps, id, layoutStyles);
      case 'navbar':
        return this.renderNavbar(mergedProps, id, layoutStyles);
      case 'hero':
        return this.renderHero(mergedProps, id, layoutStyles);
      case 'modal':
        return this.renderModal(mergedProps, id, layoutStyles);
      case 'tabs':
        return this.renderTabs(mergedProps, id, layoutStyles);
      case 'dropdown':
        return this.renderDropdown(mergedProps, id, layoutStyles);
      case 'toggle':
        return this.renderToggle(mergedProps, id, layoutStyles);
      case 'progress':
        return this.renderProgress(mergedProps, id, layoutStyles);
      case 'tooltip':
        return this.renderTooltip(mergedProps, id, layoutStyles);
      case 'alert':
        return this.renderAlert(mergedProps, id, layoutStyles);
      case 'textarea':
        return this.renderTextarea(mergedProps, id, layoutStyles);
      case 'checkbox':
        return this.renderCheckbox(mergedProps, id, layoutStyles);
      case 'radio':
        return this.renderRadio(mergedProps, id, layoutStyles);
      case 'select':
        return this.renderSelect(mergedProps, id, layoutStyles);
      case 'slider':
        return this.renderSlider(mergedProps, id, layoutStyles);
      case 'image':
        return this.renderImage(mergedProps, id, layoutStyles);
      case 'video':
        return this.renderVideo(mergedProps, id, layoutStyles);
      case 'icon':
        return this.renderIcon(mergedProps, id, layoutStyles);
      case 'separator':
        return this.renderSeparator(mergedProps, id, layoutStyles);
      case 'breadcrumb':
        return this.renderBreadcrumb(mergedProps, id, layoutStyles);
      case 'pagination':
        return this.renderPagination(mergedProps, id, layoutStyles);
      // Layout elements
      case 'div':
        return this.renderDiv(mergedProps, id, layoutStyles);
      case 'section':
        return this.renderSection(mergedProps, id, layoutStyles);
      case 'container':
        return this.renderContainer(mergedProps, id, layoutStyles);
      case 'flex':
        return this.renderFlex(mergedProps, id, layoutStyles);
      case 'grid':
        return this.renderGrid(mergedProps, id, layoutStyles);
      default:
        return this.renderGeneric(mergedProps, id, componentDef, layoutStyles);
    }
  }
  
  // FIXED: Button renderer
  renderButton(props, id, layoutStyles = {}) {
      const className = this.getButtonClasses(props);
      
      const buttonStyle = {
          maxWidth: '100%',
          wordBreak: 'break-word',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: props.width || 'fit-content',
          minWidth: props.minWidth || '60px',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('button', {
          key: id,
          className,
          onClick: () => console.log(`Button ${id} clicked`),
          disabled: props.disabled || false,
          style: buttonStyle
      }, props.text || props.children || 'Button');
  }

  // FIXED: Avatar renderer
  renderAvatar(props, id, layoutStyles = {}) {
      const className = this.getAvatarClasses(props);
      
      const avatarStyle = {
          ...layoutStyles,
          ...props.style
      };
      
      if (props.src) {
          return React.createElement('div', {
              key: id,
              className,
              style: avatarStyle
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
          style: avatarStyle
      }, React.createElement('span', {
          className: 'font-medium'
      }, initials));
  }

  // FIXED: Badge renderer
  renderBadge(props, id, layoutStyles = {}) {
      const className = this.getBadgeClasses(props);
      
      const badgeStyle = {
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('span', {
          key: id,
          className,
          style: badgeStyle
      }, props.text || props.children || 'Badge');
  }

  // FIXED: Input renderer
  renderInput(props, id, layoutStyles = {}) {
      const className = this.getInputClasses(props);
      
      const inputStyle = {
          width: props.width || '100%',
          maxWidth: props.maxWidth || '250px',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('input', {
          key: id,
          type: props.type || 'text',
          placeholder: props.placeholder || '',
          className,
          disabled: props.disabled || false,
          required: props.required || false,
          style: inputStyle
      });
  }

  // FIXED: Card renderer
  renderCard(props, id, layoutStyles = {}) {
      const cardClassName = this.getCardClasses(props);
      
      const cardStyle = {
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('div', {
          key: id,
          className: cardClassName,
          style: cardStyle
      }, [
          props.title && React.createElement('h3', {
              key: `${id}-title`,
              className: 'font-semibold text-lg mb-2 text-gray-900'
          }, props.title),
          React.createElement('div', {
              key: `${id}-content`,
              className: 'text-gray-600'
          }, props.content || props.children || 'Card content')
      ]);
  }

  // NEW: Additional component renderers
  renderSearchbar(props, id, layoutStyles = {}) {
      const className = this.getSearchbarClasses(props);
      
      const searchbarStyle = {
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('div', {
          key: id,
          className,
          style: searchbarStyle
      }, [
          React.createElement('input', {
              key: `${id}-input`,
              type: 'text',
              placeholder: props.placeholder || 'Search...',
              className: 'flex-1 bg-transparent outline-none'
          }),
          props.showIcon !== false && React.createElement('svg', {
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

  renderNavbar(props, id, layoutStyles = {}) {
      const navStyle = {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('nav', {
          key: id,
          style: navStyle,
          className: 'w-full'
      }, [
          React.createElement('div', {
              key: `${id}-brand`,
              className: 'font-bold text-xl'
          }, props.brand || 'Brand'),
          React.createElement('div', {
              key: `${id}-links`,
              className: 'flex space-x-6'
          }, (props.links || ['Home', 'About', 'Contact']).map((link, index) =>
              React.createElement('a', {
                  key: `${id}-link-${index}`,
                  className: 'text-gray-600 hover:text-gray-900 cursor-pointer'
              }, link)
          ))
      ]);
  }

  renderHero(props, id, layoutStyles = {}) {
      const heroStyle = {
          textAlign: 'center',
          padding: '5rem 1.5rem',
          background: props.backgroundType === 'gradient' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : '#f8fafc',
          color: props.backgroundType === 'gradient' ? 'white' : '#1f2937',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('section', {
          key: id,
          style: heroStyle,
          className: 'w-full'
      }, [
          React.createElement('h1', {
              key: `${id}-title`,
              className: 'text-5xl font-bold mb-4'
          }, props.title || 'Welcome to Our App'),
          React.createElement('p', {
              key: `${id}-subtitle`,
              className: 'text-xl mb-8'
          }, props.subtitle || 'Build amazing things with our platform'),
          React.createElement('button', {
              key: `${id}-cta`,
              className: `${props.backgroundType === 'gradient' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'} px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity`
          }, props.ctaText || 'Get Started')
      ]);
  }

  renderModal(props, id, layoutStyles = {}) {
      return React.createElement('div', {
          key: id,
          className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
          style: { ...layoutStyles, ...props.style, display: props.isOpen ? 'flex' : 'none' }
      }, React.createElement('div', {
          className: 'bg-white rounded-lg p-6 max-w-md w-full mx-4'
      }, [
          React.createElement('h2', {
              key: `${id}-title`,
              className: 'text-xl font-bold mb-4'
          }, props.title || 'Modal Title'),
          React.createElement('p', {
              key: `${id}-content`,
              className: 'mb-6'
          }, props.content || 'Modal content goes here...'),
          React.createElement('div', {
              key: `${id}-actions`,
              className: 'flex justify-end space-x-2'
          }, [
              React.createElement('button', {
                  key: `${id}-cancel`,
                  className: 'px-4 py-2 text-gray-600 hover:text-gray-800'
              }, 'Cancel'),
              React.createElement('button', {
                  key: `${id}-confirm`,
                  className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              }, 'Confirm')
          ])
      ]));
  }

  renderTabs(props, id, layoutStyles = {}) {
      const tabs = props.tabs || ['Tab 1', 'Tab 2', 'Tab 3'];
      const activeTab = props.activeTab || 0;
      
      return React.createElement('div', {
          key: id,
          style: { ...layoutStyles, ...props.style }
      }, [
          React.createElement('div', {
              key: `${id}-tabs`,
              className: 'flex border-b border-gray-200'
          }, tabs.map((tab, index) =>
              React.createElement('button', {
                  key: `${id}-tab-${index}`,
                  className: `px-4 py-2 font-medium ${index === activeTab 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'}`
              }, tab)
          )),
          React.createElement('div', {
              key: `${id}-content`,
              className: 'p-4'
          }, props.content || `Content for ${tabs[activeTab]}`)
      ]);
  }

  renderDropdown(props, id, layoutStyles = {}) {
      const options = props.options || ['Option 1', 'Option 2', 'Option 3'];
      
      return React.createElement('div', {
          key: id,
          className: 'relative inline-block text-left',
          style: { ...layoutStyles, ...props.style }
      }, [
          React.createElement('button', {
              key: `${id}-trigger`,
              className: 'inline-flex justify-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50'
          }, [
              props.label || 'Dropdown',
              React.createElement('svg', {
                  key: `${id}-chevron`,
                  className: 'ml-2 -mr-1 h-5 w-5',
                  fill: 'currentColor',
                  viewBox: '0 0 20 20'
              }, React.createElement('path', {
                  fillRule: 'evenodd',
                  d: 'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z',
                  clipRule: 'evenodd'
              }))
          ]),
          props.isOpen && React.createElement('div', {
              key: `${id}-menu`,
              className: 'absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5'
          }, React.createElement('div', {
              className: 'py-1'
          }, options.map((option, index) =>
              React.createElement('a', {
                  key: `${id}-option-${index}`,
                  className: 'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
              }, option)
          )))
      ]);
  }

  renderToggle(props, id, layoutStyles = {}) {
      const isOn = props.isOn || false;
      
      return React.createElement('button', {
          key: id,
          className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isOn ? 'bg-blue-600' : 'bg-gray-200'
          }`,
          style: { ...layoutStyles, ...props.style }
      }, React.createElement('span', {
          className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isOn ? 'translate-x-6' : 'translate-x-1'
          }`
      }));
  }

  renderProgress(props, id, layoutStyles = {}) {
      const value = props.value || 0;
      const max = props.max || 100;
      const percentage = (value / max) * 100;
      
      return React.createElement('div', {
          key: id,
          className: 'w-full bg-gray-200 rounded-full h-2',
          style: { ...layoutStyles, ...props.style }
      }, React.createElement('div', {
          className: 'bg-blue-600 h-2 rounded-full transition-all duration-300',
          style: { width: `${percentage}%` }
      }));
  }

  renderAlert(props, id, layoutStyles = {}) {
      const variant = props.variant || 'info';
      const variantClasses = {
          info: 'bg-blue-50 border-blue-200 text-blue-800',
          success: 'bg-green-50 border-green-200 text-green-800',
          warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          error: 'bg-red-50 border-red-200 text-red-800'
      };
      
      return React.createElement('div', {
          key: id,
          className: `border rounded-lg p-4 ${variantClasses[variant]}`,
          style: { ...layoutStyles, ...props.style }
      }, [
          props.title && React.createElement('h4', {
              key: `${id}-title`,
              className: 'font-medium mb-1'
          }, props.title),
          React.createElement('p', {
              key: `${id}-message`
          }, props.message || 'Alert message')
      ]);
  }

  renderTextarea(props, id, layoutStyles = {}) {
      return React.createElement('textarea', {
          key: id,
          placeholder: props.placeholder || 'Enter text...',
          rows: props.rows || 4,
          className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
          style: { ...layoutStyles, ...props.style }
      });
  }

  renderCheckbox(props, id, layoutStyles = {}) {
      return React.createElement('label', {
          key: id,
          className: 'flex items-center space-x-2 cursor-pointer',
          style: { ...layoutStyles, ...props.style }
      }, [
          React.createElement('input', {
              key: `${id}-input`,
              type: 'checkbox',
              checked: props.checked || false,
              className: 'rounded border-gray-300 text-blue-600 focus:ring-blue-500'
          }),
          React.createElement('span', {
              key: `${id}-label`
          }, props.label || 'Checkbox')
      ]);
  }

  renderRadio(props, id, layoutStyles = {}) {
      const options = props.options || ['Option 1', 'Option 2'];
      
      return React.createElement('div', {
          key: id,
          className: 'space-y-2',
          style: { ...layoutStyles, ...props.style }
      }, options.map((option, index) =>
          React.createElement('label', {
              key: `${id}-option-${index}`,
              className: 'flex items-center space-x-2 cursor-pointer'
          }, [
              React.createElement('input', {
                  key: `${id}-input-${index}`,
                  type: 'radio',
                  name: props.name || id,
                  value: option,
                  className: 'text-blue-600 focus:ring-blue-500'
              }),
              React.createElement('span', {
                  key: `${id}-label-${index}`
              }, option)
          ])
      ));
  }

  renderSelect(props, id, layoutStyles = {}) {
      const options = props.options || ['Option 1', 'Option 2', 'Option 3'];
      
      return React.createElement('select', {
          key: id,
          className: 'block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
          style: { ...layoutStyles, ...props.style }
      }, [
          props.placeholder && React.createElement('option', {
              key: `${id}-placeholder`,
              value: '',
              disabled: true,
              selected: true
          }, props.placeholder),
          ...options.map((option, index) =>
              React.createElement('option', {
                  key: `${id}-option-${index}`,
                  value: option
              }, option)
          )
      ]);
  }

  // Layout element renderers
  renderDiv(props, id, layoutStyles = {}) {
      const divStyle = {
          minHeight: '100px',
          padding: '16px',
          border: props.showPlaceholder ? '2px dashed #e5e7eb' : 'none',
          borderRadius: '8px',
          backgroundColor: props.showPlaceholder ? '#f9fafb' : 'transparent',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('div', {
          key: id,
          className: props.className || '',
          style: divStyle
      }, props.showPlaceholder ? 'Empty Container - Drop components here' : props.children);
  }

  renderSection(props, id, layoutStyles = {}) {
      const sectionStyle = {
          width: '100%',
          padding: props.padding === 'large' ? '5rem 1.5rem' : 
                  props.padding === 'small' ? '2rem 1.5rem' : '3rem 1.5rem',
          backgroundColor: props.background === 'gradient' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : props.background || 'transparent',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('section', {
          key: id,
          style: sectionStyle
      }, React.createElement('div', {
          className: 'max-w-7xl mx-auto'
      }, props.children || 'Section content'));
  }

  renderContainer(props, id, layoutStyles = {}) {
      const maxWidthClasses = {
          'sm': 'max-w-sm',
          'md': 'max-w-md',
          'lg': 'max-w-lg',
          'xl': 'max-w-xl',
          '2xl': 'max-w-2xl',
          'full': 'max-w-full'
      };
      
      const containerStyle = {
          width: '100%',
          padding: props.padding === 'large' ? '2rem' :
                  props.padding === 'small' ? '0.5rem' : '1rem',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('div', {
          key: id,
          className: `${maxWidthClasses[props.maxWidth] || 'max-w-xl'} ${props.centered ? 'mx-auto' : ''}`,
          style: containerStyle
      }, props.children || 'Container content');
  }

  renderFlex(props, id, layoutStyles = {}) {
      const gapClasses = {
          'none': '0',
          'small': '0.5rem',
          'medium': '1rem',
          'large': '1.5rem'
      };
      
      const flexStyle = {
          display: 'flex',
          flexDirection: props.direction || 'row',
          justifyContent: props.justify || 'flex-start',
          alignItems: props.align || 'stretch',
          gap: gapClasses[props.gap] || '1rem',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('div', {
          key: id,
          style: flexStyle
      }, props.children || [
          React.createElement('div', { key: `${id}-item1`, style: { padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' } }, 'Flex Item 1'),
          React.createElement('div', { key: `${id}-item2`, style: { padding: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.5rem' } }, 'Flex Item 2')
      ]);
  }

  renderGrid(props, id, layoutStyles = {}) {
      const gapClasses = {
          'none': '0',
          'small': '0.5rem',
          'medium': '1rem',
          'large': '1.5rem'
      };
      
      const gridStyle = {
          display: 'grid',
          gridTemplateColumns: props.columns === 'auto-fit' 
              ? 'repeat(auto-fit, minmax(200px, 1fr))'
              : `repeat(${props.columns || '3'}, 1fr)`,
          gap: gapClasses[props.gap] || '1rem',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('div', {
          key: id,
          style: gridStyle
      }, props.children || [
          React.createElement('div', { key: `${id}-item1`, style: { padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' } }, 'Grid Item 1'),
          React.createElement('div', { key: `${id}-item2`, style: { padding: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.5rem' } }, 'Grid Item 2'),
          React.createElement('div', { key: `${id}-item3`, style: { padding: '1rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem' } }, 'Grid Item 3')
      ]);
  }

  // Additional useful component renderers
  renderSlider(props, id, layoutStyles = {}) {
      const value = props.value || 50;
      const min = props.min || 0;
      const max = props.max || 100;
      
      return React.createElement('div', {
          key: id,
          className: 'w-full',
          style: { ...layoutStyles, ...props.style }
      }, [
          props.label && React.createElement('label', {
              key: `${id}-label`,
              className: 'block text-sm font-medium text-gray-700 mb-2'
          }, props.label),
          React.createElement('input', {
              key: `${id}-input`,
              type: 'range',
              min: min,
              max: max,
              value: value,
              className: 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
          }),
          React.createElement('div', {
              key: `${id}-value`,
              className: 'flex justify-between text-xs text-gray-500 mt-1'
          }, [
              React.createElement('span', { key: `${id}-min` }, min),
              React.createElement('span', { key: `${id}-current` }, value),
              React.createElement('span', { key: `${id}-max` }, max)
          ])
      ]);
  }

  renderImage(props, id, layoutStyles = {}) {
      const imageStyle = {
          width: props.width || 'auto',
          height: props.height || 'auto',
          maxWidth: '100%',
          borderRadius: props.rounded ? '0.5rem' : '0',
          objectFit: props.objectFit || 'cover',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('img', {
          key: id,
          src: props.src || 'https://via.placeholder.com/300x200?text=Image',
          alt: props.alt || 'Image',
          style: imageStyle,
          className: props.shadow ? 'shadow-lg' : ''
      });
  }

  renderVideo(props, id, layoutStyles = {}) {
      const videoStyle = {
          width: props.width || '100%',
          height: props.height || 'auto',
          borderRadius: props.rounded ? '0.5rem' : '0',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('video', {
          key: id,
          src: props.src,
          controls: props.controls !== false,
          autoPlay: props.autoPlay || false,
          loop: props.loop || false,
          muted: props.muted || false,
          style: videoStyle,
          className: props.shadow ? 'shadow-lg' : ''
      });
  }

  renderIcon(props, id, layoutStyles = {}) {
    const iconStyle = {
      width: props.size || '24px',
      height: props.size || '24px',
      color: props.color || 'currentColor',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...layoutStyles,
      ...props.style
    };
  
    // Handle different icon types
    if (props.iconType === 'svg' && props.svgData) {
      return React.createElement('div', {
        key: id,
        style: iconStyle,
        dangerouslySetInnerHTML: { __html: props.svgData }
      });
    }
  
    if (props.iconType === 'heroicons' && props.iconName) {
      // For heroicons, you'd need to import dynamically or have a mapping
      return React.createElement('div', {
        key: id,
        style: {
          ...iconStyle,
          border: '2px dashed var(--color-border)',
          borderRadius: '4px',
          backgroundColor: 'var(--color-bg-muted)',
          fontSize: '10px'
        }
      }, `${props.iconName}`);
    }
  
    if (props.iconType === 'lucide') {
      // Similar for lucide icons
      return React.createElement('div', {
        key: id,
        style: {
          ...iconStyle,
          border: '2px dashed var(--color-border)',
          borderRadius: '4px',
          backgroundColor: 'var(--color-bg-muted)',
          fontSize: '10px'
        }
      }, `${props.iconName}`);
    }
  
    if (props.iconType === 'lottie') {
      return React.createElement('div', {
        key: id,
        style: {
          ...iconStyle,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          color: 'white',
          fontSize: '12px'
        }
      }, '▶');
    }

    // Default fallback
    return React.createElement('div', {
      key: id,
      style: {
        ...iconStyle,
        border: '2px dashed var(--color-border)',
        borderRadius: '4px',
        backgroundColor: 'var(--color-bg-muted)',
        fontSize: '10px',
        color: 'var(--color-text-muted)'
      }
    }, 'Icon');
  }

  renderSeparator(props, id, layoutStyles = {}) {
      const separatorStyle = {
          height: props.orientation === 'vertical' ? props.height || '100%' : '1px',
          width: props.orientation === 'vertical' ? '1px' : props.width || '100%',
          backgroundColor: props.color || '#e5e7eb',
          margin: props.margin || '1rem 0',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('div', {
          key: id,
          style: separatorStyle
      });
  }

  renderBreadcrumb(props, id, layoutStyles = {}) {
      const items = props.items || ['Home', 'Category', 'Page'];
      
      return React.createElement('nav', {
          key: id,
          style: { ...layoutStyles, ...props.style }
      }, React.createElement('ol', {
          className: 'flex items-center space-x-2 text-sm text-gray-500'
      }, items.map((item, index) => [
          React.createElement('li', {
              key: `${id}-item-${index}`,
              className: index === items.length - 1 ? 'text-gray-900 font-medium' : 'hover:text-gray-700 cursor-pointer'
          }, item),
          index < items.length - 1 && React.createElement('li', {
              key: `${id}-separator-${index}`,
              className: 'text-gray-300'
          }, '/')
      ]).flat()));
  }

  renderPagination(props, id, layoutStyles = {}) {
      const currentPage = props.currentPage || 1;
      const totalPages = props.totalPages || 5;
      
      return React.createElement('nav', {
          key: id,
          style: { ...layoutStyles, ...props.style }
      }, React.createElement('div', {
          className: 'flex items-center justify-center space-x-1'
      }, [
          React.createElement('button', {
              key: `${id}-prev`,
              className: 'px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:text-gray-700',
              disabled: currentPage === 1
          }, 'Previous'),
          ...Array.from({ length: totalPages }, (_, i) => i + 1).map(page =>
              React.createElement('button', {
                  key: `${id}-page-${page}`,
                  className: `px-3 py-2 rounded-md ${page === currentPage 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-300 text-gray-500 hover:text-gray-700'}`
              }, page)
          ),
          React.createElement('button', {
              key: `${id}-next`,
              className: 'px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:text-gray-700',
              disabled: currentPage === totalPages
          }, 'Next')
      ]));
  }

  renderTooltip(props, id, layoutStyles = {}) {
      return React.createElement('div', {
          key: id,
          className: 'relative inline-block',
          style: { ...layoutStyles, ...props.style }
      }, [
          React.createElement('div', {
              key: `${id}-trigger`,
              className: 'cursor-pointer'
          }, props.children || 'Hover me'),
          React.createElement('div', {
              key: `${id}-tooltip`,
              className: 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-sm text-white bg-gray-900 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none',
              style: { whiteSpace: 'nowrap' }
          }, props.text || 'Tooltip text')
      ]);
  }

  // Enhanced generic renderer with better fallback
  renderGeneric(props, id, componentDef, layoutStyles = {}) {
      const containerStyle = {
          maxWidth: '200px',
          overflow: 'hidden',
          padding: '1rem',
          border: '2px dashed #d1d5db',
          borderRadius: '0.5rem',
          backgroundColor: '#f9fafb',
          textAlign: 'center',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('div', {
          key: id,
          style: containerStyle,
          title: `${componentDef.name} component`
      }, [
          React.createElement('div', {
              key: `${id}-name`,
              className: 'font-semibold text-gray-700 truncate mb-1'
          }, componentDef.name),
          React.createElement('div', {
              key: `${id}-type`,
              className: 'text-xs text-gray-500 truncate'
          }, `(${componentDef.type})`)
      ]);
  }

  // Enhanced button classes with better variants
  getButtonClasses(props) {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shrink-0 cursor-pointer";
    
    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md",
      secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 shadow-sm hover:shadow-md",
      success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md",
      warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-sm hover:shadow-md",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md",
      ghost: "bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500 border border-transparent hover:border-blue-200",
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all",
      neon: "bg-black border-2 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/50 hover:shadow-cyan-400/75 transition-all",
      glass: "bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl",
      outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all",
      minimal: "text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all"
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

  // Enhanced avatar classes
  getAvatarClasses(props) {
      const baseClasses = "rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-gray-300 text-gray-600";
      
      const sizeClasses = {
          xs: "w-6 h-6 text-xs",
          sm: "w-8 h-8 text-sm",
          md: "w-12 h-12 text-base",
          lg: "w-16 h-16 text-lg",
          xl: "w-20 h-20 text-xl"
      };
      
      const size = props.size || 'md';
      
      return `${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
  }

  // Enhanced badge classes
  getBadgeClasses(props) {
      const baseClasses = "inline-flex items-center rounded-full font-medium shrink-0";
      
      const variantClasses = {
          default: "bg-gray-100 text-gray-800",
          primary: "bg-blue-100 text-blue-800",
          success: "bg-green-100 text-green-800",
          warning: "bg-yellow-100 text-yellow-800",
          danger: "bg-red-100 text-red-800",
          info: "bg-cyan-100 text-cyan-800"
      };
      
      const sizeClasses = {
          sm: "px-2 py-0.5 text-xs",
          md: "px-2.5 py-1 text-sm",
          lg: "px-3 py-1.5 text-base"
      };
      
      const variant = props.variant || 'default';
      const size = props.size || 'md';
      
      return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
  }

  // Enhanced input classes
  getInputClasses(props) {
      const baseClasses = "block rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 shrink-0";
      
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
      
      const variant = props.variant || 'default';
      const size = props.size || 'md';
      
      return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
  }

  // Enhanced searchbar classes
  getSearchbarClasses(props) {
      const baseClasses = "flex items-center rounded-lg border transition-colors duration-200 shrink-0 bg-white";
      
      const sizeClasses = {
          sm: "px-3 py-1.5",
          md: "px-4 py-2.5",
          lg: "px-5 py-3"
      };
      
      const size = props.size || 'md';
      
      return `${baseClasses} border-gray-300 focus-within:border-blue-500 ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
  }

  // Enhanced card classes
  getCardClasses(props) {
      const baseClasses = "rounded-lg shrink-0";
      
      const variantClasses = {
          default: "bg-white border border-gray-200",
          outlined: "bg-transparent border-2 border-gray-300",
          elevated: "bg-white shadow-lg border-0"
      };
      
      const paddingClasses = {
          sm: "p-3",
          md: "p-4",
          lg: "p-6"
      };
      
      const variant = props.variant || 'default';
      const padding = props.padding || 'md';
      const shadow = props.shadow && variant !== 'elevated' ? 'shadow-sm' : '';
      
      return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${paddingClasses[padding] || paddingClasses.md} ${shadow} ${props.className || ''}`;
  }

  // Rest of the existing methods remain the same...
    // Enhanced code generation for new component types
  async generateComponentCode(componentDef, props, allComponents, style) {
    const componentType = componentDef.type;
    
    // Check if extension can handle code generation
    if (this.extension.generateCodeForComponent) {
      const extensionCode = this.extension.generateCodeForComponent(componentType, props, style);
      if (extensionCode) {
        return extensionCode;
      }
    }
    
    // Fall back to default code generation
    return this.defaultCodeGeneration(componentDef, props, style);
  }

  defaultCodeGeneration(componentDef, props, style) {
    const componentType = componentDef.type;
    
    switch (style) {
      case 'react-tailwind':
        return this.generateReactTailwindCode(componentType, props);
      case 'react-css':
        return this.generateReactCSSCode(componentType, props);
      case 'html-tailwind':
        return this.generateHTMLTailwindCode(componentType, props);
      default:
        return {
          react: `// ${componentDef.name} component\n// Type: ${componentType}`,
          html: `<!-- ${componentDef.name} -->`,
          css: `/* ${componentDef.name} styles */`,
          tailwind: `/* ${componentDef.name} classes */`
        };
    }
  }
  
  generateReactTailwindCode(componentType, props) {
    // Enhanced code generation with support for new component types
    const codeMap = {
      // Form Components
      'text-input': () => `
import React from 'react';

const TextInput = ({ label, placeholder, type = 'text', variant = 'default' }) => {
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500',
    glass: 'bg-white/20 backdrop-blur-md border-white/30 text-white placeholder-white/70',
    floating: 'peer border-gray-300 focus:border-blue-500 placeholder-transparent'
  };

  return (
    <div className="relative">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        className={\`w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 \${variantClasses[variant]}\`}
      />
      {variant === 'floating' && (
        <label className="absolute left-4 -top-2.5 text-sm text-blue-600 bg-white px-1">
          {label}
        </label>
      )}
    </div>
  );
};

export default TextInput;`,

      // Media Components
      'image-gallery': () => `
import React, { useState } from 'react';

const ImageGallery = ({ images, columns = 3, layout = 'grid' }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div>
      <div className={\`grid grid-cols-\${columns} gap-4\`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="aspect-square cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            onClick={() => setSelectedImage(image)}
          >
            <img src={image} alt={\`Gallery \${index + 1}\`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      
      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Selected" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
};

export default ImageGallery;`,

      // Interactive Components
      'kanban-board': () => `
import React, { useState } from 'react';

const KanbanBoard = ({ columns: initialColumns }) => {
  const [columns, setColumns] = useState(initialColumns);

  const handleDragStart = (e, item, sourceColumn) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, sourceColumn }));
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    const { item, sourceColumn } = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (sourceColumn !== targetColumn) {
      // Move item between columns
      setColumns(prev => ({
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter(i => i.id !== item.id),
        [targetColumn]: [...prev[targetColumn], item]
      }));
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg overflow-x-auto">
      {Object.entries(columns).map(([columnId, column]) => (
        <div
          key={columnId}
          className="flex-shrink-0 w-72 bg-white rounded-lg p-4 shadow-sm"
          onDragOver={e => e.preventDefault()}
          onDrop={e => handleDrop(e, columnId)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{column.title}</h3>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {column.items.length}
            </span>
          </div>
          
          <div className="space-y-3 min-h-32">
            {column.items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={e => handleDragStart(e, item, columnId)}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;`
    };

    const generator = codeMap[componentType];
    if (generator) {
      return {
        react: generator(),
        tailwind: `/* ${componentType} component uses Tailwind utility classes */`,
        html: '',
        css: ''
      };
    }

    // Default fallback
    return {
      react: `// ${componentType} component\nconst ${componentType.charAt(0).toUpperCase() + componentType.slice(1)} = () => {\n  return <div>{/* Component implementation */}</div>;\n};`,
      tailwind: `/* ${componentType} classes */`,
      html: '',
      css: ''
    };
  }

  // Enhanced component validation
  validateComponentDrop(componentType, dropTarget, frameType) {
      const layoutElements = ['div', 'section', 'container', 'flex', 'grid'];
      const isLayoutElement = layoutElements.includes(componentType);
      
      if (frameType === 'page') {
          if (dropTarget === 'canvas-root') {
              return {
                  allowed: isLayoutElement,
                  message: isLayoutElement 
                      ? null 
                      : 'Pages must start with Layout elements (Section, Container, etc.)'
              };
          }
          
          if (dropTarget?.startsWith('section-') || dropTarget?.startsWith('container-')) {
              return { allowed: true, message: null };
          }
      }
      
      if (frameType === 'component') {
          return { allowed: true, message: null };
      }
      
      return { allowed: true, message: null };
  }

  // Create layout element with proper defaults
  createLayoutElement(elementType, props = {}) {
      const layoutDefaults = {
          section: {
              display: 'block',
              width: '100%',
              minHeight: '200px',
              padding: '48px 24px',
              backgroundColor: '#ffffff',
              margin: '0 0 32px 0'
          },
          container: {
              display: 'block',
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 24px'
          },
          flex: {
              display: 'flex',
              flexDirection: 'row',
              gap: '16px',
              alignItems: 'stretch'
          },
          grid: {
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px'
          },
          div: {
              display: 'block',
              minHeight: '50px',
              padding: '16px',
              border: '2px dashed #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb'
          }
      };

      return {
          id: `${elementType}_${Date.now()}`,
          type: elementType,
          props: {
              ...this.getComponentDefinition(elementType)?.default_props,
              ...props
          },
          position: { x: 0, y: 0 },
          name: this.getComponentDefinition(elementType)?.name || elementType,
          style: layoutDefaults[elementType] || {},
          animation: {},
          children: []
      };
  }

  // Get component by type
  getComponent(type) {
      return this.components.get(type);
  }

  getComponent(type) {
    return this.components.get(type);
  }

  getComponentDefinition(type) {
    return this.componentDefinitions.get(type);
  }

  getAllComponents() {
    return Object.fromEntries(this.components);
  }

  getAllComponentDefinitions() {
    return Object.fromEntries(this.componentDefinitions);
  }

  // Save/load methods remain the same...
  async saveProjectComponents(projectId, frameId, components) {
      try {
          console.log('ComponentLibraryService: Save requested for frame:', frameId, 'with', components.length, 'components');
          
          if (this.isUndoRedoInProgress(frameId)) {
              console.log('ComponentLibraryService: Skipping save - undo/redo in progress');
              return true;
          }
          
          if (this.saveQueue.has(frameId)) {
              clearTimeout(this.saveQueue.get(frameId));
              console.log('ComponentLibraryService: Cleared previous save timeout for frame:', frameId);
          }
          
          if (this.isSaving.get(frameId)) {
              console.log('ComponentLibraryService: Save already in progress for frame:', frameId, '- queuing new save');
              
              const timeoutId = setTimeout(() => {
                  this.saveQueue.delete(frameId);
                  this.executeSave(projectId, frameId, components);
              }, this.saveDebounceTime);
              
              this.saveQueue.set(frameId, timeoutId);
              return true;
          }
          
          return await this.executeSave(projectId, frameId, components);
          
      } catch (error) {
          console.error('ComponentLibraryService: Save failed:', error);
          this.isSaving.set(frameId, false);
          throw error;
      }
  }
  
  async executeSave(projectId, frameId, components) {
      try {
          this.isSaving.set(frameId, true);
          
          console.log('ComponentLibraryService: Executing save for frame:', frameId);
          
          const response = await axios.post('/api/project-components/bulk-update', {
              project_id: projectId,
              frame_id: frameId,
              components: components.map(comp => {
                  const componentDef = this.componentDefinitions.get(comp.type);
                  
                  return {
                      component_instance_id: comp.id,
                      component_type: comp.type,
                      props: comp.props || {},
                      position: comp.position,
                      name: comp.name || componentDef?.name || comp.type,
                      z_index: comp.zIndex || 0,
                      variant: comp.variant || null,
                      style: comp.style || {},
                      animation: comp.animation || {}
                  };
              }),
              create_revision: false
          });
          
          if (response.data.success) {
              console.log('ComponentLibraryService: Successfully saved', components.length, 'components to database');
              return true;
          } else {
              console.error('ComponentLibraryService: Backend save failed:', response.data.message);
              return false;
          }
          
      } catch (error) {
          console.error('ComponentLibraryService: Save execution failed:', error);
          throw error;
      } finally {
          this.isSaving.set(frameId, false);
      }
  }

  async loadProjectComponents(projectId, frameId) {
      try {
          console.log('ComponentLibraryService: Loading components for frame:', frameId);
          
          if (this.isSaving.get(frameId)) {
              console.log('ComponentLibraryService: Waiting for save to complete before loading');
              await new Promise(resolve => {
                  const checkSave = () => {
                      if (!this.isSaving.get(frameId)) {
                          resolve();
                      } else {
                          setTimeout(checkSave, 100);
                      }
                  };
                  checkSave();
              });
          }
          
          const response = await axios.get('/api/project-components', {
              params: { project_id: projectId, frame_id: frameId }
          });
          
          if (response.data.success) {
              const components = response.data.data;
              console.log('ComponentLibraryService: Loaded', components.length, 'components from backend');
              
              return components.map(comp => {
                  const componentDef = this.componentDefinitions.get(comp.type);
                  
                  return {
                      id: comp.id,
                      type: comp.type,
                      props: {
                        ...componentDef?.default_props,
                          ...comp.props
                      },
                      position: comp.position,
                      name: comp.name,
                      zIndex: comp.zIndex || 0,
                      variant: comp.variant,
                      style: comp.style || {},
                      animation: comp.animation || {}
                  };
              });
          }
          
          return [];
      } catch (error) {
          console.error('ComponentLibraryService: Load failed:', error);
          return [];
      }
  }

  async forceSave(projectId, frameId, components, options = {}) {
      try {
          console.log('ComponentLibraryService: FORCE SAVE requested for frame:', frameId);
          
          this.undoRedoInProgress.set(frameId, true);
          
          if (this.saveQueue.has(frameId)) {
              clearTimeout(this.saveQueue.get(frameId));
              this.saveQueue.delete(frameId);
          }
          
          if (this.isSaving.get(frameId)) {
              console.log('ComponentLibraryService: Waiting for current save to complete');
              await new Promise(resolve => {
                  const checkSave = () => {
                      if (!this.isSaving.get(frameId)) {
                          resolve();
                      } else {
                          setTimeout(checkSave, 50);
                      }
                  };
                  checkSave();
              });
          }
          
          const result = await this.executeSave(projectId, frameId, components);
          
          console.log('ComponentLibraryService: Force save completed for frame:', frameId);
          return result;
          
      } catch (error) {
          console.error('ComponentLibraryService: Force save failed:', error);
          throw error;
      } finally {
          setTimeout(() => {
              this.undoRedoInProgress.set(frameId, false);
          }, 1000);
      }
  }
  
  isUndoRedoInProgress(frameId) {
      return this.undoRedoInProgress.get(frameId) || false;
  }
  
  clearSaveQueue(frameId) {
      if (this.saveQueue.has(frameId)) {
          clearTimeout(this.saveQueue.get(frameId));
          this.saveQueue.delete(frameId);
          console.log('ComponentLibraryService: Cleared save queue for frame:', frameId);
      }
      
      this.undoRedoInProgress.set(frameId, true);
      
      setTimeout(() => {
          this.undoRedoInProgress.set(frameId, false);
      }, 2000);
  }

  hasPendingSave(frameId) {
      return this.saveQueue.has(frameId) || 
             this.isSaving.get(frameId) || 
             this.isUndoRedoInProgress(frameId);
  }
  
  
  
    // ADD THESE RENDERER METHODS TO ComponentLibraryService.js
  
  // Text/Typography renderers
  renderH1(props, id, layoutStyles = {}) {
      const headingStyle = {
          fontSize: '2.25rem', // text-4xl
          fontWeight: props.weight === 'extrabold' ? '800' : 
                     props.weight === 'bold' ? '700' : 
                     props.weight === 'semibold' ? '600' : 
                     props.weight === 'medium' ? '500' : '400',
          textAlign: props.align || 'left',
          color: props.color || '#1f2937',
          lineHeight: '1.1',
          marginBottom: '1rem',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('h1', {
          key: id,
          style: headingStyle
      }, props.text || 'Main Heading');
  }
  
  renderH2(props, id, layoutStyles = {}) {
      const headingStyle = {
          fontSize: '1.875rem', // text-3xl
          fontWeight: props.weight === 'bold' ? '700' : 
                     props.weight === 'semibold' ? '600' : 
                     props.weight === 'medium' ? '500' : '600',
          textAlign: props.align || 'left',
          color: props.color || '#1f2937',
          lineHeight: '1.2',
          marginBottom: '0.75rem',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('h2', {
          key: id,
          style: headingStyle
      }, props.text || 'Section Heading');
  }
  
  renderH3(props, id, layoutStyles = {}) {
      const headingStyle = {
          fontSize: '1.25rem', // text-xl
          fontWeight: '600',
          textAlign: props.align || 'left',
          color: props.color || '#1f2937',
          lineHeight: '1.3',
          marginBottom: '0.5rem',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('h3', {
          key: id,
          style: headingStyle
      }, props.text || 'Subheading');
  }
  
  renderP(props, id, layoutStyles = {}) {
      const fontSize = {
          'sm': '0.875rem',
          'base': '1rem',
          'lg': '1.125rem',
          'xl': '1.25rem'
      };
      
      const lineHeightMap = {
          'tight': '1.25',
          'normal': '1.5',
          'relaxed': '1.625',
          'loose': '2'
      };
      
      const paragraphStyle = {
          fontSize: fontSize[props.size] || '1rem',
          textAlign: props.align || 'left',
          color: props.color || '#6b7280',
          lineHeight: lineHeightMap[props.lineHeight] || '1.625',
          marginBottom: '1rem',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('p', {
          key: id,
          style: paragraphStyle
      }, props.text || 'This is a paragraph of text content.');
  }
  
  renderLink(props, id, layoutStyles = {}) {
      const linkStyle = {
          color: props.color || '#3b82f6',
          textDecoration: props.underline ? 'underline' : 'none',
          cursor: 'pointer',
          transition: 'color 0.2s ease',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('a', {
          key: id,
          href: props.href || '#',
          target: props.target || '_self',
          style: linkStyle,
          onMouseEnter: (e) => {
              e.target.style.opacity = '0.8';
          },
          onMouseLeave: (e) => {
              e.target.style.opacity = '1';
          }
      }, props.text || 'Click here');
  }
  
  renderBlockquote(props, id, layoutStyles = {}) {
      const quoteStyle = props.style === 'card' ? {
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #3b82f6',
          ...layoutStyles,
          ...props.style
      } : props.style === 'highlighted' ? {
          backgroundColor: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          borderLeft: '4px solid #64748b',
          ...layoutStyles,
          ...props.style
      } : {
          borderLeft: '4px solid #e5e7eb',
          paddingLeft: '1rem',
          margin: '1rem 0',
          fontStyle: 'italic',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('blockquote', {
          key: id,
          style: quoteStyle
      }, [
          React.createElement('p', {
              key: `${id}-text`,
              style: { 
                  fontStyle: 'italic', 
                  marginBottom: props.author ? '1rem' : '0',
                  color: '#374151',
                  fontSize: '1.125rem'
              }
          }, `"${props.text || 'Quote text'}"`),
          (props.author || props.role) && React.createElement('cite', {
              key: `${id}-author`,
              style: { 
                  fontSize: '0.875rem', 
                  fontStyle: 'normal',
                  fontWeight: '500',
                  color: '#1f2937'
              }
          }, `— ${props.author || 'Author'}${props.role ? `, ${props.role}` : ''}`)
      ]);
  }
  
  renderCode(props, id, layoutStyles = {}) {
      const codeStyle = {
          backgroundColor: props.theme === 'dark' ? '#1f2937' : '#f3f4f6',
          color: props.theme === 'dark' ? '#f9fafb' : '#374151',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('pre', {
          key: id,
          style: codeStyle
      }, React.createElement('code', {}, props.code || 'const example = "code";'));
  }
  
  renderCodeInline(props, id, layoutStyles = {}) {
      const inlineCodeStyle = {
          backgroundColor: props.background || '#f3f4f6',
          color: props.color || '#dc2626',
          padding: '0.125rem 0.25rem',
          borderRadius: '0.25rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('code', {
          key: id,
          style: inlineCodeStyle
      }, props.code || 'code');
  }
  
  renderList(props, id, layoutStyles = {}) {
      const listStyle = {
          margin: '1rem 0',
          paddingLeft: props.type === 'ordered' ? '1.5rem' : '1.5rem',
          ...layoutStyles,
          ...props.style
      };
      
      const itemSpacing = {
          'tight': '0.25rem',
          'normal': '0.5rem',
          'loose': '1rem'
      };
      
      const items = (props.items || []).map((item, index) => 
          React.createElement('li', {
              key: `${id}-item-${index}`,
              style: { 
                  marginBottom: itemSpacing[props.spacing] || '0.5rem',
                  color: '#374151'
              }
          }, item)
      );
      
      return React.createElement(props.type === 'ordered' ? 'ol' : 'ul', {
          key: id,
          style: {
              ...listStyle,
              listStyleType: props.style || (props.type === 'ordered' ? 'decimal' : 'disc')
          }
      }, items);
  }
  
  renderHighlight(props, id, layoutStyles = {}) {
      const highlightStyle = props.style === 'background' ? {
          backgroundColor: props.backgroundColor || '#fef08a',
          color: props.textColor || '#713f12',
          padding: '0.125rem 0.25rem',
          borderRadius: '0.25rem',
          ...layoutStyles,
          ...props.style
      } : props.style === 'underline' ? {
          textDecoration: 'underline',
          textDecorationColor: props.backgroundColor || '#fef08a',
          textDecorationThickness: '3px',
          color: props.textColor || '#713f12',
          ...layoutStyles,
          ...props.style
      } : {
          backgroundColor: props.backgroundColor || '#fef08a',
          color: props.textColor || '#713f12',
          padding: '0.125rem 0.25rem',
          borderRadius: '0.25rem',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('span', {
          key: id,
          style: highlightStyle
      }, props.text || 'Highlighted text');
  }
  
  // Advanced component renderers
  renderAccordion(props, id, layoutStyles = {}) {
      const items = props.items || [];
      
      return React.createElement('div', {
          key: id,
          className: 'space-y-2',
          style: { ...layoutStyles, ...props.style }
      }, items.map((item, index) => 
          React.createElement('div', {
              key: `${id}-item-${index}`,
              className: 'border border-gray-200 rounded-lg'
          }, [
              React.createElement('button', {
                  key: `${id}-header-${index}`,
                  className: 'w-full p-4 text-left flex justify-between items-center hover:bg-gray-50',
                  style: { borderBottom: '1px solid #e5e7eb' }
              }, [
                  React.createElement('span', {
                      key: `${id}-title-${index}`,
                      className: 'font-medium'
                  }, item.title || `Section ${index + 1}`),
                  React.createElement('svg', {
                      key: `${id}-chevron-${index}`,
                      className: 'w-5 h-5',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20'
                  }, React.createElement('path', {
                      fillRule: 'evenodd',
                      d: 'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z',
                      clipRule: 'evenodd'
                  }))
              ]),
              React.createElement('div', {
                  key: `${id}-content-${index}`,
                  className: 'p-4 text-gray-600',
                  style: { display: index === 0 ? 'block' : 'none' }
              }, item.content || `Content for ${item.title}`)
          ])
      ));
  }
  
  renderTimeline(props, id, layoutStyles = {}) {
      const items = props.items || [];
      
      return React.createElement('div', {
          key: id,
          className: 'space-y-8',
          style: { ...layoutStyles, ...props.style }
      }, items.map((item, index) => 
          React.createElement('div', {
              key: `${id}-item-${index}`,
              className: 'flex'
          }, [
              React.createElement('div', {
                  key: `${id}-marker-${index}`,
                  className: 'flex-shrink-0 w-4 h-4 bg-blue-600 rounded-full mt-1'
              }),
              React.createElement('div', {
                  key: `${id}-content-${index}`,
                  className: 'ml-4'
              }, [
                  React.createElement('h3', {
                      key: `${id}-title-${index}`,
                      className: 'font-semibold text-gray-900'
                  }, item.title || `Event ${index + 1}`),
                  React.createElement('p', {
                      key: `${id}-date-${index}`,
                      className: 'text-sm text-gray-500'
                  }, item.date || new Date().toLocaleDateString()),
                  React.createElement('p', {
                      key: `${id}-desc-${index}`,
                      className: 'text-gray-600 mt-1'
                  }, item.description || 'Event description')
              ])
          ])
      ));
  }
  
  renderCarousel(props, id, layoutStyles = {}) {
      const images = props.images || [];
      
      return React.createElement('div', {
          key: id,
          className: 'relative max-w-md mx-auto',
          style: { ...layoutStyles, ...props.style }
      }, [
          React.createElement('div', {
              key: `${id}-container`,
              className: 'overflow-hidden rounded-lg'
          }, React.createElement('img', {
              key: `${id}-image`,
              src: images[0] || 'https://via.placeholder.com/400x300?text=Image',
              alt: 'Carousel image',
              className: 'w-full h-auto'
          })),
          props.showDots && React.createElement('div', {
              key: `${id}-dots`,
              className: 'flex justify-center mt-4 space-x-2'
          }, images.map((_, index) => 
              React.createElement('div', {
                  key: `${id}-dot-${index}`,
                  className: `w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'}`
              })
          ))
      ]);
  }
  
  renderSkeleton(props, id, layoutStyles = {}) {
      const skeletonStyle = {
          width: props.width || '100%',
          height: props.height || '20px',
          backgroundColor: '#e5e7eb',
          borderRadius: props.variant === 'circle' ? '50%' : '0.25rem',
          ...layoutStyles,
          ...props.style
      };
      
      if (props.animated) {
          skeletonStyle.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
      }
      
      if (props.variant === 'card') {
          return React.createElement('div', {
              key: id,
              className: 'animate-pulse',
              style: { ...layoutStyles, ...props.style }
          }, [
              React.createElement('div', {
                  key: `${id}-image`,
                  style: {
                      backgroundColor: '#d1d5db',
                      borderRadius: '0.5rem',
                      height: '12rem',
                      width: '100%',
                      marginBottom: '1rem'
                  }
              }),
              React.createElement('div', {
                  key: `${id}-lines`,
                  className: 'space-y-2'
              }, [
                  React.createElement('div', {
                      key: `${id}-line1`,
                      style: {
                          backgroundColor: '#d1d5db',
                          borderRadius: '0.25rem',
                          height: '1rem',
                          width: '75%'
                      }
                  }),
                  React.createElement('div', {
                      key: `${id}-line2`,
                      style: {
                          backgroundColor: '#d1d5db',
                          borderRadius: '0.25rem',
                          height: '1rem',
                          width: '50%'
                      }
                  })
              ])
          ]);
      }
      
      return React.createElement('div', {
          key: id,
          style: skeletonStyle
      });
  }
  
  renderSpacer(props, id, layoutStyles = {}) {
      const spacerStyle = {
          width: props.width || '100%',
          height: props.height || '20px',
          backgroundColor: 'transparent',
          ...layoutStyles,
          ...props.style
      };
      
      return React.createElement('div', {
          key: id,
          style: spacerStyle
      });
  }
}

// Create singleton instance
export const componentLibraryService = new ComponentLibraryService();
export default componentLibraryService;