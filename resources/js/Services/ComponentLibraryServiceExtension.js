// @/Services/ComponentLibraryServiceExtension.js - Enhanced Renderer Extension
import React from 'react';

export class ComponentLibraryServiceExtension {
  constructor(baseService) {
    this.base = baseService;
  }

  // Enhanced renderer with new component types
  renderComponentExtension(componentDef, props, id, layoutStyles = {}) {
    const mergedProps = { 
      ...componentDef.default_props,
      ...props.props,
      ...props
    };

    // Check for variant-specific rendering first
    if (props.variant && componentDef.variants) {
      const variantData = componentDef.variants.find(v => v.name === props.variant.name);
      if (variantData && variantData.preview_code) {
        return React.createElement('div', {
          key: id,
          dangerouslySetInnerHTML: {
            __html: variantData.preview_code.replace(/className=/g, 'class=')
          }
        });
      }
    }

    // Route to extended renderers
    switch (componentDef.type) {
      // Form Components
      case 'text-input':
        return this.renderTextInput(mergedProps, id, layoutStyles);
      case 'multi-select':
        return this.renderMultiSelect(mergedProps, id, layoutStyles);
      case 'file-upload':
        return this.renderFileUpload(mergedProps, id, layoutStyles);
      case 'date-picker':
        return this.renderDatePicker(mergedProps, id, layoutStyles);
      case 'color-picker':
        return this.renderColorPicker(mergedProps, id, layoutStyles);
      case 'range-slider':
        return this.renderRangeSlider(mergedProps, id, layoutStyles);
      case 'rating':
        return this.renderRating(mergedProps, id, layoutStyles);

      // Media Components
      case 'image-gallery':
        return this.renderImageGallery(mergedProps, id, layoutStyles);
      case 'video-player':
        return this.renderVideoPlayer(mergedProps, id, layoutStyles);
      case 'audio-player':
        return this.renderAudioPlayer(mergedProps, id, layoutStyles);
      case 'qr-code':
        return this.renderQRCode(mergedProps, id, layoutStyles);

      // 3D and Animation Components
      case '3d-model-viewer':
        return this.render3DModelViewer(mergedProps, id, layoutStyles);
      case '3d-scene':
        return this.render3DScene(mergedProps, id, layoutStyles);
      case 'particle-system':
        return this.renderParticleSystem(mergedProps, id, layoutStyles);
      case 'gsap-animation':
        return this.renderGSAPAnimation(mergedProps, id, layoutStyles);
      case 'css-animation':
        return this.renderCSSAnimation(mergedProps, id, layoutStyles);

      // Layout Components
      case 'masonry-grid':
        return this.renderMasonryGrid(mergedProps, id, layoutStyles);
      case 'sticky-sidebar':
        return this.renderStickySidebar(mergedProps, id, layoutStyles);
      case 'parallax-container':
        return this.renderParallaxContainer(mergedProps, id, layoutStyles);
      case 'split-screen':
        return this.renderSplitScreen(mergedProps, id, layoutStyles);
      case 'infinite-scroll':
        return this.renderInfiniteScroll(mergedProps, id, layoutStyles);
      case 'drag-grid':
        return this.renderDragGrid(mergedProps, id, layoutStyles);

      // E-commerce Components
      case 'product-card':
        return this.renderProductCard(mergedProps, id, layoutStyles);
      case 'shopping-cart':
        return this.renderShoppingCart(mergedProps, id, layoutStyles);
      case 'pricing-table':
        return this.renderPricingTable(mergedProps, id, layoutStyles);

      // Marketing Components
      case 'testimonial':
        return this.renderTestimonial(mergedProps, id, layoutStyles);
      case 'cta-banner':
        return this.renderCTABanner(mergedProps, id, layoutStyles);
      case 'feature-grid':
        return this.renderFeatureGrid(mergedProps, id, layoutStyles);
      case 'countdown-timer':
        return this.renderCountdownTimer(mergedProps, id, layoutStyles);

      // Content Components
      case 'rich-text-editor':
        return this.renderRichTextEditor(mergedProps, id, layoutStyles);
      case 'code-block':
        return this.renderCodeBlock(mergedProps, id, layoutStyles);
      case 'faq-section':
        return this.renderFAQSection(mergedProps, id, layoutStyles);
      case 'table-of-contents':
        return this.renderTableOfContents(mergedProps, id, layoutStyles);
      case 'contact-form':
        return this.renderContactForm(mergedProps, id, layoutStyles);
      case 'social-proof':
        return this.renderSocialProof(mergedProps, id, layoutStyles);

      // Interactive Components
      case 'drag-drop-builder':
        return this.renderDragDropBuilder(mergedProps, id, layoutStyles);
      case 'virtual-scroller':
        return this.renderVirtualScroller(mergedProps, id, layoutStyles);
      case 'command-palette':
        return this.renderCommandPalette(mergedProps, id, layoutStyles);
      case 'kanban-board':
        return this.renderKanbanBoard(mergedProps, id, layoutStyles);
      case 'data-visualization':
        return this.renderDataVisualization(mergedProps, id, layoutStyles);
      case 'sortable-list':
        return this.renderSortableList(mergedProps, id, layoutStyles);
      case 'chat-interface':
        return this.renderChatInterface(mergedProps, id, layoutStyles);

      // Maps
      case 'interactive-map':
        return this.renderInteractiveMap(mergedProps, id, layoutStyles);

      default:
        // Fall back to base service
        return this.base.renderComponent(componentDef, props, id);
    }
  }

