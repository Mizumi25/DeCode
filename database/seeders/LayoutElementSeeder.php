<?php
// database/seeders/LayoutElementSeeder.php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Component;

class LayoutElementSeeder extends Seeder
{
    public function run(): void
    {
        $layoutElements = [
            // LAYOUT ELEMENTS
            [
                'name' => 'Empty Div',
                'type' => 'div',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'D',
                'description' => 'Empty container element - fully configurable',
                'icon' => 'Square',
                'default_props' => [
                    'className' => '',
                    'showPlaceholder' => true
                ],
                'prop_definitions' => [
                    'className' => [
                        'type' => 'string',
                        'label' => 'CSS Classes',
                        'default' => ''
                    ],
                    'showPlaceholder' => [
                        'type' => 'boolean',
                        'label' => 'Show Placeholder',
                        'default' => true
                    ]
                ],
                'render_template' => 'div-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/div.js'
                    ]
                ],
                'variants' => [
                    [
                        'name' => 'Empty Container',
                        'description' => 'Blank div container',
                        'props' => ['className' => '', 'showPlaceholder' => true],
                        'preview_code' => '<div className="min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">Empty Container</div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 1
            ],
            [
                'name' => 'Section',
                'type' => 'section',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'S',
                'description' => 'Semantic section element for page structure',
                'icon' => 'Layout',
                'default_props' => [
                    'padding' => 'default',
                    'background' => 'transparent',
                    'fullWidth' => true
                ],
                'prop_definitions' => [
                    'padding' => [
                        'type' => 'select',
                        'label' => 'Padding',
                        'options' => ['none', 'small', 'default', 'large'],
                        'default' => 'default'
                    ],
                    'background' => [
                        'type' => 'string',
                        'label' => 'Background Color',
                        'default' => 'transparent'
                    ],
                    'fullWidth' => [
                        'type' => 'boolean',
                        'label' => 'Full Width',
                        'default' => true
                    ]
                ],
                'render_template' => 'section-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/section.js'
                    ]
                ],
                'variants' => [
                    [
                        'name' => 'Basic Section',
                        'description' => 'Standard page section',
                        'props' => ['padding' => 'default', 'background' => 'transparent'],
                        'preview_code' => '<section className="w-full py-16 px-6 bg-white"><div className="max-w-7xl mx-auto"><h2 className="text-3xl font-bold mb-4">Section Title</h2><p className="text-gray-600">Section content goes here...</p></div></section>'
                    ],
                    [
                        'name' => 'Hero Section',
                        'description' => 'Large hero section with gradient',
                        'props' => ['padding' => 'large', 'background' => 'gradient'],
                        'preview_code' => '<section className="w-full py-32 px-6 bg-gradient-to-r from-blue-600 to-purple-600"><div className="max-w-7xl mx-auto text-center text-white"><h1 className="text-6xl font-bold mb-6">Hero Title</h1><p className="text-xl">Hero description</p></div></section>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 2
            ],
            [
                'name' => 'Container',
                'type' => 'container',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'C',
                'description' => 'Content container with max-width',
                'icon' => 'Square',
                'default_props' => [
                    'maxWidth' => 'xl',
                    'centered' => true,
                    'padding' => 'default'
                ],
                'prop_definitions' => [
                    'maxWidth' => [
                        'type' => 'select',
                        'label' => 'Max Width',
                        'options' => ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
                        'default' => 'xl'
                    ],
                    'centered' => [
                        'type' => 'boolean',
                        'label' => 'Center Content',
                        'default' => true
                    ],
                    'padding' => [
                        'type' => 'select',
                        'label' => 'Padding',
                        'options' => ['none', 'small', 'default', 'large'],
                        'default' => 'default'
                    ]
                ],
                'render_template' => 'container-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/container.js'
                    ]
                ],
                'variants' => [
                    [
                        'name' => 'Standard Container',
                        'description' => 'Centered content container',
                        'props' => ['maxWidth' => 'xl', 'centered' => true],
                        'preview_code' => '<div className="max-w-6xl mx-auto px-6"><div className="bg-gray-100 p-8 rounded-lg">Container Content</div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 3
            ],
            [
                'name' => 'Flex Container',
                'type' => 'flex',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'F',
                'description' => 'Flexbox container with configurable properties',
                'icon' => 'Columns',
                'default_props' => [
                    'direction' => 'row',
                    'justify' => 'flex-start',
                    'align' => 'stretch',
                    'gap' => 'medium'
                ],
                'prop_definitions' => [
                    'direction' => [
                        'type' => 'select',
                        'label' => 'Direction',
                        'options' => ['row', 'column', 'row-reverse', 'column-reverse'],
                        'default' => 'row'
                    ],
                    'justify' => [
                        'type' => 'select',
                        'label' => 'Justify Content',
                        'options' => ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'],
                        'default' => 'flex-start'
                    ],
                    'align' => [
                        'type' => 'select',
                        'label' => 'Align Items',
                        'options' => ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'],
                        'default' => 'stretch'
                    ],
                    'gap' => [
                        'type' => 'select',
                        'label' => 'Gap',
                        'options' => ['none', 'small', 'medium', 'large'],
                        'default' => 'medium'
                    ]
                ],
                'render_template' => 'flex-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/flex.js'
                    ]
                ],
                'variants' => [
                    [
                        'name' => 'Flex Row',
                        'description' => 'Horizontal flex layout',
                        'props' => ['direction' => 'row', 'justify' => 'flex-start', 'gap' => 'medium'],
                        'preview_code' => '<div className="flex gap-4"><div className="bg-blue-500 p-4 rounded text-white flex-1">Item 1</div><div className="bg-green-500 p-4 rounded text-white flex-1">Item 2</div></div>'
                    ],
                    [
                        'name' => 'Flex Column',
                        'description' => 'Vertical flex layout',
                        'props' => ['direction' => 'column', 'align' => 'stretch', 'gap' => 'medium'],
                        'preview_code' => '<div className="flex flex-col gap-4"><div className="bg-blue-500 p-4 rounded text-white">Item 1</div><div className="bg-green-500 p-4 rounded text-white">Item 2</div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 4
            ],
            [
                'name' => 'Grid Container',
                'type' => 'grid',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'G',
                'description' => 'CSS Grid container with configurable columns',
                'icon' => 'Grid3X3',
                'default_props' => [
                    'columns' => '3',
                    'gap' => 'medium',
                    'autoRows' => 'auto'
                ],
                'prop_definitions' => [
                    'columns' => [
                        'type' => 'select',
                        'label' => 'Columns',
                        'options' => ['1', '2', '3', '4', 'auto-fit'],
                        'default' => '3'
                    ],
                    'gap' => [
                        'type' => 'select',
                        'label' => 'Gap',
                        'options' => ['none', 'small', 'medium', 'large'],
                        'default' => 'medium'
                    ],
                    'autoRows' => [
                        'type' => 'select',
                        'label' => 'Row Height',
                        'options' => ['auto', 'min-content', 'max-content', 'fr'],
                        'default' => 'auto'
                    ]
                ],
                'render_template' => 'grid-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/grid.js'
                    ]
                ],
                'variants' => [
                    [
                        'name' => '3 Column Grid',
                        'description' => 'Three equal columns',
                        'props' => ['columns' => '3', 'gap' => 'medium'],
                        'preview_code' => '<div className="grid grid-cols-3 gap-4"><div className="bg-blue-500 p-4 rounded text-white">1</div><div className="bg-green-500 p-4 rounded text-white">2</div><div className="bg-purple-500 p-4 rounded text-white">3</div></div>'
                    ],
                    [
                        'name' => 'Auto-Fit Grid',
                        'description' => 'Responsive auto-fitting grid',
                        'props' => ['columns' => 'auto-fit', 'gap' => 'large'],
                        'preview_code' => '<div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6"><div className="bg-blue-500 p-4 rounded text-white">Auto</div><div className="bg-green-500 p-4 rounded text-white">Fit</div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 5
            ]
        ];

        foreach ($layoutElements as $element) {
            Component::create($element);
        }
    }
}