<?php

namespace App\Services;

class FrontendAnalysisService
{
    /**
     * Frontend file extensions and their types
     */
    private static $frontendExtensions = [
        // HTML files
        'html' => 'page',
        'htm' => 'page',
        
        // React/JSX files
        'jsx' => 'component',
        'tsx' => 'component',
        
        // Vue files
        'vue' => 'component',
        
        // Angular component files
        'component.ts' => 'component',
        'component.html' => 'component',
        
        // JavaScript/TypeScript files
        'js' => 'component',
        'ts' => 'component',
        
        // Template engines
        'blade.php' => 'page',
        'twig' => 'page',
        'hbs' => 'page',
        'handlebars' => 'page',
        'ejs' => 'page',
        'pug' => 'page',
        'jade' => 'page'
    ];

    /**
     * Skip patterns for files/directories to ignore
     */
    private static $skipPatterns = [
        'test', 'spec', '.test.', '.spec.', '__test__', '__tests__',
        'config', 'setup', 'webpack', 'babel', 'eslint',
        'package.json', 'tsconfig', 'jest.config',
        '.gitignore', 'readme', 'license', 'node_modules',
        '.git', 'vendor', 'build', 'dist', 'coverage'
    ];

    /**
     * Frontend directory patterns
     */
    private static $frontendDirs = [
        'src', 'app', 'components', 'pages', 'views', 'templates',
        'public', 'assets', 'static', 'client', 'frontend',
        'layouts', 'partials', 'includes'
    ];

    /**
     * Analyze repository contents for frontend files
     */
    public static function analyzeFrontendFiles(array $repoContents): array
    {
        $frontendFiles = [];
        
        foreach ($repoContents as $file) {
            if ($file['type'] === 'file') {
                $analysis = self::analyzeFile($file);
                if ($analysis) {
                    $frontendFiles[] = $analysis;
                }
            }
        }
        
        // Sort by priority and limit results
        usort($frontendFiles, function($a, $b) {
            return $a['priority'] <=> $b['priority'];
        });
        
        return array_slice($frontendFiles, 0, 20); // Limit to 20 frames
    }

    /**
     * Analyze individual file
     */
    private static function analyzeFile(array $file): ?array
    {
        $name = $file['name'];
        $path = $file['path'];
        $lowercaseName = strtolower($name);
        $lowercasePath = strtolower($path);
        
        // Skip files matching skip patterns
        foreach (self::$skipPatterns as $pattern) {
            if (strpos($lowercaseName, $pattern) !== false || strpos($lowercasePath, $pattern) !== false) {
                return null;
            }
        }
        
        // Check if file is in frontend directory
        $isInFrontendDir = false;
        foreach (self::$frontendDirs as $dir) {
            if (strpos($lowercasePath, "/{$dir}/") !== false || strpos($lowercasePath, "{$dir}/") === 0) {
                $isInFrontendDir = true;
                break;
            }
        }
        
        // Determine file type based on extension
        $fileType = null;
        foreach (self::$frontendExtensions as $ext => $type) {
            if (str_ends_with($lowercaseName, ".{$ext}")) {
                $fileType = $type;
                break;
            }
        }
        
        if (!$fileType && !$isInFrontendDir) {
            return null;
        }
        
        // Refine type based on filename and path patterns
        $frameType = self::determineFrameType($name, $path, $fileType);
        
        if (!$frameType) {
            return null;
        }
        
        $extension = pathinfo($name, PATHINFO_EXTENSION);
        $nameWithoutExt = pathinfo($name, PATHINFO_FILENAME);
        
        return [
            'name' => self::sanitizeFrameName($nameWithoutExt),
            'filename' => $name,
            'path' => $path,
            'type' => $frameType,
            'file_type' => $fileType,
            'extension' => $extension,
            'priority' => self::getFilePriority($name, $path, $frameType),
            'estimated_complexity' => self::estimateComplexity($name, $path)
        ];
    }