  // FORM COMPONENT RENDERERS
  renderTextInput(props, id, layoutStyles = {}) {
    const inputStyle = {
      width: '100%',
      maxWidth: '300px',
      ...layoutStyles,
      ...props.style
    };

    const className = this.getInputClasses(props);

    return React.createElement('div', {
      key: id,
      style: inputStyle
    }, [
      props.label && React.createElement('label', {
        key: `${id}-label`,
        className: 'block text-sm font-medium text-gray-700 mb-1'
      }, props.label),
      React.createElement('input', {
        key: `${id}-input`,
        type: props.type || 'text',
        placeholder: props.placeholder || 'Enter text...',
        className: className,
        disabled: props.disabled || false,
        required: props.required || false
      })
    ]);
  }

  renderMultiSelect(props, id, layoutStyles = {}) {
    const containerStyle = {
      width: '100%',
      maxWidth: '300px',
      ...layoutStyles,
      ...props.style
    };

    return React.createElement('div', {
      key: id,
      style: containerStyle,
      className: 'relative'
    }, [
      React.createElement('div', {
        key: `${id}-container`,
        className: 'border border-gray-300 rounded-lg p-3 bg-white cursor-pointer hover:border-blue-500 transition-colors'
      }, [
        React.createElement('div', {
          key: `${id}-placeholder`,
          className: 'text-gray-500 text-sm'
        }, props.placeholder || 'Select options...'),
        React.createElement('div', {
          key: `${id}-selected`,
          className: 'flex flex-wrap gap-1 mt-2'
        }, [
          React.createElement('span', {
            key: `${id}-tag-1`,
            className: 'bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'
          }, 'Option 1'),
          React.createElement('span', {
            key: `${id}-tag-2`,
            className: 'bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'
          }, 'Option 2')
        ])
      ])
    ]);
  }

  renderFileUpload(props, id, layoutStyles = {}) {
    const containerStyle = {
      width: '100%',
      ...layoutStyles,
      ...props.style
    };

    return React.createElement('div', {
      key: id,
      style: containerStyle,
      className: 'border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer'
    }, [
      React.createElement('svg', {
        key: `${id}-icon`,
        className: 'w-12 h-12 mx-auto mb-4 text-gray-400'
      }, React.createElement('path', {
        d: 'M7 14l3-3 3 3M12 17V5M5 7h14'
      })),
      React.createElement('p', {
        key: `${id}-text`,
        className: 'text-gray-600'
      }, 'Drop files here or click to browse'),
      React.createElement('p', {
        key: `${id}-subtext`,
        className: 'text-xs text-gray-500 mt-2'
      }, `Max size: ${props.maxSize || '5MB'}`)
    ]);
  }

