<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class BasicElementsSeeder extends Seeder
{
    public function run(): void
    {
        $basicElements = [
            // BUTTON
            [
                'name' => 'Button',
                'type' => 'button',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'B',
                'description' => 'Interactive button with multiple styles and animations',
                'icon' => 'Square',
                'default_props' => [
                    'content' => '', // ✅ Changed from 'text'
                    'variant' => 'primary',
                    'size' => 'md',
                    'disabled' => false,
                    'type' => 'button',
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Button Text', 'default' => ''], // ✅ Changed
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost', 'gradient', 'neon', 'glass', 'outline', 'minimal'], 'default' => 'primary'],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['xs', 'sm', 'md', 'lg', 'xl'], 'default' => 'md'],
                    'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => false],
                    'type' => ['type' => 'select', 'label' => 'Type', 'options' => ['button', 'submit', 'reset'], 'default' => 'button'],
                ],
                'render_template' => 'button-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/button.js'],
                'variants' => [
                    [
                        'name' => 'Primary Gradient',
                        'description' => 'Modern gradient button with shadow',
                        'props' => ['content' => 'Get Started', 'variant' => 'primary', 'size' => 'lg'], // ✅ Changed
                        'preview_code' => '<button class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">Get Started</button>'
                    ],
                    [
                        'name' => 'Glass Effect',
                        'description' => 'Glassmorphism button',
                        'props' => ['content' => 'Glass Effect', 'variant' => 'glass', 'size' => 'md'], // ✅ Changed
                        'preview_code' => '<button class="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl hover:bg-white/20 transition-all duration-300">Glass Effect</button>'
                    ],
                    [
                        'name' => 'Neon Glow',
                        'description' => 'Cyberpunk neon button',
                        'props' => ['content' => 'Neon Glow', 'variant' => 'neon', 'size' => 'lg'], // ✅ Changed
                        'preview_code' => '<button class="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-lg bg-black border-2 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:shadow-[0_0_40px_rgba(34,211,238,0.9)] hover:scale-105 transition-all duration-300">Neon Glow</button>'
                    ],
                    [
                        'name' => 'Rounded Pill',
                        'description' => 'Fully rounded pill button',
                        'props' => ['content' => 'Subscribe', 'variant' => 'primary', 'size' => 'md'], // ✅ Changed
                        'preview_code' => '<button class="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">Subscribe</button>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean minimal design',
                        'props' => ['content' => 'Learn More', 'variant' => 'minimal', 'size' => 'md'], // ✅ Changed
                        'preview_code' => '<button class="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200">Learn More</button>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 1
            ],

            // LINK
            [
                'name' => 'Link',
                'type' => 'link',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'L',
                'description' => 'Hyperlink element with various styles',
                'icon' => 'Link',
                'default_props' => [
                    'content' => '', // ✅ Changed
                    'href' => '#',
                    'target' => '_self',
                    'variant' => 'default',
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Link Text', 'default' => ''], // ✅ Changed
                    'href' => ['type' => 'string', 'label' => 'URL', 'default' => '#'],
                    'target' => ['type' => 'select', 'label' => 'Target', 'options' => ['_self', '_blank', '_parent', '_top'], 'default' => '_self'],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'underline', 'button', 'gradient'], 'default' => 'default'],
                ],
                'render_template' => 'link-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/link.js'],
                'variants' => [
                    [
                        'name' => 'Underline Hover',
                        'description' => 'Link with animated underline',
                        'props' => ['content' => 'Read more', 'href' => '#', 'variant' => 'underline'], // ✅ Changed
                        'preview_code' => '<a href="#" class="relative inline-block text-blue-600 font-medium after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full">Read more</a>'
                    ],
                    [
                        'name' => 'Gradient Link',
                        'description' => 'Link with gradient text',
                        'props' => ['content' => 'Explore now', 'href' => '#', 'variant' => 'gradient'], // ✅ Changed
                        'preview_code' => '<a href="#" class="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300">Explore now</a>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 2
            ],

            // INPUT - Keep placeholder separate from content
            [
                'name' => 'Text Input',
                'type' => 'input',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'I',
                'description' => 'Text input field with validation states',
                'icon' => 'Type',
                'default_props' => [
                    'type' => 'text',
                    'placeholder' => '', // ✅ Placeholder stays
                    'value' => '',
                    'size' => 'md',
                    'variant' => 'default',
                    'required' => false,
                    'disabled' => false
                ],
                'prop_definitions' => [
                    'type' => ['type' => 'select', 'label' => 'Input Type', 'options' => ['text', 'email', 'password', 'tel', 'url', 'number', 'date'], 'default' => 'text'],
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder', 'default' => ''], // ✅ Stays
                    'value' => ['type' => 'string', 'label' => 'Default Value', 'default' => ''],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm', 'md', 'lg'], 'default' => 'md'],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'error', 'success', 'glass'], 'default' => 'default']
                ],
                'render_template' => 'input-template',
                'code_generators' => ['react-tailwind' => 'templates/form/input.js'],
                'variants' => [
                    [
                        'name' => 'Glass Input',
                        'description' => 'Glassmorphism input field',
                        'props' => ['placeholder' => 'Enter email...', 'type' => 'email', 'variant' => 'glass'],
                        'preview_code' => '<input class="block w-full px-4 py-3 text-base bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300" type="email" placeholder="Enter email..." />'
                    ],
                    [
                        'name' => 'Floating Label',
                        'description' => 'Input with animated label',
                        'props' => ['placeholder' => 'Email', 'type' => 'email'],
                        'preview_code' => '<div class="relative"><input class="peer w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none placeholder-transparent transition-all" placeholder="Email" /><label class="absolute left-4 -top-2.5 text-sm text-blue-600 bg-white px-2 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">Email</label></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ],

            // TEXTAREA
            [
                'name' => 'Textarea',
                'type' => 'textarea',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'T',
                'description' => 'Multi-line text input',
                'icon' => 'AlignLeft',
                'default_props' => [
                    'placeholder' => '', // ✅ Placeholder stays
                    'content' => '', // ✅ Changed from 'value'
                    'rows' => 4,
                    'resize' => 'vertical',
                ],
                'prop_definitions' => [
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder', 'default' => ''],
                    'content' => ['type' => 'textarea', 'label' => 'Default Value', 'default' => ''], // ✅ Changed
                    'rows' => ['type' => 'number', 'label' => 'Rows', 'default' => 4, 'min' => 2, 'max' => 20],
                    'resize' => ['type' => 'select', 'label' => 'Resize', 'options' => ['none', 'vertical', 'horizontal', 'both'], 'default' => 'vertical'],
                ],
                'render_template' => 'textarea-template',
                'code_generators' => ['react-tailwind' => 'templates/form/textarea.js'],
                'variants' => [
                    [
                        'name' => 'Standard Textarea',
                        'description' => 'Clean textarea design',
                        'props' => ['placeholder' => 'Write your message...', 'rows' => 4],
                        'preview_code' => '<textarea class="block w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-vertical transition-all" rows="4" placeholder="Write your message..."></textarea>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 4
            ],

            // PARAGRAPH
            [
                'name' => 'Paragraph',
                'type' => 'paragraph',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'P',
                'description' => 'Text paragraph element',
                'icon' => 'Type',
                'default_props' => [
                    'content' => '', // ✅ Changed
                    'size' => 'base',
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Paragraph Text', 'default' => ''], // ✅ Changed
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm', 'base', 'lg', 'xl'], 'default' => 'base'],
                ],
                'render_template' => 'paragraph-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/paragraph.js'],
                'variants' => [
                    [
                        'name' => 'Body Text',
                        'description' => 'Standard paragraph',
                        'props' => ['content' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'size' => 'base'], // ✅ Changed
                        'preview_code' => '<p class="text-base text-gray-700 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 6
            ],
        ];

        foreach ($basicElements as $element) {
            Component::create($element);
        }
    }
}