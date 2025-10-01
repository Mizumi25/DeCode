<?php
// database/seeders/TypographyElementsSeeder.php - TEXT ELEMENTS
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class TypographyElementsSeeder extends Seeder
{
    public function run(): void
    {
        $typographyElements = [
            // HEADING 1
            [
                'name' => 'Heading 1',
                'type' => 'h1',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Large main heading - perfect for hero titles',
                'icon' => 'Type',
                'default_props' => [
                    'text' => 'Main Heading',
                    'align' => 'left',
                    'color' => '#1f2937',
                    'weight' => 'bold',
                    'className' => 'text-4xl font-bold text-gray-900'
                ],
                'prop_definitions' => [
                    'text' => ['type' => 'string', 'label' => 'Heading Text', 'default' => 'Main Heading'],
                    'align' => ['type' => 'select', 'label' => 'Alignment', 'options' => ['left', 'center', 'right'], 'default' => 'left'],
                    'weight' => ['type' => 'select', 'label' => 'Font Weight', 'options' => ['normal', 'medium', 'semibold', 'bold', 'extrabold'], 'default' => 'bold']
                ],
                'render_template' => 'h1-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h1.js'],
                'variants' => [
                    [
                        'name' => 'Hero Title',
                        'description' => 'Large hero section title',
                        'props' => ['text' => 'Welcome to the Future', 'align' => 'center', 'weight' => 'extrabold', 'className' => 'text-6xl font-extrabold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'],
                        'preview_code' => '<h1 class="text-6xl font-extrabold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Welcome to the Future</h1>'
                    ],
                    [
                        'name' => 'Section Title',
                        'description' => 'Standard section heading',
                        'props' => ['text' => 'Our Services', 'align' => 'left', 'weight' => 'bold', 'className' => 'text-4xl font-bold text-gray-900'],
                        'preview_code' => '<h1 class="text-4xl font-bold text-gray-900">Our Services</h1>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 1
            ],

            // PARAGRAPH
            [
                'name' => 'Paragraph',
                'type' => 'p',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'P',
                'description' => 'Paragraph text content with customizable styling',
                'icon' => 'FileText',
                'default_props' => [
                    'text' => 'This is a paragraph of text content. You can customize the styling, alignment, and appearance to match your design needs.',
                    'align' => 'left',
                    'size' => 'base',
                    'color' => '#6b7280',
                    'className' => 'text-base text-gray-600 leading-relaxed'
                ],
                'prop_definitions' => [
                    'text' => ['type' => 'textarea', 'label' => 'Paragraph Text'],
                    'align' => ['type' => 'select', 'label' => 'Alignment', 'options' => ['left', 'center', 'right', 'justify'], 'default' => 'left'],
                    'size' => ['type' => 'select', 'label' => 'Text Size', 'options' => ['sm', 'base', 'lg', 'xl'], 'default' => 'base']
                ],
                'render_template' => 'p-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/p.js'],
                'variants' => [
                    [
                        'name' => 'Lead Text',
                        'description' => 'Large introductory paragraph',
                        'props' => ['text' => 'This is a lead paragraph that introduces the main content with larger, more prominent text that draws attention.', 'size' => 'lg', 'className' => 'text-lg text-gray-700 leading-relaxed font-medium'],
                        'preview_code' => '<p class="text-lg text-gray-700 leading-relaxed font-medium">This is a lead paragraph that introduces the main content with larger, more prominent text that draws attention.</p>'
                    ],
                    [
                        'name' => 'Body Text',
                        'description' => 'Standard body paragraph',
                        'props' => ['text' => 'Regular body text provides detailed information and maintains readability across different screen sizes and contexts.', 'className' => 'text-base text-gray-600 leading-relaxed'],
                        'preview_code' => '<p class="text-base text-gray-600 leading-relaxed">Regular body text provides detailed information and maintains readability across different screen sizes and contexts.</p>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 2
            ],

            // LINK
            [
                'name' => 'Link',
                'type' => 'link',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'L',
                'description' => 'Clickable link element with hover effects',
                'icon' => 'Link',
                'default_props' => [
                    'text' => 'Click here',
                    'href' => '#',
                    'target' => '_self',
                    'underline' => true,
                    'className' => 'text-blue-600 hover:text-blue-800 underline'
                ],
                'prop_definitions' => [
                    'text' => ['type' => 'string', 'label' => 'Link Text', 'default' => 'Click here'],
                    'href' => ['type' => 'string', 'label' => 'Link URL', 'default' => '#'],
                    'target' => ['type' => 'select', 'label' => 'Target', 'options' => ['_self', '_blank'], 'default' => '_self'],
                    'underline' => ['type' => 'boolean', 'label' => 'Show Underline', 'default' => true]
                ],
                'render_template' => 'link-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/link.js'],
                'variants' => [
                    [
                        'name' => 'Primary Link',
                        'description' => 'Standard blue link with underline',
                        'props' => ['text' => 'Learn More', 'href' => '#', 'className' => 'text-blue-600 hover:text-blue-800 underline transition-colors'],
                        'preview_code' => '<a href="#" class="text-blue-600 hover:text-blue-800 underline transition-colors">Learn More</a>'
                    ],
                    [
                        'name' => 'Button Link',
                        'description' => 'Link styled as a button',
                        'props' => ['text' => 'Get Started', 'href' => '#', 'underline' => false, 'className' => 'inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'],
                        'preview_code' => '<a href="#" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Get Started</a>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ]
        ];

        foreach ($typographyElements as $element) {
            Component::create($element);
        }
    }
}