  renderRating(props, id, layoutStyles = {}) {
    const containerStyle = {
      display: 'inline-flex',
      gap: '4px',
      ...layoutStyles,
      ...props.style
    };

    const max = props.max || 5;
    const value = props.value || 0;

    return React.createElement('div', {
      key: id,
      style: containerStyle
    }, Array.from({ length: max }, (_, i) => 
      React.createElement('svg', {
        key: `${id}-star-${i}`,
        className: `w-5 h-5 ${i < value ? 'text-yellow-400 fill-current' : 'text-gray-300'}`,
        viewBox: '0 0 20 20'
      }, React.createElement('path', {
        d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
      }))
    ));
  }

  // MEDIA COMPONENT RENDERERS
  renderImageGallery(props, id, layoutStyles = {}) {
    const containerStyle = {
      width: '100%',
      ...layoutStyles,
      ...props.style
    };

    const images = props.images || [];
    const columns = props.columns || 3;

    return React.createElement('div', {
      key: id,
      style: containerStyle,
      className: `grid grid-cols-${columns} gap-4`
    }, images.slice(0, 6).map((img, index) =>
      React.createElement('div', {
        key: `${id}-img-${index}`,
        className: 'aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity'
      }, React.createElement('img', {
        src: img,
        alt: `Gallery image ${index + 1}`,
        className: 'w-full h-full object-cover'
      }))
    ));
  }

  renderVideoPlayer(props, id, layoutStyles = {}) {
    const containerStyle = {
      width: '100%',
      aspectRatio: '16/9',
      backgroundColor: '#000000',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      ...layoutStyles,
      ...props.style
    };

    return React.createElement('div', {
      key: id,
      style: containerStyle,
      className: 'relative group cursor-pointer'
    }, [
      props.poster && React.createElement('img', {
        key: `${id}-poster`,
        src: props.poster,
        alt: 'Video poster',
        className: 'w-full h-full object-cover'
      }),
      React.createElement('div', {
        key: `${id}-overlay`,
        className: 'absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors'
      }, React.createElement('div', {
        className: 'w-16 h-16 bg-white/90 rounded-full flex items-center justify-center'
      }, React.createElement('svg', {
        className: 'w-6 h-6 text-black ml-1'
      }, React.createElement('path', {
        fill: 'currentColor',
        d: 'M8 5v14l11-7z'
      }))))
    ]);
  }

 


  // 3D COMPONENT RENDERERS
  render3DModelViewer(props, id, layoutStyles = {}) {
    const containerStyle = {
      width: '100%',
      height: '300px',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.5rem',
      ...layoutStyles,
      ...props.style
    };

    return React.createElement('div', {
      key: id,
      style: containerStyle,
      className: 'relative overflow-hidden'
    }, [
      React.createElement('div', {
        key: `${id}-scene`,
        className: 'absolute inset-0 flex items-center justify-center'
      }, [
        React.createElement('div', {
          key: `${id}-model`,
          className: 'w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-2xl transform rotate-12 animate-pulse',
          style: { 
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            animation: 'rotate3d 4s linear infinite'
          }
        })
      ]),
      React.createElement('div', {
        key: `${id}-controls`,
        className: 'absolute bottom-4 right-4 flex gap-2'
      }, [
        React.createElement('button', {
          key: `${id}-rotate`,
          className: 'w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-colors'
        }, '🔄'),
        React.createElement('button', {
          key: `${id}-zoom`,
          className: 'w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-colors'
        }, '🔍')
      ])
    ]);
  }

