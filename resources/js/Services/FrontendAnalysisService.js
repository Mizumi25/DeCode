// @/Services/frontendAnalysisService.js
export class FrontendAnalysisService {
  /**
   * Analyze repository contents for frontend files
   */
  static analyzeFrontendFiles(repoContents) {
    const frontendFiles = [];
    
    // Frontend file extensions and their types
    const frontendExtensions = {
      // HTML files
      'html': 'page',
      'htm': 'page',
      
      // React/JSX files
      'jsx': 'component',
      'tsx': 'component',
      
      // Vue files
      'vue': 'component',
      
      // Angular component files
      'component.ts': 'component',
      'component.html': 'component',
      
      // JavaScript/TypeScript files
      'js': 'component',
      'ts': 'component',
      
      // Template engines
      'blade.php': 'page',
      'twig': 'page',
      'hbs': 'page',
      'handlebars': 'page',
      'ejs': 'page',
      'pug': 'page',
      'jade': 'page'
    };
    
    // Skip patterns
    const skipPatterns = [
      'test', 'spec', '.test.', '.spec.', '__test__', '__tests__',
      'config', 'setup', 'webpack', 'babel', 'eslint',
      'package.json', 'tsconfig', 'jest.config',
      '.gitignore', 'readme', 'license', 'node_modules',
      '.git', 'vendor', 'build', 'dist', 'coverage'
    ];
    
    // Frontend directory patterns
    const frontendDirs = [
      'src', 'app', 'components', 'pages', 'views', 'templates',
      'public', 'assets', 'static', 'client', 'frontend',
      'layouts', 'partials', 'includes'
    ];
    
    const analyzeFile = (file) => {
      const { name, path } = file;
      const lowercaseName = name.toLowerCase();
      const lowercasePath = path.toLowerCase();
      
      // Skip files matching skip patterns
      if (skipPatterns.some(pattern => 
        lowercaseName.includes(pattern) || lowercasePath.includes(pattern)
      )) {
        return null;
      }
      
      // Check if file is in frontend directory
      const isInFrontendDir = frontendDirs.some(dir => 
        lowercasePath.includes(`/${dir}/`) || lowercasePath.startsWith(`${dir}/`)
      );
      
      // Determine file type based on extension
      let fileType = null;
      for (const [ext, type] of Object.entries(frontendExtensions)) {
        if (lowercaseName.endsWith(`.${ext}`)) {
          fileType = type;
          break;
        }
      }
      
      if (!fileType && !isInFrontendDir) {
        return null;
      }
      
      // Refine type based on filename and path patterns
      const frameType = this.determineFrameType(name, path, fileType);
      
      if (!frameType) {
        return null;
      }
      
      return {
        name: this.sanitizeFrameName(name.replace(/\.[^/.]+$/, '')), // Remove extension
        filename: name,
        path: path,
        type: frameType,
        file_type: fileType,
        extension: name.split('.').pop(),
        priority: this.getFilePriority(name, path, frameType),
        estimated_complexity: this.estimateComplexity(name, path)
      };
    };
    
    // Process all files
    repoContents.forEach(file => {
      if (file.type === 'file') {
        const analysis = analyzeFile(file);
        if (analysis) {
          frontendFiles.push(analysis);
        }
      }
    });
    
    // Sort by priority and limit results
    return frontendFiles
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 20); // Limit to 20 frames
  }
  
  /**
   * Determine frame type based on file characteristics
   */
  static determineFrameType(filename, path, fileType) {
    const lowercaseFilename = filename.toLowerCase();
    const lowercasePath = path.toLowerCase();
    
    // Page patterns (highest priority)
    const pagePatterns = [
      'index', 'home', 'main', 'app', 'page',
      'dashboard', 'profile', 'settings', 'login', 'register',
      'about', 'contact', 'blog', 'post', 'article',
      'landing', 'welcome', 'hero', 'layout'
    ];
    
    // Check for page patterns in filename or path
    if (pagePatterns.some(pattern => lowercaseFilename.includes(pattern)) ||
        lowercasePath.includes('/pages/') ||
        lowercasePath.includes('/views/') ||
        lowercasePath.includes('/layouts/') ||
        lowercasePath.includes('/templates/')) {
      return 'page';
    }
    
    // Component patterns
    const componentPatterns = [
      'component', 'widget', 'element', 'control',
      'button', 'input', 'form', 'modal', 'dialog',
      'card', 'list', 'item', 'nav', 'menu', 'header', 'footer',
      'sidebar', 'panel', 'tab', 'accordion', 'tooltip'
    ];
    
    if (componentPatterns.some(pattern => lowercaseFilename.includes(pattern)) ||
        lowercasePath.includes('/components/') ||
        lowercasePath.includes('/widgets/') ||
        lowercasePath.includes('/ui/') ||
        lowercasePath.includes('/shared/')) {
      return 'component';
    }
    
    // Default based on file type
    if (fileType === 'page') {
      return 'page';
    }
    
    // Default to component for other frontend files
    return 'component';
  }
  
  /**
   * Get file priority for sorting (lower = higher priority)
   */
  static getFilePriority(filename, path, type) {
    const lowercaseFilename = filename.toLowerCase();
    const lowercasePath = path.toLowerCase();
    
    // High priority files
    if (lowercaseFilename.includes('index') || 
        lowercaseFilename.includes('home') ||
        lowercaseFilename.includes('main') ||
        lowercaseFilename.includes('app')) {
      return 1;
    }
    
    // Pages get priority over components
    if (type === 'page') {
      return 2;
    }
    
    // Important components
    const importantComponents = ['header', 'nav', 'menu', 'layout', 'wrapper'];
    if (importantComponents.some(comp => lowercaseFilename.includes(comp))) {
      return 3;
    }
    
    // Regular components
    if (type === 'component') {
      return 4;
    }
    
    return 5;
  }
  
  /**
   * Estimate file complexity for better frame sizing
   */
  static estimateComplexity(filename, path) {
    const lowercaseFilename = filename.toLowerCase();
    const lowercasePath = path.toLowerCase();
    
    // Complex patterns
    const complexPatterns = [
      'dashboard', 'admin', 'complex', 'layout', 'template',
      'editor', 'builder', 'manager', 'overview'
    ];
    
    if (complexPatterns.some(pattern => 
      lowercaseFilename.includes(pattern) || lowercasePath.includes(pattern)
    )) {
      return 'high';
    }
    
    // Medium complexity
    const mediumPatterns = [
      'form', 'table', 'list', 'grid', 'chart',
      'profile', 'settings', 'modal', 'dialog'
    ];
    
    if (mediumPatterns.some(pattern => 
      lowercaseFilename.includes(pattern) || lowercasePath.includes(pattern)
    )) {
      return 'medium';
    }
    
    return 'simple';
  }
  
  /**
   * Sanitize frame name for display
   */
  static sanitizeFrameName(name) {
    return name
      .replace(/[_-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle camelCase
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }
  
  /**
   * Generate default elements for a frame based on file analysis
   */
  static generateFrameElements(fileData, viewport) {
    const { type, filename, path, estimated_complexity } = fileData;
    
    const baseElements = {
      page: this.generatePageElements(fileData, viewport),
      component: this.generateComponentElements(fileData, viewport)
    };
    
    return baseElements[type] || baseElements.component;
  }
  
  /**
   * Generate page elements
   */
  static generatePageElements(fileData, viewport) {
    const { filename, path } = fileData;
    const pageName = this.sanitizeFrameName(filename.replace(/\.[^/.]+$/, ''));
    
    return [
      {
        id: `github-header-${Date.now()}`,
        type: 'header',
        props: {
          className: 'w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6'
        },
        children: [
          {
            id: `logo-${Date.now()}`,
            type: 'div',
            props: {
              className: 'flex items-center space-x-3'
            },
            children: [
              {
                id: `github-icon-${Date.now()}`,
                type: 'div',
                props: {
                  className: 'w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'
                },
                children: '🗂️'
              },
              {
                id: `page-title-${Date.now()}`,
                type: 'h1',
                props: {
                  className: 'text-xl font-bold text-gray-900'
                },
                children: pageName
              }
            ]
          },
          {
            id: `nav-actions-${Date.now()}`,
            type: 'div',
            props: {
              className: 'flex items-center space-x-2'
            },
            children: [
              {
                id: `github-badge-${Date.now()}`,
                type: 'span',
                props: {
                  className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                },
                children: 'GitHub Import'
              }
            ]
          }
        ]
      },
      {
        id: `github-main-${Date.now()}`,
        type: 'main',
        props: {
          className: 'flex-1 p-8 bg-gray-50'
        },
        children: [
          {
            id: `file-info-card-${Date.now()}`,
            type: 'div',
            props: {
              className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8'
            },
            children: [
              {
                id: `file-header-${Date.now()}`,
                type: 'div',
                props: {
                  className: 'flex items-center justify-between mb-4'
                },
                children: [
                  {
                    id: `file-title-${Date.now()}`,
                    type: 'h2',
                    props: {
                      className: 'text-lg font-semibold text-gray-900'
                    },
                    children: 'Source File Information'
                  },
                  {
                    id: `file-type-badge-${Date.now()}`,
                    type: 'span',
                    props: {
                      className: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'
                    },
                    children: fileData.extension?.toUpperCase() || 'FILE'
                  }
                ]
              },
              {
                id: `file-details-${Date.now()}`,
                type: 'div',
                props: {
                  className: 'space-y-3'
                },
                children: [
                  {
                    id: `file-path-${Date.now()}`,
                    type: 'div',
                    props: {
                      className: 'flex items-start'
                    },
                    children: [
                      {
                        id: `path-label-${Date.now()}`,
                        type: 'span',
                        props: {
                          className: 'text-sm font-medium text-gray-500 w-16'
                        },
                        children: 'Path:'
                      },
                      {
                        id: `path-value-${Date.now()}`,
                        type: 'code',
                        props: {
                          className: 'text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded'
                        },
                        children: path
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: `placeholder-content-${Date.now()}`,
            type: 'div',
            props: {
              className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'
            },
            children: [
              {
                id: `placeholder-icon-${Date.now()}`,
                type: 'div',
                props: {
                  className: 'w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl'
                },
                children: '📄'
              },
              {
                id: `placeholder-title-${Date.now()}`,
                type: 'h3',
                props: {
                  className: 'text-lg font-medium text-gray-900 mb-2'
                },
                children: 'Page Content'
              },
              {
                id: `placeholder-desc-${Date.now()}`,
                type: 'p',
                props: {
                  className: 'text-gray-500 text-sm'
                },
                children: 'This frame represents the imported page structure. Use the Forge editor to build the actual content.'
              }
            ]
          }
        ]
      }
    ];
  }
  
  /**
   * Generate component elements
   */
  static generateComponentElements(fileData, viewport) {
    const { filename, path } = fileData;
    const componentName = this.sanitizeFrameName(filename.replace(/\.[^/.]+$/, ''));
    
    return [
      {
        id: `github-component-wrapper-${Date.now()}`,
        type: 'div',
        props: {
          className: 'w-full h-full p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg'
        },
        children: [
          {
            id: `component-header-${Date.now()}`,
            type: 'div',
            props: {
              className: 'flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm border border-blue-200'
            },
            children: [
              {
                id: `component-info-${Date.now()}`,
                type: 'div',
                props: {
                  className: 'flex items-center space-x-3'
                },
                children: [
                  {
                    id: `component-icon-${Date.now()}`,
                    type: 'div',
                    props: {
                      className: 'w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg'
                    },
                    children: '⚡'
                  },
                  {
                    id: `component-details-${Date.now()}`,
                    type: 'div',
                    children: [
                      {
                        id: `component-name-${Date.now()}`,
                        type: 'h3',
                        props: {
                          className: 'text-lg font-semibold text-gray-900'
                        },
                        children: componentName
                      },
                      {
                        id: `component-type-${Date.now()}`,
                        type: 'p',
                        props: {
                          className: 'text-sm text-gray-500'
                        },
                        children: 'React Component'
                      }
                    ]
                  }
                ]
              },
              {
                id: `component-badges-${Date.now()}`,
                type: 'div',
                props: {
                  className: 'flex items-center space-x-2'
                },
                children: [
                  {
                    id: `github-import-badge-${Date.now()}`,
                    type: 'span',
                    props: {
                      className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                    },
                    children: 'GitHub'
                  },
                  {
                    id: `file-ext-badge-${Date.now()}`,
                    type: 'span',
                    props: {
                      className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                    },
                    children: fileData.extension?.toUpperCase() || 'JS'
                  }
                ]
              }
            ]
          },
          {
            id: `component-preview-${Date.now()}`,
            type: 'div',
            props: {
              className: 'bg-white rounded-lg shadow-sm border-2 border-dashed border-blue-300 p-8 text-center'
            },
            children: [
              {
                id: `preview-placeholder-${Date.now()}`,
                type: 'div',
                props: {
                  className: 'space-y-4'
                },
                children: [
                  {
                    id: `preview-icon-${Date.now()}`,
                    type: 'div',
                    props: {
                      className: 'w-20 h-20 bg-blue-100 rounded-lg mx-auto flex items-center justify-center text-3xl'
                    },
                    children: '🧩'
                  },
                  {
                    id: `preview-title-${Date.now()}`,
                    type: 'h4',
                    props: {
                      className: 'text-xl font-medium text-gray-900'
                    },
                    children: 'Component Preview'
                  },
                  {
                    id: `preview-desc-${Date.now()}`,
                    type: 'p',
                    props: {
                      className: 'text-gray-600 max-w-md mx-auto'
                    },
                    children: 'This represents your imported component. Switch to Forge mode to design and build the component interface.'
                  },
                  {
                    id: `file-path-display-${Date.now()}`,
                    type: 'code',
                    props: {
                      className: 'text-xs text-gray-500 font-mono bg-gray-100 px-3 py-2 rounded block mt-4'
                    },
                    children: path
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }
}