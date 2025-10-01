<?php
// database/seeders/LayoutContainerSeeder.php - POWERFUL LAYOUT CONTAINERS
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class LayoutContainerSeeder extends Seeder
{
    public function run(): void
    {
        $layoutContainers = [
            // SECTION - Main page structure container
            [
                'name' => 'Section',
                'type' => 'section',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'S',
                'description' => 'Semantic section element - main page structure container',
                'icon' => 'Layout',
                'default_props' => [
                    'padding' => 'py-16 px-6',
                    'background' => 'bg-white',
                    'maxWidth' => 'full',
                    'className' => 'w-full min-h-screen'
                ],
                'prop_definitions' => [
                    'padding' => ['type' => 'select', 'label' => 'Padding', 'options' => ['py-8 px-4', 'py-16 px-6', 'py-24 px-8'], 'default' => 'py-16 px-6'],
                    'background' => ['type' => 'string', 'label' => 'Background', 'default' => 'bg-white'],
                    'maxWidth' => ['type' => 'select', 'label' => 'Max Width', 'options' => ['full', 'container', 'screen'], 'default' => 'full']
                ],
                'render_template' => 'section-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/section.js'],
                'variants' => [
                    [
                        'name' => 'Hero Section',
                        'description' => 'Large hero section with gradient background',
                        'props' => [
                            'padding' => 'py-32 px-8',
                            'background' => 'bg-gradient-to-r from-blue-600 to-purple-600',
                            'className' => 'w-full min-h-screen flex items-center justify-center text-white'
                        ],
                        'preview_code' => '<section class="w-full min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-32 px-8"><div class="text-center"><h1 class="text-6xl font-bold mb-6">Hero Title</h1><p class="text-xl mb-8">Amazing subtitle here</p><button class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Get Started</button></div></section>'
                    ],
                    [
                        'name' => 'Content Section',
                        'description' => 'Standard content section with container',
                        'props' => [
                            'padding' => 'py-16 px-6',
                            'background' => 'bg-gray-50',
                            'className' => 'w-full'
                        ],
                        'preview_code' => '<section class="w-full py-16 px-6 bg-gray-50"><div class="max-w-7xl mx-auto"><h2 class="text-3xl font-bold mb-8 text-center">Our Services</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-8"><!-- Content goes here --></div></div></section>'
                    ],
                    [
                        'name' => 'Full Height Section',
                        'description' => 'Full viewport height section',
                        'props' => [
                            'padding' => 'py-0 px-0',
                            'background' => 'bg-black',
                            'className' => 'w-full h-screen flex items-center justify-center'
                        ],
                        'preview_code' => '<section class="w-full h-screen flex items-center justify-center bg-black text-white"><div class="text-center"><h1 class="text-5xl font-bold mb-4">Full Height Section</h1><p class="text-xl">Perfect for landing pages</p></div></section>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 1
            ],

            // CONTAINER - Content width container
            [
                'name' => 'Container',
                'type' => 'container',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'C',
                'description' => 'Content width container with max-width constraints',
                'icon' => 'Square',
                'default_props' => [
                    'maxWidth' => 'max-w-7xl',
                    'centered' => 'mx-auto',
                    'padding' => 'px-6',
                    'className' => 'w-full'
                ],
                'prop_definitions' => [
                    'maxWidth' => ['type' => 'select', 'label' => 'Max Width', 'options' => ['max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-4xl', 'max-w-6xl', 'max-w-7xl', 'max-w-full'], 'default' => 'max-w-7xl'],
                    'centered' => ['type' => 'boolean', 'label' => 'Center Container', 'default' => true],
                    'padding' => ['type' => 'select', 'label' => 'Padding', 'options' => ['px-4', 'px-6', 'px-8'], 'default' => 'px-6']
                ],
                'render_template' => 'container-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/container.js'],
                'variants' => [
                    [
                        'name' => 'Centered Container',
                        'description' => 'Standard centered content container',
                        'props' => [
                            'maxWidth' => 'max-w-6xl',
                            'centered' => 'mx-auto',
                            'padding' => 'px-6',
                            'className' => 'w-full'
                        ],
                        'preview_code' => '<div class="w-full max-w-6xl mx-auto px-6"><div class="bg-white rounded-lg shadow-sm border p-8"><h3 class="text-2xl font-bold mb-4">Centered Content</h3><p class="text-gray-600">This content is perfectly centered and constrained to a readable width.</p></div></div>'
                    ],
                    [
                        'name' => 'Narrow Container',
                        'description' => 'Narrow container for forms and focused content',
                        'props' => [
                            'maxWidth' => 'max-w-2xl',
                            'centered' => 'mx-auto',
                            'padding' => 'px-8',
                            'className' => 'w-full'
                        ],
                        'preview_code' => '<div class="w-full max-w-2xl mx-auto px-8"><div class="bg-white rounded-lg shadow-lg p-8"><h2 class="text-3xl font-bold mb-6 text-center">Sign Up</h2><form class="space-y-4"><input class="w-full px-4 py-3 border rounded-lg" placeholder="Email" /><button class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">Continue</button></form></div></div>'
                    ],
                    [
                        'name' => 'Wide Container',
                        'description' => 'Wide container for dashboards and data',
                        'props' => [
                            'maxWidth' => 'max-w-full',
                            'centered' => 'mx-auto',
                            'padding' => 'px-4',
                            'className' => 'w-full'
                        ],
                        'preview_code' => '<div class="w-full max-w-full mx-auto px-4"><div class="bg-white rounded-lg shadow-sm border overflow-hidden"><div class="p-6 border-b"><h2 class="text-2xl font-bold">Dashboard</h2></div><div class="p-6 grid grid-cols-1 md:grid-cols-4 gap-6"><!-- Dashboard content --></div></div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 2
            ],

            // FLEX CONTAINER - Flexible layout system
            [
                'name' => 'Flex Container',
                'type' => 'flex',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'F',
                'description' => 'Flexible layout container with advanced flexbox controls',
                'icon' => 'Columns',
                'default_props' => [
                    'direction' => 'flex-row',
                    'justify' => 'justify-start',
                    'align' => 'items-stretch',
                    'gap' => 'gap-4',
                    'wrap' => 'flex-nowrap',
                    'className' => 'w-full h-full flex'
                ],
                'prop_definitions' => [
                    'direction' => ['type' => 'select', 'label' => 'Direction', 'options' => ['flex-row', 'flex-col', 'flex-row-reverse', 'flex-col-reverse'], 'default' => 'flex-row'],
                    'justify' => ['type' => 'select', 'label' => 'Justify', 'options' => ['justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly'], 'default' => 'justify-start'],
                    'align' => ['type' => 'select', 'label' => 'Align', 'options' => ['items-start', 'items-center', 'items-end', 'items-baseline', 'items-stretch'], 'default' => 'items-stretch'],
                    'gap' => ['type' => 'select', 'label' => 'Gap', 'options' => ['gap-0', 'gap-1', 'gap-2', 'gap-4', 'gap-6', 'gap-8', 'gap-12'], 'default' => 'gap-4'],
                    'wrap' => ['type' => 'select', 'label' => 'Wrap', 'options' => ['flex-nowrap', 'flex-wrap', 'flex-wrap-reverse'], 'default' => 'flex-nowrap']
                ],
                'render_template' => 'flex-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/flex.js'],
                'variants' => [
                    [
                        'name' => 'Navbar Layout',
                        'description' => 'Horizontal navbar with space between items',
                        'props' => [
                            'direction' => 'flex-row',
                            'justify' => 'justify-between',
                            'align' => 'items-center',
                            'gap' => 'gap-8',
                            'className' => 'w-full p-6 bg-white border-b'
                        ],
                        'preview_code' => '<div class="w-full p-6 bg-white border-b flex flex-row justify-between items-center gap-8"><div class="font-bold text-2xl text-gray-900">Logo</div><nav class="flex gap-6"><a class="text-gray-600 hover:text-gray-900">Home</a><a class="text-gray-600 hover:text-gray-900">About</a><a class="text-gray-600 hover:text-gray-900">Contact</a></nav><button class="bg-blue-600 text-white px-6 py-2 rounded-lg">Sign In</button></div>'
                    ],
                    [
                        'name' => 'Card Grid',
                        'description' => 'Responsive card layout with flexbox',
                        'props' => [
                            'direction' => 'flex-row',
                            'justify' => 'justify-center',
                            'align' => 'items-stretch',
                            'gap' => 'gap-6',
                            'wrap' => 'flex-wrap',
                            'className' => 'w-full p-8'
                        ],
                        'preview_code' => '<div class="w-full p-8 flex flex-row justify-center items-stretch gap-6 flex-wrap"><div class="bg-white rounded-xl shadow-lg p-6 flex-1 min-w-72"><h3 class="text-xl font-bold mb-4">Feature 1</h3><p class="text-gray-600">Description here</p></div><div class="bg-white rounded-xl shadow-lg p-6 flex-1 min-w-72"><h3 class="text-xl font-bold mb-4">Feature 2</h3><p class="text-gray-600">Description here</p></div></div>'
                    ],
                    [
                        'name' => 'Sidebar Layout',
                        'description' => 'Sidebar with main content area',
                        'props' => [
                            'direction' => 'flex-row',
                            'justify' => 'justify-start',
                            'align' => 'items-stretch',
                            'gap' => 'gap-0',
                            'className' => 'w-full h-screen'
                        ],
                        'preview_code' => '<div class="w-full h-screen flex flex-row"><aside class="w-64 bg-gray-900 text-white p-6"><h2 class="text-xl font-bold mb-6">Navigation</h2><nav class="space-y-2"><a class="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</a><a class="block py-2 px-4 rounded hover:bg-gray-700">Projects</a></nav></aside><main class="flex-1 bg-gray-50 p-8"><h1 class="text-3xl font-bold mb-6">Main Content</h1><p>Content goes here...</p></main></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 3
            ],

            // GRID CONTAINER - CSS Grid system
            [
                'name' => 'Grid Container',
                'type' => 'grid',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'G',
                'description' => 'Advanced CSS Grid container with responsive capabilities',
                'icon' => 'Grid3X3',
                'default_props' => [
                    'columns' => 'grid-cols-3',
                    'rows' => 'grid-rows-auto',
                    'gap' => 'gap-6',
                    'autoFlow' => 'grid-flow-row',
                    'placeItems' => 'place-items-stretch',
                    'className' => 'w-full h-full grid'
                ],
                'prop_definitions' => [
                    'columns' => ['type' => 'select', 'label' => 'Columns', 'options' => ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-12'], 'default' => 'grid-cols-3'],
                    'rows' => ['type' => 'select', 'label' => 'Rows', 'options' => ['grid-rows-auto', 'grid-rows-1', 'grid-rows-2', 'grid-rows-3', 'grid-rows-4'], 'default' => 'grid-rows-auto'],
                    'gap' => ['type' => 'select', 'label' => 'Gap', 'options' => ['gap-0', 'gap-2', 'gap-4', 'gap-6', 'gap-8', 'gap-12'], 'default' => 'gap-6']
                ],
                'render_template' => 'grid-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/grid.js'],
                'variants' => [
                    [
                        'name' => 'Dashboard Grid',
                        'description' => 'Dashboard layout with different sized panels',
                        'props' => [
                            'columns' => 'grid-cols-12',
                            'rows' => 'grid-rows-4',
                            'gap' => 'gap-6',
                            'className' => 'w-full h-screen p-6 grid'
                        ],
                        'preview_code' => '<div class="w-full h-screen p-6 grid grid-cols-12 grid-rows-4 gap-6"><div class="col-span-8 row-span-2 bg-white rounded-xl shadow-lg p-6 border"><h2 class="text-2xl font-bold mb-4">Main Chart</h2><div class="bg-gray-100 h-full rounded-lg flex items-center justify-center">Chart Area</div></div><div class="col-span-4 row-span-1 bg-white rounded-xl shadow-lg p-6 border"><h3 class="font-bold mb-2">Stats</h3><p class="text-3xl font-bold text-blue-600">$12,345</p></div><div class="col-span-4 row-span-1 bg-white rounded-xl shadow-lg p-6 border"><h3 class="font-bold mb-2">Users</h3><p class="text-3xl font-bold text-green-600">1,234</p></div></div>'
                    ],
                    [
                        'name' => 'Photo Gallery',
                        'description' => 'Responsive photo gallery grid',
                        'props' => [
                            'columns' => 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                            'gap' => 'gap-4',
                            'className' => 'w-full p-6 grid'
                        ],
                        'preview_code' => '<div class="w-full p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"><div class="aspect-square bg-gradient-to-br from-pink-400 to-purple-600 rounded-lg"></div><div class="aspect-square bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg"></div><div class="aspect-square bg-gradient-to-br from-green-400 to-blue-600 rounded-lg"></div><div class="aspect-square bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg"></div></div>'
                    ],
                    [
                        'name' => 'Magazine Layout',
                        'description' => 'Magazine-style complex grid layout',
                        'props' => [
                            'columns' => 'grid-cols-6',
                            'rows' => 'grid-rows-6',
                            'gap' => 'gap-4',
                            'className' => 'w-full h-screen p-6 grid'
                        ],
                        'preview_code' => '<div class="w-full h-screen p-6 grid grid-cols-6 grid-rows-6 gap-4"><div class="col-span-4 row-span-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl text-white p-8 flex items-end"><h1 class="text-4xl font-bold">Featured Article</h1></div><div class="col-span-2 row-span-2 bg-white rounded-xl shadow-lg p-6 border"><h3 class="font-bold mb-2">Side Story 1</h3></div><div class="col-span-2 row-span-1 bg-white rounded-xl shadow-lg p-4 border"><h4 class="font-semibold">Quick News</h4></div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 4
            ],

            // DIV - Generic container
            [
                'name' => 'Div Container',
                'type' => 'div',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'D',
                'description' => 'Generic div container - fully customizable building block',
                'icon' => 'Square',
                'default_props' => [
                    'display' => 'block',
                    'className' => 'w-full h-auto',
                    'showPlaceholder' => true
                ],
                'prop_definitions' => [
                    'display' => ['type' => 'select', 'label' => 'Display', 'options' => ['block', 'flex', 'grid', 'inline-block', 'inline-flex'], 'default' => 'block'],
                    'showPlaceholder' => ['type' => 'boolean', 'label' => 'Show Placeholder', 'default' => true]
                ],
                'render_template' => 'div-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/div.js'],
                'variants' => [
                    [
                        'name' => 'Content Block',
                        'description' => 'Basic content container',
                        'props' => [
                            'className' => 'w-full p-6 bg-white rounded-lg border',
                            'showPlaceholder' => false
                        ],
                        'preview_code' => '<div class="w-full p-6 bg-white rounded-lg border"><div class="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm font-medium">Content Block</div></div>'
                    ],
                    [
                        'name' => 'Card Wrapper',
                        'description' => 'Card-style wrapper with shadow',
                        'props' => [
                            'className' => 'w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden',
                            'showPlaceholder' => false
                        ],
                        'preview_code' => '<div class="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden"><div class="p-8"><div class="h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4"></div><h3 class="text-xl font-bold text-gray-900">Card Title</h3><p class="text-gray-600 mt-2">Card description goes here</p></div></div>'
                    ],
                    [
                        'name' => 'Overlay Container',
                        'description' => 'Container with overlay capabilities',
                        'props' => [
                            'className' => 'relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden',
                            'showPlaceholder' => false
                        ],
                        'preview_code' => '<div class="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden"><div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div><div class="absolute bottom-6 left-6 text-white"><h3 class="text-2xl font-bold">Overlay Content</h3><p class="text-gray-200">Perfect for hero sections</p></div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 5
            ]
        ];

        foreach ($layoutContainers as $container) {
            Component::create($container);
        }
    }
}