  // LAYOUT COMPONENT RENDERERS
  renderMasonryGrid(props, id, layoutStyles = {}) {
    const containerStyle = {
      width: '100%',
      ...layoutStyles,
      ...props.style
    };

    const columns = props.columns || 3;

    return React.createElement('div', {
      key: id,
      style: containerStyle,
      className: `columns-${columns} gap-4 space-y-4`
    }, [
      React.createElement('div', {
        key: `${id}-item-1`,
        className: 'break-inside-avoid bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg p-4 h-32'
      }),
      React.createElement('div', {
        key: `${id}-item-2`,
        className: 'break-inside-avoid bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg p-4 h-24'
      }),
      React.createElement('div', {
        key: `${id}-item-3`,
        className: 'break-inside-avoid bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg p-4 h-40'
      }),
      React.createElement('div', {
        key: `${id}-item-4`,
        className: 'break-inside-avoid bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg p-4 h-28'
      })
    ]);
  }

  // E-COMMERCE COMPONENT RENDERERS
  renderProductCard(props, id, layoutStyles = {}) {
    const containerStyle = {
      width: '100%',
      maxWidth: '300px',
      ...layoutStyles,
      ...props.style
    };

    return React.createElement('div', {
      key: id,
      style: containerStyle,
      className: 'bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer'
    }, [
      React.createElement('div', {
        key: `${id}-image`,
        className: 'relative aspect-square'
      }, [
        React.createElement('img', {
          key: `${id}-img`,
          src: props.image || 'https://via.placeholder.com/300x300/3b82f6/ffffff?text=Product',
          alt: props.name || 'Product',
          className: 'w-full h-full object-cover'
        }),
        props.badge && React.createElement('div', {
          key: `${id}-badge`,
          className: 'absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold'
        }, props.badge)
      ]),
      React.createElement('div', {
        key: `${id}-content`,
        className: 'p-4'
      }, [
        React.createElement('h3', {
          key: `${id}-name`,
          className: 'font-semibold text-gray-900 mb-2 truncate'
        }, props.name || 'Product Name'),
        props.rating && React.createElement('div', {
          key: `${id}-rating`,
          className: 'flex items-center mb-2'
        }, [
          this.renderRating({ value: props.rating, max: 5 }, `${id}-rating-stars`),
          React.createElement('span', {
            key: `${id}-reviews`,
            className: 'text-sm text-gray-600 ml-2'
          }, `(${props.reviews || 0})`)
        ]),
        React.createElement('div', {
          key: `${id}-price-section`,
          className: 'flex items-center justify-between'
        }, [
          React.createElement('div', {
            key: `${id}-prices`
          }, [
            React.createElement('span', {
              key: `${id}-price`,
              className: 'text-lg font-bold text-gray-900'
            }, props.price || '$99.99'),
            props.originalPrice && React.createElement('span', {
              key: `${id}-original-price`,
              className: 'text-sm text-gray-500 line-through ml-2'
            }, props.originalPrice)
          ]),
          React.createElement('button', {
            key: `${id}-add-to-cart`,
            className: 'bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors'
          }, '🛒 Add')
        ])
      ])
    ]);
  }

  // INTERACTIVE COMPONENT RENDERERS
  renderKanbanBoard(props, id, layoutStyles = {}) {
    const containerStyle = {
      width: '100%',
      overflowX: 'auto',
      ...layoutStyles,
      ...props.style
    };

    const columns = props.columns || [
      { id: 'todo', title: 'To Do', items: [] },
      { id: 'progress', title: 'In Progress', items: [] },
      { id: 'done', title: 'Done', items: [] }
    ];

    return React.createElement('div', {
      key: id,
      style: containerStyle,
      className: 'flex gap-4 p-4 bg-gray-50 rounded-lg'
    }, columns.map((column, colIndex) =>
      React.createElement('div', {
        key: `${id}-col-${colIndex}`,
        className: 'flex-shrink-0 w-72 bg-white rounded-lg p-4 shadow-sm'
      }, [
        React.createElement('div', {
          key: `${id}-col-header-${colIndex}`,
          className: 'flex items-center justify-between mb-4'
        }, [
          React.createElement('h3', {
            key: `${id}-col-title-${colIndex}`,
            className: 'font-semibold text-gray-800'
          }, column.title),
          React.createElement('span', {
            key: `${id}-col-count-${colIndex}`,
            className: 'text-xs bg-gray-100 px-2 py-1 rounded-full'
          }, column.items?.length || 0)
        ]),
        React.createElement('div', {
          key: `${id}-col-items-${colIndex}`,
          className: 'space-y-3 min-h-32'
        }, (column.items || []).slice(0, 3).map((item, itemIndex) =>
          React.createElement('div', {
            key: `${id}-item-${colIndex}-${itemIndex}`,
            className: 'bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow'
          }, [
            React.createElement('h4', {
              key: `${id}-item-title-${colIndex}-${itemIndex}`,
              className: 'font-medium text-sm mb-1'
            }, item.title || `Task ${itemIndex + 1}`),
            React.createElement('p', {
              key: `${id}-item-desc-${colIndex}-${itemIndex}`,
              className: 'text-xs text-gray-600'
            }, item.description || 'Task description')
          ])
        ))
      ])
    ));
  }

