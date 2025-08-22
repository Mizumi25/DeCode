<?php
// database/seeders/ComponentSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class ComponentSeeder extends Seeder
{
    public function run(): void
    {
        $components = [
            // ELEMENTS
            [
                'name' => 'Button',
                'type' => 'button',
                'component_type' => 'element',
                'category' => 'basic',
                'alphabet_group' => 'B',
                'description' => 'Interactive button element with multiple styles',
                'icon' => 'Square',
                'default_props' => [
                    'text' => 'Click me',
                    'variant' => 'primary',
                    'size' => 'md',
                    'className' => ''
                ],
                'prop_definitions' => [
                    'text' => [
                        'type' => 'string',
                        'label' => 'Button Text',
                        'default' => 'Click me'
                    ],
                    'variant' => [
                        'type' => 'select',
                        'label' => 'Variant',
                        'options' => ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost', 'gradient', 'neon', 'glass'],
                        'default' => 'primary'
                    ],
                    'size' => [
                        'type' => 'select',
                        'label' => 'Size',
                        'options' => ['xs', 'sm', 'md', 'lg', 'xl'],
                        'default' => 'md'
                    ],
                    'className' => [
                        'type' => 'string',
                        'label' => 'Custom Classes',
                        'default' => ''
                    ]
                ],
                'render_template' => 'button-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/button.js',
                        'styles' => 'templates/react-tailwind/button-styles.js'
                    ]
                ],
                'variants' => [
                    [
                        'name' => 'Default Button',
                        'description' => 'Standard button with primary styling',
                        'props' => ['text' => 'Click me', 'variant' => 'primary', 'size' => 'md'],
                        'preview_code' => '<button className="bg-blue-500 text-white px-4 py-2 rounded">Click me</button>'
                    ],
                    [
                        'name' => 'Gradient Button',
                        'description' => 'Beautiful gradient button with hover effects',
                        'props' => ['text' => 'Gradient', 'variant' => 'gradient', 'size' => 'md'],
                        'preview_code' => '<button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">Gradient</button>',
                        'has_animation' => true,
                        'animation_type' => 'css'
                    ],
                    [
                        'name' => 'Neon Button',
                        'description' => 'Glowing neon effect button',
                        'props' => ['text' => 'Neon Glow', 'variant' => 'neon', 'size' => 'lg'],
                        'preview_code' => '<button className="bg-black border-2 border-cyan-400 text-cyan-400 px-8 py-4 rounded-lg shadow-lg shadow-cyan-400/50 hover:shadow-cyan-400/75 transition-all">Neon Glow</button>',
                        'has_animation' => true,
                        'animation_type' => 'css'
                    ],
                    [
                        'name' => 'Pulse Animation',
                        'description' => 'Button with pulse animation effect',
                        'props' => ['text' => 'Pulse Me', 'variant' => 'primary', 'size' => 'md'],
                        'preview_code' => '<button className="bg-red-500 text-white px-6 py-3 rounded-lg animate-pulse">Pulse Me</button>',
                        'has_animation' => true,
                        'animation_type' => 'css'
                    ],
                    [
                        'name' => 'Bounce on Hover',
                        'description' => 'Button with bounce animation on hover',
                        'props' => ['text' => 'Bounce', 'variant' => 'success', 'size' => 'md'],
                        'preview_code' => '<button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:animate-bounce transition-all">Bounce</button>',
                        'has_animation' => true,
                        'animation_type' => 'css'
                    ],
                    [
                        'name' => 'Glass Morphism',
                        'description' => 'Modern glass effect button',
                        'props' => ['text' => 'Glass', 'variant' => 'glass', 'size' => 'md'],
                        'preview_code' => '<button className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-xl shadow-xl">Glass</button>',
                        'has_animation' => false
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 1
            ],
            [
                'name' => 'Avatar',
                'type' => 'avatar',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'A',
                'description' => 'User avatar with different styles and sizes',
                'icon' => 'User',
                'default_props' => [
                    'src' => '',
                    'alt' => 'Avatar',
                    'size' => 'md',
                    'shape' => 'circle',
                    'status' => 'none'
                ],
                'prop_definitions' => [
                    'src' => [
                        'type' => 'string',
                        'label' => 'Image Source',
                        'default' => ''
                    ],
                    'alt' => [
                        'type' => 'string',
                        'label' => 'Alt Text',
                        'default' => 'Avatar'
                    ],
                    'size' => [
                        'type' => 'select',
                        'label' => 'Size',
                        'options' => ['xs', 'sm', 'md', 'lg', 'xl'],
                        'default' => 'md'
                    ],
                    'shape' => [
                        'type' => 'select',
                        'label' => 'Shape',
                        'options' => ['circle', 'square', 'rounded'],
                        'default' => 'circle'
                    ],
                    'status' => [
                        'type' => 'select',
                        'label' => 'Status Indicator',
                        'options' => ['none', 'online', 'offline', 'away', 'busy'],
                        'default' => 'none'
                    ]
                ],
                'render_template' => 'avatar-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/avatar.js',
                        'styles' => 'templates/react-tailwind/avatar-styles.js'
                    ]
                ],
                'variants' => [
                    [
                        'name' => 'Default Avatar',
                        'description' => 'Simple circular avatar',
                        'props' => ['size' => 'md', 'shape' => 'circle'],
                        'preview_code' => '<div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"><span className="text-gray-600">A</span></div>'
                    ],
                    [
                        'name' => 'Online Status',
                        'description' => 'Avatar with online indicator',
                        'props' => ['size' => 'md', 'shape' => 'circle', 'status' => 'online'],
                        'preview_code' => '<div className="relative"><div className="w-12 h-12 bg-gray-300 rounded-full"></div><div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 2
            ],
            [
                'name' => 'Badge',
                'type' => 'badge',
                'component_type' => 'element',
                'category' => 'display',
                'alphabet_group' => 'B',
                'description' => 'Small status or label badges',
                'icon' => 'Tag',
                'default_props' => [
                    'text' => 'Badge',
                    'variant' => 'default',
                    'size' => 'md'
                ],
                'prop_definitions' => [
                    'text' => [
                        'type' => 'string',
                        'label' => 'Badge Text',
                        'default' => 'Badge'
                    ],
                    'variant' => [
                        'type' => 'select',
                        'label' => 'Variant',
                        'options' => ['default', 'primary', 'success', 'warning', 'danger', 'info'],
                        'default' => 'default'
                    ],
                    'size' => [
                        'type' => 'select',
                        'label' => 'Size',
                        'options' => ['sm', 'md', 'lg'],
                        'default' => 'md'
                    ]
                ],
                'render_template' => 'badge-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/badge.js',
                        'styles' => 'templates/react-tailwind/badge-styles.js'
                    ]
                ],
                'variants' => [
                    [
                        'name' => 'Default Badge',
                        'description' => 'Simple text badge',
                        'props' => ['text' => 'New', 'variant' => 'default'],
                        'preview_code' => '<span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">New</span>'
                    ],
                    [
                        'name' => 'Success Badge',
                        'description' => 'Green success badge',
                        'props' => ['text' => 'Success', 'variant' => 'success'],
                        'preview_code' => '<span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Success</span>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 3
            ],
            [
                'name' => 'Card',
                'type' => 'card',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'C',
                'description' => 'Flexible card container',
                'icon' => 'Layout',
                'default_props' => [
                    'title' => 'Card Title',
                    'content' => 'Card content goes here...',
                    'variant' => 'default',
                    'padding' => 'md',
                    'shadow' => true
                ],
                'prop_definitions' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Card Title',
                        'default' => 'Card Title'
                    ],
                    'content' => [
                        'type' => 'textarea',
                        'label' => 'Content',
                        'default' => 'Card content goes here...'
                    ],
                    'variant' => [
                        'type' => 'select',
                        'label' => 'Variant',
                        'options' => ['default', 'outlined', 'elevated'],
                        'default' => 'default'
                    ],
                    'padding' => [
                        'type' => 'select',
                        'label' => 'Padding',
                        'options' => ['sm', 'md', 'lg'],
                        'default' => 'md'
                    ],
                    'shadow' => [
                        'type' => 'boolean',
                        'label' => 'Drop Shadow',
                        'default' => true
                    ]
                ],
                'render_template' => 'card-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/card.js',
                        'styles' => 'templates/react-tailwind/card-styles.js'
                    ]
                ],
                'variants' => [
                    [
                        'name' => 'Default Card',
                        'description' => 'Basic card with title and content',
                        'props' => ['title' => 'Card Title', 'content' => 'Some content'],
                        'preview_code' => '<div className="bg-white rounded-lg shadow-md p-6"><h3 className="font-semibold mb-2">Card Title</h3><p className="text-gray-600">Some content</p></div>'
                    ],
                    [
                        'name' => 'Hover Card',
                        'description' => 'Card with hover animation',
                        'props' => ['title' => 'Hover Me', 'content' => 'Hover to see effect'],
                        'preview_code' => '<div className="bg-white rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 p-6"><h3 className="font-semibold mb-2">Hover Me</h3><p className="text-gray-600">Hover to see effect</p></div>',
                        'has_animation' => true,
                        'animation_type' => 'css'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 4
            ],

            // COMPONENTS (Complex UI patterns)
            [
                'name' => 'Search Bar',
                'type' => 'searchbar',
                'component_type' => 'component',
                'category' => 'form',
                'alphabet_group' => 'S',
                'description' => 'Complete search input with icon and suggestions',
                'icon' => 'Search',
                'default_props' => [
                    'placeholder' => 'Search...',
                    'size' => 'md',
                    'showIcon' => true,
                    'showButton' => false
                ],
                'prop_definitions' => [
                    'placeholder' => [
                        'type' => 'string',
                        'label' => 'Placeholder Text',
                        'default' => 'Search...'
                    ],
                    'size' => [
                        'type' => 'select',
                        'label' => 'Size',
                        'options' => ['sm', 'md', 'lg'],
                        'default' => 'md'
                    ],
                    'showIcon' => [
                        'type' => 'boolean',
                        'label' => 'Show Search Icon',
                        'default' => true
                    ],
                    'showButton' => [
                        'type' => 'boolean',
                        'label' => 'Show Search Button',
                        'default' => false
                    ]
                ],
                'render_template' => 'searchbar-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/searchbar.js',
                        'styles' => 'templates/react-tailwind/searchbar-styles.js'
                    ]
                ],
                'variants' => [
                    [
                        'name' => 'Basic Search',
                        'description' => 'Simple search input with icon',
                        'props' => ['placeholder' => 'Search...', 'showIcon' => true],
                        'preview_code' => '<div className="relative"><input className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Search..." /><svg className="absolute left-3 top-3 w-4 h-4 text-gray-400"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" fill="none"/></svg></div>'
                    ],
                    [
                        'name' => 'Search with Button',
                        'description' => 'Search input with search button',
                        'props' => ['placeholder' => 'Search...', 'showIcon' => true, 'showButton' => true],
                        'preview_code' => '<div className="flex"><input className="flex-1 px-4 py-2 border rounded-l-lg" placeholder="Search..." /><button className="bg-blue-500 text-white px-4 py-2 rounded-r-lg">Search</button></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 5
            ],
            [
                'name' => 'Navigation Bar',
                'type' => 'navbar',
                'component_type' => 'component',
                'category' => 'navigation',
                'alphabet_group' => 'N',
                'description' => 'Complete navigation header component',
                'icon' => 'Menu',
                'default_props' => [
                    'brand' => 'Brand',
                    'links' => ['Home', 'About', 'Contact'],
                    'showSearch' => false,
                    'showProfile' => true
                ],
                'prop_definitions' => [
                    'brand' => [
                        'type' => 'string',
                        'label' => 'Brand Name',
                        'default' => 'Brand'
                    ],
                    'links' => [
                        'type' => 'array',
                        'label' => 'Navigation Links',
                        'default' => ['Home', 'About', 'Contact']
                    ],
                    'showSearch' => [
                        'type' => 'boolean',
                        'label' => 'Show Search',
                        'default' => false
                    ],
                    'showProfile' => [
                        'type' => 'boolean',
                        'label' => 'Show Profile',
                        'default' => true
                    ]
                ],
                'render_template' => 'navbar-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/navbar.js',
                        'styles' => 'templates/react-tailwind/navbar-styles.js'
                    ]
                ],
                'variants' => [
                    [
                        'name' => 'Basic Navbar',
                        'description' => 'Simple navigation bar with links',
                        'props' => ['brand' => 'MyApp', 'links' => ['Home', 'About', 'Contact']],
                        'preview_code' => '<nav className="bg-white shadow-md px-6 py-4"><div className="flex items-center justify-between"><div className="font-bold text-xl">MyApp</div><div className="flex space-x-6"><a className="text-gray-600 hover:text-gray-900">Home</a><a className="text-gray-600 hover:text-gray-900">About</a><a className="text-gray-600 hover:text-gray-900">Contact</a></div></div></nav>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 6
            ],
            [
                'name' => 'Hero Section',
                'type' => 'hero',
                'component_type' => 'component',
                'category' => 'layout',
                'alphabet_group' => 'H',
                'description' => 'Landing page hero section with CTA',
                'icon' => 'Zap',
                'default_props' => [
                    'title' => 'Welcome to Our App',
                    'subtitle' => 'Build amazing things with our platform',
                    'ctaText' => 'Get Started',
                    'backgroundType' => 'gradient'
                ],
                'prop_definitions' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Main Title',
                        'default' => 'Welcome to Our App'
                    ],
                    'subtitle' => [
                        'type' => 'string',
                        'label' => 'Subtitle',
                        'default' => 'Build amazing things with our platform'
                    ],
                    'ctaText' => [
                        'type' => 'string',
                        'label' => 'CTA Button Text',
                        'default' => 'Get Started'
                    ],
                    'backgroundType' => [
                        'type' => 'select',
                        'label' => 'Background Type',
                        'options' => ['gradient', 'image', 'solid'],
                        'default' => 'gradient'
                    ]
                ],
                'render_template' => 'hero-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/hero.js',
                        'styles' => 'templates/react-tailwind/hero-styles.js'
                    ]
                ],
                'variants' => [
                    [
                        'name' => 'Gradient Hero',
                        'description' => 'Hero section with gradient background',
                        'props' => ['title' => 'Build the Future', 'subtitle' => 'Create amazing apps today'],
                        'preview_code' => '<section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 px-6"><div className="text-center"><h1 className="text-5xl font-bold mb-4">Build the Future</h1><p className="text-xl mb-8">Create amazing apps today</p><button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold">Get Started</button></div></section>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 7
            ]
        ];

        foreach ($components as $component) {
            Component::create($component);
        }
    }
}