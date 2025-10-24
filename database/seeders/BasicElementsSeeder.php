<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class BasicElementsSeeder extends Seeder
{
    public function run(): void
    {
        $basicElements = [
            // ============================================
            // BUTTON
            // ============================================
            [
                'name' => 'Button',
                'type' => 'button',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'B',
                'description' => 'Interactive button with multiple styles and animations',
                'icon' => 'Square',
                'default_props' => [
                    'content' => 'Button',
                    'disabled' => false,
                    'type' => 'button',
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Button Text', 'default' => 'Button'],
                    'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => false],
                    'type' => ['type' => 'select', 'label' => 'Type', 'options' => ['button', 'submit', 'reset'], 'default' => 'button'],
                ],
                'render_template' => 'button-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/button.js'],
                'variants' => [
                    [
                        'name' => 'Primary Gradient',
                        'description' => 'Modern gradient button with shadow',
                        'props' => ['content' => 'Get Started'], // ✅ NO STYLES HERE
                        'style' => [ // ✅ ALL STYLES HERE (CSS)
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '16px 32px',
                            'fontSize' => '18px',
                            'fontWeight' => '600',
                            'borderRadius' => '12px',
                            'background' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            'color' => '#ffffff',
                            'border' => 'none',
                            'boxShadow' => '0 4px 14px rgba(102, 126, 234, 0.4)',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button class="inline-flex items-center justify-center font-semibold" style="padding: 16px 32px; font-size: 18px; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; cursor: pointer;">Get Started</button>'
                    ],
                    [
                        'name' => 'Glass Effect',
                        'description' => 'Glassmorphism button',
                        'props' => ['content' => 'Glass Effect'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '12px 24px',
                            'fontSize' => '16px',
                            'fontWeight' => '500',
                            'borderRadius' => '12px',
                            'background' => 'rgba(255, 255, 255, 0.1)',
                            'backdropFilter' => 'blur(16px)',
                            'color' => '#ffffff',
                            'border' => '1px solid rgba(255, 255, 255, 0.2)',
                            'boxShadow' => '0 8px 32px rgba(0, 0, 0, 0.1)',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button class="inline-flex items-center justify-center font-medium" style="padding: 12px 24px; font-size: 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(16px); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; cursor: pointer;">Glass Effect</button>'
                    ],
                    [
                        'name' => 'Neon Glow',
                        'description' => 'Cyberpunk neon button',
                        'props' => ['content' => 'Neon Glow'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '16px 32px',
                            'fontSize' => '18px',
                            'fontWeight' => '700',
                            'borderRadius' => '8px',
                            'background' => '#000000',
                            'color' => '#22d3ee',
                            'border' => '2px solid #22d3ee',
                            'boxShadow' => '0 0 20px rgba(34, 211, 238, 0.6)',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button class="inline-flex items-center justify-center font-bold" style="padding: 16px 32px; font-size: 18px; border-radius: 8px; background: #000000; color: #22d3ee; border: 2px solid #22d3ee; box-shadow: 0 0 20px rgba(34, 211, 238, 0.6); transition: all 0.3s ease; cursor: pointer;">Neon Glow</button>'
                    ],
                    [
                        'name' => 'Rounded Pill',
                        'description' => 'Fully rounded pill button',
                        'props' => ['content' => 'Subscribe'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '12px 32px',
                            'fontSize' => '16px',
                            'fontWeight' => '500',
                            'borderRadius' => '9999px',
                            'background' => 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                            'color' => '#ffffff',
                            'border' => 'none',
                            'boxShadow' => '0 4px 14px rgba(236, 72, 153, 0.4)',
                            'transition' => 'all 0.2s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button class="inline-flex items-center justify-center font-medium" style="padding: 12px 32px; font-size: 16px; border-radius: 9999px; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(236, 72, 153, 0.4); transition: all 0.2s ease; cursor: pointer;">Subscribe</button>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean minimal design',
                        'props' => ['content' => 'Learn More'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '12px 24px',
                            'fontSize' => '16px',
                            'fontWeight' => '500',
                            'borderRadius' => '8px',
                            'background' => 'transparent',
                            'color' => '#374151',
                            'border' => 'none',
                            'transition' => 'all 0.2s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button class="inline-flex items-center justify-center font-medium" style="padding: 12px 24px; font-size: 16px; border-radius: 8px; background: transparent; color: #374151; border: none; transition: all 0.2s ease; cursor: pointer;">Learn More</button>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 1
            ],

            // ============================================
            // LINK
            // ============================================
            [
                'name' => 'Link',
                'type' => 'link',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'L',
                'description' => 'Hyperlink element with various styles',
                'icon' => 'Link',
                'default_props' => [
                    'content' => 'Link',
                    'href' => '#',
                    'target' => '_self',
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Link Text', 'default' => 'Link'],
                    'href' => ['type' => 'string', 'label' => 'URL', 'default' => '#'],
                    'target' => ['type' => 'select', 'label' => 'Target', 'options' => ['_self', '_blank', '_parent', '_top'], 'default' => '_self'],
                ],
                'render_template' => 'link-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/link.js'],
                'variants' => [
                    [
                        'name' => 'Underline Hover',
                        'description' => 'Link with animated underline',
                        'props' => ['content' => 'Read more', 'href' => '#'],
                        'style' => [
                            'display' => 'inline-block',
                            'position' => 'relative',
                            'color' => '#2563eb',
                            'fontWeight' => '500',
                            'textDecoration' => 'none',
                            'transition' => 'color 0.3s ease',
                        ],
                        'preview_code' => '<a href="#" style="display: inline-block; position: relative; color: #2563eb; font-weight: 500; text-decoration: none; transition: color 0.3s ease;">Read more</a>'
                    ],
                    [
                        'name' => 'Gradient Link',
                        'description' => 'Link with gradient text',
                        'props' => ['content' => 'Explore now', 'href' => '#'],
                        'style' => [
                            'display' => 'inline-block',
                            'background' => 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                            'WebkitBackgroundClip' => 'text',
                            'WebkitTextFillColor' => 'transparent',
                            'backgroundClip' => 'text',
                            'fontWeight' => '700',
                            'textDecoration' => 'none',
                            'transition' => 'all 0.3s ease',
                        ],
                        'preview_code' => '<a href="#" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; text-decoration: none; transition: all 0.3s ease;">Explore now</a>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 2
            ],

            // ============================================
            // INPUT
            // ============================================
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
                    'placeholder' => 'Enter text...',
                    'value' => '',
                    'required' => false,
                    'disabled' => false
                ],
                'prop_definitions' => [
                    'type' => ['type' => 'select', 'label' => 'Input Type', 'options' => ['text', 'email', 'password', 'tel', 'url', 'number', 'date'], 'default' => 'text'],
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder', 'default' => 'Enter text...'],
                    'value' => ['type' => 'string', 'label' => 'Default Value', 'default' => ''],
                ],
                'render_template' => 'input-template',
                'code_generators' => ['react-tailwind' => 'templates/form/input.js'],
                'variants' => [
                    [
                        'name' => 'Glass Input',
                        'description' => 'Glassmorphism input field',
                        'props' => ['placeholder' => 'Enter email...', 'type' => 'email'],
                        'style' => [
                            'display' => 'block',
                            'width' => '100%',
                            'padding' => '12px 16px',
                            'fontSize' => '16px',
                            'background' => 'rgba(255, 255, 255, 0.1)',
                            'backdropFilter' => 'blur(16px)',
                            'border' => '1px solid rgba(255, 255, 255, 0.2)',
                            'borderRadius' => '12px',
                            'color' => '#ffffff',
                            'outline' => 'none',
                            'transition' => 'all 0.3s ease',
                        ],
                        'preview_code' => '<input type="email" placeholder="Enter email..." style="display: block; width: 100%; padding: 12px 16px; font-size: 16px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: #ffffff; outline: none; transition: all 0.3s ease;" />'
                    ],
                    [
                        'name' => 'Standard Input',
                        'description' => 'Clean standard input',
                        'props' => ['placeholder' => 'Email', 'type' => 'email'],
                        'style' => [
                            'display' => 'block',
                            'width' => '100%',
                            'padding' => '12px 16px',
                            'fontSize' => '16px',
                            'background' => '#ffffff',
                            'border' => '2px solid #d1d5db',
                            'borderRadius' => '12px',
                            'color' => '#111827',
                            'outline' => 'none',
                            'transition' => 'all 0.2s ease',
                        ],
                        'preview_code' => '<input type="email" placeholder="Email" style="display: block; width: 100%; padding: 12px 16px; font-size: 16px; background: #ffffff; border: 2px solid #d1d5db; border-radius: 12px; color: #111827; outline: none; transition: all 0.2s ease;" />'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ],

            // ============================================
            // TEXTAREA
            // ============================================
            [
                'name' => 'Textarea',
                'type' => 'textarea',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'T',
                'description' => 'Multi-line text input',
                'icon' => 'AlignLeft',
                'default_props' => [
                    'placeholder' => 'Write your message...',
                    'content' => '',
                    'rows' => 4,
                ],
                'prop_definitions' => [
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder', 'default' => 'Write your message...'],
                    'content' => ['type' => 'textarea', 'label' => 'Default Value', 'default' => ''],
                    'rows' => ['type' => 'number', 'label' => 'Rows', 'default' => 4, 'min' => 2, 'max' => 20],
                ],
                'render_template' => 'textarea-template',
                'code_generators' => ['react-tailwind' => 'templates/form/textarea.js'],
                'variants' => [
                    [
                        'name' => 'Standard Textarea',
                        'description' => 'Clean textarea design',
                        'props' => ['placeholder' => 'Write your message...', 'rows' => 4],
                        'style' => [
                            'display' => 'block',
                            'width' => '100%',
                            'padding' => '12px 16px',
                            'fontSize' => '16px',
                            'background' => '#ffffff',
                            'border' => '2px solid #d1d5db',
                            'borderRadius' => '12px',
                            'color' => '#111827',
                            'outline' => 'none',
                            'resize' => 'vertical',
                            'transition' => 'all 0.2s ease',
                            'minHeight' => '100px',
                        ],
                        'preview_code' => '<textarea rows="4" placeholder="Write your message..." style="display: block; width: 100%; padding: 12px 16px; font-size: 16px; background: #ffffff; border: 2px solid #d1d5db; border-radius: 12px; color: #111827; outline: none; resize: vertical; transition: all 0.2s ease; min-height: 100px;"></textarea>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 4
            ],

            // ============================================
            // PARAGRAPH
            // ============================================
            [
                'name' => 'Paragraph',
                'type' => 'p',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'P',
                'description' => 'Text paragraph element',
                'icon' => 'Type',
                'default_props' => [
                    'content' => 'Lorem ipsum dolor sit amet.',
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Paragraph Text', 'default' => 'Lorem ipsum dolor sit amet.'],
                ],
                'render_template' => 'paragraph-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/paragraph.js'],
                'variants' => [
                    [
                        'name' => 'Body Text',
                        'description' => 'Standard paragraph',
                        'props' => ['content' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'],
                        'style' => [
                            'fontSize' => '16px',
                            'lineHeight' => '1.7',
                            'color' => '#374151',
                            'margin' => '0',
                        ],
                        'preview_code' => '<p style="font-size: 16px; line-height: 1.7; color: #374151; margin: 0;">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>'
                    ],
                    [
                        'name' => 'Large Text',
                        'description' => 'Large body text',
                        'props' => ['content' => 'Large readable text for emphasis.'],
                        'style' => [
                            'fontSize' => '20px',
                            'lineHeight' => '1.6',
                            'color' => '#111827',
                            'fontWeight' => '400',
                            'margin' => '0',
                        ],
                        'preview_code' => '<p style="font-size: 20px; line-height: 1.6; color: #111827; font-weight: 400; margin: 0;">Large readable text for emphasis.</p>'
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