  renderChatInterface(props, id, layoutStyles = {}) {
    const containerStyle = {
      width: '100%',
      maxWidth: '400px',
      height: '500px',
      ...layoutStyles,
      ...props.style
    };

    const messages = props.messages || [];

    return React.createElement('div', {
      key: id,
      style: containerStyle,
      className: 'bg-white rounded-2xl shadow-xl flex flex-col'
    }, [
      React.createElement('div', {
        key: `${id}-header`,
        className: 'bg-blue-600 text-white p-4 rounded-t-2xl flex items-center gap-3'
      }, [
        React.createElement('div', {
          key: `${id}-avatar`,
          className: 'w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'
        }, '💬'),
        React.createElement('div', {
          key: `${id}-info`
        }, [
          React.createElement('div', {
            key: `${id}-name`,
            className: 'font-semibold'
          }, 'Chat'),
          React.createElement('div', {
            key: `${id}-status`,
            className: 'text-xs opacity-80'
          }, 'Online')
        ])
      ]),
      React.createElement('div', {
        key: `${id}-messages`,
        className: 'flex-1 p-4 space-y-3 overflow-y-auto'
      }, messages.slice(0, 4).map((message, msgIndex) =>
        React.createElement('div', {
          key: `${id}-msg-${msgIndex}`,
          className: `flex gap-2 ${message.isMe ? 'justify-end' : ''}`
        }, [
          !message.isMe && React.createElement('div', {
            key: `${id}-msg-avatar-${msgIndex}`,
            className: 'w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs'
          }, message.sender?.charAt(0) || 'U'),
          React.createElement('div', {
            key: `${id}-msg-bubble-${msgIndex}`,
            className: `rounded-2xl px-4 py-2 max-w-xs ${message.isMe 
              ? 'bg-blue-600 text-white rounded-tr-sm' 
              : 'bg-gray-100 rounded-tl-sm'}`
          }, [
            React.createElement('p', {
              key: `${id}-msg-text-${msgIndex}`,
              className: 'text-sm'
            }, message.text),
            React.createElement('span', {
              key: `${id}-msg-time-${msgIndex}`,
              className: `text-xs ${message.isMe ? 'opacity-80' : 'text-gray-500'} mt-1 block`
            }, message.timestamp)
          ])
        ])
      )),
      React.createElement('div', {
        key: `${id}-input`,
        className: 'p-4 border-t'
      }, React.createElement('div', {
        className: 'flex gap-2'
      }, [
        React.createElement('input', {
          key: `${id}-text-input`,
          className: 'flex-1 border rounded-full px-4 py-2 text-sm',
          placeholder: 'Type a message...'
        }),
        React.createElement('button', {
          key: `${id}-send`,
          className: 'bg-blue-600 text-white rounded-full p-2'
        }, '➤')
      ]))
    ]);
  }

  // Utility method to get enhanced input classes
  getInputClasses(props) {
    const baseClasses = "block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";
    
    const variantClasses = {
      default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white",
      error: "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50",
      success: "border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50",
      glass: "bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70",
      floating: "peer border-2 border-gray-300 focus:border-blue-500 placeholder-transparent bg-white"
    };
    
    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-5 py-3 text-lg"
    };
    
    const variant = props.variant || 'default';
    const size = props.size || 'md';
    
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${props.className || ''}`;
  }
}