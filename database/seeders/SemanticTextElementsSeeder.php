<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class SemanticTextElementsSeeder extends Seeder
{
    public function run(): void
    {
        $semanticElements = [
            // H1 - WRAPPED element
            [
                'name' => 'Heading 1',
                'type' => 'h1',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Main heading element (wrapped in <h1> tag)',
                'icon' => 'Heading',
                'default_props' => [
                    'content' => '',
                    'variant' => 'default',
                    'isPseudoElement' => false, // ✅ FLAG
                    'hasWrapper' => true,       // ✅ FLAG
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Heading Text', 'default' => ''],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'gradient', 'outline'], 'default' => 'default'],
                ],
                'render_template' => 'h1-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h1.js'],
                'variants' => [
                    [
                        'name' => 'Default H1',
                        'description' => 'Standard h1 heading',
                        'props' => ['content' => 'Main Title'],
                        'preview_code' => '<h1 class="text-6xl font-bold text-gray-900">Main Title</h1>' // ✅ HAS TAGS
                    ],
                    [
                        'name' => 'Gradient H1',
                        'description' => 'Gradient text effect',
                        'props' => ['content' => 'Welcome to DeCode', 'variant' => 'gradient'],
                        'preview_code' => '<h1 class="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">Welcome to DeCode</h1>' // ✅ HAS TAGS
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 1
            ],

            // H2
            [
                'name' => 'Heading 2',
                'type' => 'h2',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Secondary heading (wrapped in <h2> tag)',
                'icon' => 'Heading',
                'default_props' => [
                    'content' => '',
                    'variant' => 'default',
                    'isPseudoElement' => false,
                    'hasWrapper' => true,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Heading Text', 'default' => ''],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'gradient', 'outline'], 'default' => 'default'],
                ],
                'render_template' => 'h2-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h2.js'],
                'variants' => [
                    [
                        'name' => 'Default H2',
                        'description' => 'Standard h2',
                        'props' => ['content' => 'Section Title'],
                        'preview_code' => '<h2 class="text-4xl font-bold text-gray-900">Section Title</h2>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 2
            ],

            // H3
            [
                'name' => 'Heading 3',
                'type' => 'h3',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Tertiary heading (wrapped in <h3> tag)',
                'icon' => 'Heading',
                'default_props' => [
                    'content' => '',
                    'isPseudoElement' => false,
                    'hasWrapper' => true,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Heading Text', 'default' => ''],
                ],
                'render_template' => 'h3-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h3.js'],
                'variants' => [
                    [
                        'name' => 'Default H3',
                        'description' => 'Standard h3',
                        'props' => ['content' => 'Subsection Title'],
                        'preview_code' => '<h3 class="text-3xl font-bold text-gray-900">Subsection Title</h3>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 3
            ],

            // H4
            [
                'name' => 'Heading 4',
                'type' => 'h4',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Fourth-level heading (wrapped in <h4> tag)',
                'icon' => 'Heading',
                'default_props' => [
                    'content' => '',
                    'isPseudoElement' => false,
                    'hasWrapper' => true,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Heading Text', 'default' => ''],
                ],
                'render_template' => 'h4-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h4.js'],
                'variants' => [
                    [
                        'name' => 'Default H4',
                        'description' => 'Standard h4',
                        'props' => ['content' => 'Minor Heading'],
                        'preview_code' => '<h4 class="text-2xl font-bold text-gray-900">Minor Heading</h4>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 4
            ],

            // H5
            [
                'name' => 'Heading 5',
                'type' => 'h5',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Fifth-level heading (wrapped in <h5> tag)',
                'icon' => 'Heading',
                'default_props' => [
                    'content' => '',
                    'isPseudoElement' => false,
                    'hasWrapper' => true,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Heading Text', 'default' => ''],
                ],
                'render_template' => 'h5-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h5.js'],
                'variants' => [
                    [
                        'name' => 'Default H5',
                        'description' => 'Standard h5',
                        'props' => ['content' => 'Small Heading'],
                        'preview_code' => '<h5 class="text-xl font-bold text-gray-900">Small Heading</h5>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 5
            ],

            // H6
            [
                'name' => 'Heading 6',
                'type' => 'h6',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Sixth-level heading (wrapped in <h6> tag)',
                'icon' => 'Heading',
                'default_props' => [
                    'content' => '',
                    'isPseudoElement' => false,
                    'hasWrapper' => true,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Heading Text', 'default' => ''],
                ],
                'render_template' => 'h6-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h6.js'],
                'variants' => [
                    [
                        'name' => 'Default H6',
                        'description' => 'Standard h6',
                        'props' => ['content' => 'Tiny Heading'],
                        'preview_code' => '<h6 class="text-lg font-bold text-gray-900">Tiny Heading</h6>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 6
            ],

            // PARAGRAPH
            [
                'name' => 'Paragraph',
                'type' => 'p',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'P',
                'description' => 'Paragraph element (wrapped in <p> tag)',
                'icon' => 'AlignLeft',
                'default_props' => [
                    'content' => '',
                    'size' => 'base',
                    'isPseudoElement' => false,
                    'hasWrapper' => true,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Paragraph Text', 'default' => ''],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm', 'base', 'lg', 'xl'], 'default' => 'base'],
                ],
                'render_template' => 'p-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/p.js'],
                'variants' => [
                    [
                        'name' => 'Body Text',
                        'description' => 'Standard paragraph',
                        'props' => ['content' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.', 'size' => 'base'],
                        'preview_code' => '<p class="text-base text-gray-700 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>'
                    ],
                    [
                        'name' => 'Large Paragraph',
                        'description' => 'Bigger text for emphasis',
                        'props' => ['content' => 'This is a larger paragraph for better readability.', 'size' => 'lg'],
                        'preview_code' => '<p class="text-lg text-gray-700 leading-relaxed">This is a larger paragraph for better readability.</p>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 7
            ],

            // SPAN
            [
                'name' => 'Span',
                'type' => 'span',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'S',
                'description' => 'Inline text wrapper (wrapped in <span> tag)',
                'icon' => 'Type',
                'default_props' => [
                    'content' => '',
                    'isPseudoElement' => false,
                    'hasWrapper' => true,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text', 'default' => ''],
                ],
                'render_template' => 'span-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/span.js'],
                'variants' => [
                    [
                        'name' => 'Highlight',
                        'description' => 'Highlighted text',
                        'props' => ['content' => 'Important'],
                        'preview_code' => '<span class="px-2 py-1 bg-yellow-200 rounded">Important</span>'
                    ],
                    [
                        'name' => 'Badge Span',
                        'description' => 'Badge-style inline text',
                        'props' => ['content' => 'New'],
                        'preview_code' => '<span class="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">New</span>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 8
            ],

            // STRONG
            [
                'name' => 'Bold Text',
                'type' => 'strong',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'B',
                'description' => 'Bold/strong text (wrapped in <strong> tag)',
                'icon' => 'Bold',
                'default_props' => [
                    'content' => '',
                    'isPseudoElement' => false,
                    'hasWrapper' => true,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text', 'default' => ''],
                ],
                'render_template' => 'strong-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/strong.js'],
                'variants' => [
                    [
                        'name' => 'Default Bold',
                        'description' => 'Standard bold text',
                        'props' => ['content' => 'Bold Text'],
                        'preview_code' => '<strong class="font-bold text-gray-900">Bold Text</strong>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 9
            ],

            // EM
            [
                'name' => 'Italic Text',
                'type' => 'em',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'I',
                'description' => 'Emphasized/italic text (wrapped in <em> tag)',
                'icon' => 'Italic',
                'default_props' => [
                    'content' => '',
                    'isPseudoElement' => false,
                    'hasWrapper' => true,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text', 'default' => ''],
                ],
                'render_template' => 'em-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/em.js'],
                'variants' => [
                    [
                        'name' => 'Default Italic',
                        'description' => 'Standard italic text',
                        'props' => ['content' => 'Italic Text'],
                        'preview_code' => '<em class="italic text-gray-700">Italic Text</em>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 10
            ],

            // SMALL
            [
                'name' => 'Small Text',
                'type' => 'small',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'S',
                'description' => 'Small text element (wrapped in <small> tag)',
                'icon' => 'Type',
                'default_props' => [
                    'content' => '',
                    'isPseudoElement' => false,
                    'hasWrapper' => true,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text', 'default' => ''],
                ],
                'render_template' => 'small-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/small.js'],
                'variants' => [
                    [
                        'name' => 'Default Small',
                        'description' => 'Smaller text',
                        'props' => ['content' => 'Fine print'],
                        'preview_code' => '<small class="text-sm text-gray-600">Fine print</small>'
                    ],
                    [
                        'name' => 'Caption',
                        'description' => 'Image caption style',
                        'props' => ['content' => 'Photo by John Doe, 2024'],
                        'preview_code' => '<small class="text-xs text-gray-500 italic">Photo by John Doe, 2024</small>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 11
            ],

            // LABEL
            [
                'name' => 'Label',
                'type' => 'label',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'L',
                'description' => 'Form label element (wrapped in <label> tag)',
                'icon' => 'Tag',
                'default_props' => [
                    'content' => '',
                    'for' => '',
                    'isPseudoElement' => false,
                    'hasWrapper' => true,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Label Text', 'default' => ''],
                    'for' => ['type' => 'string', 'label' => 'For (ID)', 'default' => ''],
                ],
                'render_template' => 'label-template',
                'code_generators' => ['react-tailwind' => 'templates/form/label.js'],
                'variants' => [
                    [
                        'name' => 'Default Label',
                        'description' => 'Standard form label',
                        'props' => ['content' => 'Email Address'],
                        'preview_code' => '<label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>'
                    ],
                    [
                        'name' => 'Required Label',
                        'description' => 'Label with required indicator',
                        'props' => ['content' => 'Full Name'],
                        'preview_code' => '<label class="block text-sm font-medium text-gray-700 mb-2">Full Name <span class="text-red-500">*</span></label>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 12
            ],

            // BLOCKQUOTE
            [
                'name' => 'Blockquote',
                'type' => 'blockquote',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'B',
                'description' => 'Quote block element (wrapped in <blockquote> tag)',
                'icon' => 'Quote',
                'default_props' => [
                    'content' => '',
                    'cite' => '',
                    'isPseudoElement' => false,
                    'hasWrapper' => true,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Quote Text', 'default' => ''],
                    'cite' => ['type' => 'string', 'label' => 'Citation/Author', 'default' => ''],
                ],
                'render_template' => 'blockquote-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/blockquote.js'],
                'variants' => [
                    [
                        'name' => 'Styled Quote',
                        'description' => 'Decorative blockquote',
                        'props' => ['content' => 'Design is not just what it looks like and feels like. Design is how it works.', 'cite' => 'Steve Jobs'],
                        'preview_code' => '<blockquote class="border-l-4 border-purple-600 pl-6 py-4 italic text-gray-700 bg-gray-50 rounded-r-lg"><p class="text-lg mb-2">Design is not just what it looks like and feels like. Design is how it works.</p><cite class="text-sm text-gray-500 not-italic">— Steve Jobs</cite></blockquote>'
                    ],
                    [
                        'name' => 'Minimal Quote',
                        'description' => 'Clean minimal blockquote',
                        'props' => ['content' => 'Less is more.', 'cite' => 'Mies van der Rohe'],
                        'preview_code' => '<blockquote class="text-2xl font-serif text-gray-800 italic"><p class="mb-2">Less is more.</p><cite class="text-base text-gray-600 not-italic">— Mies van der Rohe</cite></blockquote>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 13
            ],
        ];

        foreach ($semanticElements as $element) {
            Component::create($element);
        }
    }
}