    /**
     * Determine frame type based on file characteristics
     */
    private static function determineFrameType(string $filename, string $path, ?string $fileType): ?string
    {
        $lowercaseFilename = strtolower($filename);
        $lowercasePath = strtolower($path);
        
        // Page patterns (highest priority)
        $pagePatterns = [
            'index', 'home', 'main', 'app', 'page',
            'dashboard', 'profile', 'settings', 'login', 'register',
            'about', 'contact', 'blog', 'post', 'article',
            'landing', 'welcome', 'hero', 'layout'
        ];
        
        // Check for page patterns in filename or path
        foreach ($pagePatterns as $pattern) {
            if (strpos($lowercaseFilename, $pattern) !== false) {
                return 'page';
            }
        }
        
        $pagePathPatterns = ['/pages/', '/views/', '/layouts/', '/templates/'];
        foreach ($pagePathPatterns as $pattern) {
            if (strpos($lowercasePath, $pattern) !== false) {
                return 'page';
            }
        }
        
        // Component patterns
        $componentPatterns = [
            'component', 'widget', 'element', 'control',
            'button', 'input', 'form', 'modal', 'dialog',
            'card', 'list', 'item', 'nav', 'menu', 'header', 'footer',
            'sidebar', 'panel', 'tab', 'accordion', 'tooltip'
        ];
        
        foreach ($componentPatterns as $pattern) {
            if (strpos($lowercaseFilename, $pattern) !== false) {
                return 'component';
            }
        }
        
        $componentPathPatterns = ['/components/', '/widgets/', '/ui/', '/shared/'];
        foreach ($componentPathPatterns as $pattern) {
            if (strpos($lowercasePath, $pattern) !== false) {
                return 'component';
            }
        }
        
        // Default based on file type
        if ($fileType === 'page') {
            return 'page';
        }
        
        // Default to component for other frontend files
        return 'component';
    }

    /**
     * Get file priority for sorting (lower = higher priority)
     */
    private static function getFilePriority(string $filename, string $path, string $type): int
    {
        $lowercaseFilename = strtolower($filename);
        
        // High priority files
        $highPriorityPatterns = ['index', 'home', 'main', 'app'];
        foreach ($highPriorityPatterns as $pattern) {
            if (strpos($lowercaseFilename, $pattern) !== false) {
                return 1;
            }
        }
        
        // Pages get priority over components
        if ($type === 'page') {
            return 2;
        }
        
        // Important components
        $importantComponents = ['header', 'nav', 'menu', 'layout', 'wrapper'];
        foreach ($importantComponents as $comp) {
            if (strpos($lowercaseFilename, $comp) !== false) {
                return 3;
            }
        }
        
        // Regular components
        if ($type === 'component') {
            return 4;
        }
        
        return 5;
    }

    /**
     * Estimate file complexity for better frame sizing
     */
    private static function estimateComplexity(string $filename, string $path): string
    {
        $lowercaseFilename = strtolower($filename);
        $lowercasePath = strtolower($path);
        
        // Complex patterns
        $complexPatterns = [
            'dashboard', 'admin', 'complex', 'layout', 'template',
            'editor', 'builder', 'manager', 'overview'
        ];
        
        foreach ($complexPatterns as $pattern) {
            if (strpos($lowercaseFilename, $pattern) !== false || strpos($lowercasePath, $pattern) !== false) {
                return 'high';
            }
        }
        
        // Medium complexity
        $mediumPatterns = [
            'form', 'table', 'list', 'grid', 'chart',
            'profile', 'settings', 'modal', 'dialog'
        ];
        
        foreach ($mediumPatterns as $pattern) {
            if (strpos($lowercaseFilename, $pattern) !== false || strpos($lowercasePath, $pattern) !== false) {
                return 'medium';
            }
        }
        
        return 'simple';
    }

    /**
     * Sanitize frame name for display
     */
    private static function sanitizeFrameName(string $name): string
    {
        // Replace underscores and hyphens with spaces
        $name = str_replace(['_', '-'], ' ', $name);
        
        // Handle camelCase by adding spaces before capitals
        $name = preg_replace('/([a-z])([A-Z])/', '$1 $2', $name);
        
        // Split into words, capitalize each, and join
        $words = array_filter(explode(' ', $name));
        $words = array_map(function($word) {
            return ucfirst(strtolower($word));
        }, $words);
        
        return trim(implode(' ', $words));
    }

    /**
     * Generate default elements for a frame based on file analysis
     */
    public static function generateFrameElements(array $fileData, array $viewport): array
    {
        $type = $fileData['type'];
        
        if ($type === 'page') {
            return self::generatePageElements($fileData, $viewport);
        }
        
        return self::generateComponentElements($fileData, $viewport);
    }

    /**
     * Generate page elements
     */
    private static function generatePageElements(array $fileData, array $viewport): array
    {
        $filename = $fileData['filename'];
        $path = $fileData['path'];
        $pageName = self::sanitizeFrameName(pathinfo($filename, PATHINFO_FILENAME));
        $timestamp = time() . rand(100, 999);
        
        return [
            [
                'id' => "github-header-{$timestamp}",
                'type' => 'header',
                'props' => [
                    'className' => 'w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6'
                ],
                'children' => [
                    [
                        'id' => "logo-{$timestamp}",
                        'type' => 'div',
                        'props' => [
                            'className' => 'flex items-center space-x-3'
                        ],
                        'children' => [
                            [
                                'id' => "github-icon-{$timestamp}",
                                'type' => 'div',
                                'props' => [
                                    'className' => 'w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'
                                ],
                                'children' => '🗂️'
                            ],
                            [
                                'id' => "page-title-{$timestamp}",
                                'type' => 'h1',
                                'props' => [
                                    'className' => 'text-xl font-bold text-gray-900'
                                ],
                                'children' => $pageName
                            ]
                        ]
                    ],
                    [
                        'id' => "nav-actions-{$timestamp}",
                        'type' => 'div',
                        'props' => [
                            'className' => 'flex items-center space-x-2'
                        ],
                        'children' => [
                            [
                                'id' => "github-badge-{$timestamp}",
                                'type' => 'span',
                                'props' => [
                                    'className' => 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                                ],
                                'children' => 'GitHub Import'
                            ]
                        ]
                    ]
                ]
            ],
            [
                'id' => "github-main-{$timestamp}",
                'type' => 'main',
                'props' => [
                    'className' => 'flex-1 p-8 bg-gray-50'
                ],
                'children' => [
                    [
                        'id' => "file-info-card-{$timestamp}",
                        'type' => 'div',
                        'props' => [
                            'className' => 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8'
                        ],
                        'children' => [
                            [
                                'id' => "file-header-{$timestamp}",
                                'type' => 'div',
                                'props' => [
                                    'className' => 'flex items-center justify-between mb-4'
                                ],
                                'children' => [
                                    [
                                        'id' => "file-title-{$timestamp}",
                                        'type' => 'h2',
                                        'props' => [
                                            'className' => 'text-lg font-semibold text-gray-900'
                                        ],
                                        'children' => 'Source File Information'
                                    ],
                                    [
                                        'id' => "file-type-badge-{$timestamp}",
                                        'type' => 'span',
                                        'props' => [
                                            'className' => 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'
                                        ],
                                        'children' => strtoupper($fileData['extension'] ?? 'FILE')
                                    ]
                                ]
                            ],
                            [
                                'id' => "file-details-{$timestamp}",
                                'type' => 'div',
                                'props' => [
                                    'className' => 'space-y-3'
                                ],
                                'children' => [
                                    [
                                        'id' => "file-path-{$timestamp}",
                                        'type' => 'div',
                                        'props' => [
                                            'className' => 'flex items-start'
                                        ],
                                        'children' => [
                                            [
                                                'id' => "path-label-{$timestamp}",
                                                'type' => 'span',
                                                'props' => [
                                                    'className' => 'text-sm font-medium text-gray-500 w-16'
                                                ],
                                                'children' => 'Path:'
                                            ],
                                            [
                                                'id' => "path-value-{$timestamp}",
                                                'type' => 'code',
                                                'props' => [
                                                    'className' => 'text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded'
                                                ],
                                                'children' => $path
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    [
                        'id' => "placeholder-content-{$timestamp}",
                        'type' => 'div',
                        'props' => [
                            'className' => 'bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'
                        ],
                        'children' => [
                            [
                                'id' => "placeholder-icon-{$timestamp}",
                                'type' => 'div',
                                'props' => [
                                    'className' => 'w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl'
                                ],
                                'children' => '📄'
                            ],
                            [
                                'id' => "placeholder-title-{$timestamp}",
                                'type' => 'h3',
                                'props' => [
                                    'className' => 'text-lg font-medium text-gray-900 mb-2'
                                ],
                                'children' => 'Page Content'
                            ],
                            [
                                'id' => "placeholder-desc-{$timestamp}",
                                'type' => 'p',
                                'props' => [
                                    'className' => 'text-gray-500 text-sm'
                                ],
                                'children' => 'This frame represents the imported page structure. Use the Forge editor to build the actual content.'
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

    /**
     * Generate component elements
     */
    private static function generateComponentElements(array $fileData, array $viewport): array
    {
        $filename = $fileData['filename'];
        $path = $fileData['path'];
        $componentName = self::sanitizeFrameName(pathinfo($filename, PATHINFO_FILENAME));
        $timestamp = time() . rand(100, 999);
        
        return [
            [
                'id' => "github-component-wrapper-{$timestamp}",
                'type' => 'div',
                'props' => [
                    'className' => 'w-full h-full p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg'
                ],
                'children' => [
                    [
                        'id' => "component-header-{$timestamp}",
                        'type' => 'div',
                        'props' => [
                            'className' => 'flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm border border-blue-200'
                        ],
                        'children' => [
                            [
                                'id' => "component-info-{$timestamp}",
                                'type' => 'div',
                                'props' => [
                                    'className' => 'flex items-center space-x-3'
                                ],
                                'children' => [
                                    [
                                        'id' => "component-icon-{$timestamp}",
                                        'type' => 'div',
                                        'props' => [
                                            'className' => 'w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg'
                                        ],
                                        'children' => '⚡'
                                    ],
                                    [
                                        'id' => "component-details-{$timestamp}",
                                        'type' => 'div',
                                        'children' => [
                                            [
                                                'id' => "component-name-{$timestamp}",
                                                'type' => 'h3',
                                                'props' => [
                                                    'className' => 'text-lg font-semibold text-gray-900'
                                                ],
                                                'children' => $componentName
                                            ],
                                            [
                                                'id' => "component-type-{$timestamp}",
                                                'type' => 'p',
                                                'props' => [
                                                    'className' => 'text-sm text-gray-500'
                                                ],
                                                'children' => 'React Component'
                                            ]
                                        ]
                                    ]
                                ]
                            ],
                            [
                                'id' => "component-badges-{$timestamp}",
                                'type' => 'div',
                                'props' => [
                                    'className' => 'flex items-center space-x-2'
                                ],
                                'children' => [
                                    [
                                        'id' => "github-import-badge-{$timestamp}",
                                        'type' => 'span',
                                        'props' => [
                                            'className' => 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                                        ],
                                        'children' => 'GitHub'
                                    ],
                                    [
                                        'id' => "file-ext-badge-{$timestamp}",
                                        'type' => 'span',
                                        'props' => [
                                            'className' => 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                                        ],
                                        'children' => strtoupper($fileData['extension'] ?? 'JS')
                                    ]
                                ]
                            ]
                        ]
                    ],
                    [
                        'id' => "component-preview-{$timestamp}",
                        'type' => 'div',
                        'props' => [
                            'className' => 'bg-white rounded-lg shadow-sm border-2 border-dashed border-blue-300 p-8 text-center'
                        ],
                        'children' => [
                            [
                                'id' => "preview-placeholder-{$timestamp}",
                                'type' => 'div',
                                'props' => [
                                    'className' => 'space-y-4'
                                ],
                                'children' => [
                                    [
                                        'id' => "preview-icon-{$timestamp}",
                                        'type' => 'div',
                                        'props' => [
                                            'className' => 'w-20 h-20 bg-blue-100 rounded-lg mx-auto flex items-center justify-center text-3xl'
                                        ],
                                        'children' => '🧩'
                                    ],
                                    [
                                        'id' => "preview-title-{$timestamp}",
                                        'type' => 'h4',
                                        'props' => [
                                            'className' => 'text-xl font-medium text-gray-900'
                                        ],
                                        'children' => 'Component Preview'
                                    ],
                                    [
                                        'id' => "preview-desc-{$timestamp}",
                                        'type' => 'p',
                                        'props' => [
                                            'className' => 'text-gray-600 max-w-md mx-auto'
                                        ],
                                        'children' => 'This represents your imported component. Switch to Forge mode to design and build the component interface.'
                                    ],
                                    [
                                        'id' => "file-path-display-{$timestamp}",
                                        'type' => 'code',
                                        'props' => [
                                            'className' => 'text-xs text-gray-500 font-mono bg-gray-100 px-3 py-2 rounded block mt-4'
                                        ],
                                        'children' => $path
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }
}